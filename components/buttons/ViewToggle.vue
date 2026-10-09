<template>
    <div class="flex items-center justify-between gap-4 pt-2">
        <div class="flex items-center gap-2">
            <div
                class="view-toggle-container inline-flex p-1 rounded-xl border backdrop-blur-md transition-colors"
                :class="
                    isDark
                        ? 'bg-obsidian-900/90 border-white/[0.08]'
                        : 'bg-white border-[#005571]/20 shadow-sm'
                "
            >
                <button
                    v-for="item in options"
                    :key="item?.value"
                    type="button"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    :class="
                        modelValue === item?.value
                            ? 'view-toggle-btn-active bg-acid-400 font-bold shadow-sm'
                            : isDark
                                ? 'text-obsidian-400 hover:text-white hover:bg-white/5'
                                : 'view-toggle-btn-inactive'
                    "
                    @click="setView(item.value)"
                >
                    <component :is="item.icon" class="w-4 h-4" />
                    <span>{{ item?.label }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
const { isDark } = useTheme()

defineProps({
    modelValue: {
        type: String,
        default: 'table'
    },
    options: {
        type: Array as () => Array<{ value: string; label: string; icon?: Component }>,
        default: () => [
            { value: "table", label: "Tabla" },
            { value: "kanban", label: "Kanban" },
        ]
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const setView = (view: string) => {
    emit('update:modelValue', view)
    emit('change', view)
}
</script>

<style scoped>
/* Always keep white text and icons on the active teal button */
.view-toggle-btn-active,
.view-toggle-btn-active * {
    color: #ffffff !important;
}

/* Light Mode Overrides */
:global(.theme-light) .view-toggle-container {
    background-color: #ffffff !important;
    border-color: rgba(0, 85, 113, 0.18) !important;
    box-shadow: 0 2px 10px rgba(0, 85, 113, 0.08) !important;
}

:global(.theme-light) .view-toggle-btn-active,
:global(.theme-light) .view-toggle-btn-active * {
    color: #ffffff !important;
}

:global(.theme-light) .view-toggle-btn-inactive {
    color: #60737c !important;
}

:global(.theme-light) .view-toggle-btn-inactive:hover {
    color: #10232c !important;
    background-color: rgba(0, 85, 113, 0.06) !important;
}
</style>

