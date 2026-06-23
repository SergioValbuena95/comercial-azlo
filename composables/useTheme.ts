type ThemeMode = "dark" | "light";

const STORAGE_KEY = "crm-theme";
const theme = ref<ThemeMode>("dark");
let initialized = false;

const applyTheme = (mode: ThemeMode) => {
    if (!import.meta.client) return;

    const root = document.documentElement;
    root.classList.toggle("theme-light", mode === "light");
    root.classList.toggle("theme-dark", mode === "dark");
    root.style.colorScheme = mode;
};

export const useTheme = () => {
    const initTheme = () => {
        if (!import.meta.client || initialized) return;
        initialized = true;

        const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        const prefersLight = window.matchMedia(
            "(prefers-color-scheme: light)",
        ).matches;
        theme.value = saved || (prefersLight ? "light" : "dark");
        applyTheme(theme.value);
    };

    const setTheme = (mode: ThemeMode) => {
        theme.value = mode;
        applyTheme(mode);
        if (import.meta.client) localStorage.setItem(STORAGE_KEY, mode);
    };

    const toggleTheme = () => {
        setTheme(theme.value === "dark" ? "light" : "dark");
    };

    const isDark = computed(() => theme.value === "dark");

    return {
        theme,
        isDark,
        initTheme,
        setTheme,
        toggleTheme,
    };
};
