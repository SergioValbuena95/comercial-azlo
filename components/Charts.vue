<!-- components/Charts.vue -->
<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Actividad Mensual -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Actividad Mensual</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Proyectos creados por mes
            </p>
            <canvas ref="lineRef" height="120"></canvas>
        </div>
        <!-- Actividad Mensual -->
        <div class="glass-card p-6">
            <div
                class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6"
            >
                <div>
                    <h3 class="section-title text-base mb-1">
                        Valor Vendido Mensual
                    </h3>
                    <p class="text-obsidian-500 text-xs font-mono">
                        {{ valueChartDescription }}
                    </p>
                </div>
                <div class="flex gap-2">
                    <select
                        v-model="selectedValueYear"
                        class="input-dark h-9 w-auto text-xs"
                    >
                        <option value="all">Todos los anos</option>
                        <option
                            v-for="year in valueYears"
                            :key="year"
                            :value="year"
                        >
                            {{ year }}
                        </option>
                    </select>
                    <select
                        v-model="selectedValueMonth"
                        class="input-dark h-9 w-auto text-xs"
                    >
                        <option value="all">Todos los meses</option>
                        <option
                            v-for="month in monthOptions"
                            :key="month.value"
                            :value="month.value"
                        >
                            {{ month.label }}
                        </option>
                    </select>
                </div>
            </div>
            <canvas ref="valueRef" height="120"></canvas>
        </div>
        <!-- Proyectos por Estado -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Proyectos por Estado</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Distribucion del pipeline - {{ total }} proyectos
            </p>
            <div class="flex items-center justify-center">
                <canvas ref="pieRef" height="220"></canvas>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-4">
                <div
                    v-for="(count, status) in byStatus"
                    :key="status"
                    class="flex items-center gap-2 text-xs"
                >
                    <span
                        class="w-2 h-2 rounded-sm flex-shrink-0"
                        :style="`background: ${getStatusColor(status as string)}`"
                    ></span>
                    <span class="text-obsidian-400 truncate">{{ status }}</span>
                    <span class="text-white font-mono ml-auto">{{
                        count
                    }}</span>
                </div>
            </div>
        </div>
        <!-- Proyectos por Pais -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Proyectos por Pais</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Presencia regional
            </p>
            <canvas ref="barRef" height="220"></canvas>
        </div>
        <!-- Carga por Encargado -->
        <div class="glass-card p-6 lg:col-span-2">
            <h3 class="section-title text-base mb-1">Carga por Encargado</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Proyectos asignados por ejecutivo
            </p>
            <div class="space-y-3">
                <div
                    v-for="(count, name) in sortedResponsibles"
                    :key="name"
                    class="group"
                >
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="text-sm text-obsidian-300 font-body">{{
                            name
                        }}</span>
                        <span class="font-mono text-xs text-white"
                            >{{ count }} proyectos</span
                        >
                    </div>
                    <div
                        class="h-2 bg-obsidian-800 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full rounded-full transition-all duration-1000 ease-out"
                            :style="`width: ${(count / maxResponsible) * 100}%; background: linear-gradient(90deg, #c8ff47, #74b9ff)`"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps<{
    byStatus: Record<string, number>;
    byCountry: Record<string, number>;
    byMonth: Record<string, number>;
    valueByMonth: Record<string, number>;
    byResponsible: Record<string, number>;
    total: number;
}>();

const pieRef = ref<HTMLCanvasElement>();
const barRef = ref<HTMLCanvasElement>();
const lineRef = ref<HTMLCanvasElement>();
const valueRef = ref<HTMLCanvasElement>();

let pieChart: Chart | null = null;
let barChart: Chart | null = null;
let lineChart: Chart | null = null;
let valueChart: Chart | null = null;

const statusColors: Record<string, string> = {
    vendido: "#74b9ff",
    fabricacion: "#c8ff47",
    despacho: "#e17055",
    instalacion: "#00cec9",
    vendidoInstalacion: "#55efc4",
    terminado: "#00b894",
    facturado: "#a29bfe",
    Programado: "#74b9ff",
    Aprobado: "#c8ff47",
    Instalado: "#00b894",
    Entregado: "#a29bfe",
    Cerrado: "#636e72",
    Prospecto: "#fdcb6e",
    Cotizado: "#e17055",
    "En instalacion": "#00cec9",
    "En instalaciÃ³n": "#00cec9",
    "En instalación": "#00cec9",
};

