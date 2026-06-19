<!-- components/NotesModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="$emit('update:modelValue', false)"
            >
                <div
                    class="absolute inset-0 bg-black/70 backdrop-blur-sm"
                ></div>

                <div
                    class="relative z-10 w-full max-w-md glass-card border-white/10 shadow-2xl"
                >
                    <div
                        class="flex items-start justify-between gap-4 p-5 border-b border-white/[0.07]"
                    >
                        <div>
                            <h2
                                class="font-display font-bold text-white text-base"
                            >
                                Notas
                            </h2>
                            <p
                                class="text-obsidian-500 text-xs font-mono mt-1 truncate max-w-xs"
                            >
                                {{ projectTitle || "Proyecto sin nombre" }}
                            </p>
                        </div>
                        <button
                            type="button"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-lg"
                            aria-label="Cerrar notas"
                            @click="$emit('update:modelValue', false)"
                        >
                            x
                        </button>
                    </div>

                    <form class="p-5" @submit.prevent="handleSubmit">
                        <p
                            v-if="cleanNotes && !isEditing"
                            class="text-sm leading-relaxed text-obsidian-200 whitespace-pre-wrap"
                        >
                            {{ cleanNotes }}
                        </p>
                        <div
                            v-if="cleanNotes && !isEditing"
                            class="flex justify-end mt-5"
                        >
                            <button
                                type="button"
                                class="btn-ghost"
                                @click="startEditing"
                            >
                                Editar nota
                            </button>
                        </div>
                        <div v-else class="space-y-4">
                            <p
                                v-if="!cleanNotes"
                                class="text-sm text-obsidian-500 font-mono"
                            >
                                Sin notas registradas.
                            </p>
                            <textarea
                                v-model="draftNotes"
                                class="input-dark min-h-28 resize-y"
                                placeholder="Agregar nota para este proyecto"
                            ></textarea>
                            <div class="flex justify-end gap-3">
                                <button
                                    type="button"
                                    class="btn-ghost"
                                    @click="cancelEditing"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    class="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                    :disabled="!draftNotes.trim()"
                                >
                                    Guardar nota
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean;
    projectTitle?: string;
    notes?: string;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    save: [notes: string];
}>();

const cleanNotes = computed(() => props.notes?.trim() || "");
const draftNotes = ref("");
const isEditing = ref(false);

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            draftNotes.value = cleanNotes.value;
            isEditing.value = !cleanNotes.value;
        }
    },
);

watch(
    () => props.notes,
    (notes) => {
        if (!props.modelValue || isEditing.value) return;
        draftNotes.value = notes?.trim() || "";
    },
);

const startEditing = () => {
    draftNotes.value = cleanNotes.value;
    isEditing.value = true;
};

const cancelEditing = () => {
    if (cleanNotes.value) {
        draftNotes.value = cleanNotes.value;
        isEditing.value = false;
        return;
    }

    emit("update:modelValue", false);
};

const handleSubmit = () => {
    const notes = draftNotes.value.trim();
    if (!notes) return;
    emit("save", notes);
    isEditing.value = false;
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
