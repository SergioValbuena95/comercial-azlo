<template>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section v-show="filteredProjects.length" class="animate-on-scroll lg:col-span-8" style="animation-delay: 0.2s">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 class="section-title text-xl">Acciones</h2>
                    <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                        {{ filteredProjects.length }} de {{ userProjects.length }}
                        registros
                    </p>
                </div>
            </div>

            <div class="glass-card overflow-hidden">
                <!-- cards -->
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
                        <div class="flex flex-col gap-x-4 gap-y-1 text-xs text-obsidian-400 font-mono">
                            <p
                                class="text-white text-sm font-body font-medium max-w-xs truncate uppercase"
                                :title="project.proyecto"
                            >
                                {{ project.proyecto }}
                            </p>
                            <span class="text-white font-body font-medium">{{ project.accion }}</span>
                            <span>{{ responsibleName(project.encargado) }}</span>
                            <div class="">
                                <p>
                                    Instalacion:
                                    {{ formatDate(project.fechaInstalacion) }}
                                </p>
                                <p>
                                    Despacho: {{ formatDate(project.fechaDespacho) }}
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-3">
                            <button
                                @click.stop="$emit('info', project)"
                                class="btn-ghost text-xs h-7 px-3"
                            >
                                Project Info
                            </button>
                        </div>
                    </div>
                </div>
                <!-- table -->
                <div class="hidden lg:block overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-white/[0.06]">
                                <th
                                    v-for="col in columns"
                                    :key="col.key"
                                    class="px-4 py-3 text-left text-xs font-mono text-obsidian-500 uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
                                >
                                    <div class="flex items-center gap-1.5">
                                        {{ col.label }}
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
                                    {{ formatDate(project.fechaDespacho) }}
                                </td>
                                <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono">
                                    {{ formatDate(project.fechaInstalacion) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- pagination -->
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
        <!-- Calendario -->
        <section v-show="filteredProjects.length" class="animate-on-scroll lg:col-span-4" style="animation-delay: 0.2s">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 class="section-title text-xl">Calendario</h2>
                    <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                        Registros
                    </p>
                </div>
            </div>

            <div class="glass-card calendar-card p-4">
                <div>
                    <VCalendar
                        expanded
                        borderless
                        transparent
                        locale="es"
                        :attributes="projectsCalendar"
                    />
                </div>
            </div>
        </section>
    </div>
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
const currentPage = ref(1);

const columns = [
    { key: "proyecto", label: "Proyecto" },
    { key: "accion", label: "Acción" },
    { key: "fechaDespacho", label: "Despacho" },
    { key: "fechaInstalacion", label: "Instalacion" },
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
                    daysRemaining: instDiff,
                });
            }

            const despDiff = getDiffDays(project.fechaDespacho);
            if (despDiff !== null && despDiff >= 0 && despDiff <= 30) {
                list.push({
                    ...project,
                    id: `${project.id}-desp`,
                    accion: `Preparar despacho (${despDiff} días)`,
                    daysRemaining: despDiff,
                });
            }
        });
    }
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);;
});

const totalPages = computed(() => 1);

const paginatedProjects = computed(() => filteredProjects.value);

const calendarColorForAction = (action?: string) => {
    const normalizedAction = action?.toLowerCase() ?? "";

    if (normalizedAction.includes("instalaci")) {
        return "orange";
    }

    if (normalizedAction.includes("despacho")) {
        return "red";
    }

    return "blue";
};

const projectsCalendar = computed(() => {
    return filteredProjects.value.map((project) => {
        const color = calendarColorForAction(project.accion);

        return {
            ...project,
            key: project.id,
            dates: new Date(project.fechaInstalacion),
            highlight: {
                color,
                fillMode: "solid",
            },
            popover: {
                label: `${project.proyecto} - ${project.accion}`,
                hideIndicator: true,
            },
        };
    });
});

const rangeStart = computed(() => 1);

const rangeEnd = computed(() => filteredProjects.value.length);

const visiblePages = computed(() => [1]);

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
