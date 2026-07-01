<template>
    <section class="animate-on-scroll" style="animation-delay: 0.2s">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
                <h2 class="section-title text-xl">Proyectos</h2>
                <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                    {{ filteredProjects.length }} de {{ projects.length }}
                    registros
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <select
                    v-model="filterStatus"
                    class="input-dark h-9 w-auto text-xs"
                >
                    <option value="">Todos los estados</option>
                    <option v-for="status in allStatuses" :key="status">
                        {{ status }}
                    </option>
                </select>

                <select
                    v-model="filterCountry"
                    class="input-dark h-9 w-auto text-xs hidden"
                >
                    <option value="">Todos los paises</option>
                    <option v-for="country in allCountries" :key="country">
                        {{ country }}
                    </option>
                </select>

                <select
                    v-if="canFilterByResponsible"
                    v-model="filterResponsible"
                    class="input-dark h-9 w-auto text-xs"
                >
                    <option value="">Todos los encargados</option>
                    <option
                        v-for="responsible in allResponsibles"
                        :key="responsible"
                    >
                        {{ responsible }}
                    </option>
                </select>

                <button
                    v-if="hasFilters"
                    class="btn-ghost h-9 text-xs text-coral-400 border-coral-400/20 hover:border-coral-400/40"
                    @click="clearFilters"
                >
                    Limpiar x
                </button>
            </div>
        </div>
         <div class="flex flex-wrap items-center gap-2 mb-4">
            <button
                v-for="tab in projectTabsMain"
                :key="tab.key"
                type="button"
                class="h-9 px-3 rounded-lg border text-xs font-medium transition-colors"
                :class="
                    activeProjectTabMain === tab.key
                        ? 'border-acid-400/40 bg-acid-400/10 text-acid-400'
                        : 'border-white/10 text-obsidian-400 hover:text-white hover:border-white/20'
                "
                @click="activeProjectTabMain = tab.key"
            >
                {{ tab.label }}
                <span class="ml-1 text-obsidian-500">{{ tab.count }}</span>
            </button>
        </div>
        <!-- sub filter states -->
        <!-- <div class="flex flex-wrap items-center gap-2 mb-4">
            <button
                v-for="tab in projectTabs"
                :key="tab.key"
                type="button"
                class="h-9 px-3 rounded-lg border text-xs font-medium transition-colors"
                :class="
                    activeProjectTab === tab.key
                        ? 'border-acid-400/40 bg-acid-400/10 text-acid-400'
                        : 'border-white/10 text-obsidian-400 hover:text-white hover:border-white/20'
                "
                @click="activeProjectTab = tab.key"
            >
                {{ tab.label }}
                <span class="ml-1 text-obsidian-500">{{ tab.count }}</span>
            </button>
        </div> -->

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
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <p class="font-body text-white text-sm font-medium leading-snug flex-1">
                            {{ project.proyecto }}
                        </p>
                        <StatusBadge :estado="projectSubState(project)" />
                    </div>
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
                    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-obsidian-400 font-mono">
                        <span>
                            Valor:
                            {{ formatCurrency(project.valorTotal) }}
                        </span>
                        <span>
                            Pagos:
                        </span>
                        <div class="flex flex-wrap gap-1.5" @click.stop>
                            <button
                                v-for="(payment, index) in paymentParts(project)"
                                :key="`${projectKey(project)}-${index}-${payment}`"
                                type="button"
                                class="payment-chip"
                                :class="{
                                    'payment-chip-paid':
                                        isPaymentPaid(project, index),
                                }"
                                :title="
                                    isPaymentPaid(project, index)
                                        ? 'Marcar como pendiente'
                                        : 'Marcar como pagado'
                                "
                                @click.stop="handlePaymentClick(project, index)"
                            >
                                {{ payment }}
                            </button>
                            <span
                                v-if="!paymentParts(project).length"
                                class="text-obsidian-500"
                            >
                                Sin definir
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-3">
                        <button
                            @click.stop="$emit('info', project)"
                            class="btn-ghost text-xs h-7 px-3"
                        >
                            Info
                        </button>
                        <button
                            @click.stop="$emit('notes', project)"
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
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                                <path d="M8 13h8" />
                                <path d="M8 17h5" />
                            </svg>
                            <span>Notas</span>
                        </button>
                        <button
                            @click.stop="$emit('edit', project)"
                            class="btn-ghost text-xs h-7 px-3"
                        >
                            Editar
                        </button>
                        <button
                            @click.stop="$emit('delete', project)"
                            class="text-xs h-7 px-3 rounded-lg border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors"
                        >
                            Eliminar
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
                            <th class="px-4 py-3 text-right text-xs font-mono text-obsidian-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/[0.04]">
                        <tr v-if="loading">
                            <td
                                :colspan="columns.length + 1"
                                class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                            >
                                Cargando proyectos...
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
                            class="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                            role="button"
                            tabindex="0"
                            @click="$emit('info', project)"
                            @keydown.enter="$emit('info', project)"
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
                            </td> <td class="px-4 py-3.5 text-obsidian-400 text-sm font-body">
                                {{ responsibleName(project.encargado) }}
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
                            <td class="px-4 py-3.5">
                                <StatusBadge :estado="projectSubState(project)" />
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-300 text-sm font-mono whitespace-nowrap">
                                {{ formatCurrency(project.valorTotal) }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-400 text-xs font-mono">
                                <div class="flex flex-wrap gap-1.5 min-w-32" @click.stop>
                                    <button
                                        v-for="(payment, index) in paymentParts(project)"
                                        :key="`${projectKey(project)}-${index}-${payment}`"
                                        type="button"
                                        class="payment-chip"
                                        :class="{
                                            'payment-chip-paid':
                                                isPaymentPaid(project, index),
                                        }"
                                        :title="
                                            isPaymentPaid(project, index)
                                                ? 'Marcar como pendiente'
                                                : 'Marcar como pagado'
                                        "
                                        @click.stop="handlePaymentClick(project, index)"
                                    >
                                        {{ payment }}
                                    </button>
                                    <span
                                        v-if="!paymentParts(project).length"
                                        class="text-obsidian-500 whitespace-nowrap"
                                    >
                                        Sin definir
                                    </span>
                                </div>
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
                                    @click.stop="$emit('notes', project)"
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
                                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        @click.stop="$emit('edit', project)"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-sm"
                                        title="Editar"
                                        aria-label="Editar"
                                    >
                                        <svg
                                            aria-hidden="true"
                                            class="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <path d="M12 20h9" />
                                            <path
                                                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        @click.stop="$emit('delete', project)"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coral-400/10 text-obsidian-500 hover:text-coral-400 transition-colors text-sm"
                                        title="Eliminar"
                                        aria-label="Eliminar"
                                    >
                                        x
                                    </button>
                                </div>
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
    PROJECT_STATES,
    projectSubState,
    type Project,
} from "~/composables/useProjects";

