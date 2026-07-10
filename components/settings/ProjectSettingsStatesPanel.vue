<template>
    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="glass-card overflow-hidden">
            <div class="border-b border-white/[0.06] px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-1">
                            Estados
                        </p>
                        <h2 class="section-title text-xl">
                            Tipos de estados
                        </h2>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="label-badge bg-acid-400/15 text-acid-400">
                            {{ projectStateType.length }} registros
                        </span>
                        <button
                            type="button"
                            class="btn-primary h-9 px-3 text-xs"
                            @click="openCreate"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            <div class="divide-y divide-white/[0.04]">
                <div
                    v-if="loading"
                    class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                >
                    Cargando tipos de proyecto...
                </div>
                <div
                    v-else-if="error"
                    class="px-4 py-12 text-center text-coral-400 text-sm"
                >
                    {{ error }}
                </div>
                <div
                    v-else-if="!projectStateType.length"
                    class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                >
                    No hay tipos de proyecto registrados
                </div>
                <div
                    v-for="state in projectStateType"
                    v-else
                    :key="state.id"
                    class="px-4 py-4 sm:px-6 hover:bg-white/[0.02] transition-colors"
                >
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div class="w-full">
                            <p class="text-white text-sm font-medium">
                                {{ state.name || "Sin nombre" }}
                            </p>
                            <p
                                v-if="state.description"
                                class="text-obsidian-400 text-sm mt-1"
                            >
                                {{ state.description }}
                            </p>

                            <!-- Sub-states -->
                            <div class="mt-4">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="text-xs font-mono uppercase text-obsidian-400">Sub-estados</p>
                                    <button
                                        type="button"
                                        class="text-xs text-acid-400 hover:text-acid-300 transition-colors"
                                        @click="openCreateSubState(state)"
                                    >
                                        + Agregar
                                    </button>
                                </div>
                                <div v-if="state.sub_state && state.sub_state.length > 0" class="space-y-3">
                                    <div
                                        v-for="subState in state.sub_state"
                                        :key="subState.id"
                                        class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 border border-white/[0.04]"
                                    >
                                        <span class="text-sm text-obsidian-200">{{ subState.name || "Sin nombre" }}</span>
                                        <div class="flex items-center gap-2">
                                            <EditButton @click="openEditSubState(state, subState)" />
                                            <DeleteButton @click="confirmDeleteSubState(subState)" />
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="text-xs text-obsidian-500 font-mono py-2 text-center bg-white/[0.01] rounded-lg border border-white/[0.02] border-dashed">
                                    Sin sub-estados
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 sm:justify-end">
                            <button
                                type="button"
                                class="btn-ghost h-8 px-3 text-xs"
                                @click="openEdit(state)"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                class="h-8 px-3 rounded-xl border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors text-xs"
                                @click="confirmDelete(state)"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Modal Form Create/Edit -->
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="showFormModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="closeForm"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card z-10 w-full max-w-md p-6">
                    <div class="mb-5">
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                            {{ editingProjectState ? "Editar registro" : "Nuevo registro" }}
                        </p>
                        <h3 class="section-title text-xl">
                            {{ editingProjectState ? "Editar estado" : "Agregar estado" }}
                        </h3>
                    </div>

                    <form class="space-y-4" @submit.prevent="handleSaveState">
                        <div>
                            <label
                                for="product-type-name"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Nombre
                            </label>
                            <input
                                id="product-type-name"
                                v-model.trim="form.name"
                                class="input-dark"
                                type="text"
                                placeholder="Nombre del estado"
                                autocomplete="off"
                            />
                        </div>

                        <p
                            v-if="formError"
                            class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400"
                        >
                            {{ formError }}
                        </p>

                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                class="btn-ghost flex-1"
                                @click="closeForm"
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

    <!-- Modal Delete -->
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="deletingProjectState"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="deletingProjectState = null"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card border-coral-400/20 z-10 w-full max-w-sm p-6 text-center">
                    <h2 class="section-title text-xl mb-2">
                        Eliminar tipo de proyecto
                    </h2>
                    <p class="text-obsidian-400 text-sm mb-6">
                        Se eliminara
                        <strong class="text-white">
                            {{ deletingProjectState.name || "Sin nombre" }}
                        </strong>
                        de la coleccion states.
                    </p>
                    <p
                        v-if="deleteError"
                        class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400 mb-4"
                    >
                        {{ deleteError }}
                    </p>
                    <div class="flex gap-3">
                        <button class="btn-ghost flex-1" @click="deletingProjectState = null">
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
    <!-- Modal Form Sub-State Create/Edit -->
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="showSubStateFormModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="closeSubStateForm"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card z-10 w-full max-w-md p-6">
                    <div class="mb-5">
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                            {{ editingSubState ? "Editar sub-estado" : "Nuevo sub-estado" }}
                        </p>
                        <h3 class="section-title text-xl">
                            {{ targetParentState?.name }}
                        </h3>
                    </div>

                    <form class="space-y-4" @submit.prevent="handleSaveSubState">
                        <div>
                            <label
                                for="sub-state-name"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Nombre
                            </label>
                            <input
                                id="sub-state-name"
                                v-model.trim="subStateForm.name"
                                class="input-dark"
                                type="text"
                                placeholder="Nombre del sub-estado"
                                autocomplete="off"
                            />
                        </div>

                        <p
                            v-if="subStateFormError"
                            class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400"
                        >
                            {{ subStateFormError }}
                        </p>

                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                class="btn-ghost flex-1"
                                @click="closeSubStateForm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                class="btn-primary flex-1"
                                :disabled="savingSubState"
                            >
                                {{ savingSubState ? "Guardando..." : "Guardar" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- Modal Delete Sub-State -->
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="deletingSubState"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="deletingSubState = null"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card border-coral-400/20 z-10 w-full max-w-sm p-6 text-center">
                    <h2 class="section-title text-xl mb-2">
                        Eliminar sub-estado
                    </h2>
                    <p class="text-obsidian-400 text-sm mb-6">
                        Se eliminara
                        <strong class="text-white">
                            {{ deletingSubState.name || "Sin nombre" }}
                        </strong>
                        permanentemente.
                    </p>
                    <p
                        v-if="deleteSubStateError"
                        class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400 mb-4"
                    >
                        {{ deleteSubStateError }}
                    </p>
                    <div class="flex gap-3">
                        <button class="btn-ghost flex-1" @click="deletingSubState = null">
                            Cancelar
                        </button>
                        <button
                            class="flex-1 h-10 rounded-xl bg-coral-500 hover:bg-coral-400 text-white font-display font-bold text-sm transition-colors"
                            :disabled="deletingSubStateInProgress"
                            @click="handleDeleteSubState"
                        >
                            {{ deletingSubStateInProgress ? "Eliminando..." : "Eliminar" }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { ProjectState, SubState } from "~/composables/useProjectStates";

const {
    loading,
    error,
    projectStateType,
    loadMainStates,
    addProjectState,
    updateProjectState,
    deleteProjectState,
    addSubState,
    updateSubState,
    deleteSubState
} = useProjectStatesTypes();

const showFormModal = ref(false);
const editingProjectState = ref<ProjectState | null>(null);
const deletingProjectState = ref<ProjectState | null>(null);
const saving = ref(false);
const deleting = ref(false);
const formError = ref("");
const deleteError = ref("");
const form = reactive({
    name: "",
    description: "",
});

// Sub-states state
const showSubStateFormModal = ref(false);
const targetParentState = ref<ProjectState | null>(null);
const editingSubState = ref<SubState | null>(null);
const deletingSubState = ref<SubState | null>(null);
const savingSubState = ref(false);
const deletingSubStateInProgress = ref(false);
const subStateFormError = ref("");
const deleteSubStateError = ref("");
const subStateForm = reactive({
    name: "",
});

onMounted(() => {
    loadMainStates();
});

const openCreate = () => {
    editingProjectState.value = null;
    form.name = "";
    form.description = "";
    formError.value = "";
    showFormModal.value = true;
};

const openEdit = (projectState: ProjectState) => {
    editingProjectState.value = projectState;
    form.name = projectState.name;
    formError.value = "";
    showFormModal.value = true;
};

const closeForm = () => {
    showFormModal.value = false;
    editingProjectState.value = null;
    formError.value = "";
};

const confirmDelete = (projectState: ProjectState) => {
    deletingProjectState.value = projectState;
    deleteError.value = "";
};

const handleSaveState = async () => {
    if (!form.name.trim()) {
        formError.value = "El nombre es obligatorio.";
        return;
    }

    saving.value = true;
    formError.value = "";

    try {
        const payload = {
            name: form.name,
            description: form.description,
        };

        if (editingProjectState.value) {
            await updateProjectState(editingProjectState.value.id, payload);
        } else {
            await addProjectState(payload);
        }

        closeForm();
    } catch {
        formError.value = "No se pudo guardar el tipo de proyecto.";
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    if (!deletingProjectState.value) return;

    deleting.value = true;
    deleteError.value = "";

    try {
        await deleteProjectState(deletingProjectState.value.id);
        deletingProjectState.value = null;
    } catch {
        deleteError.value = "No se pudo eliminar el tipo de proyecto.";
    } finally {
        deleting.value = false;
    }
};

// Sub-states handlers
const openCreateSubState = (parentState: ProjectState) => {
    targetParentState.value = parentState;
    editingSubState.value = null;
    subStateForm.name = "";
    subStateFormError.value = "";
    showSubStateFormModal.value = true;
};

const openEditSubState = (parentState: ProjectState, subState: SubState) => {
    targetParentState.value = parentState;
    editingSubState.value = subState;
    subStateForm.name = subState.name;
    subStateFormError.value = "";
    showSubStateFormModal.value = true;
};

const closeSubStateForm = () => {
    showSubStateFormModal.value = false;
    targetParentState.value = null;
    editingSubState.value = null;
    subStateFormError.value = "";
};

const confirmDeleteSubState = (subState: SubState) => {
    deletingSubState.value = subState;
    deleteSubStateError.value = "";
};

const handleSaveSubState = async () => {
    if (!subStateForm.name.trim()) {
        subStateFormError.value = "El nombre es obligatorio.";
        return;
    }
    if (!targetParentState.value) return;

    savingSubState.value = true;
    subStateFormError.value = "";

    try {
        if (editingSubState.value) {
            await updateSubState(editingSubState.value.id, subStateForm.name);
        } else {
            await addSubState(targetParentState.value.id, subStateForm.name);
        }
        closeSubStateForm();
    } catch {
        subStateFormError.value = "No se pudo guardar el sub-estado.";
    } finally {
        savingSubState.value = false;
    }
};

const handleDeleteSubState = async () => {
    if (!deletingSubState.value) return;

    deletingSubStateInProgress.value = true;
    deleteSubStateError.value = "";

    try {
        await deleteSubState(deletingSubState.value.id);
        deletingSubState.value = null;
    } catch {
        deleteSubStateError.value = "No se pudo eliminar el sub-estado.";
    } finally {
        deletingSubStateInProgress.value = false;
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

