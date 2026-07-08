export interface Product {
    id: string;
    name: string;
    description?: string;
    product_type_id?: string;
    profit_percentage: number;
    value: number;
    created_at?: unknown;
    deleted_at?: unknown;
    [key: string]: unknown;
}

export interface ProductCreateInput {
    name: string;
    description?: string;
    product_type_id?: string;
    profit_percentage: number;
    value: number;
}

export type ProductUpdateInput = ProductCreateInput;

const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
};

const hasDeletedAt = (value: unknown): boolean => {
    if (value === null || value === undefined || value === "") return false;
    return true;
};

const normalizeProduct = (row: any): Product => ({
    id: String(row.id),
    name: String(row.name || ""),
    description: typeof row.description === "string" ? row.description : undefined,
    product_type_id: typeof row.product_type_id === "string" ? row.product_type_id : undefined,
    profit_percentage: toNumber(row.profit_percentage),
    value: toNumber(row.value),
    created_at: row.created_at,
    deleted_at: row.deleted_at,
});

export function useProducts() {
    const products = ref<Product[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const client = useSupabaseClient();
    let productsChannel: any = null;

    const loadProducts = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await (client as any)
                .from("products")
                .select("*");

            if (err) throw err;

            products.value = (data || [])
                .map(normalizeProduct)
                .filter((product: Product) => !hasDeletedAt(product.deleted_at))
                .sort((a: Product, b: Product) =>
                    a.name.localeCompare(b.name, "es", {
                        sensitivity: "base",
                    }),
                );

            if (!productsChannel) {
                productsChannel = client
                    .channel("products-changes")
                    .on(
                        "postgres_changes",
                        { event: "*", schema: "public", table: "products" },
                        () => {
                            loadProducts();
                        },
                    )
                    .subscribe();
            }
        } catch (err: any) {
            console.error(err);
            error.value = "No se pudieron cargar los productos.";
        } finally {
            loading.value = false;
        }
    };

    const addProduct = async (data: ProductCreateInput) => {
        const name = data.name.trim();
        const description = data.description?.trim() || "";
        const productTypeId = data.product_type_id?.trim() || null;
        const profitPercentage = Number(data.profit_percentage);
        const value = Number(data.value);

        if (!name) {
            error.value = "El nombre del producto es obligatorio.";
            throw new Error(error.value);
        }

        if (!Number.isFinite(profitPercentage) || profitPercentage < 0) {
            error.value = "El porcentaje de ganancia debe ser un numero valido.";
            throw new Error(error.value);
        }

        if (!Number.isFinite(value) || value < 0) {
            error.value = "El valor debe ser un numero valido.";
            throw new Error(error.value);
        }

        try {
            const { error: err } = await (client as any)
                .from("products")
                .insert({
                    name,
                    description,
                    product_type_id: productTypeId,
                    profit_percentage: profitPercentage,
                    value,
                    created_at: new Date().toISOString(),
                    deleted_at: null,
                });

            if (err) throw err;
        } catch (err) {
            console.error(err);
            error.value = "No se pudo crear el producto.";
            throw err;
        }
    };

    const updateProduct = async (id: string, data: ProductUpdateInput) => {
        const name = data.name.trim();
        const description = data.description?.trim() || "";
        const productTypeId = data.product_type_id?.trim() || null;
        const profitPercentage = Number(data.profit_percentage);
        const value = Number(data.value);

        if (!name) {
            error.value = "El nombre del producto es obligatorio.";
            throw new Error(error.value);
        }

        if (!Number.isFinite(profitPercentage) || profitPercentage < 0) {
            error.value = "El porcentaje de ganancia debe ser un numero valido.";
            throw new Error(error.value);
        }

        if (!Number.isFinite(value) || value < 0) {
            error.value = "El valor debe ser un numero valido.";
            throw new Error(error.value);
        }

        try {
            const { error: err } = await (client as any)
                .from("products")
                .update({
                    name,
                    description,
                    product_type_id: productTypeId,
                    profit_percentage: profitPercentage,
                    value,
                })
                .eq("id", id);

            if (err) throw err;
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el producto.";
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error: err } = await (client as any)
                .from("products")
                .update({
                    deleted_at: new Date().toISOString(),
                })
                .eq("id", id);

            if (err) throw err;
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el producto.";
            throw err;
        }
    };

    onScopeDispose(() => {
        if (productsChannel) {
            client.removeChannel(productsChannel);
            productsChannel = null;
        }
    });

    return {
        products,
        loading,
        error,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
    };
}
