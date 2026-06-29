<!-- pages/index.vue -->
<template>
    <div class="min-h-screen bg-obsidian-950 noise-bg">
        <!-- Header -->
        <header class="sticky top-0 z-40 border-b border-white/[0.06] bg-obsidian-950/80 backdrop-blur-xl">
            <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo -->
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-acid-400 flex items-center justify-center">
                            <span class="text-obsidian-950 font-display font-bold text-sm">CR</span>
                        </div>
                        <div>
                            <div class="font-display font-bold text-white text-sm leading-none">
                                CRM Comercial
                            </div>
                            <div class="text-obsidian-500 text-xs font-mono">
                                Seguimiento de Proyectos
                            </div>
                        </div>
                    </div>

                    <!-- Search + Actions -->
                    <div class="flex items-center gap-3">
                        <div class="hidden sm:block relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-500 text-sm">⌕</span >
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Buscar proyecto..."
                                class="input-dark pl-8 w-56 h-9"
                            />
                        </div>
                        <ThemeToggle />
                       
                        <button
                            @click="openCreate"
                            class="btn-primary flex items-center gap-2 h-9"
                        >
                            <span class="text-base leading-none">+</span>
                            <span class="hidden sm:inline">Nuevo Proyecto</span>
                        </button>
                        <AccountMenu />
                    </div>
                </div>
            </div>
        </header>
        <!-- Main -->
        <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <!-- Hero Section -->
            <section class="animate-on-scroll">
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
                <!-- KPI Grid -->
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
                        :sub="`${percent(stats.active, stats.total)}% del total`"
                    />
                    <StatCard
                        label="Instalados"
                        :value="stats.completed"
                        icon="✅"
                        accent-color="#00b894"
                        :sub="`${percent(stats.completed, stats.total)}% instalados`"
                    />
                    <StatCard
                        label="Cerrados"
                        :value="stats.closed"
                        icon="🗂"
                        accent-color="#a29bfe"
                        :sub="`${percent(stats.closed, stats.total)}% facturados`"
                    />
                </div>
                <!-- KPI Grid -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        class="col-span-2 lg:col-span-1"
                        label="Total Vendido"
                        :value="stats.totalSoldCurrentYear"
                        icon="💰"
                        accent-color="#005571"
                        :value-formatter="formatCurrency"
                        :sub="`Meta anual: ${formatCurrency(YEARLY_GOAL)}`"
                        :progress="yearlyGoalProgress"
                        progress-label="Cumplimiento"
                    />
                    <!-- <StatCard
                        label="Total Vendido Mes Actual"
                        :value="stats.totalSoldCurrentMonth"
                        icon="💸"
                        accent-color="#74b9ff"
                        :value-formatter="formatCurrency"
                        :sub="currentMonthLabel"
                    /> -->
                    <StatCard
                        class="col-span-2 lg:col-span-1"
                        label="Venta mensual"
                        :value="stats.totalSoldCurrentMonth"
                        icon="🎯"
                        accent-color="#00b894"
                        :value-formatter="formatCurrency"
                        :sub="`Meta mensual: ${formatCurrency(MONTHLY_GOAL)}`"
                        :progress="monthlyGoalProgress"
                        progress-label="Cumplimiento"
                    />
                </div>
            </section>
            <ProjectsTable
                :projects="projects"
                :loading="loading"
                :search-query="searchQuery"
                @info="openInfo"
                @notes="openNotes"
                @edit="openEdit"
                @delete="confirmDelete"
                @payment-toggle="togglePayment"
            />
            <!-- Charts Section -->
            <section class="animate-on-scroll" style="animation-delay: 0.1s">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="section-title text-xl">Análisis Visual</h2>
                    <span class="text-obsidian-500 text-xs font-mono">
                        {{ stats.total }} registros
                    </span>
                </div>
                <ClientOnly>
                    <Charts
                        v-if="!loading && projects.length"
                        :by-status="stats.byStatus"
                        :by-city="stats.byCity"
                        :by-month="stats.byMonth"
                        :value-by-month="stats.valueByMonth"
                        :by-responsible="stats.byResponsible"
                        :total="stats.total"
                    />
                    <div v-else class="grid grid-cols-2 gap-6">
                        <div
                            v-for="i in 3"
                            :key="i"
                            class="glass-card h-64 animate-pulse"
                        ></div>
                    </div>
                </ClientOnly>
            </section>
        </main>

        <!-- Footer -->
        <footer class="border-t border-white/[0.05] mt-16">
            <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p class="text-obsidian-600 text-xs font-mono">
                    CRM Comercial · {{ new Date().getFullYear() }}
                </p>
                <p class="text-obsidian-600 text-xs font-mono">
                    Nuxt 3 · Firebase · Tailwind CSS
                </p>
            </div>
        </footer>

        <!-- Project Modal -->
        <ProjectModal
            v-model="showModal"
            :project="editingProject"
            @save="handleSave"
        />

        <NotesModal
            v-model="showNotesModal"
            :project-title="notesProject?.proyecto"
            :notes="notesProject?.notas"
            @save="handleNotesSave"
        />

        <ProjectInfoModal
            v-model="showInfoModal"
            :project="infoProject"
        />

        <!-- Delete Confirmation -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="deletingProject"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4"
                    @click.self="deletingProject = null"
                >
                    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" ></div>
                    <div class="relative glass-card border-coral-400/20 p-6 max-w-sm w-full z-10 text-center" >
                        <div class="w-12 h-12 rounded-xl bg-coral-400/10 flex items-center justify-center text-2xl mx-auto mb-4" >
                            ⚠️
                        </div>
                        <h3 class="font-display font-bold text-white mb-2">
                            ¿Eliminar proyecto?
                        </h3>
                        <p class="text-obsidian-400 text-sm mb-6">
                            <strong class="text-white">
                                {{ deletingProject.proyecto }}
                            </strong>
                            será eliminado permanentemente.
                        </p>
                        <div class="flex gap-3">
                            <button @click="deletingProject = null" class="btn-ghost flex-1">
                                Cancelar
                            </button>
                            <button
                                @click="handleDelete"
                                class="flex-1 h-10 rounded-xl bg-coral-500 hover:bg-coral-400 text-white font-display font-bold text-sm transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { Project } from "~/composables/useProjects";
