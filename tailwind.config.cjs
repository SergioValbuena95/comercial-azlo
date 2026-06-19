/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./composables/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ["Syne", "sans-serif"],
                mono: ["Space Mono", "monospace"],
                body: ["Inter", "sans-serif"],
            },
            colors: {
                obsidian: {
                    50: "#f0f0f2",
                    100: "#e1e1e6",
                    200: "#c3c3cc",
                    300: "#a5a5b3",
                    400: "#878799",
                    500: "#696980",
                    600: "#545466",
                    700: "#3f3f4d",
                    800: "#2a2a33",
                    900: "#15151a",
                    950: "#0a0a0d",
                },
                acid: {
                    300: "#d4ff6e",
                    400: "#c8ff47",
                    500: "#b8f000",
                    600: "#96c800",
                },
                coral: {
                    400: "#ff6b6b",
                    500: "#ff4757",
                },
                sky: {
                    400: "#74b9ff",
                    500: "#0984e3",
                },
            },
            animation: {
                "fade-up": "fadeUp 0.6s ease-out forwards",
                "fade-in": "fadeIn 0.4s ease-out forwards",
                "slide-right": "slideRight 0.5s ease-out forwards",
                counter: "counter 1.5s ease-out forwards",
                "pulse-slow": "pulse 3s ease-in-out infinite",
                "bar-grow": "barGrow 1s ease-out forwards",
            },
            keyframes: {
                fadeUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideRight: {
                    "0%": { transform: "translateX(-10px)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                barGrow: {
                    "0%": { width: "0%" },
                    "100%": { width: "var(--bar-width)" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
