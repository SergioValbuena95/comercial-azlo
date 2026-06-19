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

const statusKey = computed(() => {
    const value = props.estado.toLowerCase();

    if (value.includes("vendido") && value.includes("instal"))
        return "vendidoInstalacion";
    if (value.includes("vendido")) return "vendido";
    if (value.includes("fabricaci")) return "fabricacion";
    if (value.includes("despacho")) return "despacho";
    if (value.includes("instal")) return "instalacion";
    if (value.includes("terminado")) return "terminado";
    if (value.includes("facturado")) return "facturado";

    return props.estado;
});

const badgeClass = computed(() => {
    const map: Record<string, string> = {
        vendido:
            "label-badge bg-blue-500/15 text-blue-300 border border-blue-500/20",
        fabricacion:
            "label-badge bg-acid-400/15 text-acid-400 border border-acid-400/20",
        despacho:
            "label-badge bg-orange-500/15 text-orange-400 border border-orange-500/20",
        instalacion:
            "label-badge bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
        vendidoInstalacion:
            "label-badge bg-teal-500/15 text-teal-300 border border-teal-500/20",
        terminado:
            "label-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        facturado:
            "label-badge bg-purple-500/15 text-purple-300 border border-purple-500/20",
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
    };

    return (
        map[statusKey.value] ||
        "label-badge bg-white/5 text-obsidian-400 border border-white/10"
    );
});

const dotClass = computed(() => {
    const map: Record<string, string> = {
        vendido: "bg-blue-400",
        fabricacion: "bg-acid-400",
        despacho: "bg-orange-400",
        instalacion: "bg-cyan-400",
        vendidoInstalacion: "bg-teal-300",
        terminado: "bg-emerald-400",
        facturado: "bg-purple-400",
        Programado: "bg-blue-400",
        Aprobado: "bg-acid-400",
        Instalado: "bg-emerald-400",
        Entregado: "bg-purple-400",
        Cerrado: "bg-obsidian-500",
        Prospecto: "bg-amber-400",
        Cotizado: "bg-orange-400",
    };

    return map[statusKey.value] || "bg-obsidian-500";
});
</script>
