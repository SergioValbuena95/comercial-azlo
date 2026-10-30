<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Actividad Mensual -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Actividad Mensual</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Proyectos creados por mes
            </p>
            <div class="relative h-[200px] w-full">
                <Line
                    :data="lineChartData2"
                    :options="chartOptions"
                    aria-label="Monthly revenue line chart"
                    role="img"
                />
            </div>
        </div>

        <!-- Valor Vendido Mensual -->
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
                        <option value="all">Todos los años</option>
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
            <div class="relative h-[200px] w-full">
                <Bar
                    id="monthly-value-chart-2"
                    :data="valueChartData2"
                    :options="valueChartOptions"
                />
            </div>
        </div>

        <!-- Valor por proyecto -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Valor por proyecto</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Distribución del pipeline - {{ total }} proyectos
            </p>
            <div class="relative flex items-center justify-center h-[220px] w-full">
                <Pie
                    id="status-pie-chart-2"
                    :data="pieChartData2"
                    :options="pieChartOptions"
                />
            </div>
        </div>

        <!-- Proyectos por Ciudad -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Proyectos por Ciudad</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                Presencia regional
            </p>
            <div class="relative h-[260px] w-full">
                <Bar
                    id="city-bar-chart-2"
                    :data="cityBarChartData2"
                    :options="cityBarChartOptions"
                />
            </div>
        </div>

        <!-- Carga por Encargado -->
        <div class="glass-card p-6">
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
                        <span class="text-sm text-obsidian-300 font-body">
                            {{ name }}
                        </span>
                        <span class="font-mono text-xs text-white"
                            >{{ count }} proyectos</span
                        >
                    </div>
                    <div
                        class="h-2 bg-obsidian-800 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full rounded-full transition-all duration-1000 ease-out"
                            :style="`width: ${(count / maxResponsible) * 100}%; background: linear-gradient(90deg, #005571, #74b9ff)`"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Recaudado vs. Por Cobrar -->
        <div class="glass-card p-6">
            <h3 class="section-title text-base mb-1">Recaudado vs. Por Cobrar</h3>
            <p class="text-obsidian-500 text-xs font-mono mb-6">
                {{ paymentChartDescription }}
            </p>
            <div class="relative flex items-center justify-center h-[220px] w-full">
                <Bar
                    id="payment-bar-chart"
                    :data="paymentChartData"
                    :options="paymentChartOptions"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";


import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  BarElement,
  ArcElement,
type ChartOptions,
} from 'chart.js'
import { Line, Bar, Pie } from "vue-chartjs";


ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  BarElement,
  ArcElement,
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: false,
    mode: 'index' as const,
  },

  plugins: {
    legend: {
        display: false,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
            usePointStyle: true,
            padding: 20,
        },
    },

    tooltip: {
        enabled: true,
        backgroundColor: '#18181B',
        padding: 12,
        displayColors: false,
        callbacks: {
            label: (context: { parsed: { y: number | null } }) =>
            `Total: ${(context.parsed.y ?? 0)}`,
        },
    },
  },

  scales: {
    x: {
        grid: {
            display: true,
        },
        border: {
            display: true,
        },
        ticks: {
            color: '#71717A',
        },
    },

    y: {
        beginAtZero: true,
        border: {
            display: true,
            // dash: [4, 4],
        },
        grid: {
            display: true,
            color: '#E4E4E7',
        },
        ticks: {
            color: '#71717A',
            callback: (value: string | number) =>
            `${Number(value)}`,
        },
    },
  },
}

const props = defineProps<{
    byStatus: Record<string, number>;
    byCity: Record<string, number>;
    byMonth: Record<string, number>;
    valueByMonth: Record<string, number>;
    valueByProject: Record<string, number>;
    paymentByProject?: Record<string, { collected: number; pending: number }>;
    byResponsible: Record<string, number>;
    total: number;
}>();

const sortedResponsibles = computed(() =>
    Object.fromEntries(
        Object.entries(props.byResponsible).sort(([, a], [, b]) => b - a),
    ),
);

const maxResponsible = computed(() =>
    Math.max(1, ...Object.values(props.byResponsible)),
);

const selectedValueYear = ref(String(new Date().getFullYear()));
const selectedValueMonth = ref("all");

const monthLabel = (key: string) => {
    const [y, m] = key.split("-");
    return new Date(+y, +m - 1).toLocaleString("es", {
        month: "short",
    });
};

const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return {
        value: month,
        label: new Date(2000, index, 1).toLocaleString("es", {
            month: "short",
        }),
    };
});

const valueYears = computed(() =>
    [...new Set(Object.keys(props.valueByMonth).map((key) => key.slice(0, 4)))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)),
);

const sortedEntries = (data: Record<string, number>) =>
    Object.entries(data).sort(([a], [b]) => a.localeCompare(b));

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

const compactCurrencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
    notation: "compact",
});

const fullCurrencyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

const compactCurrency = (value: number) =>
    compactCurrencyFormatter.format(value);

