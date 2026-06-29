<template>
    <div class="min-h-screen bg-obsidian-950 noise-bg flex items-center justify-center px-4 py-10">
        <main class="w-full max-w-md">
            <div class="mb-8 flex items-center justify-between">
                <NuxtLink to="/" class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-acid-400 flex items-center justify-center">
                        <span class="text-white font-display font-bold text-sm">CR</span>
                    </div>
                    <div>
                        <div class="font-display font-bold text-white text-sm leading-none">
                            CRM Comercial
                        </div>
                        <div class="text-obsidian-500 text-xs font-mono">
                            Acceso privado
                        </div>
                    </div>
                </NuxtLink>

                <ThemeToggle />
            </div>

            <section class="glass-card p-6 sm:p-8">
                <div class="mb-7">
                    <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                        {{ isRegisterMode ? "Crear cuenta" : "Iniciar sesion" }}
                    </p>
                    <h1 class="section-title text-2xl">
                        {{
                            isRegisterMode
                                ? "Registra tu acceso"
                                : "Entra al dashboard"
                        }}
                    </h1>
                    <p class="text-obsidian-500 text-sm mt-2">
                        {{
                            isRegisterMode
                                ? "Crea una cuenta con tu correo corporativo."
                                : "Usa tu correo corporativo para acceder al seguimiento comercial."
                        }}
                    </p>
                </div>

                <form class="space-y-5" @submit.prevent="handleSubmit">
                    <div>
                        <label for="email" class="block text-xs font-mono text-obsidian-400 mb-2">
                            Correo
                        </label>
                        <input
                            id="email"
                            v-model.trim="email"
                            class="input-dark"
                            type="email"
                            autocomplete="email"
                            placeholder="correo@empresa.com"
                            :aria-invalid="Boolean(emailError)"
                        />
                        <p v-if="emailError" class="mt-2 text-xs text-coral-400">
                            {{ emailError }}
                        </p>
                    </div>

                    <div>
                        <div class="flex items-center justify-between gap-3 mb-2">
                            <label for="password" class="block text-xs font-mono text-obsidian-400">
                                Password
                            </label>
                            <button
                                type="button"
                                class="text-xs text-obsidian-400 hover:text-white transition-colors"
                                @click="showPassword = !showPassword"
                            >
                                {{ showPassword ? "Ocultar" : "Mostrar" }}
                            </button>
                        </div>
                        <input
                            id="password"
                            v-model="password"
                            class="input-dark"
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="current-password"
                            placeholder="Tu password"
                            :aria-invalid="Boolean(passwordError)"
                        />
                        <p v-if="passwordError" class="mt-2 text-xs text-coral-400">
                            {{ passwordError }}
                        </p>
                        <div v-if="!isRegisterMode" class="mt-3 text-right">
                            <button
                                type="button"
                                class="text-xs font-medium text-acid-400 hover:text-acid-300 transition-colors"
                                :disabled="submitting || resettingPassword"
                                @click="handlePasswordReset"
                            >
                                {{
                                    resettingPassword
                                        ? "Enviando..."
                                        : "Recuperar password"
                                }}
                            </button>
                        </div>
                    </div>

                    <div v-if="isRegisterMode">
                        <label
                            for="confirm-password"
                            class="block text-xs font-mono text-obsidian-400 mb-2"
                        >
                            Confirmar password
                        </label>
                        <input
                            id="confirm-password"
                            v-model="confirmPassword"
                            class="input-dark"
                            type="password"
                            autocomplete="new-password"
                            placeholder="Repite tu password"
                            :aria-invalid="Boolean(confirmPasswordError)"
                        />
                        <p
                            v-if="confirmPasswordError"
                            class="mt-2 text-xs text-coral-400"
                        >
                            {{ confirmPasswordError }}
                        </p>
                    </div>

                    <p
                        v-if="formMessage"
                        class="rounded-xl border px-4 py-3 text-sm"
                        :class="
                            messageType === 'success'
                                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
                                : 'border-coral-400/20 bg-coral-400/10 text-coral-400'
                        "
                    >
                        {{ formMessage }}
                    </p>

                    <button
                        type="submit"
                        class="btn-primary w-full h-11 flex items-center justify-center"
                        :disabled="submitting || resettingPassword"
                    >
                        {{
                            submitting
                                ? "Validando..."
                                : isRegisterMode
                                  ? "Crear cuenta"
                                  : "Ingresar"
                        }}
                    </button>

                    <button
                        type="button"
                        class="btn-ghost w-full h-11"
                        :disabled="submitting || resettingPassword"
                        @click="toggleMode"
                    >
                        {{
                            isRegisterMode
                                ? "Ya tengo cuenta"
                                : "Crear una cuenta"
                        }}
                    </button>
                </form>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isRegisterMode = ref(false);
