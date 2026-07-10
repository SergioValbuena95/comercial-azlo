<template>
    <button
        :class="[
            'w-8 h-8 flex items-center justify-center rounded-lg text-obsidian-400 transition-colors text-sm',
            { 'hover:bg-white/5 hover:text-white': hover }
        ]"
        title="Editar"
        aria-label="Editar"
    >
        <svg
            aria-hidden="true"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    </button>
</template>

<script setup lang="ts">
defineProps({
    hover: {
        type: Boolean,
        default: true
    }
})
</script>
