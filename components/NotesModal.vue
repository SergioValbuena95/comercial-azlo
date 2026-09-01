<!-- components/NotesModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="$emit('update:modelValue', false)"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

                <section
                    class="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden glass-card border-white/10 shadow-2xl"
                    aria-labelledby="notes-modal-title"
                >
                    <header class="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5">
                        <div>
                            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-acid-300">
                                Historial
                            </p>
                            <h2 id="notes-modal-title" class="mt-1 font-display text-base font-bold text-white">
                                Notas del proyecto
                            </h2>
                            <p class="mt-1 max-w-xs truncate font-mono text-xs text-obsidian-500">
                                {{ projectTitle || "Proyecto sin nombre" }}
                            </p>
                        </div>
                        <button
                            type="button"
                            class="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-obsidian-400 transition-colors hover:bg-white/5 hover:text-white"
                            aria-label="Cerrar notas"
                            @click="$emit('update:modelValue', false)"
                        >
                            ×
                        </button>
                    </header>

                    <form class="border-b border-white/[0.07] p-5" @submit.prevent="handleSubmit">
                        <label for="new-project-note" class="mb-2 block text-sm font-semibold text-obsidian-200">
                            Nueva nota
                        </label>
                        <textarea
                            id="new-project-note"
                            v-model="draftNote"
                            class="input-dark min-h-24 resize-y"
                            placeholder="Escribe una actualización para este proyecto…"
                        />
                        <div class="mt-3 flex items-center justify-between gap-3">
                            <p class="text-xs text-obsidian-500">
                                La nota se añadirá al historial.
                            </p>
                            <button
                                type="submit"
                                class="btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
                                :disabled="!draftNote.trim() || saving"
                            >
                                {{ saving ? "Guardando…" : "Guardar nota" }}
                            </button>
                        </div>
                    </form>

                    <div class="min-h-0 flex-1 overflow-y-auto p-5">
                        <div v-if="loading" class="py-8 text-center font-mono text-xs text-obsidian-500">
                            Cargando historial…
                        </div>
                        <div
                            v-else-if="!historialNotes.length"
                            class="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center"
                        >
                            <p class="text-sm text-obsidian-300">Aún no hay notas registradas.</p>
                            <p class="mt-1 text-xs text-obsidian-500">Agrega la primera actualización arriba.</p>
                        </div>
                        <ol v-else class="relative ml-2 space-y-6 border-l border-white/10 pl-6">
                            <li
                                v-for="note in historialNotes"
                                :key="note.id"
                                class="relative"
                                @dblclick="startEditing(note)"
                            >
                                <span
                                    class="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-obsidian-900 bg-acid-400"
                                    aria-hidden="true"
                                ></span>
                                <div class="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                    <div class="flex items-center justify-between gap-3">
                                        <time class="font-mono text-[11px] text-obsidian-500" :datetime="note.created_at || undefined">
                                            {{ formatNoteDate(note.created_at) }}
                                        </time>
                                        <DeleteButton
                                            :hover="!saving"
                                            :disabled="saving"
                                            @click.stop="emit('delete', note.id)"
                                            @dblclick.stop
                                        />
                                    </div>
                                    <form
                                        v-if="editingNoteId === note.id"
                                        class="mt-2"
                                        @submit.prevent="saveEdit(note.id)"
                                    >
                                        <textarea
                                            v-model="editingNote"
                                            class="input-dark min-h-24 w-full resize-y"
                                            aria-label="Editar nota"
                                            autofocus
                                            @dblclick.stop
                                            @keydown.enter.exact.prevent="saveEdit(note.id)"
                                        />
                                        <div class="mt-3 flex justify-end gap-2">
                                            <button type="button" class="btn-ghost" :disabled="saving" @click="cancelEdit">
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                class="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                                                :disabled="!editingNote.trim() || saving"
                                            >
                                                {{ saving ? "Guardando..." : "Guardar" }}
                                            </button>
                                        </div>
                                    </form>
                                    <p v-else class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-obsidian-200">
                                        {{ note.note || "Nota sin contenido" }}
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { Tables } from "~/types/database.types";
type Note = Tables<"notes">;

const props = withDefaults(defineProps<{
    modelValue: boolean;
    projectTitle?: string;
    historialNotes?: Note[];
    loading?: boolean;
    saving?: boolean;
}>(), {
    historialNotes: () => [],
    loading: false,
    saving: false,
});

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    save: [note: string];
    update: [id: number, note: string];
    delete: [id: number];
}>();

const draftNote = ref("");
const editingNoteId = ref<number | null>(null);
const editingNote = ref("");

watch(() => props.modelValue, (isOpen) => {
    if (!isOpen) {
        draftNote.value = "";
        cancelEdit();
    }
});

const formatNoteDate = (value: string | null) => {
    if (!value) return "Fecha no disponible";

    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

const handleSubmit = () => {
    const note = draftNote.value.trim();
    if (!note || props.saving) return;

    emit("save", note);
    draftNote.value = "";
};

const startEditing = (note: Note) => {
    if (props.saving) return;

    editingNoteId.value = note.id;
    editingNote.value = note.note || "";
};

const cancelEdit = () => {
    editingNoteId.value = null;
    editingNote.value = "";
};

const saveEdit = (id: number) => {
    const note = editingNote.value.trim();
    if (!note || props.saving) return;

    emit("update", id, note);
    cancelEdit();
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-from .relative {
    transform: scale(0.96) translateY(8px);
}
.modal-leave-to .relative {
    transform: scale(0.96);
}
</style>
