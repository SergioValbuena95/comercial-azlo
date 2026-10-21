<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
            label="Total Proyectos"
            :value="stats.total"
            icon="📋"
            accent-color="#005571"
            :sub="`${totalCities} ciudades`"
        />
        <StatCard
            label="Proyectos Activos"
            :value="stats.active"
            icon="⚡"
            accent-color="#74b9ff"
            :sub="`${percent(stats.active, stats.total)}%`"
        />
        <StatCard
            label="En tramite"
            :value="stats.closed"
            icon="🤝"
            accent-color="#a29bfe"
            :sub="`${percent(stats.closed, stats.total)}%`"
        />
        <StatCard
            label="Cartera y finalizado"
            :value="stats.completed"
            icon="✅"
            accent-color="#00b894"
            :sub="`${percent(stats.completed, stats.total)}%`"
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    stats: {
        type: Object,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    loading: {
        type: Boolean,
        required: true,
    },
    totalCities: {
        type: Number,
        required: true,
    },
});

const percent = (value: number, total: number) =>
    total ? Math.round((value / total) * 100) : 0;
</script>
