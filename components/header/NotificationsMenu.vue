<template>
    <div class="relative" @click.stop>
        <!-- Trigger Button -->
        <button
            type="button"
            class="theme-toggle relative"
            :class="{
                'border-acid-400/40 bg-acid-400/10 text-acid-400 hover:border-acid-400/60 hover:bg-acid-400/15':
                    hasUnread || menuOpen,
            }"
            :aria-expanded="menuOpen"
            aria-haspopup="menu"
            title="Notificaciones"
            @click="toggleMenu"
        >
            <BellDot
                v-if="hasUnread"
                class="h-4 w-4 text-acid-400 animate-bell"
            />
            <Bell
                v-else
                class="h-4 w-4"
            />

            <!-- Unread count badge -->
            <span
                v-if="unreadCount > 0"
                class="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-acid-400 px-1 font-mono text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-obsidian-950"
            >
                {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
            <div
                v-if="menuOpen"
                class="absolute right-0 top-11 z-50 w-80 sm:w-96 overflow-hidden rounded-xl border border-white/10 bg-obsidian-900 shadow-2xl"
                role="menu"
            >
                <!-- Header -->
                <div class="border-b border-white/[0.06] px-4 py-3">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-display font-bold text-white">
                                Notificaciones
                            </p>
                            <span
                                v-if="unreadCount > 0"
                                class="rounded-full bg-acid-400/15 border border-acid-400/30 px-2 py-0.5 font-mono text-[11px] font-semibold text-acid-400"
                            >
                                {{ unreadCount }} nuevas
                            </span>
                        </div>

                        <div class="flex items-center gap-1">
                            <button
                                v-if="unreadCount > 0"
                                type="button"
                                class="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-obsidian-400 hover:bg-white/5 hover:text-white transition-colors"
                                title="Marcar todas como leídas"
                                @click="markAllAsRead"
                            >
                                <CheckCheck class="h-3.5 w-3.5 text-acid-400" />
                                <span class="hidden sm:inline">Leídas</span>
                            </button>
                            <button
                                v-if="notifications.length > 0"
                                type="button"
                                class="flex items-center gap-1 rounded-lg p-1 text-xs text-obsidian-400 hover:bg-coral-400/10 hover:text-coral-400 transition-colors"
                                title="Limpiar todas"
                                @click="clearAll"
                            >
                                <Trash2 class="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <!-- Filter Tabs -->
                    <div class="mt-2.5 flex items-center gap-1 rounded-lg bg-obsidian-950/60 p-1 border border-white/[0.05]">
                        <button
                            type="button"
                            class="flex-1 rounded-md py-1 text-xs font-medium transition-colors"
                            :class="
                                activeTab === 'all'
                                    ? 'bg-acid-400 text-white font-semibold shadow-sm'
                                    : 'text-obsidian-400 hover:text-white'
                            "
                            @click="activeTab = 'all'"
                        >
                            Todas ({{ notifications.length }})
                        </button>
                        <button
                            type="button"
                            class="flex-1 rounded-md py-1 text-xs font-medium transition-colors"
                            :class="
                                activeTab === 'unread'
                                    ? 'bg-acid-400 text-white font-semibold shadow-sm'
                                    : 'text-obsidian-400 hover:text-white'
                            "
                            @click="activeTab = 'unread'"
                        >
                            No leídas ({{ unreadCount }})
                        </button>
                    </div>
                </div>

                <!-- Loading State -->
                <div
                    v-if="loading && notifications.length === 0"
                    class="flex flex-col items-center justify-center px-6 py-10 text-center"
                >
                    <div class="h-5 w-5 rounded-full border-2 border-acid-400 border-t-transparent animate-spin mb-2"></div>
                    <p class="font-mono text-xs text-obsidian-500">
                        Cargando notificaciones...
                    </p>
                </div>

                <!-- Notification Items List -->
                <div
                    v-else-if="filteredNotifications.length > 0"
                    class="max-h-80 overflow-y-auto divide-y divide-white/[0.06]"
                >
                    <div
                        v-for="item in filteredNotifications"
                        :key="item.id"
                        class="group relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/5 cursor-pointer"
                        :class="{ 'bg-acid-400/[0.04]': !item.read }"
                        @click="handleNotificationClick(item)"
                    >
                        <!-- Unread Indicator Dot -->
                        <span
                            class="mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors"
                            :class="
                                !item.read
                                    ? 'bg-acid-400 shadow-[0_0_8px_rgba(0,85,113,0.8)]'
                                    : 'bg-obsidian-700'
                            "
                        ></span>

                        <!-- Content -->
                        <div class="min-w-0 flex-1 space-y-1">
                            <div class="flex items-start justify-between gap-2">
                                <p
                                    class="truncate text-xs font-semibold"
                                    :class="!item.read ? 'text-white' : 'text-obsidian-300'"
                                >
                                    {{ item.projectName }}
                                </p>
                                <span class="shrink-0 font-mono text-[10px] text-obsidian-500">
                                    {{ item.timeAgo }}
                                </span>
                            </div>

                            <p class="text-xs text-obsidian-400 leading-relaxed">
                                {{ item.message }}
                            </p>

                            <!-- State Transition Pill -->
                            <div
                                v-if="item.oldState || item.newState"
                                class="inline-flex items-center gap-1.5 pt-0.5 flex-wrap"
                            >
                                <span
                                    v-if="item.oldState"
                                    class="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-obsidian-400"
                                >
                                    {{ item.oldState }}
                                </span>
                                <ArrowRight
                                    v-if="item.oldState && item.newState"
                                    class="h-3 w-3 text-obsidian-500"
                                />
                                <span
                                    v-if="item.newState"
                                    class="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold border"
                                    :class="stateBadgeClass(item.newState)"
                                >
                                    {{ item.newState }}
                                </span>
                            </div>

                            <div v-if="item.actor" class="pt-0.5 font-mono text-[10px] text-obsidian-500">
                                Por: {{ item.actor }}
                            </div>
                        </div>

                        <!-- Quick Hover Actions -->
                        <div class="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                v-if="!item.read"
                                type="button"
                                class="rounded p-1 text-obsidian-400 hover:bg-white/10 hover:text-white transition-colors"
                                title="Marcar como leída"
                                @click.stop="markAsRead(item.id)"
                            >
                                <Check class="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                class="rounded p-1 text-obsidian-400 hover:bg-coral-400/10 hover:text-coral-400 transition-colors"
                                title="Eliminar notificación"
                                @click.stop="removeNotification(item.id)"
                            >
                                <X class="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div
                    v-else
                    class="flex flex-col items-center justify-center px-6 py-10 text-center"
                >
                    <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-obsidian-500">
                        <Bell class="h-5 w-5" />
                    </div>
                    <p class="text-sm font-semibold text-white">
                        {{ activeTab === "unread" ? "Todo al día" : "Sin notificaciones" }}
                    </p>
                    <p class="mt-1 text-xs text-obsidian-500 max-w-[220px]">
                        {{
                            activeTab === "unread"
                                ? "No tienes notificaciones pendientes por leer."
                                : "Aquí aparecerán los cambios de estado de tus proyectos."
                        }}
                    </p>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between border-t border-white/[0.06] bg-obsidian-950/40 px-4 py-2.5">
                    <span class="font-mono text-[11px] text-obsidian-500">
                        Alertas en tiempo real
                    </span>
                    <button
                        v-if="browserPermission === 'default'"
                        type="button"
                        class="font-mono text-[11px] text-acid-400 hover:underline"
                        @click="requestBrowserPermission"
                    >
                        Activar alertas de escritorio
                    </button>
                    <span
                        v-else-if="browserPermission === 'granted'"
                        class="font-mono text-[11px] text-emerald-400"
                    >
                        ● Push activo
                    </span>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import {
    Bell,
    BellDot,
    CheckCheck,
    Trash2,
    ArrowRight,
    Check,
    X,
} from "@lucide/vue";
import {
    useNotifications,
    formatRelativeTime,
    type NotificationItem,
} from "~/composables/useNotifications";

const menuOpen = ref(false);
const activeTab = ref<"all" | "unread">("all");

const {
    notifications,
    loading,
    unreadCount,
    hasUnread,
    browserPermission,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestBrowserPermission,
} = useNotifications();

const filteredNotifications = computed(() => {
    const list = notifications.value.map((n) => ({
        ...n,
        timeAgo: formatRelativeTime(n.createdAt),
    }));

    if (activeTab.value === "unread") {
        return list.filter((n) => !n.read);
    }
    return list;
});

const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
    if (menuOpen.value) {
        loadNotifications();
    }
};

const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read) {
        await markAsRead(item.id);
    }
};

const stateBadgeClass = (state: string) => {
    const normalized = state.toLowerCase();
    if (normalized.includes("vendido") || normalized.includes("facturado")) {
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
    if (normalized.includes("cartera") || normalized.includes("ensamble")) {
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
    if (normalized.includes("finalizado")) {
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
};

const closeMenu = () => {
    menuOpen.value = false;
};

onMounted(() => {
    loadNotifications();
    window.addEventListener("click", closeMenu);
});

onBeforeUnmount(() => {
    window.removeEventListener("click", closeMenu);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
}

@keyframes bell-ring {
    0%,
    100% {
        transform: rotate(0);
    }
    20% {
        transform: rotate(12deg);
    }
    40% {
        transform: rotate(-10deg);
    }
    60% {
        transform: rotate(6deg);
    }
    80% {
        transform: rotate(-4deg);
    }
}

.animate-bell {
    animation: bell-ring 0.6s ease-in-out;
}
</style>
