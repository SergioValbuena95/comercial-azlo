import type { DocumentReference } from "firebase/firestore";

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

const referencePath = (value: unknown) => {
    if (!value || typeof value !== "object") return "";
    return "path" in value ? String((value as { path: string }).path) : "";
};

const referenceId = (value: unknown) => {
    if (!value || typeof value !== "object") return "";
    return "id" in value ? String((value as { id: string }).id) : "";
};

const normalizeUser = async (
    id: string,
    data: Record<string, unknown>,
    firebase: any,
): Promise<AppUser> => {
    const roleReference = (data.roleRef || data.role_id) as
        | DocumentReference
        | undefined;
    const roleSnapshot = roleReference
        ? await firebase.getDoc(roleReference)
        : null;
    const roleData =
        roleSnapshot?.exists?.() && roleSnapshot.data
            ? roleSnapshot.data()
            : null;

    return {
        id,
        uid: String(data.uid || id),
        email: String(data.email || ""),
        displayName: String(data.displayName || data.name || ""),
        roleId: String(data.roleId || referenceId(roleReference)),
        roleName: String(data.roleName || roleData?.name || ""),
        rolePath: referencePath(roleReference),
        status: String(data.status || "active"),
    };
};

export function useUsers() {
    const users = ref<AppUser[]>([]);
    const currentUserProfile = ref<AppUser | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    let unsubscribeUsers: (() => void) | null = null;
    let unsubscribeCurrentUser: (() => void) | null = null;

    const loadUsers = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $db, $firebase } = useNuxtApp() as any;
            const usersQuery = $firebase.query(
                $firebase.collection($db, "users"),
                $firebase.orderBy("email", "asc"),
            );

            unsubscribeUsers?.();
            unsubscribeUsers = $firebase.onSnapshot(
                usersQuery,
                async (snapshot: any) => {
                    users.value = await Promise.all(
                        snapshot.docs.map((userDoc: any) =>
                            normalizeUser(
                                userDoc.id,
                                userDoc.data(),
                                $firebase,
                            ),
                        ),
                    );
                    loading.value = false;
                },
                (err: unknown) => {
                    console.error(err);
                    error.value = "No se pudieron cargar los usuarios.";
                    loading.value = false;
                },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudieron cargar los usuarios.";
            loading.value = false;
        }
    };

    const loadCurrentUserProfile = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { user, initAuth } = useAuth();
            await initAuth();

            if (!user.value) {
                currentUserProfile.value = null;
                loading.value = false;
                return;
            }

            const { $db, $firebase } = useNuxtApp() as any;
            const userDocRef = $firebase.doc($db, "users", user.value.uid);

            unsubscribeCurrentUser?.();
            unsubscribeCurrentUser = $firebase.onSnapshot(
                userDocRef,
                async (snapshot: any) => {
                    if (!snapshot.exists()) {
                        currentUserProfile.value = null;
                    } else {
                        currentUserProfile.value = await normalizeUser(
                            snapshot.id,
                            snapshot.data(),
                            $firebase,
                        );
                    }
                    loading.value = false;
                },
                (err: unknown) => {
                    console.error(err);
                    error.value =
                        "No se pudo cargar el perfil del usuario actual.";
                    loading.value = false;
                },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudo cargar el perfil del usuario actual.";
            loading.value = false;
        }
    };

    const getUser = async (uid: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;
            const snapshot = await $firebase.getDoc(
                $firebase.doc($db, "users", uid),
            );

            if (!snapshot.exists()) return null;

            return normalizeUser(snapshot.id, snapshot.data(), $firebase);
        } catch (err) {
            console.error(err);
            error.value = "No se pudo cargar el usuario.";
            return null;
        }
    };

    const updateCurrentUserProfile = async (
        data: Partial<Pick<AppUser, "displayName">>,
    ) => {
        try {
            const { user, initAuth } = useAuth();
            await initAuth();

            if (!user.value) return;

            const { $db, $firebase } = useNuxtApp() as any;
            await $firebase.setDoc(
                $firebase.doc($db, "users", user.value.uid),
                {
                    uid: user.value.uid,
                    email: user.value.email || "",
                    ...data,
                },
                { merge: true },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el perfil.";
            throw err;
        }
    };

    const updateUser = async (uid: string, data: UserUpdateInput) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;
            await $firebase.setDoc(
                $firebase.doc($db, "users", uid),
                {
                    uid,
                    email: data.email,
                    displayName: data.displayName,
                    roleId: data.roleId,
                    roleName: data.roleName,
                    role_id: data.roleId
                        ? $firebase.doc($db, "roles", data.roleId)
                        : null,
                    status: data.status,
                },
                { merge: true },
            );
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el usuario.";
            throw err;
        }
    };

    const deleteUserProfile = async (uid: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;
            await $firebase.deleteDoc($firebase.doc($db, "users", uid));
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el usuario.";
            throw err;
        }
    };

    onScopeDispose(() => {
        unsubscribeUsers?.();
        unsubscribeCurrentUser?.();
        unsubscribeUsers = null;
        unsubscribeCurrentUser = null;
    });

    return {
        users,
        currentUserProfile,
        loading,
        error,
        loadUsers,
        loadCurrentUserProfile,
        getUser,
        updateCurrentUserProfile,
        updateUser,
        deleteUserProfile,
    };
}
