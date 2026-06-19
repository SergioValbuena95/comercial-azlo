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
                        <button
                            @click="openCreate"
                            class="btn-primary flex items-center gap-2 h-9"
                        >
                            <span class="text-base leading-none">+</span>
                            <span class="hidden sm:inline">Nuevo Proyecto</span>
                        </button>
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
                        accent-color="#c8ff47"
                        :sub="`${stats.byCountry ? Object.keys(stats.byCountry).length : 0} países`"
                    />
                    <StatCard
                        label="Proyectos Activos"
                        :value="stats.active"
                        icon="⚡"
                        accent-color="#74b9ff"
                        :sub="`${percent(stats.active, stats.total)}% del total`"
                    />
                    <StatCard
                        label="Entregados"
                        :value="stats.completed"
                        icon="✅"
                        accent-color="#00b894"
                        :sub="`${percent(stats.completed, stats.total)}% completados`"
                    />
                    <StatCard
                        label="Cerrados"
                        :value="stats.closed"
                        icon="🗂"
                        accent-color="#a29bfe"
                        :sub="`${percent(stats.closed, stats.total)}% del pipeline`"
                    />
                </div>
                <!-- KPI Grid -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Vendido"
                        :value="stats.totalSoldCurrentYear"
                        icon="💰"
                        accent-color="#c8ff47"
                        :value-formatter="formatCurrency"
                        :sub="`Año ${currentYear}`"
                    />
                    <StatCard
                        label="Total Vendido Mes Actual"
                        :value="stats.totalSoldCurrentMonth"
                        icon="💸"
                        accent-color="#74b9ff"
                        :value-formatter="formatCurrency"
                        :sub="currentMonthLabel"
                    />
                    <StatCard
                        label="Meta mensual"
                        :value="stats.completed"
                        icon="🎯"
                        accent-color="#00b894"
                        :sub="`${percent(stats.completed, stats.total)}% completados`"
                    />
                    <StatCard
                        label="EMPTY"
                        :value="stats.closed"
                        icon="🗂"
                        accent-color="#a29bfe"
                        :sub="`${percent(stats.closed, stats.total)}% del pipeline`"
                    />
                </div>
            </section>
            <!-- Projects Table Section -->
            <section class="animate-on-scroll" style="animation-delay: 0.2s">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 class="section-title text-xl">Proyectos</h2>
                        <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                            {{ filteredProjects.length }} de
                            {{ projects.length }} registros
                        </p>
                    </div>

                    <!-- Filters -->
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Status filter -->
                        <select
                            v-model="filterStatus"
                            class="input-dark h-9 w-auto text-xs"
                        >
                            <option value="">Todos los estados</option>
                            <option v-for="s in allStatuses" :key="s">
                                {{ s }}
                            </option>
                        </select>

                        <!-- Country filter -->
                        <select
                            v-model="filterCountry"
                            class="input-dark h-9 w-auto text-xs hidden"
                        >
                            <option value="">Todos los países</option>
                            <option v-for="c in allCountries" :key="c">
                                {{ c }}
                            </option>
                        </select>

                        <!-- Responsible filter -->
                        <select
                            v-model="filterResponsible"
                            class="input-dark h-9 w-auto text-xs"
                        >
                            <option value="">Todos los encargados</option>
                            <option v-for="r in allResponsibles" :key="r">
                                {{ r }}
                            </option>
                        </select>

                        <button
                            v-if="hasFilters"
                            class="btn-ghost h-9 text-xs text-coral-400 border-coral-400/20 hover:border-coral-400/40"
                            @click="clearFilters"
                        >
                            Limpiar ✕
                        </button>
                    </div>
                </div>

                <!-- Table -->
                <div class="glass-card overflow-hidden">
                    <!-- Mobile view: cards -->
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
                            :key="project.id"
                            class="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            role="button"
                            tabindex="0"
                            @click="openInfo(project)"
                            @keydown.enter="openInfo(project)"
                        >
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <p class="font-body text-white text-sm font-medium leading-snug flex-1">
                                    {{ project.proyecto }}
                                </p>
                                <StatusBadge :estado="project.estado" />
                            </div>
                            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-obsidian-400 font-mono">
                                <span>👤 {{ project.encargado }}</span>
                                <span>
                                    📅 {{ formatDate(project.fechaInstalacion) }}
                                </span>
                            </div>
                            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-obsidian-400 font-mono">
                                <span>
                                    Valor:
                                    {{ formatCurrency(project.valorTotal) }}
                                </span>
                                <span>
                                    Pagos:
                                    {{ project.porcentajesPago || "Sin definir" }}
                                </span>
                            </div>
                            <!-- actions -->
                            <div class="flex flex-wrap gap-2 mt-3">
                                <button
                                    @click.stop="openInfo(project)"
                                    class="btn-ghost text-xs h-7 px-3"
                                >
                                    Info
                                </button>
                                <button
                                    @click.stop="openNotes(project)"
                                    class="btn-ghost text-xs h-7 px-3 flex items-center gap-1.5"
                                >
                                    <svg
                                        aria-hidden="true"
                                        class="w-3.5 h-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                    >
                                        <path
                                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                        />
                                        <path d="M14 2v6h6" />
                                        <path d="M8 13h8" />
                                        <path d="M8 17h5" />
                                    </svg>
                                    <span>Notas</span>
                                </button>
                                <button @click.stop="openEdit(project)" class="btn-ghost text-xs h-7 px-3">
                                    Editar
                                </button>
                                <button
                                    @click.stop="confirmDelete(project)"
                                    class="text-xs h-7 px-3 rounded-lg border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Desktop: table -->
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
                                                {{
                                                    sortDir === "asc"
                                                        ? "↑"
                                                        : "↓"
                                                }}
                                            </span>
                                        </div>
                                    </th>
                                    <th class="px-4 py-3 text-right text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/[0.04]">
                                <tr v-if="loading">
                                    <td
                                        colspan="10"
                                        class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                                    >
                                        Cargando proyectos...
                                    </td>
                                </tr>
                                <tr v-else-if="!filteredProjects.length">
                                    <td
                                        colspan="10"
                                        class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                                    >
                                        Sin resultados para los filtros aplicados
                                    </td>
                                </tr>
                                <tr
                                    v-for="project in paginatedProjects"
                                    :key="project.id"
                                    class="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    role="button"
                                    tabindex="0"
                                    @click="openInfo(project)"
                                    @keydown.enter="openInfo(project)"
                                >
                                    <td class="px-4 py-3.5">
                                        <p
                                            class="text-white text-sm font-body font-medium max-w-xs truncate"
                                            :title="project.proyecto"
                                        >
                                            {{ project.proyecto }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3.5 text-obsidian-400 text-sm font-mono">
                                        {{ project.ciudad }}
                                    </td>
                                    <td class="px-4 py-3.5 text-obsidian-400 text-sm font-body">
                                        {{ project.encargado }}
                                    </td>
                                    <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono">
                                        {{ formatDate(project.fechaCreacion) }}
                                    </td>
                                    <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono">
                                        {{
                                            formatDate(project.fechaInstalacion)
                                        }}
                                    </td>
                                    <td class="px-4 py-3.5">
                                        <StatusBadge :estado="project.estado" />
                                    </td>
                                    <td class="px-4 py-3.5 text-obsidian-300 text-sm font-mono whitespace-nowrap">
                                        {{ formatCurrency(project.valorTotal) }}
                                    </td>
                                    <td class="px-4 py-3.5 text-obsidian-400 text-xs font-mono whitespace-nowrap">
                                        {{
                                            project.porcentajesPago ||
                                            "Sin definir"
                                        }}
                                    </td>
                                    <td class="px-4 py-3.5">
                                        <button
                                            type="button"
                                            class="relative w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-obsidian-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors"
                                            :class="{
                                                'text-acid-400 border-acid-400/30 bg-acid-400/10':
                                                    project.notas,
                                            }"
                                            :title="
                                                project.notas
                                                    ? 'Ver notas'
                                                    : 'Sin notas registradas'
                                            "
                                            aria-label="Ver notas"
                                            @click.stop="openNotes(project)"
                                        >
                                            <svg
                                                aria-hidden="true"
                                                class="w-4 h-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                            >
                                                <path
                                                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                                />
                                                <path d="M14 2v6h6" />
                                                <path d="M8 13h8" />
                                                <path d="M8 17h5" />
                                            </svg>
                                            <span
                                                v-if="project.notas"
                                                class="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-acid-400"
                                            ></span>
                                        </button>
                                    </td>
                                    <td class="px-4 py-3.5">
                                        <div
                                            class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <button
                                                @click.stop="openEdit(project)"
                                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-sm"
                                                title="Editar"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                @click.stop="confirmDelete(project)"
                                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coral-400/10 text-obsidian-500 hover:text-coral-400 transition-colors text-sm"
                                                title="Eliminar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
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
                                ‹
                            </button>
                            <button
                                v-for="p in visiblePages"
                                :key="p"
                                @click="currentPage = p"
                                class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-mono transition-colors"
                                :class="
                                    currentPage === p
                                        ? 'border-acid-400/40 bg-acid-400/10 text-acid-400'
                                        : 'border-white/10 text-obsidian-400 hover:text-white hover:border-white/20'
                                "
                            >
                                {{ p }}
                            </button>
                            <button
                                @click="currentPage++"
                                :disabled="
                                    currentPage === totalPages ||
                                    !filteredProjects.length
                                "
                                class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-obsidian-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </section>
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
                        :by-country="stats.byCountry"
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

