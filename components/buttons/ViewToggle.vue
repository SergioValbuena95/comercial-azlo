<template>
    <div class="flex items-center justify-between gap-4 pt-2">
        <div class="flex items-center gap-2">
            <div class="inline-flex p-1 rounded-xl bg-obsidian-900/90 border border-white/[0.08] backdrop-blur-md">
                <button
                    v-for="item in options"
                    :key="item?.value"
                    type="button"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    :class="
                        modelValue === item?.value
                            ? 'bg-acid-400 text-white-950 font-bold shadow-sm'
                            : 'text-obsidian-400 hover:text-white'
                    "
                    @click="setView(item.value)"
                >
                    <component :is="item.icon" class="w-4" />
                    <span> {{ item?.label }} </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SquareKanban } from '@lucide/vue';
defineProps({
    modelValue: {
        type: String,
        default: 'table'
    },
    options: {
        type: Array as () => Array<{ value: string; label: string; icon: Component }>,
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
