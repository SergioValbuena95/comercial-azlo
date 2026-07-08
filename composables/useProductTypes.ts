export interface ProductType {
    id: string;
    name: string;
    description?: string;
    [key: string]: unknown;
}

export interface ProductTypeCreateInput {
    name: string;
    description?: string;
}

export type ProductTypeUpdateInput = ProductTypeCreateInput;

const normalizeProductType = (row: any): ProductType => ({
    id: String(row.id),
    name: String(row.name || ""),
    description: typeof row.description === "string" ? row.description : undefined,
});

export function useProductTypes() {
    const productTypes = ref<ProductType[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const client = useSupabaseClient();
    let productTypesChannel: any = null;

    const loadProductTypes = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await (client as any)
                .from("product_types")
                .select("*")
                .order("name", { ascending: true });

            if (err) throw err;

            productTypes.value = (data || []).map(normalizeProductType);

            if (!productTypesChannel) {
                productTypesChannel = client
                    .channel("product_types-changes")
                    .on(
                        "postgres_changes",
                        { event: "*", schema: "public", table: "product_types" },
                        () => {
                            loadProductTypes();
                        },
                    )
                    .subscribe();
            }
        } catch (err: any) {
            console.error(err);
            error.value = "No se pudieron cargar los tipos de producto.";
        } finally {
            loading.value = false;
        }
    };

    const getProductType = async (id: string) => {
        try {
            const { data, error: err } = await (client as any)
                .from("product_types")
                .select("*")
                .eq("id", id)
                .single();

            if (err) throw err;
            if (!data) return null;

            return normalizeProductType(data);
        } catch (err) {
            console.error(err);
            error.value = "No se pudo cargar el tipo de producto.";
            return null;
        }
    };

    const addProductType = async (data: ProductTypeCreateInput) => {
        const name = data.name.trim();
        const description = data.description?.trim() || "";

        if (!name) {
            error.value = "El nombre del tipo de producto es obligatorio.";
            throw new Error(error.value);
        }

        try {
            const { error: err } = await (client as any)
                .from("product_types")
                .insert({
                    name,
                    description,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (err) throw err;
        } catch (err) {
            console.error(err);
            error.value = "No se pudo crear el tipo de producto.";
            throw err;
        }
    };

    const updateProductType = async (
        id: string,
        data: ProductTypeUpdateInput,
    ) => {
        const name = data.name.trim();
        const description = data.description?.trim() || "";

        if (!name) {
            error.value = "El nombre del tipo de producto es obligatorio.";
            throw new Error(error.value);
        }

        try {
            const { error: err } = await (client as any)
                .from("product_types")
                .update({
                    name,
                    description,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (err) throw err;
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el tipo de producto.";
            throw err;
        }
    };

    const deleteProductType = async (id: string) => {
        try {
            const { error: err } = await (client as any)
                .from("product_types")
                .delete()
                .eq("id", id);

            if (err) throw err;
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el tipo de producto.";
            throw err;
        }
    };

    onScopeDispose(() => {
        if (productTypesChannel) {
            client.removeChannel(productTypesChannel);
            productTypesChannel = null;
        }
    });

    return {
        productTypes,
        loading,
        error,
        loadProductTypes,
        getProductType,
        addProductType,
        updateProductType,
        deleteProductType,
    };
}
