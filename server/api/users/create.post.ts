import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import type { Database } from '~/types/database.types';

const ADMIN_ROLE_IDS = [1, 2];

interface CreateUserRequest {
    displayName: string;
    email: string;
    roleId?: string | number | null;
    status?: 'active' | 'inactive';
    mode: 'password' | 'invite';
    password?: string;
    redirectTo?: string;
}

function getJwtProjectRef(token?: string | null): string | null {
    if (!token) return null;
    try {
        const parts = token.trim().split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf8'),
        );
        return payload?.ref || null;
    } catch {
        return null;
    }
}

export default defineEventHandler(async (event) => {
    const authUser = await serverSupabaseUser(event);
    if (!authUser) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autorizado. Debe iniciar sesion.',
        });
    }

    const userClient = await serverSupabaseClient<Database>(event);

    // Resolve the caller's email to check admin permissions in public.users
    let callerEmail = authUser.email;
    if (!callerEmail) {
        const { data: userData } = await userClient.auth.getUser();
        callerEmail = userData?.user?.email;
    }

    if (!callerEmail) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No se pudo verificar el correo del usuario actual.',
        });
    }

    const { data: callerProfile, error: callerError } = await userClient
        .from('users')
        .select('id, email, role_id, status')
        .ilike('email', callerEmail.trim())
        .maybeSingle();

    if (callerError) {
        throw createError({
            statusCode: 500,
            statusMessage: `Error verificando permisos: ${callerError.message}`,
        });
    }

    if (
        !callerProfile ||
        callerProfile.status === false ||
        !callerProfile.role_id ||
        !ADMIN_ROLE_IDS.includes(Number(callerProfile.role_id))
    ) {
        throw createError({
            statusCode: 403,
            statusMessage:
                'Solo usuarios Admin o SuperAdmin pueden crear o invitar usuarios.',
        });
    }

    const body = await readBody<CreateUserRequest>(event);
    const displayName = (body?.displayName || '').trim();
    const email = (body?.email || '').trim().toLowerCase();
    const mode = body?.mode === 'invite' ? 'invite' : 'password';
    const password = body?.password || '';
    const statusBool = body?.status !== 'inactive';
    const roleIdNum =
        body?.roleId !== undefined &&
        body?.roleId !== null &&
        String(body.roleId).trim() !== ''
            ? Number(body.roleId)
            : null;

    if (!displayName) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El nombre del usuario es obligatorio.',
        });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Ingresa un correo electronico valido.',
        });
    }

    if (mode === 'password' && password.length < 6) {
        throw createError({
            statusCode: 400,
            statusMessage: 'El password debe tener al menos 6 caracteres.',
        });
    }

    // Check if user already exists in public.users
    const { data: existingProfile } = await userClient
        .from('users')
        .select('id, email')
        .ilike('email', email)
        .maybeSingle();

    if (existingProfile) {
        throw createError({
            statusCode: 409,
            statusMessage: 'Ya existe un usuario registrado con ese correo.',
        });
    }

    const config = useRuntimeConfig(event);
    const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.NUXT_PUBLIC_SUPABASE_URL ||
        (config.public as any)?.supabase?.url;
    const anonKey =
        process.env.SUPABASE_KEY ||
        process.env.NUXT_PUBLIC_SUPABASE_KEY ||
        (config.public as any)?.supabase?.key;
    const serviceRoleKey =
        (config as any).supabaseServiceRoleKey ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        (config as any)?.supabase?.serviceKey;

    if (!supabaseUrl || !anonKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Falta configurar SUPABASE_URL o SUPABASE_KEY.',
        });
    }

    // Check if serviceRoleKey belongs to the same Supabase project as SUPABASE_URL
    const urlRefMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/i);
    const urlProjectRef = urlRefMatch ? urlRefMatch[1] : null;
    const serviceKeyProjectRef = getJwtProjectRef(serviceRoleKey);
    const hasMatchingServiceKey = Boolean(
        serviceRoleKey &&
            (!urlProjectRef ||
                !serviceKeyProjectRef ||
                urlProjectRef === serviceKeyProjectRef),
    );

    const supabaseAdmin = hasMatchingServiceKey
        ? createClient<Database>(supabaseUrl, serviceRoleKey!, {
              auth: {
                  autoRefreshToken: false,
                  persistSession: false,
              },
          })
        : null;

    const statelessAuthClient = createClient<Database>(supabaseUrl, anonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    let createdAuthUserId: string | null = null;

    if (mode === 'password') {
        if (supabaseAdmin) {
            const { data: createdAuth, error: createAuthError } =
                await supabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        display_name: displayName,
                        name: displayName,
                    },
                });

            if (createAuthError) {
                const errMsg = createAuthError.message?.toLowerCase() || '';
                const isAlreadyRegistered =
                    errMsg.includes('already') ||
                    errMsg.includes('registered') ||
                    errMsg.includes('exists');

                if (isAlreadyRegistered) {
                    const { data: listData, error: listError } =
                        await supabaseAdmin.auth.admin.listUsers({
                            page: 1,
                            perPage: 1000,
                        });

                    const existingAuthUser = listData?.users?.find(
                        (u) => u.email?.toLowerCase() === email,
                    );

                    if (listError || !existingAuthUser) {
                        throw createError({
                            statusCode: 400,
                            statusMessage:
                                createAuthError.message ||
                                'El correo ya existe en autenticacion y no se pudo actualizar.',
                        });
                    }

                    const { error: updateAuthError } =
                        await supabaseAdmin.auth.admin.updateUserById(
                            existingAuthUser.id,
                            {
                                password,
                                email_confirm: true,
                                user_metadata: {
                                    display_name: displayName,
                                    name: displayName,
                                },
                            },
                        );

                    if (updateAuthError) {
                        throw createError({
                            statusCode: 400,
                            statusMessage:
                                updateAuthError.message ||
                                'No se pudo actualizar la cuenta de autenticacion.',
                        });
                    }
                } else {
                    throw createError({
                        statusCode: 400,
                        statusMessage:
                            createAuthError.message ||
                            'No se pudo crear la cuenta en Supabase Auth.',
                    });
                }
            } else {
                createdAuthUserId = createdAuth?.user?.id || null;
            }
        } else {
            // Fallback when SUPABASE_SERVICE_ROLE_KEY is missing or for a different project
            const { data: signUpData, error: signUpError } =
                await statelessAuthClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: displayName,
                            name: displayName,
                        },
                        emailRedirectTo: body?.redirectTo
                            ? body.redirectTo.replace(
                                  'setup_password=1',
                                  'verified=1',
                              )
                            : undefined,
                    },
                });

            if (signUpError) {
                throw createError({
                    statusCode: 400,
                    statusMessage:
                        signUpError.message ||
                        'No se pudo registrar el usuario en Supabase Auth.',
                });
            }

            createdAuthUserId = signUpData?.user?.id || null;
        }
    } else {
        if (supabaseAdmin) {
            const { data: invitedAuth, error: inviteError } =
                await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                    data: {
                        display_name: displayName,
                        name: displayName,
                    },
                    redirectTo: body?.redirectTo || undefined,
                });

            if (inviteError) {
                const errMsg = inviteError.message?.toLowerCase() || '';
                if (
                    errMsg.includes('already') ||
                    errMsg.includes('registered') ||
                    errMsg.includes('exists')
                ) {
                    throw createError({
                        statusCode: 409,
                        statusMessage:
                            'Este correo ya tiene una cuenta de acceso creada. Puedes crear el usuario con el modo "Asignar password" para definirle una nueva clave.',
                    });
                }

                throw createError({
                    statusCode: 400,
                    statusMessage:
                        inviteError.message ||
                        'No se pudo enviar la invitacion por correo.',
                });
            }

            createdAuthUserId = invitedAuth?.user?.id || null;
        } else {
            // Fallback when SUPABASE_SERVICE_ROLE_KEY belongs to another project
            const tempPassword = `${randomBytes(12).toString('hex')}A1!`;
            const { data: signUpData, error: signUpError } =
                await statelessAuthClient.auth.signUp({
                    email,
                    password: tempPassword,
                    options: {
                        data: {
                            display_name: displayName,
                            name: displayName,
                        },
                        emailRedirectTo: body?.redirectTo || undefined,
                    },
                });

            if (signUpError) {
                throw createError({
                    statusCode: 400,
                    statusMessage:
                        signUpError.message ||
                        'No se pudo enviar la invitacion por correo.',
                });
            }

            // Also trigger password reset link so the user can set their password directly
            if (signUpData?.session) {
                await statelessAuthClient.auth
                    .resetPasswordForEmail(email, {
                        redirectTo: body?.redirectTo || undefined,
                    })
                    .catch(() => {});
            }

            createdAuthUserId = signUpData?.user?.id || null;
        }
    }

    const dbClient = supabaseAdmin || userClient;
    const { data: newProfile, error: insertError } = await dbClient
        .from('users')
        .insert({
            name: displayName,
            email,
            role_id: roleIdNum,
            status: statusBool,
        })
        .select('*, roles(name)')
        .single();

    if (insertError) {
        if (supabaseAdmin && createdAuthUserId) {
            await supabaseAdmin.auth.admin
                .deleteUser(createdAuthUserId)
                .catch(() => {});
        }
        throw createError({
            statusCode: 500,
            statusMessage:
                insertError.message ||
                'No se pudo guardar el perfil del usuario en la base de datos.',
        });
    }

    return {
        success: true,
        mode,
        usedAdminApi: Boolean(supabaseAdmin),
        user: newProfile,
    };
});