// Filters
const searchQuery = ref("");
const filterStatus = ref("");
const filterCountry = ref("");
const filterResponsible = ref("");

// Sort
const sortKey = ref("fechaCreacion");
const sortDir = ref<"asc" | "desc">("desc");

// Pagination
const currentPage = ref(1);
const perPage = 10;

// Load on mount
onMounted(() => {
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

const allStatuses = computed(() =>
    [...new Set(projects.value.map((p) => p.estado))].sort(),
);
const allCountries = computed(() =>
    [...new Set(projects.value.map((p) => p.pais))].sort(),
);
const allResponsibles = computed(() =>
    [...new Set(projects.value.map((p) => p.encargado))].sort(),
);
const hasFilters = computed(
    () =>
        searchQuery.value ||
        filterStatus.value ||
        filterCountry.value ||
        filterResponsible.value,
);

const filteredProjects = computed(() => {
    let list = [...projects.value];

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
            (p) =>
                p.proyecto.toLowerCase().includes(q) ||
                p.ciudad.toLowerCase().includes(q) ||
                p.encargado.toLowerCase().includes(q) ||
                (p.notas || "").toLowerCase().includes(q),
        );
    }
    if (filterStatus.value)
        list = list.filter((p) => p.estado === filterStatus.value);
    if (filterCountry.value)
        list = list.filter((p) => p.pais === filterCountry.value);
    if (filterResponsible.value)
        list = list.filter((p) => p.encargado === filterResponsible.value);

    list.sort((a, b) => {
        const va = sortValue(a, sortKey.value);
        const vb = sortValue(b, sortKey.value);
        if (typeof va === "number" && typeof vb === "number") {
            return sortDir.value === "asc" ? va - vb : vb - va;
        }
        const sa = String(va);
        const sb = String(vb);
        return sortDir.value === "asc"
            ? sa.localeCompare(sb)
            : sb.localeCompare(sa);
    });

    return list;
});

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredProjects.value.length / perPage)),
);
const paginatedProjects = computed(() => {
    const start = (currentPage.value - 1) * perPage;
    return filteredProjects.value.slice(start, start + perPage);
});
const rangeStart = computed(() =>
    filteredProjects.value.length ? (currentPage.value - 1) * perPage + 1 : 0,
);
const rangeEnd = computed(() =>
    Math.min(currentPage.value * perPage, filteredProjects.value.length),
);
const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const cur = currentPage.value;
    for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++)
        pages.push(i);
    return pages;
});

