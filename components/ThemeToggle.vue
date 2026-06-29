<template>
    <button
        type="button"
        class="theme-toggle"
        :aria-label="label"
        :title="label"
        @click="toggleTheme"
    >
        <svg
            v-if="isDark"
            aria-hidden="true"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
        <svg
            v-else
            aria-hidden="true"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path d="M20.99 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 20.99 12.79Z" />
        </svg>
    </button>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useTheme();

const label = computed(() =>
    isDark.value ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
);
</script>
