<!-- components/StatCard.vue -->
<template>
    <div
        class="glass-card p-6 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300"
        :class="{ 'hover:-translate-y-1': !flat }"
    >
        <!-- Accent glow -->
        <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            :style="`background: radial-gradient(circle at 20% 20%, ${accentColor}08 0%, transparent 60%)`"
        ></div>

        <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
                <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    :style="`background: ${accentColor}18; color: ${accentColor}`"
                >
                    {{ icon }}
                </div>
                <div
                    v-if="trend !== undefined"
                    class="flex items-center gap-1 text-xs font-mono"
                    :class="trend >= 0 ? 'text-emerald-400' : 'text-coral-400'"
                >
                    <span>{{ trend >= 0 ? "↑" : "↓" }}</span>
                    <span>{{ Math.abs(trend) }}%</span>
                </div>
            </div>

            <p
                class="text-obsidian-400 text-xs font-mono uppercase tracking-widest mb-1"
            >
                {{ label }}
            </p>

            <div class="flex items-end gap-2">
                <span
                    ref="counterEl"
                    class="font-display font-bold text-3xl text-white tabular-nums"
                    :style="`color: ${valueColor || 'white'}`"
                >
                    {{ renderedValue }}
                </span>
                <span v-if="suffix" class="text-obsidian-400 text-sm mb-1">{{
                    suffix
                }}</span>
            </div>

            <p v-if="sub" class="text-obsidian-500 text-xs mt-2">{{ sub }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    label: string;
    value: number;
    icon: string;
    accentColor?: string;
    valueColor?: string;
    trend?: number;
    suffix?: string;
    sub?: string;
    flat?: boolean;
    valueFormatter?: (value: number) => string;
}>();

const displayValue = ref(0);
let animationFrame: number | null = null;

const renderedValue = computed(() =>
    props.valueFormatter ? props.valueFormatter(displayValue.value) : displayValue.value,
);

const animateToValue = (target: number) => {
    if (!import.meta.client) {
        displayValue.value = target;
        return;
    }

    if (animationFrame !== null) cancelAnimationFrame(animationFrame);

    const initial = displayValue.value;
    const duration = 1200;
    const start = Date.now();

    const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        displayValue.value = Math.round(initial + (target - initial) * ease);
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
        else animationFrame = null;
    };

    animationFrame = requestAnimationFrame(tick);
};

watch(
    () => props.value,
    (value) => {
        animateToValue(value);
    },
    { immediate: true },
);

onUnmounted(() => {
    if (import.meta.client && animationFrame !== null)
        cancelAnimationFrame(animationFrame);
});
</script>
