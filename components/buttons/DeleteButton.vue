<template>
    <button
        :class="[
            'w-8 h-8 flex items-center justify-center rounded-lg  text-obsidian-500  transition-colors text-sm cursor-pointer',
            { 'hover:bg-coral-400/10 hover:text-coral-400': hover }
        ]"
        title="Eliminar"
        aria-label="Eliminar"
    >
        <svg
            aria-hidden="true"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
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