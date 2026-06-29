import type { User } from "firebase/auth";

const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let initialized = false;
let unsubscribeAuth: (() => void) | null = null;
let authReady: Promise<void> | null = null;

const authErrorMessage = (code?: string) => {
    const messages: Record<string, string> = {
        "auth/invalid-email": "El correo no es valido.",
        "auth/user-disabled": "Esta cuenta esta deshabilitada.",
        "auth/user-not-found": "No existe una cuenta con este correo.",
        "auth/wrong-password": "El password no es correcto.",
        "auth/invalid-credential": "El correo o password no es correcto.",
        "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
        "auth/weak-password": "El password debe tener al menos 6 caracteres.",
        "auth/network-request-failed": "No se pudo conectar con Firebase.",
        "auth/too-many-requests":
            "Demasiados intentos. Intenta de nuevo mas tarde.",
    };

    return code && messages[code]
        ? messages[code]
        : "No se pudo completar la autenticacion.";
};

const emailVerificationSettings = () => {
    if (!import.meta.client) return undefined;

    return {
        url: `${window.location.origin}/login?verified=1`,
        handleCodeInApp: false,
    };
};

export const useAuth = () => {
    const initAuth = () => {
        if (!import.meta.client) return Promise.resolve();
        if (authReady) return authReady;

        authReady = new Promise<void>((resolve) => {
            initialized = true;

            const { $auth, $firebase } = useNuxtApp() as any;

            if (!$auth || !$firebase?.onAuthStateChanged) {
                loading.value = false;
                error.value = "Firebase Auth no esta disponible.";
                resolve();
                return;
            }

            unsubscribeAuth = $firebase.onAuthStateChanged(
                $auth,
                (currentUser: User | null) => {
                    user.value = currentUser;
                    loading.value = false;
                    error.value = null;
                    resolve();
                },
                (authError: { code?: string }) => {
                    user.value = null;
                    loading.value = false;
                    error.value = authErrorMessage(authError.code);
                    resolve();
                },
            );
        });

        return authReady;
    };

    const login = async (email: string, password: string) => {
        loading.value = true;
        error.value = null;

        try {
            const { $auth, $firebase } = useNuxtApp() as any;
            const credential = await $firebase.signInWithEmailAndPassword(
                $auth,
                email,
                password,
            );

            if (!credential.user.emailVerified) {
                await $firebase.sendEmailVerification(
                    credential.user,
                    emailVerificationSettings(),
                );
                await $firebase.signOut($auth);
                error.value =
                    "Verifica tu correo antes de entrar. Te enviamos un nuevo enlace.";
                throw new Error("email-not-verified");
            }
        } catch (authError: any) {
            if (authError?.message !== "email-not-verified") {
                error.value = authErrorMessage(authError?.code);
            }
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const register = async (email: string, password: string) => {
        loading.value = true;
        error.value = null;

        try {
            const { $auth, $firebase } = useNuxtApp() as any;
            const credential = await $firebase.createUserWithEmailAndPassword(
                $auth,
                email,
                password,
            );
            await $firebase.sendEmailVerification(
                credential.user,
                emailVerificationSettings(),
            );
            await $firebase.signOut($auth);
        } catch (authError: any) {
            error.value = authErrorMessage(authError?.code);
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const resetPassword = async (email: string) => {
        loading.value = true;
        error.value = null;

        try {
            const { $auth, $firebase } = useNuxtApp() as any;
            await $firebase.sendPasswordResetEmail($auth, email);
        } catch (authError: any) {
            error.value = authErrorMessage(authError?.code);
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $auth, $firebase } = useNuxtApp() as any;
            await $firebase.signOut($auth);
            await navigateTo("/login");
        } catch (authError: any) {
            error.value = authErrorMessage(authError?.code);
            throw authError;
        } finally {
            loading.value = false;
        }
    };

    const stopAuth = () => {
        unsubscribeAuth?.();
        unsubscribeAuth = null;
        authReady = null;
        initialized = false;
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
