<!-- components/modals/FilesModal.vue -->
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
                    <HeaderModal
                        :project-title="projectTitle"
                        @close="emit('update:modelValue', false)"
                    />

                    <div class="p-5">
                            <p class="text-xs font-mono uppercase tracking-wider text-obsidian-500 mb-2">
                                Archivos
                            </p>
                            <div class="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-obsidian-200">
                                <div v-if="filesLoading" class="text-xs text-obsidian-400 font-mono py-2 flex items-center gap-2">
                                    <span class="animate-spin text-xs">🌀</span> Cargando archivos...
                                </div>
                                <div v-else-if="filesError" class="text-xs text-red-400 font-mono py-2">
                                    {{ filesError }}
                                </div>
                                <div v-else-if="projectFiles.length === 0" class="text-xs text-obsidian-400 font-mono py-2">
                                    Sin archivos adjuntos.
                                </div>
                                <CardsFiles v-else :project-files="projectFiles" />
                            </div>
                        </div>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { useProjectFiles } from "~/composables/useProjectFiles";
const {
    projectFiles,
    loading: filesLoading,
    error: filesError,
    fetchFilesByProject
} = useProjectFiles();


const props = withDefaults(defineProps<{
    modelValue: boolean;
    projectTitle?: string;
    projectId?: string | number;
}>(), {
    projectTitle: "",
});

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
}>();

const loadFiles = async () => {
    if (!props.projectId) return;
    const numericId = Number(props.projectId);
    if (numericId) {
        await fetchFilesByProject(numericId);
    }
};

watch(
    () => [props.modelValue, props.projectId] as const,
    ([isOpen, id]) => {
        if (isOpen && id) {
            loadFiles();
        } else if (!isOpen) {
            projectFiles.value = [];
        }
    },
    { immediate: true }
);
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
