import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server';

interface SignUrlRequest {
    path: string;
    expiresIn?: number;
}

export default defineEventHandler(async (event) => {
    // 1. Verify authenticated user
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autorizado. Debe iniciar sesión.',
        });
    }

    // 2. Parse body
    const body = await readBody<SignUrlRequest>(event);
    if (!body?.path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'La ruta del archivo (path) es requerida.',
        });
    }

    // 3. Clean path
    let cleaned = body.path.trim();
    if (cleaned.startsWith('azlo/')) {
        cleaned = cleaned.slice('azlo/'.length);
    }
    cleaned = cleaned.replace(/^\/+/, '');

    // 4. Generate signed URL using service role (bypasses storage RLS)
    const supabase = serverSupabaseServiceRole(event);
    const { data, error } = await supabase.storage
        .from('azlo')
        .createSignedUrl(cleaned, body.expiresIn || 3600);

    if (error || !data?.signedUrl) {
        console.error('Storage sign error:', error);
        throw createError({
            statusCode: 404,
            statusMessage: error?.message || 'Archivo no encontrado en el almacenamiento.',
        });
    }

    return {
        signedUrl: data.signedUrl,
    };
});
