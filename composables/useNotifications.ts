import type { Database, Tables, TablesInsert } from "~/types/database.types";

export interface NotificationItem {
    id: string;
    projectId?: string;
    projectName: string;
    message: string;
    oldState?: string;
    newState?: string;
    actor?: string;
    createdAt: string;
    timeAgo: string;
    read: boolean;
}

type NotificationRow = Tables<"notifications">;
type NotificationInsert = TablesInsert<"notifications">;

const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const browserPermission = ref<NotificationPermission | "unsupported">("default");
let notificationsChannel: any = null;
const userNamesCache = new Map<number, string>();

export const formatRelativeTime = (isoDate?: string | null): string => {
    if (!isoDate) return "Ahora mismo";
    const timestamp = new Date(isoDate).getTime();
    if (Number.isNaN(timestamp)) return "Ahora mismo";

    const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

    if (diffSeconds < 60) return "Ahora mismo";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return new Date(isoDate).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
    });
};

export function useNotifications() {
    const client = useSupabaseClient<Database>();

    const syncBrowserPermission = () => {
        if (!import.meta.client) return;
        if (!("Notification" in window)) {
            browserPermission.value = "unsupported";
            return;
        }
        browserPermission.value = Notification.permission;
    };

    const requestBrowserPermission = async () => {
        if (!import.meta.client || !("Notification" in window)) {
            browserPermission.value = "unsupported";
            return false;
        }
        try {
            const result = await Notification.requestPermission();
            browserPermission.value = result;
            return result === "granted";
        } catch (err) {
            console.warn("Could not request notification permission:", err);
            return false;
        }
    };

    const triggerBrowserNotification = (item: NotificationItem) => {
        if (!import.meta.client || !("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        try {
            const transitionText =
                item.oldState && item.newState
                    ? ` (${item.oldState} → ${item.newState})`
                    : "";
            new Notification(`CRM Comercial: ${item.projectName}`, {
                body: `${item.message}${transitionText}`,
                icon: "/favicon.ico",
            });
        } catch (e) {
            console.warn("Browser notification error:", e);
        }
    };

    const loadUsersLookup = async () => {
        try {
            const { data } = await client
                .from("users")
                .select("id, name, email");
            if (data) {
                data.forEach((u) => {
                    if (u.id) {
                        userNamesCache.set(Number(u.id), u.name || u.email || "");
                    }
                });
            }
        } catch (e) {
            console.warn("Could not load users lookup for notifications:", e);
        }
    };

    const mapRowToNotification = (row: NotificationRow): NotificationItem => {
        const actorName = row.created_by
            ? userNamesCache.get(Number(row.created_by)) || undefined
            : undefined;

        return {
            id: String(row.id),
            projectId: row.project_id ? String(row.project_id) : undefined,
            projectName: row.title || `Proyecto #${row.project_id}`,
            message: row.message || "",
            oldState: row.old_state || undefined,
            newState: row.new_state || undefined,
            actor: actorName,
            createdAt: row.created_at,
            timeAgo: formatRelativeTime(row.created_at),
            read: Boolean(row.is_read),
        };
    };

    const loadNotifications = async () => {
        loading.value = true;
        error.value = null;

        try {
            syncBrowserPermission();
            await loadUsersLookup();

            const { user, initAuth } = useAuth();
            const { currentUserProfile, loadCurrentUserProfile } = useUsers();
            const { getIsAdminUser } = useAccess();
            await initAuth();

            if (!user.value) {
                notifications.value = [];
                return;
            }

            if (!currentUserProfile.value) {
                await loadCurrentUserProfile();
            }

            const profile = currentUserProfile.value;
            const isAdmin = await getIsAdminUser(profile);

            let query = client
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (!isAdmin && profile?.id) {
                query = query.or(`user_id.is.null,user_id.eq.${Number(profile.id)}`);
            }

            const { data, error: supabaseError } = await query;
            if (supabaseError) throw supabaseError;

            const myProfileId = profile?.id ? Number(profile.id) : null;
            notifications.value = (data || [])
                .filter(
                    (row) =>
                        myProfileId === null ||
                        row.created_by === null ||
                        Number(row.created_by) !== myProfileId,
                )
                .map(mapRowToNotification);

            // Set up real-time subscription once
            if (!notificationsChannel) {
                notificationsChannel = client
                    .channel(`notifications-changes-${Date.now()}`)
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: "public",
                            table: "notifications",
                        },
                        async (payload) => {
                            const eventType = payload.eventType;

                            if (eventType === "INSERT" && payload.new) {
                                const newRow = payload.new as NotificationRow;

                                // Ignore notifications triggered by the current user
                                const currentProfile = currentUserProfile.value;
                                if (
                                    currentProfile?.id &&
                                    newRow.created_by !== null &&
                                    Number(newRow.created_by) === Number(currentProfile.id)
                                ) {
                                    return;
                                }

                                // Check if notification belongs to current non-admin user
                                const adminStatus = await getIsAdminUser(currentProfile);
                                if (
                                    !adminStatus &&
                                    newRow.user_id !== null &&
                                    currentProfile?.id &&
                                    Number(newRow.user_id) !== Number(currentProfile.id)
                                ) {
                                    return;
                                }

                                if (
                                    newRow.created_by &&
                                    !userNamesCache.has(Number(newRow.created_by))
                                ) {
                                    await loadUsersLookup();
                                }

                                const mapped = mapRowToNotification(newRow);
                                const exists = notifications.value.some(
                                    (n) => n.id === mapped.id,
                                );
                                if (!exists) {
                                    notifications.value.unshift(mapped);
                                    triggerBrowserNotification(mapped);
                                }
                            } else if (eventType === "UPDATE" && payload.new) {
                                const updatedRow = payload.new as NotificationRow;
                                const idx = notifications.value.findIndex(
                                    (n) => n.id === String(updatedRow.id),
                                );
                                if (idx !== -1) {
                                    notifications.value[idx] = mapRowToNotification(updatedRow);
                                }
                            } else if (eventType === "DELETE" && payload.old) {
                                const deletedId = String((payload.old as { id: number }).id);
                                notifications.value = notifications.value.filter(
                                    (n) => n.id !== deletedId,
                                );
                            }
                        },
                    )
                    .subscribe();
            }
        } catch (err: any) {
            console.error("Error loading notifications:", err);
            error.value = "No se pudieron cargar las notificaciones.";
        } finally {
            loading.value = false;
        }
    };

    const createNotification = async (input: {
        projectId: number;
        title: string;
        message: string;
        oldState?: string | null;
        newState?: string | null;
        userId?: number | null;
        createdBy?: number | null;
    }) => {
        try {
            const payload: NotificationInsert = {
                project_id: input.projectId,
                title: input.title,
                message: input.message,
                old_state: input.oldState ?? null,
                new_state: input.newState ?? null,
                user_id: input.userId ?? null,
                created_by: input.createdBy ?? null,
                is_read: false,
            };

            const { data, error: supabaseError } = await client
                .from("notifications")
                .insert(payload)
                .select()
                .single();

            if (supabaseError) throw supabaseError;

            return data;
        } catch (err) {
            console.error("Error creating notification:", err);
            return null;
        }
    };

    const markAsRead = async (id: string) => {
        const target = notifications.value.find((n) => n.id === id);
        if (!target || target.read) return;

        target.read = true;

        try {
            const { error: supabaseError } = await client
                .from("notifications")
                .update({ is_read: true })
                .eq("id", Number(id));

            if (supabaseError) throw supabaseError;
        } catch (err) {
            console.error("Error marking notification as read:", err);
            target.read = false;
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.value
            .filter((n) => !n.read)
            .map((n) => Number(n.id))
            .filter(Number.isFinite);

        if (!unreadIds.length) return;

        notifications.value.forEach((n) => {
            n.read = true;
        });

        try {
            const { error: supabaseError } = await client
                .from("notifications")
                .update({ is_read: true })
                .in("id", unreadIds);

            if (supabaseError) throw supabaseError;
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
            await loadNotifications();
        }
    };

    const removeNotification = async (id: string) => {
        const previous = [...notifications.value];
        notifications.value = notifications.value.filter((n) => n.id !== id);

        try {
            const { error: supabaseError } = await client
                .from("notifications")
                .delete()
                .eq("id", Number(id));

            if (supabaseError) throw supabaseError;
        } catch (err) {
            console.error("Error deleting notification:", err);
            notifications.value = previous;
        }
    };

    const clearAll = async () => {
        const allIds = notifications.value
            .map((n) => Number(n.id))
            .filter(Number.isFinite);

        if (!allIds.length) return;

        const previous = [...notifications.value];
        notifications.value = [];

        try {
            const { error: supabaseError } = await client
                .from("notifications")
                .delete()
                .in("id", allIds);

            if (supabaseError) throw supabaseError;
        } catch (err) {
            console.error("Error clearing notifications:", err);
            notifications.value = previous;
        }
    };

    const unreadCount = computed(
        () => notifications.value.filter((n) => !n.read).length,
    );

    const hasUnread = computed(() => unreadCount.value > 0);

    return {
        notifications,
        loading,
        error,
        unreadCount,
        hasUnread,
        browserPermission,
        loadNotifications,
        createNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        requestBrowserPermission,
    };
}

