export interface AppUser {
    id: string;
    uid: string;
    email: string;
    displayName: string;
    roleId: string;
    roleName: string;
    rolePath: string;
    status: string;
}

export interface UserUpdateInput {
    displayName: string;
    email: string;
    roleId: string;
    roleName: string;
    status: string;
}

export interface UserCreateInput {
    displayName: string;
    email: string;
    roleId: string;
    status: "active" | "inactive";
    mode: "password" | "invite";
    password?: string;
}

const normalizeUser = (row: any): AppUser => {
    let roleNameVal = "";
    const rolesData = row.roles || row.role;

    if (rolesData) {
        if (Array.isArray(rolesData)) {
            roleNameVal = rolesData[0]?.name || "";
        } else {
            roleNameVal = rolesData.name || "";
        }
    }

    // Static fallback if the join is blocked or empty
    if (!roleNameVal && row.role_id) {
        const idStr = String(row.role_id);
        if (idStr === "1") roleNameVal = "SuperAdmin";
        else if (idStr === "2") roleNameVal = "Admin";
        else if (idStr === "3") roleNameVal = "Comercial";
        else if (idStr === "4") roleNameVal = "Produccion";
        else if (idStr === "5") roleNameVal = "Instalacion";
    }

    return {
        id: String(row.id),
        uid: String(row.id),
        email: String(row.email || ""),
        displayName: String(row.name || ""),
        roleId: row.role_id ? String(row.role_id) : "",
        roleName: String(roleNameVal || row.roleName || ""),
        rolePath: "",
        status: row.status ? "active" : "inactive",
    };
};

const currentUserProfile = ref<AppUser | null>(null);

export function useUsers() {
    const users = ref<AppUser[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const client = useSupabaseClient();

    const loadUsers = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await client
                .from("users")
                .select("*, roles(name)")
                .order("email", { ascending: true });

            if (err) throw err;

            users.value = (data || []).map(normalizeUser);
        } catch (err: any) {
            console.error(err);
            error.value = "No se pudieron cargar los usuarios.";
        } finally {
            loading.value = false;
        }
    };

    let profileLoadingPromise: Promise<void> | null = null;

    const loadCurrentUserProfile = async () => {
        if (profileLoadingPromise) return profileLoadingPromise;

        profileLoadingPromise = (async () => {
            loading.value = true;
            error.value = null;

            try {
                const { user, initAuth } = useAuth();
                await initAuth();

                if (!user.value || !user.value.email) {
                    currentUserProfile.value = null;
                    return;
                }

                const { data, error: err } = await client
                    .from("users")
                    .select("*, roles(name)")
                    .eq("email", user.value.email)
                    .single();

                if (err) throw err;

                currentUserProfile.value = data ? normalizeUser(data) : null;
            } catch (err: any) {
                console.error(err);
                error.value = "No se pudo cargar el perfil del usuario actual.";
            } finally {
                loading.value = false;
            }
        })();

        try {
            await profileLoadingPromise;
        } finally {
            profileLoadingPromise = null;
        }
    };

    const getUser = async (uid: string) => {
        try {
            const { data, error: err } = await client
                .from("users")
                .select("*, roles(name)")
                .eq("id", Number(uid))
                .single();

            if (err) throw err;
            if (!data) return null;

            return normalizeUser(data);
        } catch (err) {
            console.error(err);
            error.value = "No se pudo cargar el usuario.";
            return null;
        }
    };

    const createUser = async (input: UserCreateInput) => {
        const redirectTo =
            typeof window !== "undefined"
                ? `${window.location.origin}/login?setup_password=1`
                : undefined;

        const response = await $fetch<{
            success: boolean;
            mode: "password" | "invite";
            user: any;
        }>("/api/users/create", {
            method: "POST",
            body: {
                displayName: input.displayName,
                email: input.email,
                roleId: input.roleId,
                status: input.status,
                mode: input.mode,
                password: input.password,
                redirectTo,
            },
        });

        await loadUsers();
        return response.user ? normalizeUser(response.user) : null;
    };

    const updateCurrentUserProfile = async (
        data: Partial<Pick<AppUser, "displayName">>,
    ) => {
        try {
            const { user, initAuth } = useAuth();
            await initAuth();

            if (!user.value || !currentUserProfile.value) return;

            const profileId = currentUserProfile.value.id;

            const { error: err } = await client
                .from("users")
                .update({
                    name: data.displayName,
                })
                .eq("id", Number(profileId));

            if (err) throw err;

            // Refresh profile locally
            if (currentUserProfile.value) {
                currentUserProfile.value.displayName = data.displayName || "";
            }
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el perfil.";
            throw err;
        }
    };

    const updateUser = async (uid: string, data: UserUpdateInput) => {
        try {
            const { error: err } = await client
                .from("users")
                .update({
                    email: data.email,
                    name: data.displayName,
                    role_id: data.roleId ? Number(data.roleId) : null,
                    status: data.status === "active",
                })
                .eq("id", Number(uid));

            if (err) throw err;
            await loadUsers();
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el usuario.";
            throw err;
        }
    };

    const deleteUserProfile = async (uid: string) => {
        try {
            const { error: err } = await client
                .from("users")
                .delete()
                .eq("id", Number(uid));

            if (err) throw err;
            await loadUsers();
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el usuario.";
            throw err;
        }
    };

    return {
        users,
        currentUserProfile,
        loading,
        error,
        loadUsers,
        loadCurrentUserProfile,
        getUser,
        createUser,
        updateCurrentUserProfile,
        updateUser,
        deleteUserProfile,
    };
}