const props = defineProps<{
    projects: Project[];
    loading: boolean;
    searchQuery: string;
}>();

const emit = defineEmits<{
    info: [project: Project];
    notes: [project: Project];
    edit: [project: Project];
    delete: [project: Project];
    "payment-toggle": [project: Project, paidPayments: number[]];
}>();

const {
    users,
    currentUserProfile,
    loadUsers,
    loadCurrentUserProfile,
} = useUsers();
const { isAdminUser } = useAccess();

const filterStatus = ref("");
const filterCountry = ref("");
const filterResponsible = ref("");
const activeProjectTabMain = ref<"inProgress" | "sold" | "all" >("all");
const activeProjectTab = ref<"inProgress" | "sold" | "all">("all");
const sortKey = ref("fechaCreacion");
const sortDir = ref<"asc" | "desc">("desc");
const currentPage = ref(1);
const perPage = 10;

const columns = [
    { key: "proyecto", label: "Proyecto" },
    { key: "ciudad", label: "Ciudad" },
    { key: "encargado", label: "Encargado" },
    { key: "fechaCreacion", label: "Solicitud" },
    { key: "fechaInstalacion", label: "Instalacion" },
    { key: "fechaDespacho", label: "Despacho" },
    { key: "sub_state", label: "Estado" },
    { key: "valorTotal", label: "Valor total" },
    { key: "porcentajesPago", label: "Pagos" },
    { key: "notas", label: "Notas" },
];

const allStatuses = computed(() =>
    [...new Set(props.projects.map(projectSubState))].filter(Boolean).sort(),
);

const allCountries = computed(() =>
    [...new Set(props.projects.map((project) => project.pais))].sort(),
);

const allResponsibles = computed(() =>
    users.value
        .filter((appUser) => appUser.roleId === "3")
        .map((appUser) => responsibleName(appUser.uid))
        .filter(Boolean)
        .sort(),
);

onMounted(() => {
    loadUsers();
    loadCurrentUserProfile();
});

const canFilterByResponsible = computed(() =>
    isAdminUser(currentUserProfile.value),
);

const responsibleName = (uid?: string) => {
    if (!uid) return "";
    const appUser = users.value.find((user) => user.uid === uid);
    return appUser?.displayName || appUser?.email || uid;
};

const projectStateId = (project: Project) => Number(project.estado);

const isInProgressProject = (project: Project) =>
    projectStateId(project) === PROJECT_STATES.IN_PROGRESS.id;

const isSoldProject = (project: Project) =>
    projectStateId(project) === PROJECT_STATES.SOLD.id;

const projectTabs = computed(() => {
    const soldCount = props.projects.filter(isSoldProject).length;
    const inProgressCount = props.projects.filter(isInProgressProject).length;

    return [
        { key: "inProgress" as const, label: "Activos", count: inProgressCount },
        { key: "sold" as const, label: "Facturados", count: soldCount },
        { key: "all" as const, label: "Todos", count: props.projects.length },
    ];
});

