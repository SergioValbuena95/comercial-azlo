<!-- components/StatusBadge.vue -->
<template>
    <span
        v-if="editable"
        ref="dropdownRef"
        class="status-dropdown"
        :class="badgeClass"
    >
        <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="dotClass"></span>
        <button
            type="button"
            class="status-trigger"
            :aria-label="ariaLabel"
            :aria-expanded="isOpen"
            aria-haspopup="listbox"
            @click.stop="toggleDropdown"
            @keydown.escape.prevent.stop="closeDropdown"
        >
            <span>{{ selectedOption.name }}</span>
            <span class="status-caret ml-auto" aria-hidden="true"></span>
        </button>
        <Teleport to="body">
            <Transition name="status-menu">
                <div
                    v-if="isOpen"
                    ref="menuRef"
                    class="status-menu"
                    role="listbox"
                    :aria-label="ariaLabel"
                    :style="menuStyle"
                    @click.stop
                >
                    <button
                        v-for="option in options"
                        :key="option.id"
                        type="button"
                        class="status-option"
                        :class="{ 'status-option-active': option === selectedOption }"
                        role="option"
                        :aria-selected="option === selectedOption"
                        @click="selectOption(option.id)"
                    >
                        {{ option.name }}
                    </button>
                </div>
            </Transition>
        </Teleport>
    </span>
    <span v-else :class="badgeClass">
        <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
        {{ estado }}
    </span>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        estado: string;
        editable?: boolean;
        options?: any[];
        ariaLabel?: string;
    }>(),
    {
        editable: false,
        options: () => [],
        ariaLabel: "Actualizar estado",
    },
);

const emit = defineEmits<{
    "update:estado": [estado: string];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuPosition = ref({
    left: 0,
    top: 0,
    minWidth: 0,
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) nextTick(updateMenuPosition);
};

const closeDropdown = () => {
    isOpen.value = false;
};

const selectOption = (option: string) => {
    closeDropdown();
    if (option !== selectedOption.value){
        emit("update:estado", option);
    }
};

const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
        !dropdownRef.value?.contains(target) &&
        !menuRef.value?.contains(target)
    ) {
        closeDropdown();
    }
};

const updateMenuPosition = () => {
    if (!dropdownRef.value) return;

    const rect = dropdownRef.value.getBoundingClientRect();
    const viewportPadding = 12;
    const menuHeight = menuRef.value?.offsetHeight || 220;
    const menuWidth = Math.max(menuRef.value?.offsetWidth || 0, rect.width);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp =
        spaceBelow < menuHeight + viewportPadding && spaceAbove > spaceBelow;

    const rawTop = shouldOpenUp
        ? rect.top - menuHeight - 8
        : rect.bottom + 8;
    const rawLeft = rect.left;

    menuPosition.value = {
        left: Math.min(
            Math.max(viewportPadding, rawLeft),
            window.innerWidth - menuWidth - viewportPadding,
        ),
        top: Math.min(
            Math.max(viewportPadding, rawTop),
            window.innerHeight - menuHeight - viewportPadding,
        ),
        minWidth: rect.width,
    };
};

onMounted(() => {
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleDocumentClick, true);
    window.removeEventListener("resize", updateMenuPosition);
    window.removeEventListener("scroll", updateMenuPosition, true);
});

const menuStyle = computed(() => ({
    left: `${menuPosition.value.left}px`,
    top: `${menuPosition.value.top}px`,
    minWidth: `${menuPosition.value.minWidth}px`,
}));

const selectedOption = computed(() => {
    return (
        props.options.find((option) => option.name.toLowerCase() === props.estado.toLowerCase()) ||
        props.options[0]
    );
});

const selectOptions = computed(() => {
    const options = props.options.filter(Boolean);
    if (
        selectedOption.value &&
        !options.some((option) => option === selectedOption.value)
    ) {
        return [selectedOption.value, ...options];
    }

    return options;
});

const statusKey = computed(() => {
    const value = props.estado.toLowerCase();

    if (value.includes("vendido") && value.includes("instal"))
        return "vendidoInstalacion";
    if (value.includes("vendido")) return "vendido";
    if (value.includes("fabricaci")) return "fabricacion";
    if (value.includes("despacho")) return "despacho";
    if (value.includes("instalado")) return "instalado";
    if (value.includes("instal")) return "instalacion";
    if (value.includes("terminado")) return "instalado";
    if (value.includes("facturado")) return "facturado";

    return props.estado;
});

