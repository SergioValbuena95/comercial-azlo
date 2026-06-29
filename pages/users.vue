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
                                Usuarios
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
                            Usuarios
                        </h1>
                    </div>
                    <div class="text-left sm:text-right">
                        <p class="text-obsidian-500 text-xs font-mono">
                            {{ users.length }} registros
                        </p>
                    </div>
                </div>
            </section>

            <section class="glass-card overflow-hidden">
                <!-- table -->
                <div class="hidden md:block overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-white/[0.06]">
                                <th class="px-4 py-3 text-left text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                    Opciones
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/[0.04]">
                            <tr v-if="loading">
                                <td colspan="5" class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm">
                                    Cargando usuarios...
                                </td>
                            </tr>
                            <tr v-else-if="!users.length">
                                <td colspan="5" class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm">
                                    No hay usuarios registrados
                                </td>
                            </tr>
                            <tr
                                v-for="appUser in users"
                                :key="appUser.uid"
                                class="hover:bg-white/[0.02] transition-colors"
                            >
                                <td class="px-4 py-3.5">
                                    <p class="text-white text-sm font-medium">
                                        {{ appUser.displayName || "Sin nombre" }}
                                    </p>
                                    <p class="text-obsidian-500 text-xs font-mono">
                                        {{ appUser.uid }}
                                    </p>
                                </td>
                                <td class="px-4 py-3.5 text-obsidian-300 text-sm">
                                    {{ appUser.email || "--" }}
                                </td>
                                <td class="px-4 py-3.5">
                                    <span class="label-badge bg-acid-400/15 text-acid-400">
                                        {{ appUser.roleName || "Sin rol" }}
                                    </span>
                                </td>
                                <td class="px-4 py-3.5 text-obsidian-400 text-sm">
                                    {{ appUser.status ? 'Activo' : 'Inactivo' }}
                                </td>
                                <td class="px-4 py-3.5">
                                    <div class="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            class="btn-ghost h-8 px-3 text-xs"
                                            @click="openEdit(appUser)"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            class="h-8 px-3 rounded-xl border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors text-xs"
                                            @click="confirmDelete(appUser)"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- mobile -->
                <div class="md:hidden divide-y divide-white/[0.06]">
                    <div v-if="loading" class="p-8 text-center text-obsidian-500 font-mono text-sm">
                        Cargando usuarios...
                    </div>
                    <div
                        v-for="appUser in users"
                        v-else
                        :key="appUser.uid"
                        class="p-4"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="text-white text-sm font-medium">
                                    {{ appUser.displayName || "Sin nombre" }}
                                </p>
                                <p class="text-obsidian-500 text-xs">
                                    {{ appUser.email || "--" }}
                                </p>
                            </div>
                            <span class="label-badge bg-acid-400/15 text-acid-400">
                                {{ appUser.roleName || "Sin rol" }}
                            </span>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <button class="btn-ghost h-8 px-3 text-xs" @click="openEdit(appUser)">
                                Editar
                            </button>
                            <button
                                class="h-8 px-3 rounded-xl border border-coral-400/20 text-coral-400 text-xs"
                                @click="confirmDelete(appUser)"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Edit user -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="editingUser"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4"
                    @click.self="closeEdit"
                >
                    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                    <div class="relative glass-card z-10 w-full max-w-md p-6">
                        <h2 class="section-title text-xl mb-5">
                            Editar usuario
                        </h2>
                        <form class="space-y-4" @submit.prevent="handleSave">
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                    Nombre
                                </label>
                                <input v-model.trim="form.displayName" class="input-dark" type="text" />
                            </div>
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                    Email
                                </label>
                                <input v-model.trim="form.email" class="input-dark" type="email" />
                            </div>
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                    Rol
                                </label>
                                <select v-model="form.roleId" class="input-dark">
                                    <option value="">Sin rol</option>
                                    <option
                                        v-for="role in roles"
                                        :key="role.id"
                                        :value="role.id"
                                    >
                                        {{ role.name }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                    Estado
                                </label>
                                <select v-model="form.status" class="input-dark">
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>

                            <p v-if="formError" class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400">
                                {{ formError }}
                            </p>

                            <div class="flex gap-3 pt-2">
                                <button type="button" class="btn-ghost flex-1" @click="closeEdit">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-primary flex-1" :disabled="saving">
                                    {{ saving ? "Guardando..." : "Guardar" }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Delete user -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="deletingUser"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4"
                    @click.self="deletingUser = null"
                >
                    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                    <div class="relative glass-card border-coral-400/20 z-10 w-full max-w-sm p-6 text-center">
                        <h2 class="section-title text-xl mb-2">
                            Eliminar usuario
                        </h2>
                        <p class="text-obsidian-400 text-sm mb-6">
                            Se eliminara el perfil de
                            <strong class="text-white">
                                {{ deletingUser.displayName || deletingUser.email }}
                            </strong>
                            en Firestore.
                        </p>
                        <div class="flex gap-3">
                            <button class="btn-ghost flex-1" @click="deletingUser = null">
                                Cancelar
                            </button>
                            <button
                                class="flex-1 h-10 rounded-xl bg-coral-500 hover:bg-coral-400 text-white font-display font-bold text-sm transition-colors"
                                :disabled="deleting"
                                @click="handleDelete"
                            >
                                {{ deleting ? "Eliminando..." : "Eliminar" }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { AppUser } from "~/composables/useUsers";

const { initTheme } = useTheme();
const {
    users,
    loading,
    loadUsers,
    updateUser,
    deleteUserProfile,
} = useUsers();
const { roles, loadRoles } = useRoles();

const editingUser = ref<AppUser | null>(null);
const deletingUser = ref<AppUser | null>(null);
const saving = ref(false);
const deleting = ref(false);
const formError = ref("");
const form = reactive({
    displayName: "",
    email: "",
    roleId: "",
    status: "active",
});

onMounted(() => {
    initTheme();
    loadUsers();
    loadRoles();
});

const selectedRoleName = computed(
    () => roles.value.find((role) => role.id === form.roleId)?.name || "",
);

const openEdit = (appUser: AppUser) => {
    editingUser.value = appUser;
    form.displayName = appUser.displayName;
    form.email = appUser.email;
    form.roleId = appUser.roleId;
    form.status = appUser.status || "active";
    formError.value = "";
};

const closeEdit = () => {
    editingUser.value = null;
    formError.value = "";
};

const confirmDelete = (appUser: AppUser) => {
    deletingUser.value = appUser;
};

const handleSave = async () => {
    if (!editingUser.value) return;

    saving.value = true;
    formError.value = "";

    try {
        await updateUser(editingUser.value.uid, {
            displayName: form.displayName,
            email: form.email,
            roleId: form.roleId,
            roleName: selectedRoleName.value,
            status: form.status,
        });
        closeEdit();
    } catch {
        formError.value = "No se pudo guardar el usuario.";
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    if (!deletingUser.value) return;

    deleting.value = true;

    try {
        await deleteUserProfile(deletingUser.value.uid);
        deletingUser.value = null;
    } finally {
        deleting.value = false;
    }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
