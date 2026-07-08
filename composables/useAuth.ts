import type { User } from "@supabase/supabase-js";

// Keep loading and error refs global or local depending on usage
const loading = ref(false);
const error = ref<string | null>(null);

export const useAuth = () => {
    const client = useSupabaseClient();
    const supabaseUser = useSupabaseUser();

    // Map Supabase User to include 'uid' and 'displayName' for Firebase compatibility
    const user = computed<any>(() => {
        if (!supabaseUser.value) return null;
        return {
            ...supabaseUser.value,
            uid: supabaseUser.value.id,
            displayName: supabaseUser.value.user_metadata?.display_name || supabaseUser.value.user_metadata?.name || "",
        };
    });

    const initAuth = async () => {
        // Supabase user is initialized automatically
        return Promise.resolve();
    };

    const login = async (emailVal: string, passwordVal: string) => {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: authError } = await client.auth.signInWithPassword({
                email: emailVal,
                password: passwordVal,
            });

            if (authError) throw authError;

            if (!data.session) {
                error.value = "Verifica tu correo antes de entrar.";
                throw new Error("email-not-verified");
            }
        } catch (authError: any) {
            // Map common error messages
            let msg = authError.message || "No se pudo iniciar sesion.";
            if (authError.status === 400) {
                msg = "El correo o password no es correcto.";
            }
            error.value = msg;
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const register = async (emailVal: string, passwordVal: string) => {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: authError } = await client.auth.signUp({
                email: emailVal,
                password: passwordVal,
                options: {
                    emailRedirectTo: `${window.location.origin}/login?verified=1`,
                }
            });

            if (authError) throw authError;

            // If signup doesn't return a session immediately, it expects verification
            if (data && !data.session) {
                throw new Error("email-verification-required");
            }
        } catch (authError: any) {
            let msg = authError.message || "No se pudo crear la cuenta.";
            if (authError.message === "email-verification-required") {
                msg = "Cuenta creada. Te enviamos un correo para verificar tu email antes de entrar.";
            }
            error.value = msg;
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const resetPassword = async (emailVal: string) => {
        loading.value = true;
        error.value = null;

        try {
            const { error: authError } = await client.auth.resetPasswordForEmail(emailVal, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (authError) throw authError;
        } catch (authError: any) {
            error.value = authError.message || "No se pudo enviar el correo de recuperacion.";
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { error: authError } = await client.auth.signOut();
            if (authError) throw authError;
            await navigateTo("/login");
        } catch (authError: any) {
            error.value = authError.message || "No se pudo cerrar sesion.";
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const stopAuth = () => {
        // No-op for compatibility
    };

    return {
        user,
        loading,
        error,
        initAuth,
        stopAuth,
        login,
        register,
        resetPassword,
        logout,
    };
};