const projectTabsMain = computed(() => {
    const soldCount = props.projects.filter(isSoldProject).length;
    const inProgressCount = props.projects.filter(isInProgressProject).length;

    return [
        { key: "all" as const, label: "Todos", count: props.projects.length },
        { key: "inProgress" as const, label: "En tramite", count: inProgressCount },
        { key: "sold" as const, label: "Vendidos", count: soldCount },
    ];
});

const hasFilters = computed(
    () =>
        props.searchQuery ||
        filterStatus.value ||
        filterCountry.value ||
        (canFilterByResponsible.value && filterResponsible.value) ||
        activeProjectTabMain.value !== "all" ||
        activeProjectTab.value !== "all",
);

const filteredProjects = computed(() => {
    let list = [...props.projects];

    if (activeProjectTabMain.value === "inProgress")
        list = list.filter(isInProgressProject);
    if (activeProjectTabMain.value === "sold") list = list.filter(isSoldProject);

    if (activeProjectTab.value === "inProgress")
        list = list.filter(isInProgressProject);
    if (activeProjectTab.value === "sold") list = list.filter(isSoldProject);

    if (props.searchQuery) {
        const query = props.searchQuery.toLowerCase();
        list = list.filter(
            (project) =>
                project.proyecto.toLowerCase().includes(query) ||
                project.ciudad.toLowerCase().includes(query) ||
                responsibleName(project.encargado).toLowerCase().includes(query) ||
                (project.notas || "").toLowerCase().includes(query),
        );
    }

    if (filterStatus.value)
        list = list.filter(
            (project) => projectSubState(project) === filterStatus.value,
        );
    if (filterCountry.value)
        list = list.filter((project) => project.pais === filterCountry.value);
    if (canFilterByResponsible.value && filterResponsible.value)
        list = list.filter(
            (project) =>
                responsibleName(project.encargado) === filterResponsible.value,
        );

    list.sort((a, b) => {
        const valueA = sortValue(a, sortKey.value);
        const valueB = sortValue(b, sortKey.value);
        if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDir.value === "asc" ? valueA - valueB : valueB - valueA;
        }
        const stringA = String(valueA);
        const stringB = String(valueB);
        return sortDir.value === "asc"
            ? stringA.localeCompare(stringB)
            : stringB.localeCompare(stringA);
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
    for (
        let page = Math.max(1, currentPage.value - 2);
        page <= Math.min(totalPages.value, currentPage.value + 2);
        page++
    ) {
        pages.push(page);
    }
    return pages;
});

watch(
    [
        () => props.searchQuery,
        filterStatus,
        filterCountry,
        filterResponsible,
        activeProjectTabMain,
        activeProjectTab,
    ],
    () => {
        currentPage.value = 1;
    },
);

watch(totalPages, (total) => {
    if (currentPage.value > total) currentPage.value = total;
});

const setSort = (key: string) => {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    } else {
        sortKey.value = key;
        sortDir.value = "asc";
    }
};

const sortValue = (project: Project, key: string) => {
    if (key === "valorTotal") return Number(project.valorTotal || 0);
    if (key === "sub_state") return projectSubState(project);
    if (key === "encargado") return responsibleName(project.encargado);
    return String((project as unknown as Record<string, unknown>)[key] || "");
};

const localPaidPayments = ref<Record<string, number[]>>({});

const projectKey = (project: Project) =>
    [
        project.id || "sin-id",
        project.proyecto,
        project.ciudad,
        project.fechaCreacion,
        project.fechaInstalacion,
        project.valorTotal ?? "sin-valor",
    ].join("|");

const projectPaymentKey = (project: Project) => projectKey(project);

const paymentParts = (project: Project) => {
    const value = project.porcentajesPago || "";
    const percentages = value.match(/\d+(?:[.,]\d+)?\s*%/g);

    if (percentages?.length) {
        return percentages.map((payment) => payment.replace(/\s+/g, ""));
    }

    return value
        .split(/[,-]/)
        .map((payment) => payment.trim())
        .filter(Boolean);
};

const displayedPaidPayments = (project: Project) => {
    const key = projectPaymentKey(project);
    return localPaidPayments.value[key] ?? project.pagosRealizados ?? [];
};

const isPaymentPaid = (project: Project, paymentIndex: number) =>
    displayedPaidPayments(project).map(Number).includes(paymentIndex);

const handlePaymentClick = (project: Project, paymentIndex: number) => {
    const key = projectPaymentKey(project);
    const currentPaid = displayedPaidPayments(project).map(Number);
    const lastPaidIndex = currentPaid.length ? Math.max(...currentPaid) : -1;
    const nextLastPaidIndex =
        paymentIndex === lastPaidIndex ? paymentIndex - 1 : paymentIndex;

    const nextPaidPayments =
        nextLastPaidIndex >= 0
            ? Array.from({ length: nextLastPaidIndex + 1 }, (_, index) => index)
            : [];

    localPaidPayments.value[key] = nextPaidPayments;
    emit("payment-toggle", project, nextPaidPayments);
};

const clearFilters = () => {
    filterStatus.value = "";
    filterCountry.value = "";
    filterResponsible.value = "";
    activeProjectTabMain.value = "all";
    activeProjectTab.value = "all";
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
