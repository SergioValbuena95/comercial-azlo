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

const normalizeProduct = (
    id: string,
    data: Record<string, unknown>,
): Product => ({
    ...data,
    id,
    name: String(data.name || ""),
    description:
        typeof data.description === "string" ? data.description : undefined,
    product_type_id:
        typeof data.product_type_id === "string"
            ? data.product_type_id
            : undefined,
    profit_percentage: toNumber(data.profit_percentage),
    value: toNumber(data.value),
    created_at: data.created_at,
    deleted_at: data.deleted_at,
});

export function useProducts() {
    const products = ref<Product[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    let unsubscribeProducts: (() => void) | null = null;

    const loadProducts = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $db, $firebase } = useNuxtApp() as any;

            const productsCollection = $firebase.collection($db, "products");

            unsubscribeProducts?.();
            unsubscribeProducts = $firebase.onSnapshot(
                productsCollection,
                (snapshot: any) => {
                    products.value = snapshot.docs
                        .map((productDoc: any) =>
                            normalizeProduct(productDoc.id, productDoc.data()),
                        )
                        .filter(
                            (product: Product) =>
                                !hasDeletedAt(product.deleted_at),
                        )
                        .sort((a: Product, b: Product) =>
                            a.name.localeCompare(b.name, "es", {
                                sensitivity: "base",
                            }),
                        );
                    loading.value = false;
                },
                (err: unknown) => {
                    console.error(err);
                    error.value = "No se pudieron cargar los productos.";
                    loading.value = false;
                },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudieron cargar los productos.";
            loading.value = false;
        }
    };

    const addProduct = async (data: ProductCreateInput) => {
        const name = data.name.trim();
        const description = data.description?.trim() || "";
        const productTypeId = data.product_type_id?.trim() || "";
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
            const { $db, $firebase } = useNuxtApp() as any;

            await $firebase.addDoc($firebase.collection($db, "products"), {
                name,
                description,
                product_type_id: productTypeId,
                profit_percentage: profitPercentage,
                value,
                created_at: $firebase.serverTimestamp(),
                deleted_at: null,
            });
        } catch (err) {
            console.error(err);
            error.value = "No se pudo crear el producto.";
            throw err;
        }
    };

    const updateProduct = async (id: string, data: ProductUpdateInput) => {
        const name = data.name.trim();
        const description = data.description?.trim() || "";
        const productTypeId = data.product_type_id?.trim() || "";
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
            const { $db, $firebase } = useNuxtApp() as any;

            await $firebase.updateDoc($firebase.doc($db, "products", id), {
                name,
                description,
                product_type_id: productTypeId,
                profit_percentage: profitPercentage,
                value,
            });
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el producto.";
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;

            await $firebase.updateDoc($firebase.doc($db, "products", id), {
                deleted_at: $firebase.serverTimestamp(),
            });
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el producto.";
            throw err;
        }
    };

    onScopeDispose(() => {
        unsubscribeProducts?.();
        unsubscribeProducts = null;
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
