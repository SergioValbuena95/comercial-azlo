<template>
    <section v-show="filteredProjects.length" class="animate-on-scroll" style="animation-delay: 0.2s">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
                <h2 class="section-title text-xl">Proyecciones</h2>
                <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                    {{ filteredProjects.length }} de {{ userProjects.length }}
                    registros
                </p>
            </div>
        </div>

        <div class="glass-card overflow-hidden">
            <div class="block lg:hidden divide-y divide-white/[0.06]">
                <div
                    v-if="loading"
                    class="p-8 text-center text-obsidian-500 font-mono text-sm"
                >
                    Cargando proyectos...
                </div>
                <div
                    v-else-if="!filteredProjects.length"
                    class="p-8 text-center text-obsidian-500 font-mono text-sm"
                >
                    Sin resultados para los filtros aplicados
                </div>
                <div
                    v-for="project in paginatedProjects"
                    :key="projectKey(project)"
                    class="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    role="button"
                    tabindex="0"
                    @click="$emit('info', project)"
                    @keydown.enter="$emit('info', project)"
                >
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-obsidian-400 font-mono">
                        <span>{{ responsibleName(project.encargado) }}</span>
                        <span>
                            Instalacion:
                            {{ formatDate(project.fechaInstalacion) }}
                        </span>
                        <span>
                            Despacho: {{ formatDate(project.fechaDespacho) }}
                        </span>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-3">
                        <button
                            @click.stop="$emit('info', project)"
                            class="btn-ghost text-xs h-7 px-3"
                        >
                            Info
                        </button>
                    </div>
                </div>
            </div>

            <div class="hidden lg:block overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-white/[0.06]">
                            <th
                                v-for="col in columns"
                                :key="col.key"
                                class="px-4 py-3 text-left text-xs font-mono text-obsidian-500 uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
                                @click="setSort(col.key)"
                            >
                                <div class="flex items-center gap-1.5">
                                    {{ col.label }}
                                    <span
                                        v-if="sortKey === col.key"
                                        class="text-acid-400"
                                    >
                                        {{ sortDir === "asc" ? "^" : "v" }}
                                    </span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.04]">
                        <tr v-if="loading">
                            <td
                                :colspan="columns.length + 1"
                                class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                            >
                                Cargando actividades...
                            </td>
                        </tr>
                        <tr v-else-if="!filteredProjects.length">
                            <td
                                :colspan="columns.length + 1"
                                class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                            >
                                Sin resultados para los filtros aplicados
                            </td>
                        </tr>
                        <tr
                            v-for="project in paginatedProjects"
                            :key="projectKey(project)"
                            class="group hover:bg-white/[0.02] transition-colors"
                            role="button"
                            tabindex="0"
                        >
                            <td
                                class="px-4 py-3.5 cursor-pointer"
                                @click="$emit('info', project)"
                                @keydown.enter="$emit('info', project)">
                                <p
                                    class="text-white text-sm font-body font-medium max-w-xs truncate"
                                    :title="project.proyecto"
                                >
                                    {{ project.proyecto }}
                                </p>
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-400 text-sm font-mono">
                                {{ (project as any).accion }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono">
                                {{ formatDate(project.fechaCreacion) }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono">
                                {{ formatDate(project.fechaInstalacion) }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono">
                                {{ formatDate(project.fechaDespacho) }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-400 text-sm font-body">
                                {{ responsibleName(project.encargado) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex items-center justify-between px-4 py-4 border-t border-white/[0.06]">
                <p class="text-obsidian-500 text-xs font-mono">
                    Mostrando {{ rangeStart }}-{{ rangeEnd }} de
                    {{ filteredProjects.length }}
                </p>
                <div class="flex gap-1">
                    <button
                        @click="currentPage--"
                        :disabled="currentPage === 1"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-obsidian-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        &lt;
                    </button>
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        @click="currentPage = page"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-mono transition-colors"
                        :class="
                            currentPage === page
                                ? 'border-acid-400/40 bg-acid-400/10 text-acid-400'
                                : 'border-white/10 text-obsidian-400 hover:text-white hover:border-white/20'
                        "
                    >
                        {{ page }}
                    </button>
                    <button
                        @click="currentPage++"
                        :disabled="
                            currentPage === totalPages ||
                            !filteredProjects.length
                        "
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-obsidian-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import {
    useProjects,
    type Project,
} from "~/composables/useProjects";

const props = defineProps<{
    searchQuery?: string;
}>();

const {
    projects: userProjects,
    loading,
    loadProjects
} = useProjects();

onMounted(() => {
    loadProjects();
});

const emit = defineEmits<{
    info: [project: Project];
    notes: [project: Project];
    edit: [project: Project];
    delete: [project: Project];
    "payment-toggle": [project: Project, paidPayments: number[]];
    "sub_state-change": [project: Project, subState: string];
}>();

// Dummy data to replace composables
const sortKey = ref("fechaCreacion");
const sortDir = ref<"asc" | "desc">("desc");
const currentPage = ref(1);

const columns = [
    { key: "proyecto", label: "Proyecto" },
    { key: "accion", label: "Acción" },
    { key: "fechaCreacion", label: "Solicitud" },
    { key: "fechaInstalacion", label: "Instalacion" },
    { key: "fechaDespacho", label: "Despacho" },
    { key: "encargado", label: "Encargado" },
];


const responsibleName = (uid?: string) => {
    if (!uid) return "";
    return uid === "user1" ? "Encargado 1" : uid === "user2" ? "Encargado 2" : uid;
};


const filteredProjects = computed(() => {
    const list: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDiffDays = (dateStr?: string | null) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split("-").map(Number);
        const targetDate = new Date(year, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);
        return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    if(userProjects.value){
        userProjects.value.forEach((project) => {
            const instDiff = getDiffDays(project.fechaInstalacion);
            if (instDiff !== null && instDiff >= 0 && instDiff <= 30) {
                list.push({
                    ...project,
                    id: `${project.id}-inst`,
                    accion: `Contactar para instalación (${instDiff} días)`,
                });
            }

            const despDiff = getDiffDays(project.fechaDespacho);
            if (despDiff !== null && despDiff >= 0 && despDiff <= 30) {
                list.push({
                    ...project,
                    id: `${project.id}-desp`,
                    accion: `Preparar despacho (${despDiff} días)`,
                });
            }
        });
    }
    return list;
});

const totalPages = computed(() => 1);

const paginatedProjects = computed(() => filteredProjects.value);

const rangeStart = computed(() => 1);

const rangeEnd = computed(() => filteredProjects.value.length);

const visiblePages = computed(() => [1]);

const setSort = (key: string) => {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    } else {
        sortKey.value = key;
        sortDir.value = "asc";
    }
};

const projectKey = (project: Project) =>
    [
        project.id || "sin-id",
        project.proyecto,
        project.ciudad,
        project.fechaCreacion,
        project.fechaInstalacion,
        project.valorTotal ?? "sin-valor",
    ].join("|");

const formatDate = (value?: string) => {
    if (!value) return "--";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
};
</script>

<style scoped>
.payment-chip {
    width: 2.35rem;
    height: 2.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: #a4a4b8;
    padding: 0;
    font-size: 0.64rem;
    line-height: 1;
    font-family: "Montserrat", sans-serif;
    font-weight: 700;
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;
}

.payment-chip:hover {
    border-color: rgba(255, 255, 255, 0.22);
    color: #ffffff;
    transform: translateY(-1px);
}

.payment-chip-paid {
    border-color: #005571;
    background: #005571;
    color: #ffffff;
    box-shadow: 0 0 0 3px rgba(0, 85, 113, 0.18);
}

:global(:root.theme-light) .payment-chip {
    border-color: rgba(0, 85, 113, 0.16);
    background: rgba(0, 85, 113, 0.05);
    color: #60737c;
}

:global(:root.theme-light) .payment-chip:hover {
    border-color: rgba(0, 85, 113, 0.28);
    color: #10232c;
}

:global(:root.theme-light) .payment-chip-paid {
    border-color: rgba(0, 85, 113, 0.46);
    background: rgba(0, 85, 113, 0.18);
    color: #005571;
}
</style>
