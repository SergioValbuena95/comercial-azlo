<template>
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
            <div class="inline-flex items-center gap-2 text-xs font-mono text-acid-400 bg-acid-400/10 border border-acid-400/20 rounded-full px-3 py-1 mb-3">
                <span class="w-1.5 h-1.5 bg-acid-400 rounded-full animate-pulse"></span>
                Dashboard activo
            </div>
            <h1 class="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                Seguimiento<br />
                <span class="text-obsidian-500">Comercial</span>
            </h1>
        </div>
        <div class="text-right">
            <p class="text-obsidian-500 text-xs font-mono uppercase tracking-wider">
                Última actualización
            </p>
            <p class="text-white font-mono text-sm">
                {{ currentDate }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const currentDate = computed(() =>
    new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }),
);
</script>