const getStatusKey = (status: string) => {
    const value = status.toLowerCase();

    if (value.includes("vendido") && value.includes("instal"))
        return "vendidoInstalacion";
    if (value.includes("vendido")) return "vendido";
    if (value.includes("fabricaci")) return "fabricacion";
    if (value.includes("despacho")) return "despacho";
    if (value.includes("instal")) return "instalacion";
    if (value.includes("terminado")) return "terminado";
    if (value.includes("facturado")) return "facturado";

    return status;
};

const getStatusColor = (status: string) =>
    statusColors[getStatusKey(status)] || "#555";

const sortedResponsibles = computed(() =>
    Object.fromEntries(
        Object.entries(props.byResponsible).sort(([, a], [, b]) => b - a),
    ),
);

const maxResponsible = computed(() =>
    Math.max(1, ...Object.values(props.byResponsible)),
);
const selectedValueYear = ref("all");
const selectedValueMonth = ref("all");

const monthLabel = (key: string) => {
    const [y, m] = key.split("-");
    return new Date(+y, +m - 1).toLocaleString("es", {
        month: "short",
        year: "2-digit",
    });
};

const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return {
        value: month,
        label: new Date(2025, index).toLocaleString("es", { month: "short" }),
    };
});

const valueYears = computed(() =>
    [...new Set(Object.keys(props.valueByMonth).map((key) => key.slice(0, 4)))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)),
);

const filteredValueEntries = computed(() => {
    if (selectedValueYear.value === "all") {
        return sortedEntries(props.valueByMonth);
    }

    const months =
        selectedValueMonth.value === "all"
            ? monthOptions.map((month) => month.value)
            : [selectedValueMonth.value];

    return months.map((month) => {
        const key = `${selectedValueYear.value}-${month}`;
        return [key, props.valueByMonth[key] || 0] as [string, number];
    });
});

const valueChartDescription = computed(() => {
    const total = filteredValueEntries.value.reduce(
        (sum, [, value]) => sum + value,
        0,
    );
    if (selectedValueYear.value === "all")
        return `Total filtrado: ${compactCurrency(total)}`;
    if (selectedValueMonth.value === "all")
        return `${selectedValueYear.value} - total: ${compactCurrency(total)}`;
    return `${monthLabel(`${selectedValueYear.value}-${selectedValueMonth.value}`)} - total: ${compactCurrency(total)}`;
});

const compactCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(value);

const fullCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);

const sortedEntries = (data: Record<string, number>) =>
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b));

const updateCharts = () => {
    if (pieChart) {
        const labels = Object.keys(props.byStatus);
        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = Object.values(props.byStatus);
        pieChart.data.datasets[0].backgroundColor = labels.map(
            (s) => getStatusColor(s),
        );
        pieChart.update();
    }

    if (barChart) {
        const sorted = Object.entries(props.byCountry).sort(
            ([, a], [, b]) => b - a,
        );
        barChart.data.labels = sorted.map(([k]) => k);
        barChart.data.datasets[0].data = sorted.map(([, v]) => v);
        barChart.update();
    }

    if (lineChart) {
        const months = sortedEntries(props.byMonth);
        lineChart.data.labels = months.map(([k]) => monthLabel(k));
        lineChart.data.datasets[0].data = months.map(([, v]) => v);
        lineChart.update();
    }

    if (valueChart) {
        const months = filteredValueEntries.value;
        valueChart.data.labels = months.map(([k]) => monthLabel(k));
        valueChart.data.datasets[0].data = months.map(([, v]) => v);
        valueChart.update();
    }
};

