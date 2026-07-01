<template>
    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="glass-card overflow-hidden">
            <div class="border-b border-white/[0.06] px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-1">
                            Firebase
                        </p>
                        <h2 class="section-title text-xl">
                            Tipos de producto
                        </h2>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="label-badge bg-acid-400/15 text-acid-400">
                            {{ productTypes.length }} registros
                        </span>
                        <button
                            type="button"
                            class="btn-primary h-9 px-3 text-xs"
                            @click="openCreate"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            <div class="divide-y divide-white/[0.04]">
                <div
                    v-if="loading"
                    class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                >
                    Cargando tipos de proyecto...
                </div>
                <div
                    v-else-if="error"
                    class="px-4 py-12 text-center text-coral-400 text-sm"
                >
                    {{ error }}
                </div>
                <div
                    v-else-if="!productTypes.length"
                    class="px-4 py-12 text-center text-obsidian-500 font-mono text-sm"
                >
                    No hay tipos de proyecto registrados
                </div>
                <div
                    v-for="productType in productTypes"
                    v-else
                    :key="productType.id"
                    class="px-4 py-4 sm:px-6 hover:bg-white/[0.02] transition-colors"
                >
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p class="text-white text-sm font-medium">
                                {{ productType.name || "Sin nombre" }}
                            </p>
                            <p
                                v-if="productType.description"
                                class="text-obsidian-400 text-sm mt-1"
                            >
                                {{ productType.description }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2 sm:justify-end">
                            <button
                                type="button"
                                class="btn-ghost h-8 px-3 text-xs"
                                @click="openEdit(productType)"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                class="h-8 px-3 rounded-xl border border-coral-400/20 text-coral-400 hover:border-coral-400/40 transition-colors text-xs"
                                @click="confirmDelete(productType)"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
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
                            {{ editingProductType ? "Editar registro" : "Nuevo registro" }}
                        </p>
                        <h3 class="section-title text-xl">
                            {{ editingProductType ? "Editar tipo de proyecto" : "Agregar tipo de proyecto" }}
                        </h3>
                    </div>

                    <form class="space-y-4" @submit.prevent="handleSave">
                        <div>
                            <label
                                for="product-type-name"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Nombre
                            </label>
                            <input
                                id="product-type-name"
                                v-model.trim="form.name"
                                class="input-dark"
                                type="text"
                                placeholder="Nombre del tipo de proyecto"
                                autocomplete="off"
                            />
                        </div>

                        <div>
                            <label
                                for="product-type-description"
                                class="block text-xs font-mono text-obsidian-400 mb-2"
                            >
                                Descripcion
                            </label>
                            <textarea
                                id="product-type-description"
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
                v-if="deletingProductType"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="deletingProductType = null"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative glass-card border-coral-400/20 z-10 w-full max-w-sm p-6 text-center">
                    <h2 class="section-title text-xl mb-2">
                        Eliminar tipo de proyecto
                    </h2>
                    <p class="text-obsidian-400 text-sm mb-6">
                        Se eliminara
                        <strong class="text-white">
                            {{ deletingProductType.name || "Sin nombre" }}
                        </strong>
                        de la coleccion product_types.
                    </p>
                    <p
                        v-if="deleteError"
                        class="rounded-xl border border-coral-400/20 bg-coral-400/10 px-4 py-3 text-sm text-coral-400 mb-4"
                    >
                        {{ deleteError }}
                    </p>
                    <div class="flex gap-3">
                        <button class="btn-ghost flex-1" @click="deletingProductType = null">
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
import type { ProductType } from "~/composables/useProductTypes";

const {
    productTypes,
    loading,
    error,
    loadProductTypes,
    addProductType,
    updateProductType,
    deleteProductType,
} = useProductTypes();

const showFormModal = ref(false);
const editingProductType = ref<ProductType | null>(null);
const deletingProductType = ref<ProductType | null>(null);
const saving = ref(false);
const deleting = ref(false);
const formError = ref("");
const deleteError = ref("");
const form = reactive({
    name: "",
    description: "",
});

onMounted(() => {
    loadProductTypes();
});

const openCreate = () => {
    editingProductType.value = null;
    form.name = "";
    form.description = "";
    formError.value = "";
    showFormModal.value = true;
};

const openEdit = (productType: ProductType) => {
    editingProductType.value = productType;
    form.name = productType.name;
    form.description = productType.description || "";
    formError.value = "";
    showFormModal.value = true;
};

const closeForm = () => {
    showFormModal.value = false;
    editingProductType.value = null;
    formError.value = "";
};

const confirmDelete = (productType: ProductType) => {
    deletingProductType.value = productType;
    deleteError.value = "";
};

const handleSave = async () => {
    if (!form.name.trim()) {
        formError.value = "El nombre es obligatorio.";
        return;
    }

    saving.value = true;
    formError.value = "";

    try {
        const payload = {
            name: form.name,
            description: form.description,
        };

        if (editingProductType.value) {
            await updateProductType(editingProductType.value.id, payload);
        } else {
            await addProductType(payload);
        }

        closeForm();
    } catch {
        formError.value = "No se pudo guardar el tipo de proyecto.";
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    if (!deletingProductType.value) return;

    deleting.value = true;
    deleteError.value = "";

    try {
        await deleteProductType(deletingProductType.value.id);
        deletingProductType.value = null;
    } catch {
        deleteError.value = "No se pudo eliminar el tipo de proyecto.";
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
