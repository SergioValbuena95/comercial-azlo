<!-- components/ProjectInfoModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="modelValue && project"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="$emit('update:modelValue', false)"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

                <div
                    class="relative z-10 w-full max-w-2xl glass-card border-white/10 shadow-2xl"
                >
                    <div
                        class="flex items-start justify-between gap-4 p-6 border-b border-white/[0.07]"
                    >
                        <div class="min-w-0">
                            <p
                                class="text-xs font-mono uppercase tracking-wider text-obsidian-500 mb-1"
                            >
                                Informacion del proyecto
                            </p>
                            <h2
                                class="font-display font-bold text-white text-lg leading-tight truncate"
                            >
                                {{ project.proyecto || "Proyecto sin nombre" }}
                            </h2>
                        </div>
                        <button
                            type="button"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-lg"
                            aria-label="Cerrar informacion"
                            @click="$emit('update:modelValue', false)"
                        >
                            x
                        </button>
                    </div>

                    <div class="p-6 max-h-[72vh] overflow-y-auto space-y-6">
                        <div class="flex flex-wrap items-center gap-3">
                            <StatusBadge :estado="project.estado" />
                            <span
                                class="text-xs font-mono text-obsidian-500 border border-white/10 rounded-lg px-2.5 py-1"
                            >
                                {{ project.encargado || "Sin encargado" }}
                            </span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoItem label="Pais" :value="project.pais" />
                            <InfoItem label="Ciudad" :value="project.ciudad" />
                            <InfoItem
                                label="Direccion"
                                :value="project.direccion"
                                class="sm:col-span-2"
                            />
                            <InfoItem
                                label="Fecha creacion"
                                :value="formatDate(project.fechaCreacion)"
                            />
                            <InfoItem
                                label="Fecha despacho"
                                :value="formatDate(project.fechaDespacho)"
                            />
                            <InfoItem
                                label="Fecha instalacion"
                                :value="formatDate(project.fechaInstalacion)"
                            />
                            <InfoItem
                                label="Dias acordados"
                                :value="formatNumber(project.diasAcordados)"
                            />
                            <InfoItem
                                label="Valor sub-total"
                                :value="formatCurrency(project.valorTotal)"
                            />
                            <InfoItem
                                label="Porcentajes acordados"
                                :value="project.porcentajesPago"
                            />
                        </div>

                        <div>
                            <p
                                class="text-xs font-mono uppercase tracking-wider text-obsidian-500 mb-2"
                            >
                                Notas
                            </p>
                            <p
                                class="min-h-20 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-obsidian-200 whitespace-pre-wrap"
                            >
                                {{ project.notas?.trim() || "Sin notas registradas." }}
                            </p>
                        </div>
                    </div>

                    <div
                        class="flex justify-end p-6 border-t border-white/[0.07]"
                    >
                        <button
                            type="button"
                            class="btn-ghost"
                            @click="$emit('update:modelValue', false)"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { Project } from "~/composables/useProjects";

defineProps<{
    modelValue: boolean;
    project?: Project | null;
}>();

defineEmits<{
    "update:modelValue": [value: boolean];
}>();

const formatDate = (value?: string) => {
    if (!value) return "Sin fecha";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
};

const formatNumber = (value?: number | null) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return "Sin definir";
    return new Intl.NumberFormat("es-CO").format(value);
};

const formatCurrency = (value?: number | string | null) => {
    const amount = Number(value || 0);
    if (!amount) return "Sin valor";
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-from .relative {
    transform: scale(0.96) translateY(8px);
}
.modal-leave-to .relative {
    transform: scale(0.96);
}
</style>
