export interface Role {
    id: string;
    name: string;
}

const normalizeRole = (row: any): Role => ({
    id: String(row.id),
    name: String(row.name || ""),
});

export function useRoles() {
    const roles = ref<Role[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const client = useSupabaseClient();

    const loadRoles = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await client
                .from("roles")
                .select("*")
                .order("name", { ascending: true });

            if (err) throw err;

            roles.value = (data || []).map(normalizeRole);
        } catch (err: any) {
            console.error(err);
            error.value = "No se pudieron cargar los roles.";
        } finally {
            loading.value = false;
        }
    };

    const getRole = async (id: string) => {
        try {
            const { data, error: err } = await client
                .from("roles")
                .select("*")
                .eq("id", Number(id))
                .single();

            if (err) throw err;
            if (!data) return null;

            return normalizeRole(data);
        } catch (err) {
            console.error(err);
            error.value = "No se pudo cargar el rol.";
            return null;
        }
    };

    return {
        roles,
        loading,
        error,
        loadRoles,
        getRole,
    };
}
