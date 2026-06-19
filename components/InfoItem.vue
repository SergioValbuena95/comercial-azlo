<!-- components/InfoItem.vue -->
<template>
    <div class="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <p class="text-[10px] font-mono uppercase tracking-wider text-obsidian-500">
            {{ label }}
        </p>
        <p class="mt-1 text-sm text-white break-words">
            {{ displayValue }}
        </p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    label: string;
    value?: string | number | null;
}>();

const displayValue = computed(() => {
    if (props.value === null || props.value === undefined || props.value === "")
        return "Sin definir";
    return props.value;
});
</script>
