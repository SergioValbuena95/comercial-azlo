<template>
    <section class="grid gap-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h2 class="section-title text-xl">
                    Productos
                </h2>
                <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                    {{ filteredProducts.length }} de {{ products.length }} registros
                </p>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                    v-model.trim="searchQuery"
                    class="input-dark h-9 w-full sm:w-72 text-xs"
                    type="search"
                    placeholder="Buscar producto"
                />
                <select
                    v-model.number="perPage"
                    class="input-dark h-9 w-full sm:w-auto text-xs"
                >
                    <option :value="10">10 por pagina</option>
                    <option :value="25">25 por pagina</option>
                    <option :value="50">50 por pagina</option>
                    <option :value="100">100 por pagina</option>
                </select>
                <button
                    v-if="searchQuery"
                    type="button"
                    class="btn-ghost h-9 px-3 text-xs text-coral-400 border-coral-400/20 hover:border-coral-400/40"
                    @click="searchQuery = ''"
                >
                    Limpiar
                </button>
                <button
                    type="button"
                    class="btn-primary h-9 px-3 text-xs"
                    @click="openCreate"
                >
                    Agregar
                </button>
            </div>
        </div>

        <div class="glass-card overflow-hidden">
            <div class="block lg:hidden divide-y divide-white/[0.06]">
                <div
                    v-if="loading"
                    class="p-8 text-center text-obsidian-500 font-mono text-sm"
                >
                    Cargando productos...
                </div>
                <div
                    v-else-if="error"
                    class="p-8 text-center text-coral-400 text-sm"
                >
                    {{ error }}
                </div>
                <div
                    v-else-if="!filteredProducts.length"
                    class="p-8 text-center text-obsidian-500 font-mono text-sm"
                >
                    Sin resultados
                </div>
                <div
                    v-for="product in paginatedProducts"
                    v-else
                    :key="product.id"
                    class="p-4 hover:bg-white/[0.02] transition-colors"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p
                                class="font-body text-white text-sm font-medium leading-snug truncate"
                                :title="product.name"
                            >
                                {{ product.name || "Sin nombre" }}
                            </p>
                            <p class="text-obsidian-500 text-xs font-mono mt-1">
                                {{ productTypeName(product.product_type_id) }}
                            </p>
                            <p
                                v-if="product.description"
                                class="text-obsidian-400 text-xs mt-1 line-clamp-2"
                            >
                                {{ product.description }}
                            </p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-obsidian-300 text-sm font-mono">
                                {{ formatCurrency(product.value) }}
                            </p>
                            <p class="text-obsidian-500 text-xs font-mono mt-1">
                                {{ formatPercent(product.profit_percentage) }}
                            </p>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <button
                            type="button"
                            class="btn-ghost text-xs h-7 px-3"
                            @click="openEdit(product)"
                        >
                            Editar
                        </button>
                        <button
                            type="button"
                            class="text-xs h-7 px-3 rounded-lg border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors"
                            @click="confirmDelete(product)"
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
                                Cargando productos...
                            </td>
                        </tr>
                        <tr v-else-if="error">
                            <td
                                :colspan="columns.length + 1"
                                class="px-4 py-12 text-center text-coral-400 text-sm"
                            >
                                {{ error }}
                            </td>
                        </tr>
                        <tr v-else-if="!filteredProducts.length">
                            <td
                                :colspan="columns.length + 1"
                                class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                            >
                                Sin resultados
                            </td>
                        </tr>
                        <tr
                            v-for="product in paginatedProducts"
                            v-else
                            :key="product.id"
                            class="group hover:bg-white/[0.02] transition-colors"
                        >
                            <td class="px-4 py-3.5">
                                <p
                                    class="text-white text-sm font-body font-medium max-w-xs truncate"
                                    :title="product.name"
                                >
                                    {{ product.name || "Sin nombre" }}
                                </p>
                                <p class="text-obsidian-500 text-xs font-mono mt-1">
                                    {{ productTypeName(product.product_type_id) }}
                                </p>
                            </td>
                            <td class="px-4 py-3.5">
                                <p
                                    class="text-obsidian-400 text-sm max-w-md truncate"
                                    :title="product.description || ''"
                                >
                                    {{ product.description || "--" }}
                                </p>
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-300 text-sm font-mono whitespace-nowrap">
                                {{ formatCurrency(product.value) }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-300 text-sm font-mono whitespace-nowrap">
                                {{ formatPercent(product.profit_percentage) }}
                            </td>
                            <td class="px-4 py-3.5 text-obsidian-500 text-xs font-mono whitespace-nowrap">
                                {{ formatDate(product.created_at) }}
                            </td>
                            <td class="px-4 py-3.5">
                                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-sm"
                                        title="Editar"
                                        aria-label="Editar"
                                        @click="openEdit(product)"
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
                                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coral-400/10 text-obsidian-500 hover:text-coral-400 transition-colors text-sm"
                                        title="Eliminar"
                                        aria-label="Eliminar"
                                        @click="confirmDelete(product)"
                                    >
                                        x
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-obsidian-500 text-xs font-mono">
                    Mostrando {{ rangeStart }}-{{ rangeEnd }} de
                    {{ filteredProducts.length }}
                </p>
                <div class="flex gap-1">
                    <button
                        type="button"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-obsidian-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                        :disabled="currentPage === 1"
                        @click="currentPage--"
                    >
                        &lt;
                    </button>
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        type="button"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-mono transition-colors"
                        :class="
                            currentPage === page
                                ? 'border-acid-400/40 bg-acid-400/10 text-acid-400'
                                : 'border-white/10 text-obsidian-400 hover:text-white hover:border-white/20'
                        "
                        @click="currentPage = page"
                    >
                        {{ page }}
                    </button>
                    <button
                        type="button"
                        class="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-obsidian-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                        :disabled="currentPage === totalPages || !filteredProducts.length"
                        @click="currentPage++"
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    </section>

    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="showFormModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="closeForm"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card z-10 w-full max-w-md p-6">
                    <div class="mb-5">
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                            {{ editingProduct ? "Editar registro" : "Nuevo registro" }}
                        </p>
                        <h3 class="section-title text-xl">
                            {{ editingProduct ? "Editar producto" : "Agregar producto" }}
                        </h3>
                    </div>

                    <form class="space-y-4" @submit.prevent="handleSave">
                        <div>
                            <label
                                for="product-name"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Nombre
                            </label>
                            <input
                                id="product-name"
                                v-model.trim="form.name"
                                class="input-dark"
                                type="text"
                                placeholder="Nombre del producto"
                                autocomplete="off"
                            />
                        </div>

                        <div>
                            <label
                                for="product-type"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Tipo de producto
                            </label>
                            <select
                                id="product-type"
                                v-model="form.product_type_id"
                                class="input-dark"
                                :disabled="productTypesLoading"
                            >
                                <option value="">
                                    {{
                                        productTypesLoading
                                            ? "Cargando tipos..."
                                            : "Sin tipo asignado"
                                    }}
                                </option>
                                <option
                                    v-for="productType in productTypes"
                                    :key="productType.id"
                                    :value="productType.id"
                                >
                                    {{ productType.name || "Sin nombre" }}
                                </option>
                            </select>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    for="product-value"
                                    class="block text-xs font-mono text-obsidian-400 mb-2"
                                >
                                    Valor
                                </label>
                                <input
                                    id="product-value"
                                    v-model.number="form.value"
                                    class="input-dark"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label
                                    for="product-profit-percentage"
                                    class="block text-xs font-mono text-obsidian-400 mb-2"
                                >
                                    Porcentaje de ganancia
                                </label>
                                <input
                                    id="product-profit-percentage"
                                    v-model.number="form.profit_percentage"
                                    class="input-dark"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                for="product-description"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Descripcion
                            </label>
                            <textarea
                                id="product-description"
                                v-model.trim="form.description"
                                class="input-dark min-h-24 resize-y"
                                placeholder="Detalle opcional"
                            ></textarea>
                        </div>

                        <p
                            v-if="formError"
                            class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400"
                        >
                            {{ formError }}
                        </p>

                        <div class="flex gap-3 pt-2">
                            <button
                                type="button"
                                class="btn-ghost flex-1"
                                @click="closeForm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                class="btn-primary flex-1"
                                :disabled="saving"
                            >
                                {{ saving ? "Guardando..." : "Guardar" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>

    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="deletingProduct"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="deletingProduct = null"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card border-coral-400/20 z-10 w-full max-w-sm p-6 text-center">
                    <h2 class="section-title text-xl mb-2">
                        Eliminar producto
                    </h2>
                    <p class="text-obsidian-400 text-sm mb-6">
                        Se eliminara
                        <strong class="text-white">
                            {{ deletingProduct.name || "Sin nombre" }}
                        </strong>
                        de la coleccion products.
                    </p>
                    <p
                        v-if="deleteError"
                        class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400 mb-4"
                    >
                        {{ deleteError }}
                    </p>
                    <div class="flex gap-3">
                        <button class="btn-ghost flex-1" @click="deletingProduct = null">
                            Cancelar
                        </button>
                        <button
                            class="flex-1 h-10 rounded-xl bg-coral-500 hover:bg-coral-400 text-white font-display font-bold text-sm transition-colors"
                            :disabled="deleting"
                            @click="handleDelete"
                        >
                            {{ deleting ? "Eliminando..." : "Eliminar" }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import type { Product } from "~/composables/useProducts";

const {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} = useProducts();
const {
    productTypes,
    loading: productTypesLoading,
    loadProductTypes,
} = useProductTypes();

const showFormModal = ref(false);
const editingProduct = ref<Product | null>(null);
const deletingProduct = ref<Product | null>(null);
const saving = ref(false);
const deleting = ref(false);
const formError = ref("");
const deleteError = ref("");
const searchQuery = ref("");
const sortKey = ref("name");
const sortDir = ref<"asc" | "desc">("asc");
const currentPage = ref(1);
const perPage = ref(25);
const form = reactive({
    name: "",
    description: "",
    product_type_id: "",
    profit_percentage: 0,
    value: 0,
});

const columns = [
    { key: "name", label: "Producto" },
    { key: "description", label: "Descripcion" },
    { key: "value", label: "Valor" },
    { key: "profit_percentage", label: "Ganancia" },
    { key: "created_at", label: "Creado" },
];

onMounted(() => {
    loadProducts();
    loadProductTypes();
});

const filteredProducts = computed(() => {
    const query = searchQuery.value.toLowerCase();

    const list = products.value.filter((product) => {
        if (!query) return true;

        return [
            product.name,
            product.description,
            productTypeName(product.product_type_id),
            String(product.value),
            String(product.profit_percentage),
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
    });

    return list.sort((a, b) => {
        const valueA = sortValue(a, sortKey.value);
        const valueB = sortValue(b, sortKey.value);

        if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDir.value === "asc" ? valueA - valueB : valueB - valueA;
        }

        const stringA = String(valueA);
        const stringB = String(valueB);

        return sortDir.value === "asc"
            ? stringA.localeCompare(stringB, "es", { sensitivity: "base" })
            : stringB.localeCompare(stringA, "es", { sensitivity: "base" });
    });
});

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredProducts.value.length / perPage.value)),
);

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredProducts.value.slice(start, start + perPage.value);
});

