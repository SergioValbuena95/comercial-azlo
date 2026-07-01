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

const normalizeProductType = (
    id: string,
    data: Record<string, unknown>,
): ProductType => ({
    ...data,
    id,
    name: String(data.name || ""),
    description:
        typeof data.description === "string" ? data.description : undefined,
});

export function useProductTypes() {
    const productTypes = ref<ProductType[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    let unsubscribeProductTypes: (() => void) | null = null;

    const loadProductTypes = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $db, $firebase } = useNuxtApp() as any;

            const productTypesQuery = $firebase.query(
                $firebase.collection($db, "product_types"),
                $firebase.orderBy("name", "asc"),
            );

            unsubscribeProductTypes?.();
            unsubscribeProductTypes = $firebase.onSnapshot(
                productTypesQuery,
                (snapshot: any) => {
                    productTypes.value = snapshot.docs.map(
                        (productTypeDoc: any) =>
                            normalizeProductType(
                                productTypeDoc.id,
                                productTypeDoc.data(),
                            ),
                    );
                    loading.value = false;
                },
                (err: unknown) => {
                    console.error(err);
                    error.value =
                        "No se pudieron cargar los tipos de producto.";
                    loading.value = false;
                },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudieron cargar los tipos de producto.";
            loading.value = false;
        }
    };

    const getProductType = async (id: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;
            const snapshot = await $firebase.getDoc(
                $firebase.doc($db, "product_types", id),
            );

            if (!snapshot.exists()) return null;

            return normalizeProductType(snapshot.id, snapshot.data());
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
            const { $db, $firebase } = useNuxtApp() as any;

            await $firebase.addDoc($firebase.collection($db, "product_types"), {
                name,
                description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
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
            const { $db, $firebase } = useNuxtApp() as any;

            await $firebase.updateDoc($firebase.doc($db, "product_types", id), {
                name,
                description,
                updatedAt: new Date().toISOString(),
            });
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el tipo de producto.";
            throw err;
        }
    };

    const deleteProductType = async (id: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;

            await $firebase.deleteDoc($firebase.doc($db, "product_types", id));
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el tipo de producto.";
            throw err;
        }
    };

    onScopeDispose(() => {
        unsubscribeProductTypes?.();
        unsubscribeProductTypes = null;
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
