<template>
    <header class="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5">
        <div>
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-acid-300">
                Historial
            </p>
            <h2 id="notes-modal-title" class="mt-1 font-display text-base font-bold text-white">
                Archivos del proyecto
            </h2>
            <p class="mt-1 max-w-xs truncate font-mono text-xs text-obsidian-500">
                {{ projectTitle || "Proyecto sin nombre" }}
            </p>
        </div>
        <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-obsidian-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cerrar notas"
            @click="emit('close')"
        >
            ×
        </button>
    </header>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    projectTitle?: string;
}>(), {
    projectTitle: "",
});

const emit = defineEmits<{
    close: [];
}>();
</script>
