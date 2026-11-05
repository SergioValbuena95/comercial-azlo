<template>
    <div class="relative" @click.stop>
        <button
            type="button"
            class="h-9 w-9 rounded-full border border-acid-400/30 bg-acid-400/15 text-acid-400 font-display text-xs font-bold hover:border-acid-400/50 hover:bg-acid-400/20 transition-colors"
            :aria-expanded="accountMenuOpen"
            aria-haspopup="menu"
            :title="accountName"
            @click="accountMenuOpen = !accountMenuOpen"
        >
            {{ accountInitials }}
        </button>

        <div
            v-if="accountMenuOpen"
            class="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-white/10 bg-obsidian-900 shadow-2xl"
            role="menu"
        >
            <div class="border-b border-white/[0.06] px-4 py-3">
                <p class="truncate text-sm font-semibold text-white">
                    {{ accountName }}
                </p>
                <p class="truncate text-xs text-obsidian-500">
                    {{ accountEmail }}
                </p>
                <p class="truncate text-xs text-obsidian-500 first-letter:[text-transform:uppercase]">
                    {{ currentUserProfile?.roleName || "Sin rol asignado" }}
                </p>
            </div>
            <button
                type="button"
                class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-obsidian-300 hover:bg-white/5 hover:text-white transition-colors"
                role="menuitem"
                @click="openProfileEdit"
            >
                <UserPen class="w-4 h-4" />
                Editar perfil
            </button>
            <NuxtLink
                v-if="canManageUsers"
                to="/settings/users"
                class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-obsidian-300 hover:bg-white/5 hover:text-white transition-colors"
                role="menuitem"
                @click="accountMenuOpen = false"
            >
                <Users class="w-4 h-4" />
                Usuarios
            </NuxtLink>
            <NuxtLink
                v-if="canAccessSettings"
                to="/settings"
                class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-obsidian-300 hover:bg-white/5 hover:text-white transition-colors"
                role="menuitem"
                @click="accountMenuOpen = false"
            >
                <Settings  class="w-4 h-4" />
                Configuracion
            </NuxtLink>
            <button
                type="button"
                class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-coral-400 hover:bg-coral-400/10 transition-colors"
                :disabled="authLoading"
                role="menuitem"
                @click="handleLogout"
            >
                <LogOut class="w-4 h-4" />     
                {{ authLoading ? "Saliendo..." : "Salir" }}
            </button>
        </div>

        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showProfileModal"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4"
                    @click.self="closeProfileEdit"
                >
                    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                    <div class="relative glass-card z-10 w-full max-w-md p-6">
                        <div class="mb-5">
                            <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                                Perfil
                            </p>
                            <h3 class="section-title text-xl">
                                Editar perfil
                            </h3>
                        </div>

                        <form class="space-y-4" @submit.prevent="handleProfileSave">
                            <div>
                                <label
                                    for="profile-name"
                                    class="block text-xs font-mono text-obsidian-400 mb-2"
                                >
                                    Nombre
                                </label>
                                <input
                                    id="profile-name"
                                    v-model.trim="profileName"
                                    class="input-dark"
                                    type="text"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <p class="text-xs font-mono text-obsidian-400 mb-2">
                                    Correo
                                </p>
                                <p class="input-dark opacity-75">
                                    {{ accountEmail }}
                                </p>
                            </div>

                            <p
                                v-if="profileMessage"
                                class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400"
                            >
                                {{ profileMessage }}
                            </p>

                            <div class="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    class="btn-ghost flex-1"
                                    @click="closeProfileEdit"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    class="btn-primary flex-1"
                                    :disabled="profileSaving"
                                >
                                    {{ profileSaving ? "Guardando..." : "Guardar" }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { Settings, UserPen, Users, LogOut } from '@lucide/vue';

const accountMenuOpen = ref(false);
const showProfileModal = ref(false);
const profileName = ref("");
const profileSaving = ref(false);
const profileMessage = ref("");

const { user, loading: authLoading, logout } = useAuth();
const {
    currentUserProfile,
    loadCurrentUserProfile,
    updateCurrentUserProfile,
} = useUsers();
const { isAdminUser } = useAccess();

onMounted(() => {
    loadCurrentUserProfile();
    window.addEventListener("click", closeAccountMenu);
});

onBeforeUnmount(() => {
    window.removeEventListener("click", closeAccountMenu);
});

const accountEmail = computed(
    () => currentUserProfile.value?.email || user.value?.email || "",
);

const accountName = computed(
    () =>
        currentUserProfile.value?.displayName ||
        user.value?.displayName ||
        accountEmail.value ||
        "Usuario",
);

const accountInitials = computed(() => {
    const source = accountName.value || accountEmail.value || "U";
    const nameParts = source
        .replace(/@.*$/, "")
        .split(/[\s._-]+/)
        .filter(Boolean);

    return (
        nameParts
            .slice(0, 2)
            .map((part: string) => part[0]?.toUpperCase())
            .join("") || "U"
    );
});

const canManageUsers = computed(() =>
    isAdminUser(currentUserProfile.value),
);

const canAccessSettings = computed(() =>
    isAdminUser(currentUserProfile.value),
);

const closeAccountMenu = () => {
    accountMenuOpen.value = false;
};

const openProfileEdit = () => {
    accountMenuOpen.value = false;
    profileName.value =
        currentUserProfile.value?.displayName ||
        user.value?.displayName ||
        "";
    profileMessage.value = "";
    showProfileModal.value = true;
};

const closeProfileEdit = () => {
    showProfileModal.value = false;
    profileMessage.value = "";
};

const handleProfileSave = async () => {
    profileSaving.value = true;
    profileMessage.value = "";

    try {
        await updateCurrentUserProfile({
            displayName: profileName.value,
        });
        showProfileModal.value = false;
    } catch {
        profileMessage.value = "No se pudo guardar el perfil.";
    } finally {
        profileSaving.value = false;
    }
};

const handleLogout = async () => {
    accountMenuOpen.value = false;
    await logout();
};
</script>