const rangeStart = computed(() =>
    filteredProducts.value.length
        ? (currentPage.value - 1) * perPage.value + 1
        : 0,
);

const rangeEnd = computed(() =>
    Math.min(currentPage.value * perPage.value, filteredProducts.value.length),
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

watch([searchQuery, perPage], () => {
    currentPage.value = 1;
});

watch(totalPages, (total) => {
    if (currentPage.value > total) currentPage.value = total;
});

const setSort = (key: string) => {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
        return;
    }

    sortKey.value = key;
    sortDir.value = "asc";
};

const sortValue = (product: Product, key: string) => {
    if (key === "value") return Number(product.value || 0);
    if (key === "profit_percentage")
        return Number(product.profit_percentage || 0);
    if (key === "product_type_id")
        return productTypeName(product.product_type_id);
    if (key === "created_at") return timestampValue(product.created_at);
    return String((product as unknown as Record<string, unknown>)[key] || "");
};

const productTypeName = (productTypeId?: string) => {
    if (!productTypeId) return "Sin tipo";

    const productType = productTypes.value.find(
        (type) => type.id === productTypeId,
    );

    return productType?.name || "Tipo no encontrado";
};

const timestampValue = (value: unknown) => {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === "string") return new Date(value).getTime() || 0;
    if (typeof value === "object" && "seconds" in value) {
        return Number((value as { seconds: number }).seconds) * 1000;
    }
    if (typeof value === "object" && "toDate" in value) {
        return (value as { toDate: () => Date }).toDate().getTime();
    }
    return 0;
};