onMounted(() => {
    Chart.defaults.font = { family: "'Space Mono', monospace" };
    Chart.defaults.color = "#696980";

    if (pieRef.value) {
        const labels = Object.keys(props.byStatus);
        pieChart = new Chart(pieRef.value, {
            type: "pie",
            data: {
                labels,
                datasets: [
                    {
                        data: Object.values(props.byStatus),
                        backgroundColor: labels.map(
                            (s) => getStatusColor(s),
                        ),
                        borderColor: "#0a0a0d",
                        borderWidth: 2,
                        hoverBorderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const value = ctx.raw as number;
                                const pct = props.total
                                    ? Math.round((value / props.total) * 100)
                                    : 0;
                                return ` ${ctx.label}: ${value} (${pct}%)`;
                            },
                        },
                        backgroundColor: "#15151a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        padding: 12,
                    },
                },
                animation: { animateRotate: true, duration: 1200 },
            },
        });
    }

    if (barRef.value) {
        const sorted = Object.entries(props.byCountry).sort(
            ([, a], [, b]) => b - a,
        );
        barChart = new Chart(barRef.value, {
            type: "bar",
            data: {
                labels: sorted.map(([k]) => k),
                datasets: [
                    {
                        data: sorted.map(([, v]) => v),
                        backgroundColor: [
                            "rgba(200,255,71,0.8)",
                            "rgba(116,185,255,0.8)",
                            "rgba(162,155,254,0.8)",
                            "rgba(0,206,201,0.8)",
                            "rgba(253,203,110,0.8)",
                        ],
                        borderRadius: 8,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: chartScales({ stepSize: 2 }),
                animation: { duration: 1000 },
            },
        });
    }

    if (lineRef.value) {
        const months = sortedEntries(props.byMonth);
        lineChart = new Chart(lineRef.value, {
            type: "line",
            data: {
                labels: months.map(([k]) => monthLabel(k)),
                datasets: [
                    {
                        label: "Proyectos",
                        data: months.map(([, v]) => v),
                        borderColor: "#c8ff47",
                        backgroundColor: "rgba(200,255,71,0.07)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#c8ff47",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: chartScales({ stepSize: 1 }),
                animation: { duration: 1200 },
            },
        });
    }

    if (valueRef.value) {
        const months = filteredValueEntries.value;
        valueChart = new Chart(valueRef.value, {
            type: "bar",
            data: {
                labels: months.map(([k]) => monthLabel(k)),
                datasets: [
                    {
                        label: "Valor vendido",
                        data: months.map(([, v]) => v),
                        backgroundColor: "rgba(116,185,255,0.75)",
                        borderColor: "#74b9ff",
                        borderWidth: 1,
                        borderRadius: 8,
                        borderSkipped: false,
                        minBarLength: 3,
                    },
                ],
            },
            options: {
                interaction: {
                    mode: "index",
                    intersect: false,
                    axis: "x",
                },
                hover: {
                    mode: "index",
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: (items) => {
                                const item = items[0];
                                return item?.label ? `Mes: ${item.label}` : "";
                            },
                            label: (ctx) =>
                                ` Total vendido: ${fullCurrency(ctx.raw as number)}`,
                        },
                        backgroundColor: "#15151a",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        padding: 12,
                    },
                },
                scales: chartScales({
                    valueFormatter: (value) => compactCurrency(Number(value)),
                }),
                animation: { duration: 1200 },
            },
        });
    }
});

const chartScales = ({
    stepSize,
    valueFormatter,
}: {
    stepSize?: number;
    valueFormatter?: (value: string | number) => string;
} = {}) => ({
    x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#696980", font: { size: 11 } },
    },
    y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { display: false },
        ticks: {
            stepSize,
            color: "#696980",
            font: { size: 11 },
            callback: valueFormatter,
        },
    },
});

watch(valueYears, (years) => {
    if (
        selectedValueYear.value !== "all" &&
        !years.includes(selectedValueYear.value)
    ) {
        selectedValueYear.value = "all";
    }
});

watch(selectedValueYear, () => {
    selectedValueMonth.value = "all";
});

watch(
    () => [
        props.byStatus,
        props.byCountry,
        props.byMonth,
        props.valueByMonth,
        selectedValueYear.value,
        selectedValueMonth.value,
    ],
    () => {
        updateCharts();
    },
    { deep: true },
);

onUnmounted(() => {
    pieChart?.destroy();
    barChart?.destroy();
    lineChart?.destroy();
    valueChart?.destroy();
});
</script>