watch([searchQuery, filterStatus, filterCountry, filterResponsible], () => {
    currentPage.value = 1;
});

watch(totalPages, (total) => {
    if (currentPage.value > total) currentPage.value = total;
});

// Columns
const columns = [
    { key: "proyecto", label: "Proyecto" },
    { key: "ciudad", label: "Ciudad" },
    { key: "encargado", label: "Encargado" },
    { key: "fechaCreacion", label: "Creación" },
    { key: "fechaInstalacion", label: "Instalación" },
    { key: "estado", label: "Estado" },
    { key: "valorTotal", label: "Valor total" },
    { key: "porcentajesPago", label: "Pagos" },
    { key: "notas", label: "Notas" },
];

// Methods
const setSort = (key: string) => {
    if (sortKey.value === key)
        sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    else {
        sortKey.value = key;
        sortDir.value = "asc";
    }
};

const percent = (value: number, total: number) =>
    total ? Math.round((value / total) * 100) : 0;

const sortValue = (project: Project, key: string) => {
    if (key === "valorTotal") return Number(project.valorTotal || 0);
    return String((project as any)[key] || "");
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

const clearFilters = () => {
    searchQuery.value = "";
    filterStatus.value = "";
    filterCountry.value = "";
    filterResponsible.value = "";
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

const handleDelete = async () => {
    if (deletingProject.value?.id) {
        await deleteProject(deletingProject.value.id);
        deletingProject.value = null;
    }
};

const formatDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
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

