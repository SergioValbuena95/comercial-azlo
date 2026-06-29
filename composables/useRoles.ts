export interface Role {
    id: string;
    name: string;
}

const normalizeRole = (id: string, data: Record<string, unknown>): Role => ({
    id,
    name: String(data.name || ""),
});

export function useRoles() {
    const roles = ref<Role[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    let unsubscribeRoles: (() => void) | null = null;

    const loadRoles = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $db, $firebase } = useNuxtApp() as any;

            const rolesQuery = $firebase.query(
                $firebase.collection($db, "roles"),
                $firebase.orderBy("name", "asc"),
            );

            unsubscribeRoles?.();
            unsubscribeRoles = $firebase.onSnapshot(
                rolesQuery,
                (snapshot: any) => {
                    roles.value = snapshot.docs.map((roleDoc: any) =>
                        normalizeRole(roleDoc.id, roleDoc.data()),
                    );
                    loading.value = false;
                },
                (err: unknown) => {
                    console.error(err);
                    error.value = "No se pudieron cargar los roles.";
                    loading.value = false;
                },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudieron cargar los roles.";
            loading.value = false;
        }
    };

    const getRole = async (id: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;
            const snapshot = await $firebase.getDoc(
                $firebase.doc($db, "roles", id),
            );

            if (!snapshot.exists()) return null;

            return normalizeRole(snapshot.id, snapshot.data());
        } catch (err) {
            console.error(err);
            error.value = "No se pudo cargar el rol.";
            return null;
        }
    };

    onScopeDispose(() => {
        unsubscribeRoles?.();
        unsubscribeRoles = null;
    });

    return {
        roles,
        loading,
        error,
        loadRoles,
        getRole,
    };
}
