// nuxt.config.ts
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineNuxtConfig({
    compatibilityDate: "2026-06-02",

    components: [
        {
            path: '~/components/buttons',
            pathPrefix: false,
        },
        '~/components'
    ],

    devtools: { enabled: true },
    css: ["v-calendar/style.css"],
    vite: {
        server: {
            allowedHosts: true,
        },
    },
    modules: [
        "@nuxtjs/tailwindcss",
        "@nuxtjs/supabase",
        // Avoid loading .nuxt/tailwind/postcss.mjs in PostCSS (breaks Vite with "import.meta outside a module")
        (_options, nuxt) => {
            nuxt.hook("modules:done", () => {
                const postcssOptions =
                    nuxt.options.postcss ??
                    (
                        nuxt.options.build as {
                            postcss?: {
                                postcssOptions?: {
                                    plugins?: Record<string, unknown>;
                                };
                            };
                        }
                    ).postcss?.postcssOptions ??
                    (
                        nuxt.options.build as {
                            postcss?: {
                                plugins?: Record<string, unknown>;
                            };
                        }
                    ).postcss;

                const plugins = postcssOptions?.plugins as
                    | Record<string, unknown>
                    | undefined;
                const tailwindPlugin = plugins?.tailwindcss;

                if (
                    typeof tailwindPlugin === "string" &&
                    tailwindPlugin.includes(".nuxt/tailwind/postcss.mjs")
                ) {
                    plugins!.tailwindcss = join(rootDir, "tailwind.config.cjs");
                }
            });
        },
    ],

    tailwindcss: {
        cssPath: "~/assets/css/main.css",
        configPath: "tailwind.config.cjs",
    },

    app: {
        baseURL: process.env.NUXT_APP_BASE_URL || "/",
        head: {
            title: "CRM Comercial — Dashboard de Seguimiento",
            meta: [
                { charset: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "description",
                    content:
                        "Dashboard de seguimiento comercial con métricas en tiempo real",
                },
            ],
            link: [
                {
                    rel: "preconnect",
                    href: "https://fonts.googleapis.com",
                },
                {
                    rel: "preconnect",
                    href: "https://fonts.gstatic.com",
                    crossorigin: "",
                },
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap",
                },
                {
                    rel: "icon",
                    type: "image/x-icon",
                    href: "/favicon.ico"
                },
            ],
        },
    },

    // @ts-ignore
    supabase: {
        redirect: false,
    },

    runtimeConfig: {
        public: {},
    },
});