const badgeClass = computed(() => {
    const map: Record<string, string> = {
        vendido:
            "label-badge bg-blue-500/15 text-blue-300 border border-blue-500/20",
        fabricacion:
            "label-badge bg-acid-400/15 text-acid-400 border border-acid-400/20",
        despacho:
            "label-badge bg-orange-500/15 text-orange-400 border border-orange-500/20",
        instalacion:
            "label-badge bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
        vendidoInstalacion:
            "label-badge bg-teal-500/15 text-teal-300 border border-teal-500/20",
        instalado:
            "label-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        facturado:
            "label-badge bg-purple-500/15 text-purple-300 border border-purple-500/20",
        Programado:
            "label-badge bg-blue-500/15 text-blue-300 border border-blue-500/20",
        Aprobado:
            "label-badge bg-acid-400/15 text-acid-400 border border-acid-400/20",
        Instalado:
            "label-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        Entregado:
            "label-badge bg-purple-500/15 text-purple-300 border border-purple-500/20",
        Cerrado:
            "label-badge bg-white/5 text-obsidian-400 border border-white/10",
        Prospecto:
            "label-badge bg-amber-500/15 text-amber-400 border border-amber-500/20",
        Cotizado:
            "label-badge bg-orange-500/15 text-orange-400 border border-orange-500/20",
    };

    return (
        map[statusKey.value] ||
        "label-badge bg-white/5 text-obsidian-400 border border-white/10"
    );
});

const dotClass = computed(() => {
    const map: Record<string, string> = {
        vendido: "bg-blue-400",
        fabricacion: "bg-acid-400",
        despacho: "bg-orange-400",
        instalacion: "bg-cyan-400",
        vendidoInstalacion: "bg-teal-300",
        instalado: "bg-emerald-400",
        facturado: "bg-purple-400",
        Programado: "bg-blue-400",
        Aprobado: "bg-acid-400",
        Instalado: "bg-emerald-400",
        Entregado: "bg-purple-400",
        Cerrado: "bg-obsidian-500",
        Prospecto: "bg-amber-400",
        Cotizado: "bg-orange-400",
    };

    return map[statusKey.value] || "bg-obsidian-500";
});
</script>

<style scoped>
.status-dropdown {
    position: relative;
    overflow: visible;
}

.status-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 8.75rem;
    max-width: 11rem;
    background-color: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    font: inherit;
    letter-spacing: inherit;
    line-height: inherit;
    outline: none;
    padding: 0;
    text-transform: inherit;
}

.status-trigger:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.55);
    outline-offset: 3px;
    border-radius: 9999px;
}

.status-trigger span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.status-caret {
    width: 0;
    height: 0;
    border-left: 0.28rem solid transparent;
    border-right: 0.28rem solid transparent;
    border-top: 0.36rem solid currentColor;
    flex: 0 0 auto;
    opacity: 0.9;
}

.status-menu {
    position: fixed;
    z-index: 1000;
    width: max-content;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.7rem;
    background-color: #121218;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.42);
    padding: 0.25rem;
    text-transform: none;
}

.status-option {
    display: block;
    width: 100%;
    min-width: 9rem;
    border: 0;
    border-radius: 0.5rem;
    background-color: #15151a;
    color: #f0f0f2;
    cursor: pointer;
    font-family: "Montserrat", sans-serif;
    font-size: 0.76rem;
    font-weight: 600;
    line-height: 1.2;
    padding: 0.5rem 0.65rem;
    text-align: left;
    text-transform: none;
    transition:
        background-color 0.15s ease,
        color 0.15s ease;
}

.status-option:hover,
.status-option:focus-visible {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    outline: none;
}

.status-option-active {
    background-color: rgba(0, 85, 113, 0.72);
    color: #ffffff;
}

.status-menu-enter-active,
.status-menu-leave-active {
    transition:
        opacity 0.14s ease,
        transform 0.14s ease;
}

.status-menu-enter-from,
.status-menu-leave-to {
    opacity: 0;
    transform: translateY(-0.2rem);
}

:global(:root.theme-light) .status-trigger:focus-visible {
    outline-color: rgba(0, 85, 113, 0.45);
}

:global(:root.theme-light) .status-menu {
    background-color: #ffffff;
    border-color: rgba(0, 85, 113, 0.16);
    box-shadow: 0 18px 40px rgba(0, 85, 113, 0.18);
}

:global(:root.theme-light) .status-option {
    background-color: #ffffff;
    color: #10232c;
}

:global(:root.theme-light) .status-option:hover,
:global(:root.theme-light) .status-option:focus-visible {
    background-color: rgba(0, 85, 113, 0.08);
}

:global(:root.theme-light) .status-option-active {
    background-color: rgba(0, 85, 113, 0.16);
    color: #005571;
}
</style>