const showPassword = ref(false);
const submitting = ref(false);
const resettingPassword = ref(false);
const formMessage = ref("");
const messageType = ref<"error" | "success">("error");
const emailError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

const { initTheme } = useTheme();
const route = useRoute();
const {
    error: authError,
    initAuth,
    login,
    register,
    resetPassword,
} = useAuth();

onMounted(() => {
    initTheme();
    initAuth();

    if (route.query.verified === "1") {
        messageType.value = "success";
        formMessage.value =
            "Tu correo fue verificado. Ya puedes iniciar sesion.";
    }
});

const validateForm = () => {
    emailError.value = "";
    passwordError.value = "";
    confirmPasswordError.value = "";
    formMessage.value = "";
    messageType.value = "error";

    if (!email.value) {
        emailError.value = "Ingresa tu correo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailError.value = "Ingresa un correo valido.";
    }

    if (!password.value) {
        passwordError.value = "Ingresa tu password.";
    } else if (password.value.length < 6) {
        passwordError.value = "El password debe tener al menos 6 caracteres.";
    }

    if (isRegisterMode.value) {
        if (!confirmPassword.value) {
            confirmPasswordError.value = "Confirma tu password.";
        } else if (confirmPassword.value !== password.value) {
            confirmPasswordError.value = "Los passwords no coinciden.";
        }
    }

    return (
        !emailError.value &&
        !passwordError.value &&
        !confirmPasswordError.value
    );
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    submitting.value = true;

    try {
        if (isRegisterMode.value) {
            await register(email.value, password.value);
            isRegisterMode.value = false;
            password.value = "";
            confirmPassword.value = "";
            messageType.value = "success";
            formMessage.value =
                "Cuenta creada. Te enviamos un correo para verificar tu email antes de entrar.";
            return;
        } else {
            await login(email.value, password.value);
        }
        await navigateTo("/");
    } catch {
        messageType.value = "error";
        formMessage.value =
            authError.value || "No se pudo iniciar sesion.";
    } finally {
        submitting.value = false;
    }
};

const validateEmail = () => {
    emailError.value = "";
    formMessage.value = "";
    messageType.value = "error";

    if (!email.value) {
        emailError.value = "Ingresa tu correo para recuperar el password.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailError.value = "Ingresa un correo valido.";
    }

    return !emailError.value;
};

const handlePasswordReset = async () => {
    if (!validateEmail()) return;

    resettingPassword.value = true;

    try {
        await resetPassword(email.value);
        messageType.value = "success";
        formMessage.value =
            "Te enviamos un correo para restablecer tu password.";
    } catch {
        messageType.value = "error";
        formMessage.value =
            authError.value || "No se pudo enviar el correo de recuperacion.";
    } finally {
        resettingPassword.value = false;
    }
};

const toggleMode = () => {
    isRegisterMode.value = !isRegisterMode.value;
    password.value = "";
    confirmPassword.value = "";
    emailError.value = "";
    passwordError.value = "";
    confirmPasswordError.value = "";
    formMessage.value = "";
    messageType.value = "error";
};
</script>
