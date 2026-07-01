<template>
    <div class="min-h-screen bg-obsidian-950 noise-bg">
        <header class="sticky top-0 z-40 border-b border-white/[0.06] bg-obsidian-950/80 backdrop-blur-xl">
            <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <NuxtLink to="/" class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-acid-400 flex items-center justify-center">
                            <span class="text-obsidian-950 font-display font-bold text-sm">CR</span>
                        </div>
                        <div>
                            <div class="font-display font-bold text-white text-sm leading-none">
                                CRM Comercial
                            </div>
                            <div class="text-obsidian-500 text-xs font-mono">
                                Configuracion
                            </div>
                        </div>
                    </NuxtLink>

                    <div class="flex items-center gap-3">
                        <NuxtLink to="/" class="btn-ghost h-9 px-3 text-xs flex items-center">
                            Dashboard
                        </NuxtLink>
                        <ThemeToggle />
                        <AccountMenu />
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <section>
                <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                            Administracion
                        </p>
                        <h1 class="section-title text-3xl">
                            {{ title }}
                        </h1>
                    </div>
                    <div class="text-left sm:text-right">
                        <p class="text-obsidian-500 text-xs font-mono">
                            {{ description }}
                        </p>
                    </div>
                </div>
            </section>

            <nav class="flex flex-wrap gap-2" aria-label="Settings navigation">
                <NuxtLink
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    class="btn-ghost h-9 px-3 text-xs flex items-center"
                    :class="{ 'border-acid-400/40 text-white bg-white/5': route.path === item.to }"
                >
                    {{ item.label }}
                </NuxtLink>
            </nav>

            <section
                v-if="accessLoading"
                class="glass-card p-8 text-center text-obsidian-500 font-mono text-sm"
            >
                Cargando configuracion...
            </section>

            <section
                v-else-if="!canAccessSettings"
                class="glass-card border-coral-400/20 p-8"
            >
                <p class="text-xs font-mono uppercase tracking-wider text-coral-400 mb-2">
                    Acceso restringido
                </p>
                <h2 class="section-title text-xl mb-2">
                    No tienes permisos para ver esta pagina.
                </h2>
                <p class="text-sm text-obsidian-400">
                    Solo usuarios admin o superadmin pueden administrar la configuracion.
                </p>
            </section>

            <slot v-else />
        </main>
    </div>
</template>

<script setup lang="ts">
import type { AppUser } from "~/composables/useUsers";

defineProps<{
    title: string;
    description: string;
}>();

const route = useRoute();
const { initTheme } = useTheme();
const { user, initAuth } = useAuth();
const { getUser } = useUsers();
const { isAdminUser } = useAccess();
const settingsUser = ref<AppUser | null>(null);
const accessLoading = ref(true);

const navItems = [
    { label: "General", to: "/settings" },
    { label: "Usuarios", to: "/settings/users" },
    { label: "Productos", to: "/settings/products" },
    { label: "Tipo de productos", to: "/settings/products/types" },
];

const canAccessSettings = computed(() => isAdminUser(settingsUser.value));

onMounted(async () => {
    initTheme();

    try {
        await initAuth();
        settingsUser.value = user.value ? await getUser(user.value.uid) : null;
    } finally {
        accessLoading.value = false;
    }
});
</script>