const formatCurrency = (value?: number | string | null) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatPercent = (value?: number | string | null) =>
    `${new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: 2,
    }).format(Number(value || 0))}%`;

const formatDate = (value: unknown) => {
    const timestamp = timestampValue(value);
    if (!timestamp) return "--";

    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(timestamp));
};

const openCreate = () => {
    editingProduct.value = null;
    form.name = "";
    form.description = "";
    form.product_type_id = "";
    form.profit_percentage = 0;
    form.value = 0;
    formError.value = "";
    showFormModal.value = true;
};

const openEdit = (product: Product) => {
    editingProduct.value = product;
    form.name = product.name;
    form.description = product.description || "";
    form.product_type_id = product.product_type_id || "";
    form.profit_percentage = product.profit_percentage || 0;
    form.value = product.value || 0;
    formError.value = "";
    showFormModal.value = true;
};

const closeForm = () => {
    showFormModal.value = false;
    editingProduct.value = null;
    formError.value = "";
};

const confirmDelete = (product: Product) => {
    deletingProduct.value = product;
    deleteError.value = "";
};

const handleSave = async () => {
    if (!form.name.trim()) {
        formError.value = "El nombre es obligatorio.";
        return;
    }

    if (!Number.isFinite(Number(form.value)) || Number(form.value) < 0) {
        formError.value = "El valor debe ser un numero valido.";
        return;
    }

    if (
        !Number.isFinite(Number(form.profit_percentage)) ||
        Number(form.profit_percentage) < 0
    ) {
        formError.value = "El porcentaje de ganancia debe ser un numero valido.";
        return;
    }

    saving.value = true;
    formError.value = "";

    try {
        const payload = {
            name: form.name,
            description: form.description,
            product_type_id: form.product_type_id,
            profit_percentage: Number(form.profit_percentage),
            value: Number(form.value),
        };

        if (editingProduct.value) {
            await updateProduct(editingProduct.value.id, payload);
        } else {
            await addProduct(payload);
        }

        closeForm();
    } catch {
        formError.value = "No se pudo guardar el producto.";
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    if (!deletingProduct.value) return;

    deleting.value = true;
    deleteError.value = "";

    try {
        await deleteProduct(deletingProduct.value.id);
        deletingProduct.value = null;
    } catch {
        deleteError.value = "No se pudo eliminar el producto.";
    } finally {
        deleting.value = false;
    }
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