const fullCurrency = (value: number) => fullCurrencyFormatter.format(value);

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

/* ==============================
   1. Actividad Mensual (Line)
================================= */
const lineChartData2 = computed(() => {
    const months = sortedEntries(props.byMonth);
    return {
        labels: months.map(([k]) => monthLabel(k)),
        datasets: [
            {
                label: "Proyectos",
                data: months.map(([, v]) => v),
                borderColor: "#005571",
                backgroundColor: "rgba(0, 85, 113,0.07)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#005571",
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };
});


/* ==============================
   2. Valor Vendido Mensual (Bar)
================================= */
const valueChartData2 = computed(() => {
    const months = filteredValueEntries.value;
    return {
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
    };
});

const valueChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
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
    }) as any,
    animation: { duration: 1200 },
};

/* ==============================
   3. Valor por proyecto (Pie)
================================= */
const projectPalette = [
    "#10232c",
    "#1b3b4b",
    "#265369",
    "#326c88",
    "#3e85a7",
    "#569ec0",
    "#78b4d1",
    "#9acae1",
];

const pieChartData2 = computed(() => {
    const entries = Object.entries(props.valueByProject || {});
    const values = entries.map(([, val]) => val);
    const maxValue = Math.max(0, ...values);

    return {
        labels: entries.map(([name]) => name),
        datasets: [
            {
                data: values,
                backgroundColor: projectPalette,
                offset: values.map((val) =>
                    maxValue > 0 && val === maxValue ? 18 : 0,
                ),
                borderWidth: 0,
                hoverBorderWidth: 0,
            },
        ],
    };
});

const totalProjectValue = computed(() =>
    Object.values(props.valueByProject || {}).reduce((sum, v) => sum + v, 0),
);

const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: 10,
    },
    interaction: {
        mode: "nearest",
        intersect: true,
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const value = ctx.raw as number;
                    const pct = totalProjectValue.value
                        ? Math.round((value / totalProjectValue.value) * 100)
                        : 0;
                    return ` ${ctx.label}: ${fullCurrency(value)} (${pct}%)`;
                },
            },
            backgroundColor: "#15151a",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 12,
        },
    },
    animation: { animateRotate: true, duration: 1200 } as any,
};

/* ==============================
   4. Proyectos por Ciudad (Bar)
================================= */
const cityBarChartData2 = computed(() => {
    const sorted = Object.entries(props.byCity).sort(([, a], [, b]) => b - a);
    return {
        labels: sorted.map(([k]) => k),
        datasets: [
            {
                label: "Proyectos por ciudad",
                data: sorted.map(([, v]) => v),
                backgroundColor: projectPalette,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };
});

const cityBarChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: "index",
        intersect: false,
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const count = ctx.raw as number;
                    return ` Proyectos: ${count}`;
                },
            },
        },
    },
    scales: chartScales({ stepSize: 2 }) as any,
    animation: { duration: 1000 },
};

/* ==============================
   5. Recaudado vs. Por Cobrar (Stacked Bar)
================================= */
const paymentEntries = computed(() =>
    Object.entries(props.paymentByProject || {}),
);

const paymentChartDescription = computed(() => {
    const totals = paymentEntries.value.reduce(
        (acc, [, val]) => {
            acc.collected += val.collected;
            acc.pending += val.pending;
            return acc;
        },
        { collected: 0, pending: 0 },
    );
    return `Recaudado: ${compactCurrency(totals.collected)} · Por cobrar: ${compactCurrency(totals.pending)}`;
});

const paymentChartData = computed(() => {
    const entries = paymentEntries.value;
    return {
        labels: entries.map(([name]) => name),
        datasets: [
            {
                label: "Recaudado",
                data: entries.map(([, val]) => val.collected),
                backgroundColor: "#3e85a7",
                borderSkipped: false,
            },
            {
                label: "Por cobrar",
                data: entries.map(([, val]) => val.pending),
                backgroundColor: "#1b3b4b",
                borderSkipped: false,
            },
        ],
    };
});

const paymentChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: "index",
        intersect: false,
    },
    plugins: {
        legend: {
            display: true,
            position: "top",
            align: "end",
            labels: {
                color: "#696980",
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 8,
                font: { size: 11 },
            },
        },
        tooltip: {
            backgroundColor: "#15151a",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 12,
            callbacks: {
                label: (ctx) =>
                    ` ${ctx.dataset.label}: ${fullCurrency(ctx.raw as number)}`,
            },
        },
    },
    scales: {
        x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: {
                color: "#696980",
                font: { size: 11 },
                callback: function (value) {
                    const label = this.getLabelForValue(Number(value));
                    return label.length > 10 ? `${label.slice(0, 10)}…` : label;
                },
            },
        },
        y: {
            stacked: true,
            grid: { color: "rgba(255,255,255,0.04)" },
            border: { display: false },
            ticks: {
                color: "#696980",
                font: { size: 11 },
                callback: (value) => compactCurrency(Number(value)),
            },
        },
    },
    animation: { duration: 1000 },
};

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
</script>
