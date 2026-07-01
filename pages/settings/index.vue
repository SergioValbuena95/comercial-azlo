<template>
    <SettingsLayout
        title="Configuracion"
        description="Ajustes del sistema"
    >
        <section class="grid gap-4 md:grid-cols-3">
            <NuxtLink
                v-for="item in settingsSections"
                :key="item.to"
                :to="item.to"
                class="glass-card-hover p-5 block"
            >
                <p class="text-xs font-mono uppercase tracking-wider text-acid-400 mb-2">
                    {{ item.subTitle }}
                </p>
                <h2 class="section-title text-lg mb-2">
                    {{ item.title }}
                </h2>
                <p class="text-sm text-obsidian-400">
                    {{ item.description }}
                </p>
            </NuxtLink>
        </section>
    </SettingsLayout>
</template>

<script setup lang="ts">
const settingsSections = [
    {
        subTitle: "Acceso",
        title: "Usuarios",
        description: "Administra roles, estados y datos basicos de usuarios.",
        to: "/settings/users",
    },
    {
        subTitle: "Productos",
        title: "Configuracion",
        description: "Agrupa los ajustes relacionados con productos.",
        to: "/settings/products",
    },
    {
        subTitle: "Productos",
        title: "Tipos de producto",
        description: "Consulta los registros de la coleccion product_types.",
        to: "/settings/products/types",
    },
];
</script>