import { ref } from 'vue';

const {
    projects,
    loading,
    stats,
    loadProjects,
    addProject,
    updateProject,
    deleteProject,
} = useProjects();

// State
const showModal = ref(false);
const showNotesModal = ref(false);
const showInfoModal = ref(false);
const editingProject = ref<Project | null>(null);
const deletingProject = ref<Project | null>(null);
const notesProject = ref<Project | null>(null);
const infoProject = ref<Project | null>(null);

const searchQuery = ref("");
const { initTheme } = useTheme();

// Load on mount
onMounted(() => {
    initTheme();
    loadProjects();
    initScrollAnimations();
});

// Computed
const currentDate = computed(() =>
    new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }),
);
const currentYear = computed(() => new Date().getFullYear());
const currentMonthLabel = computed(() =>
    new Date().toLocaleDateString("es-CO", {
        month: "long",
        year: "numeric",
    }),
);
const MONTHLY_GOAL = 186833333;
const YEARLY_GOAL = 2241999996;
const monthlyGoalProgress = computed(() =>
    percent(stats.value.totalSoldCurrentMonth, MONTHLY_GOAL),
);
const yearlyGoalProgress = computed(() =>
    percent(stats.value.totalSoldCurrentYear, YEARLY_GOAL),
);
const totalCities = computed(
    () =>
        new Set(
            projects.value
                .map((project) => project.ciudad)
                .filter(Boolean),
        ).size,
);

const percent = (value: number, total: number) =>
    total ? Math.round((value / total) * 100) : 0;

const formatCurrency = (value?: number | string | null) => {
    const amount = Number(value || 0);
    if (!amount) return "Sin valor";
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
};


const openCreate = () => {
    editingProject.value = null;
    showModal.value = true;
};

const openEdit = (project: Project) => {
    editingProject.value = { ...project };
    showModal.value = true;
};

const openNotes = (project: Project) => {
    notesProject.value = project;
    showNotesModal.value = true;
};

const openInfo = (project: Project) => {
    infoProject.value = project;
    showInfoModal.value = true;
};

const confirmDelete = (project: Project) => {
    deletingProject.value = project;
};

const handleSave = async (data: Omit<Project, "id">) => {
    if (editingProject.value?.id) {
        await updateProject(editingProject.value.id, data);
    } else {
        await addProject(data);
    }
    editingProject.value = null;
};

const handleNotesSave = async (notas: string) => {
    if (!notesProject.value?.id) return;
    await updateProject(notesProject.value.id, { notas });
    notesProject.value = { ...notesProject.value, notas };
};

const togglePayment = async (project: Project, pagosRealizados: number[]) => {
    if (!project.id) return;
    await updateProject(project.id, { pagosRealizados });
};

const handleDelete = async () => {
    if (deletingProject.value?.id) {
        await deleteProject(deletingProject.value.id);
        deletingProject.value = null;
    }
};

// Scroll animations
const initScrollAnimations = () => {
    const els = document.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("is-visible");
                    observer.unobserve(e.target);
                }
            });
        },
        { threshold: 0.1 },
    );
    els.forEach((el) => observer.observe(el));
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>

