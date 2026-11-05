<template>
    <section class="glass-card overflow-hidden">
        <div class="border-b border-white/[0.06] px-4 py-4 sm:px-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-1">
                        Acceso
                    </p>
                    <h2 class="section-title text-xl">
                        Usuarios
                    </h2>
                </div>
                <div class="flex items-center gap-3">
                    <span class="label-badge bg-acid-400/15 text-acid-400">
                        {{ users.length }} registros
                    </span>
                    <button
                        type="button"
                        class="btn-primary h-9 px-3 text-xs flex items-center gap-1.5"
                        @click="openCreate"
                    >
                        <span class="text-sm leading-none">+</span>
                        <span>Nuevo usuario</span>
                    </button>
                </div>
            </div>

            <p
                v-if="panelSuccessMessage"
                class="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-400"
            >
                {{ panelSuccessMessage }}
            </p>
        </div>

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
                    <tr v-else-if="error">
                        <td colspan="5" class="px-4 py-12 text-center text-coral-400 text-sm">
                            {{ error }}
                        </td>
                    </tr>
                    <tr v-else-if="!users.length">
                        <td colspan="5" class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm">
                            No hay usuarios registrados
                        </td>
                    </tr>
                    <tr
                        v-for="user in users"
                        :key="user.uid"
                        class="hover:bg-white/[0.02] transition-colors"
                    >
                        <td class="px-4 py-3.5">
                            <p class="text-white text-sm font-medium">
                                {{ user.displayName || "Sin nombre" }}
                            </p>
                        </td>
                        <td class="px-4 py-3.5 text-obsidian-300 text-sm">
                            {{ user.email || "--" }}
                        </td>
                        <td class="px-4 py-3.5">
                            <span class="label-badge bg-acid-400/15 text-acid-400">
                                {{ user.roleName || "Sin rol" }}
                            </span>
                        </td>
                        <td class="px-4 py-3.5 text-obsidian-400 text-sm">
                            {{ user.status === "inactive" ? "Inactivo" : "Activo" }}
                        </td>
                        <td class="px-4 py-3.5">
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    class="btn-ghost h-8 px-3 text-xs"
                                    @click="openEdit(user)"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    class="h-8 px-3 rounded-xl border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors text-xs"
                                    @click="confirmDelete(user)"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="md:hidden divide-y divide-white/[0.06]">
            <div v-if="loading" class="p-8 text-center text-obsidian-500 font-mono text-sm">
                Cargando usuarios...
            </div>
            <div v-else-if="error" class="p-8 text-center text-coral-400 text-sm">
                {{ error }}
            </div>
            <div
                v-for="user in users"
                v-else
                :key="user.uid"
                class="p-4"
            >
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-white text-sm font-medium">
                            {{ user.displayName || "Sin nombre" }}
                        </p>
                        <p class="text-obsidian-500 text-xs">
                            {{ user.email || "--" }}
                        </p>
                    </div>
                    <span class="label-badge bg-acid-400/15 text-acid-400">
                        {{ user.roleName || "Sin rol" }}
                    </span>
                </div>
                <div class="flex gap-2 mt-4">
                    <button class="btn-ghost h-8 px-3 text-xs" @click="openEdit(user)">
                        Editar
                    </button>
                    <button
                        class="h-8 px-3 rounded-xl border border-coral-400/20 text-coral-400 text-xs"
                        @click="confirmDelete(user)"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Create / Invite User Modal -->
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="creatingUser"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="closeCreate"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card z-10 w-full max-w-md p-6">
                    <div class="mb-5">
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-1">
                            Nuevo acceso
                        </p>
                        <h2 class="section-title text-xl">
                            {{
                                createForm.mode === "invite"
                                    ? "Invitar usuario por correo"
                                    : "Crear usuario"
                            }}
                        </h2>
                    </div>

                    <div class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
                        <button
                            type="button"
                            class="h-9 rounded-lg text-xs font-medium transition-colors"
                            :class="
                                createForm.mode === 'password'
                                    ? 'bg-acid-400/20 text-acid-400 border border-acid-400/30'
                                    : 'text-obsidian-400 hover:text-white'
                            "
                            @click="createForm.mode = 'password'"
                        >
                            Asignar password
                        </button>
                        <button
                            type="button"
                            class="h-9 rounded-lg text-xs font-medium transition-colors"
                            :class="
                                createForm.mode === 'invite'
                                    ? 'bg-acid-400/20 text-acid-400 border border-acid-400/30'
                                    : 'text-obsidian-400 hover:text-white'
                            "
                            @click="createForm.mode = 'invite'"
                        >
                            Invitar por correo
                        </button>
                    </div>

                    <form class="space-y-4" @submit.prevent="handleCreateUser">
                        <div>
                            <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                Nombre
                            </label>
                            <input
                                v-model.trim="createForm.displayName"
                                class="input-dark"
                                type="text"
                                placeholder="Nombre completo"
                                required
                            />
                        </div>

                        <div>
                            <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                Email
                            </label>
                            <input
                                v-model.trim="createForm.email"
                                class="input-dark"
                                type="email"
                                placeholder="correo@empresa.com"
                                required
                            />
                        </div>

                        <div>
                            <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                Rol
                            </label>
                            <select v-model="createForm.roleId" class="input-dark">
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

                        <div v-if="createForm.mode === 'password'">
                            <div class="flex items-center justify-between gap-3 mb-2">
                                <label class="block text-xs font-mono text-obsidian-400">
                                    Password inicial
                                </label>
                                <button
                                    type="button"
                                    class="text-xs text-obsidian-400 hover:text-white transition-colors"
                                    @click="showCreatePassword = !showCreatePassword"
                                >
                                    {{ showCreatePassword ? "Ocultar" : "Mostrar" }}
                                </button>
                            </div>
                            <input
                                v-model="createForm.password"
                                class="input-dark"
                                :type="showCreatePassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                placeholder="Minimo 6 caracteres"
                            />
                        </div>
                        <p
                            v-else
                            class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-xs text-obsidian-400"
                        >
                            Se enviara un correo de invitacion para que el usuario configure su propio password e ingrese a la plataforma.
                        </p>

                        <div>
                            <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                Estado
                            </label>
                            <select v-model="createForm.status" class="input-dark">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>

                        <p
                            v-if="createFormError"
                            class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400"
                        >
                            {{ createFormError }}
                        </p>

                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                class="btn-ghost flex-1"
                                :disabled="creating"
                                @click="closeCreate"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                class="btn-primary flex-1"
                                :disabled="creating"
                            >
                                {{
                                    creating
                                        ? createForm.mode === "invite"
                                            ? "Enviando..."
                                            : "Creando..."
                                        : createForm.mode === "invite"
                                          ? "Enviar invitacion"
                                          : "Crear usuario"
                                }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Edit User Modal -->
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
                    <form class="space-y-4" @submit.prevent="handleSaveUser">
                        <div>
                            <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                Nombre
                            </label>
                            <input
                                v-model.trim="form.displayName"
                                class="input-dark"
                                type="text"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-mono text-obsidian-400 mb-2">
                                Email
                            </label>
                            <input
                                v-model.trim="form.email"
                                class="input-dark"
                                type="email"
                            />
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
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>

                        <p v-if="formError" class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400">
                            {{ formError }}
                        </p>

                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                class="btn-ghost flex-1"
                                @click="closeEdit"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                class="btn-primary flex-1"
                                :disabled="saving"
                            >
                                {{ saving ? "Guardando..." : "Guardar" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Delete User Modal -->
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
</template>

<script setup lang="ts">
import type { AppUser } from "~/composables/useUsers";

const {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUserProfile,
} = useUsers();
const { roles, loadRoles } = useRoles();

const creatingUser = ref(false);
const creating = ref(false);
const showCreatePassword = ref(false);
const createFormError = ref("");
const panelSuccessMessage = ref("");

const createForm = reactive({
    mode: "password" as "password" | "invite",
    displayName: "",
    email: "",
    roleId: "3",
    password: "",
    status: "active" as "active" | "inactive",
});

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
    loadUsers();
    loadRoles();
});

const selectedRoleName = computed(
    () => roles.value.find((role) => role.id === form.roleId)?.name || "",
);

const openCreate = () => {
    panelSuccessMessage.value = "";
    createFormError.value = "";
    showCreatePassword.value = false;
    createForm.mode = "password";
    createForm.displayName = "";
    createForm.email = "";
    createForm.roleId = roles.value.find((r) => r.id === "3")?.id || roles.value[0]?.id || "";
    createForm.password = "";
    createForm.status = "active";
    creatingUser.value = true;
};

const closeCreate = () => {
    creatingUser.value = false;
    createFormError.value = "";
};

const handleCreateUser = async () => {
    createFormError.value = "";
    panelSuccessMessage.value = "";

    if (!createForm.displayName) {
        createFormError.value = "Ingresa el nombre del usuario.";
        return;
    }

    if (!createForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
        createFormError.value = "Ingresa un correo electronico valido.";
        return;
    }

    if (createForm.mode === "password" && createForm.password.length < 6) {
        createFormError.value = "El password debe tener al menos 6 caracteres.";
        return;
    }

    creating.value = true;

    try {
        await createUser({
            displayName: createForm.displayName,
            email: createForm.email,
            roleId: createForm.roleId,
            status: createForm.status,
            mode: createForm.mode,
            password: createForm.mode === "password" ? createForm.password : undefined,
        });

        const targetEmail = createForm.email;
        const usedMode = createForm.mode;
        closeCreate();

        panelSuccessMessage.value =
            usedMode === "invite"
                ? `Invitacion enviada a ${targetEmail} y perfil creado.`
                : `Usuario ${targetEmail} creado correctamente.`;
    } catch (err: any) {
        createFormError.value =
            err?.data?.statusMessage ||
            err?.statusMessage ||
            err?.message ||
            "No se pudo crear el usuario.";
    } finally {
        creating.value = false;
    }
};

const openEdit = (appUser: AppUser) => {
    panelSuccessMessage.value = "";
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
    panelSuccessMessage.value = "";
    deletingUser.value = appUser;
};

const handleSaveUser = async () => {
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
        panelSuccessMessage.value = "Usuario actualizado correctamente.";
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
        panelSuccessMessage.value = "Usuario eliminado correctamente.";
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
