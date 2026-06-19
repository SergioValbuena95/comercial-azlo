<!-- components/StatusBadge.vue -->
<template>
    <span :class="badgeClass">
        <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
        {{ estado }}
    </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ estado: string }>();

const badgeClass = computed(() => {
    const map: Record<string, string> = {
        Programado:
            "label-badge bg-blue-500/15 text-blue-300 border border-blue-500/20",
        Aprobado:
            "label-badge bg-acid-400/15 text-acid-400 border border-acid-400/20",
        Instalado:
            "label-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        Entregado:
            "label-badge bg-purple-500/15 text-purple-300 border border-purple-500/20",
        Cerrado:
            "label-badge bg-white/5 text-obsidian-400 border border-white/10",
        Prospecto:
            "label-badge bg-amber-500/15 text-amber-400 border border-amber-500/20",
        Cotizado:
            "label-badge bg-orange-500/15 text-orange-400 border border-orange-500/20",
        "En instalación":
            "label-badge bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
    };
    return map[props.estado] || "label-badge bg-white/5 text-obsidian-400";
});

const dotClass = computed(() => {
    const map: Record<string, string> = {
        Programado: "bg-blue-400",
        Aprobado: "bg-acid-400",
        Instalado: "bg-emerald-400",
        Entregado: "bg-purple-400",
        Cerrado: "bg-obsidian-500",
        Prospecto: "bg-amber-400",
        Cotizado: "bg-orange-400",
        "En instalación": "bg-cyan-400",
    };
    return map[props.estado] || "bg-obsidian-500";
});
</script>
