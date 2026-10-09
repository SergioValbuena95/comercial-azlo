<!-- components/KanbanBoard.vue -->
<template>
    <section class="w-full">
        <!-- Top bar: Header & Quick Filters -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
                <div class="flex items-center gap-2">
                    <h2 class="section-title text-xl">Tablero Kanban</h2>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-acid-400/10 text-acid-400 border border-acid-400/20">
                        {{ totalProjectsCount }} proyectos
                    </span>
                </div>
                <p class="text-obsidian-500 text-xs font-mono mt-0.5">
                    Arrastra las tarjetas entre columnas para actualizar el estado del proyecto
                </p>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-2">
                <select
                    v-if="canFilterByResponsible"
                    v-model="filterResponsible"
                    class="input-dark h-9 w-auto text-xs"
                >
                    <option value="">Todos los encargados</option>
                    <option
                        v-for="responsible in allResponsibles"
                        :key="responsible"
                        :value="responsible"
                    >
                        {{ responsible }}
                    </option>
                </select>

                <select
                    v-model="filterCity"
                    class="input-dark h-9 w-auto text-xs"
                >
                    <option value="">Todas las ciudades</option>
                    <option
                        v-for="city in allCities"
                        :key="city"
                        :value="city"
                    >
                        {{ city }}
                    </option>
                </select>

                <button
                    v-if="hasLocalFilters"
                    type="button"
                    class="btn-ghost h-9 text-xs text-coral-400 border-coral-400/20 hover:border-coral-400/40"
                    @click="clearFilters"
                >
                    Limpiar filtros
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
            class="glass-card p-12 text-center text-obsidian-400 font-mono text-sm"
        >
            <div class="inline-block w-6 h-6 border-2 border-acid-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Cargando tablero...</p>
        </div>

        <!-- Kanban Board Columns Grid -->
        <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start pb-4 overflow-x-auto"
        >
            <!-- Column 1: En trámite -->
            <div class="kanban-column glass-card p-3 rounded-2xl flex flex-col max-h-[82vh]">
                <!-- Column Header -->
                <div class="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
                        <h3 class="font-display font-bold text-white text-sm">
                            En trámite
                        </h3>
                        <span class="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {{ inProgressList.length }}
                        </span>
                    </div>
                    <span class="text-[11px] font-mono text-obsidian-400">
                        {{ formatCurrency(columnTotalValue(inProgressList)) }}
                    </span>
                </div>

                <!-- Column Cards (Drag and Drop Zone) -->
                <div class="relative flex-1 flex flex-col min-h-[220px]">
                    <div
                        v-if="!inProgressList.length"
                        class="absolute inset-0 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-obsidian-500 text-xs font-mono pointer-events-none select-none"
                    >
                        Arrastra proyectos aquí
                    </div>

                    <div
                        ref="inProgressColRef"
                        class="kanban-dropzone flex-1 overflow-y-auto space-y-3 min-h-[220px] pr-1 py-1"
                    >

                    <div
                        v-for="project in inProgressList"
                        :key="projectKey(project)"
                        class="kanban-card group glass-card p-3.5 rounded-xl border border-white/[0.08] hover:border-sky-400/40 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-lg space-y-3 select-none"
                        @click="$emit('info', project)"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-start gap-2 flex-1">
                                <span
                                    class="text-obsidian-500 group-hover:text-obsidian-300 transition-colors select-none text-base leading-none pt-0.5 px-0.5"
                                    title="Arrastrar tarjeta"
                                >
                                    ⠿
                                </span>
                                <h4 class="font-body font-semibold text-white text-sm leading-snug line-clamp-2">
                                    {{ project.proyecto }}
                                </h4>
                            </div>
                            <div @click.stop>
                                <StatusBadge
                                    :estado="projectSubState(project)"
                                    :editable="true"
                                    :options="subStateOptions(project)"
                                    @update:estado="handleSubStateChange(project, $event)"
                                />
                            </div>
                        </div>

                        <!-- Card Metadata -->
                        <div class="text-xs font-mono text-obsidian-400 space-y-1">
                            <div class="flex items-center justify-between gap-2">
                                <span class="truncate">📍 {{ project.ciudad || 'Sin ciudad' }}</span>
                                <span class="truncate text-obsidian-300 font-medium">👤 {{ responsibleName(project.encargado) }}</span>
                            </div>
                            <div v-if="project.fechaInstalacion" class="flex items-center justify-between text-[11px] text-obsidian-500">
                                <span>Instalación:</span>
                                <span class="text-obsidian-300">{{ formatDate(project.fechaInstalacion) }}</span>
                            </div>
                        </div>

                        <!-- Total Value & Payments -->
                        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                            <div>
                                <span class="text-[10px] font-mono uppercase tracking-wider text-obsidian-500 block leading-none">
                                    Valor
                                </span>
                                <span class="text-xs font-mono font-bold text-white">
                                    {{ formatCurrency(project.valorTotal) }}
                                </span>
                            </div>

                            <!-- Payment Chips -->
                            <div class="flex flex-wrap gap-1 justify-end" @click.stop>
                                <button
                                    v-for="(payment, pIdx) in paymentParts(project)"
                                    :key="`${projectKey(project)}-${pIdx}`"
                                    type="button"
                                    class="payment-chip"
                                    :class="{ 'payment-chip-paid': isPaymentPaid(project, pIdx) }"
                                    :title="isPaymentPaid(project, pIdx) ? 'Marcar como pendiente' : 'Marcar como pagado'"
                                    @click.stop="handlePaymentClick(project, pIdx)"
                                >
                                    {{ payment }}
                                </button>
                            </div>
                        </div>

                        <!-- Card Actions Footer -->
                        <div class="pt-1 flex items-center justify-between gap-1 text-xs" @click.stop>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white"
                                @click.stop="$emit('info', project)"
                            >
                                Info
                            </button>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white flex items-center gap-1"
                                @click.stop="$emit('notes', project)"
                            >
                                📝 Notas
                            </button>
                            <div class="flex items-center gap-1 ml-auto">
                                <button
                                    type="button"
                                    class="p-1 rounded text-obsidian-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title="Editar proyecto"
                                    @click.stop="$emit('edit', project)"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    class="p-1 rounded text-coral-400 hover:text-coral-300 hover:bg-coral-400/10 transition-colors"
                                    title="Eliminar proyecto"
                                    @click.stop="$emit('delete', project)"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Column 2: Vendido -->
            <div class="kanban-column glass-card p-3 rounded-2xl flex flex-col max-h-[82vh]">
                <!-- Column Header -->
                <div class="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                        <h3 class="font-display font-bold text-white text-sm">
                            Vendido
                        </h3>
                        <span class="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {{ soldList.length }}
                        </span>
                    </div>
                    <span class="text-[11px] font-mono text-obsidian-400">
                        {{ formatCurrency(columnTotalValue(soldList)) }}
                    </span>
                </div>

                <!-- Column Cards (Drag and Drop Zone) -->
                <div class="relative flex-1 flex flex-col min-h-[220px]">
                    <div
                        v-if="!soldList.length"
                        class="absolute inset-0 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-obsidian-500 text-xs font-mono pointer-events-none select-none"
                    >
                        Arrastra proyectos aquí
                    </div>

                    <div
                        ref="soldColRef"
                        class="kanban-dropzone flex-1 overflow-y-auto space-y-3 min-h-[220px] pr-1 py-1"
                    >

                    <div
                        v-for="project in soldList"
                        :key="projectKey(project)"
                        class="kanban-card group glass-card p-3.5 rounded-xl border border-white/[0.08] hover:border-emerald-400/40 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-lg space-y-3 select-none"
                        @click="$emit('info', project)"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-start gap-2 flex-1">
                                <span
                                    class="text-obsidian-500 group-hover:text-obsidian-300 transition-colors select-none text-base leading-none pt-0.5 px-0.5"
                                    title="Arrastrar tarjeta"
                                >
                                    ⠿
                                </span>
                                <h4 class="font-body font-semibold text-white text-sm leading-snug line-clamp-2">
                                    {{ project.proyecto }}
                                </h4>
                            </div>
                            <div @click.stop>
                                <StatusBadge
                                    :estado="projectSubState(project)"
                                    :editable="true"
                                    :options="subStateOptions(project)"
                                    @update:estado="handleSubStateChange(project, $event)"
                                />
                            </div>
                        </div>

                        <!-- Card Metadata -->
                        <div class="text-xs font-mono text-obsidian-400 space-y-1">
                            <div class="flex items-center justify-between gap-2">
                                <span class="truncate">📍 {{ project.ciudad || 'Sin ciudad' }}</span>
                                <span class="truncate text-obsidian-300 font-medium">👤 {{ responsibleName(project.encargado) }}</span>
                            </div>
                            <div v-if="project.fechaDespacho" class="flex items-center justify-between text-[11px] text-obsidian-500">
                                <span>Despacho:</span>
                                <span class="text-obsidian-300">{{ formatDate(project.fechaDespacho) }}</span>
                            </div>
                        </div>

                        <!-- Total Value & Payments -->
                        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                            <div>
                                <span class="text-[10px] font-mono uppercase tracking-wider text-obsidian-500 block leading-none">
                                    Valor
                                </span>
                                <span class="text-xs font-mono font-bold text-white">
                                    {{ formatCurrency(project.valorTotal) }}
                                </span>
                            </div>

                            <!-- Payment Chips -->
                            <div class="flex flex-wrap gap-1 justify-end" @click.stop>
                                <button
                                    v-for="(payment, pIdx) in paymentParts(project)"
                                    :key="`${projectKey(project)}-${pIdx}`"
                                    type="button"
                                    class="payment-chip"
                                    :class="{ 'payment-chip-paid': isPaymentPaid(project, pIdx) }"
                                    :title="isPaymentPaid(project, pIdx) ? 'Marcar como pendiente' : 'Marcar como pagado'"
                                    @click.stop="handlePaymentClick(project, pIdx)"
                                >
                                    {{ payment }}
                                </button>
                            </div>
                        </div>

                        <!-- Card Actions Footer -->
                        <div class="pt-1 flex items-center justify-between gap-1 text-xs" @click.stop>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white"
                                @click.stop="$emit('info', project)"
                            >
                                Info
                            </button>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white flex items-center gap-1"
                                @click.stop="$emit('notes', project)"
                            >
                                📝 Notas
                            </button>
                            <div class="flex items-center gap-1 ml-auto">
                                <button
                                    type="button"
                                    class="p-1 rounded text-obsidian-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title="Editar proyecto"
                                    @click.stop="$emit('edit', project)"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    class="p-1 rounded text-coral-400 hover:text-coral-300 hover:bg-coral-400/10 transition-colors"
                                    title="Eliminar proyecto"
                                    @click.stop="$emit('delete', project)"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Column 3: Cartera -->
            <div class="kanban-column glass-card p-3 rounded-2xl flex flex-col max-h-[82vh]">
                <!-- Column Header -->
                <div class="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                        <h3 class="font-display font-bold text-white text-sm">
                            Cartera
                        </h3>
                        <span class="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {{ checkbookList.length }}
                        </span>
                    </div>
                    <span class="text-[11px] font-mono text-obsidian-400">
                        {{ formatCurrency(columnTotalValue(checkbookList)) }}
                    </span>
                </div>

                <!-- Column Cards (Drag and Drop Zone) -->
                <div class="relative flex-1 flex flex-col min-h-[220px]">
                    <div
                        v-if="!checkbookList.length"
                        class="absolute inset-0 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-obsidian-500 text-xs font-mono pointer-events-none select-none"
                    >
                        Arrastra proyectos aquí
                    </div>

                    <div
                        ref="checkbookColRef"
                        class="kanban-dropzone flex-1 overflow-y-auto space-y-3 min-h-[220px] pr-1 py-1"
                    >

                    <div
                        v-for="project in checkbookList"
                        :key="projectKey(project)"
                        class="kanban-card group glass-card p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-400/40 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-lg space-y-3 select-none"
                        @click="$emit('info', project)"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-start gap-2 flex-1">
                                <span
                                    class="text-obsidian-500 group-hover:text-obsidian-300 transition-colors select-none text-base leading-none pt-0.5 px-0.5"
                                    title="Arrastrar tarjeta"
                                >
                                    ⠿
                                </span>
                                <h4 class="font-body font-semibold text-white text-sm leading-snug line-clamp-2">
                                    {{ project.proyecto }}
                                </h4>
                            </div>
                            <div @click.stop>
                                <StatusBadge
                                    :estado="projectSubState(project)"
                                    :editable="true"
                                    :options="subStateOptions(project)"
                                    @update:estado="handleSubStateChange(project, $event)"
                                />
                            </div>
                        </div>

                        <!-- Days in Cartera Alert Badge -->
                        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs">
                            <span>⏳</span>
                            <span>Días en cartera: <strong>{{ daysInCheckbook(project.state_started_at) ?? 0 }}</strong></span>
                        </div>

                        <!-- Card Metadata -->
                        <div class="text-xs font-mono text-obsidian-400 space-y-1">
                            <div class="flex items-center justify-between gap-2">
                                <span class="truncate">📍 {{ project.ciudad || 'Sin ciudad' }}</span>
                                <span class="truncate text-obsidian-300 font-medium">👤 {{ responsibleName(project.encargado) }}</span>
                            </div>
                        </div>

                        <!-- Total Value & Payments -->
                        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                            <div>
                                <span class="text-[10px] font-mono uppercase tracking-wider text-obsidian-500 block leading-none">
                                    Valor
                                </span>
                                <span class="text-xs font-mono font-bold text-white">
                                    {{ formatCurrency(project.valorTotal) }}
                                </span>
                            </div>

                            <!-- Payment Chips -->
                            <div class="flex flex-wrap gap-1 justify-end" @click.stop>
                                <button
                                    v-for="(payment, pIdx) in paymentParts(project)"
                                    :key="`${projectKey(project)}-${pIdx}`"
                                    type="button"
                                    class="payment-chip"
                                    :class="{ 'payment-chip-paid': isPaymentPaid(project, pIdx) }"
                                    :title="isPaymentPaid(project, pIdx) ? 'Marcar como pendiente' : 'Marcar como pagado'"
                                    @click.stop="handlePaymentClick(project, pIdx)"
                                >
                                    {{ payment }}
                                </button>
                            </div>
                        </div>

                        <!-- Card Actions Footer -->
                        <div class="pt-1 flex items-center justify-between gap-1 text-xs" @click.stop>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white"
                                @click.stop="$emit('info', project)"
                            >
                                Info
                            </button>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white flex items-center gap-1"
                                @click.stop="$emit('notes', project)"
                            >
                                📝 Notas
                            </button>
                            <div class="flex items-center gap-1 ml-auto">
                                <button
                                    type="button"
                                    class="p-1 rounded text-obsidian-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title="Editar proyecto"
                                    @click.stop="$emit('edit', project)"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    class="p-1 rounded text-coral-400 hover:text-coral-300 hover:bg-coral-400/10 transition-colors"
                                    title="Eliminar proyecto"
                                    @click.stop="$emit('delete', project)"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Column 4: Finalizado -->
            <div class="kanban-column glass-card p-3 rounded-2xl flex flex-col max-h-[82vh]">
                <!-- Column Header -->
                <div class="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]"></span>
                        <h3 class="font-display font-bold text-white text-sm">
                            Finalizado
                        </h3>
                        <span class="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {{ doneList.length }}
                        </span>
                    </div>
                    <span class="text-[11px] font-mono text-obsidian-400">
                        {{ formatCurrency(columnTotalValue(doneList)) }}
                    </span>
                </div>

                <!-- Column Cards (Drag and Drop Zone) -->
                <div class="relative flex-1 flex flex-col min-h-[220px]">
                    <div
                        v-if="!doneList.length"
                        class="absolute inset-0 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-obsidian-500 text-xs font-mono pointer-events-none select-none"
                    >
                        Arrastra proyectos aquí
                    </div>

                    <div
                        ref="doneColRef"
                        class="kanban-dropzone flex-1 overflow-y-auto space-y-3 min-h-[220px] pr-1 py-1"
                    >

                    <div
                        v-for="project in doneList"
                        :key="projectKey(project)"
                        class="kanban-card group glass-card p-3.5 rounded-xl border border-white/[0.08] hover:border-purple-400/40 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-lg space-y-3 select-none opacity-90"
                        @click="$emit('info', project)"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-start gap-2 flex-1">
                                <span
                                    class="text-obsidian-500 group-hover:text-obsidian-300 transition-colors select-none text-base leading-none pt-0.5 px-0.5"
                                    title="Arrastrar tarjeta"
                                >
                                    ⠿
                                </span>
                                <h4 class="font-body font-semibold text-white text-sm leading-snug line-clamp-2">
                                    {{ project.proyecto }}
                                </h4>
                            </div>
                            <div @click.stop>
                                <StatusBadge
                                    :estado="projectSubState(project)"
                                    :editable="false"
                                    :options="subStateOptions(project)"
                                />
                            </div>
                        </div>

                        <!-- Card Metadata -->
                        <div class="text-xs font-mono text-obsidian-400 space-y-1">
                            <div class="flex items-center justify-between gap-2">
                                <span class="truncate">📍 {{ project.ciudad || 'Sin ciudad' }}</span>
                                <span class="truncate text-obsidian-300 font-medium">👤 {{ responsibleName(project.encargado) }}</span>
                            </div>
                        </div>

                        <!-- Total Value & Payments -->
                        <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-2">
                            <div>
                                <span class="text-[10px] font-mono uppercase tracking-wider text-obsidian-500 block leading-none">
                                    Valor
                                </span>
                                <span class="text-xs font-mono font-bold text-white">
                                    {{ formatCurrency(project.valorTotal) }}
                                </span>
                            </div>

                            <!-- Payment Chips -->
                            <div class="flex flex-wrap gap-1 justify-end" @click.stop>
                                <button
                                    v-for="(payment, pIdx) in paymentParts(project)"
                                    :key="`${projectKey(project)}-${pIdx}`"
                                    type="button"
                                    class="payment-chip"
                                    :class="{ 'payment-chip-paid': isPaymentPaid(project, pIdx) }"
                                    :title="isPaymentPaid(project, pIdx) ? 'Marcar como pendiente' : 'Marcar como pagado'"
                                    @click.stop="handlePaymentClick(project, pIdx)"
                                >
                                    {{ payment }}
                                </button>
                            </div>
                        </div>

                        <!-- Card Actions Footer -->
                        <div class="pt-1 flex items-center justify-between gap-1 text-xs" @click.stop>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white"
                                @click.stop="$emit('info', project)"
                            >
                                Info
                            </button>
                            <button
                                type="button"
                                class="btn-ghost text-[11px] h-6 px-2 text-obsidian-400 hover:text-white flex items-center gap-1"
                                @click.stop="$emit('notes', project)"
                            >
                                📝 Notas
                            </button>
                            <div class="flex items-center gap-1 ml-auto">
                                <button
                                    type="button"
                                    class="p-1 rounded text-obsidian-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title="Editar proyecto"
                                    @click.stop="$emit('edit', project)"
                                >
                                    ✏️
                                </button>
                                <button
                                    type="button"
                                    class="p-1 rounded text-coral-400 hover:text-coral-300 hover:bg-coral-400/10 transition-colors"
                                    title="Eliminar proyecto"
                                    @click.stop="$emit('delete', project)"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useDragAndDrop } from "@formkit/drag-and-drop/vue";
import {
    projectSubState,
    PROJECT_STATES,
    type Project,
    type ProjectStateId,
} from "~/composables/useProjects";
import { useUsers } from "~/composables/useUsers";
import { useAccess } from "~/composables/useAccess";
import { useProjectStatesTypes } from "~/composables/useProjectStates";

const props = withDefaults(
    defineProps<{
        projects: Project[];
        loading?: boolean;
        searchQuery?: string;
    }>(),
    {
        loading: false,
        searchQuery: "",
    },
);

const emit = defineEmits<{
    info: [project: Project];
    notes: [project: Project];
    edit: [project: Project];
    delete: [project: Project];
    "payment-toggle": [project: Project, paidPayments: number[]];
    "sub_state-change": [project: Project, subState: string];
    "state-change": [project: Project, newStateId: number, oldStateId: number];
    "date-change": [
        project: Project,
        date: string,
        field?: "state_started_at" | "fechaInstalacion" | "fechaDespacho",
    ];
}>();

const { users, currentUserProfile, loadUsers, loadCurrentUserProfile } = useUsers();
const { isAdminUser } = useAccess();
const { projectStateType: projectStates, loadMainStates } = useProjectStatesTypes();

onMounted(() => {
    loadUsers();
    loadCurrentUserProfile();
    loadMainStates();
});

// Local filters
const filterResponsible = ref("");
const filterCity = ref("");

const canFilterByResponsible = computed(() =>
    isAdminUser(currentUserProfile.value),
);

const hasLocalFilters = computed(
    () => Boolean(filterResponsible.value || filterCity.value),
);

const clearFilters = () => {
    filterResponsible.value = "";
    filterCity.value = "";
};

// Responsible name helper
const responsibleName = (uid?: string) => {
    if (!uid) return "";
    const appUser = users.value.find((u) => String(u.uid) === String(uid) || String(u.id) === String(uid));
    return appUser?.displayName || appUser?.email || uid;
};

// Available filter options
const allResponsibles = computed(() =>
    users.value
        .filter((u) => String(u.roleId) === "3")
        .map((u) => responsibleName(u.uid))
        .filter(Boolean)
        .sort(),
);

const allCities = computed(() =>
    [...new Set(props.projects.map((p) => p.ciudad).filter(Boolean))].sort(),
);

// Filter projects by user access & active filters
const filteredProjects = computed(() => {
    let list = [...props.projects];

    // Global search query
    if (props.searchQuery) {
        const q = props.searchQuery.toLowerCase().trim();
        list = list.filter(
            (p) =>
                p.proyecto.toLowerCase().includes(q) ||
                (p.ciudad || "").toLowerCase().includes(q) ||
                responsibleName(p.encargado).toLowerCase().includes(q) ||
                (p.notas || "").toLowerCase().includes(q),
        );
    }

    // Local filters
    if (canFilterByResponsible.value && filterResponsible.value) {
        list = list.filter(
            (p) => responsibleName(p.encargado) === filterResponsible.value,
        );
    }

    if (filterCity.value) {
        list = list.filter((p) => p.ciudad === filterCity.value);
    }

    return list;
});

const totalProjectsCount = computed(() => filteredProjects.value.length);

const isDragging = ref(false);

const handleDragstart = () => {
    isDragging.value = true;
};

const handleDragend = (data: any) => {
    isDragging.value = false;
    const targetStateId = Number(data.parent?.data?.config?.name);
    const oldStateId = Number(data.state?.initialParent?.data?.config?.name);
    const draggedProject = data.draggedNode?.data?.value ?? (data.draggedNodes?.[0]?.data?.value as Project | undefined);

    if (!draggedProject || !targetStateId || !oldStateId) return;

    if (targetStateId !== oldStateId) {
        draggedProject.estado = targetStateId as ProjectStateId;
        emit("state-change", draggedProject, targetStateId, oldStateId);
    }
};

// Configure FormKit Drag and Drop for each column
const [inProgressColRef, inProgressList] = useDragAndDrop<Project>([], {
    group: "kanban-board",
    name: "1",
    disabled: true,
    onDragstart: handleDragstart,
    onDragend: handleDragend,
});

const [soldColRef, soldList] = useDragAndDrop<Project>([], {
    group: "kanban-board",
    name: "2",
    disabled: true,
    onDragstart: handleDragstart,
    onDragend: handleDragend,
});

const [checkbookColRef, checkbookList] = useDragAndDrop<Project>([], {
    group: "kanban-board",
    name: "3",
    disabled: true,
    onDragstart: handleDragstart,
    onDragend: handleDragend,
});

const [doneColRef, doneList] = useDragAndDrop<Project>([], {
    group: "kanban-board",
    name: "4",
    disabled: true,
    onDragstart: handleDragstart,
    onDragend: handleDragend,
});

// Keep column items in sync with filtered projects
const syncColumns = () => {
    if (isDragging.value) return;
    const projs = filteredProjects.value;
    inProgressList.value = projs.filter(
        (p) => Number(p.estado || PROJECT_STATES.IN_PROGRESS.id) === PROJECT_STATES.IN_PROGRESS.id,
    );
    soldList.value = projs.filter(
        (p) => Number(p.estado) === PROJECT_STATES.SOLD.id,
    );
    checkbookList.value = projs.filter(
        (p) => Number(p.estado) === PROJECT_STATES.CHECK_BOOK.id,
    );
    doneList.value = projs.filter(
        (p) => Number(p.estado) === PROJECT_STATES.DONE.id,
    );
};

watch(
    () => [props.projects, props.searchQuery, filterResponsible.value, filterCity.value],
    () => {
        syncColumns();
    },
    { immediate: true, deep: true },
);

// Helpers
const subStateOptions = (project: Project) => {
    if (project.estado) {
        const match = projectStates.value.find((s) => s.id === Number(project.estado));
        return match?.sub_state || [];
    }
    return [];
};

const handleSubStateChange = (project: Project, subState: string) => {
    if (subState === projectSubState(project)) return;
    emit("sub_state-change", project, subState);
};

const projectKey = (project: Project) =>
    [
        project.id || "sin-id",
        project.proyecto,
        project.ciudad,
        project.fechaCreacion,
        project.valorTotal ?? "0",
    ].join("|");

const daysInCheckbook = (stateStartedAt?: string) => {
    if (!stateStartedAt) return null;
    const startedAt = new Date(stateStartedAt).getTime();
    if (Number.isNaN(startedAt)) return null;
    return Math.max(0, Math.floor((Date.now() - startedAt) / 86_400_000));
};

const columnTotalValue = (list: Project[]) =>
    list.reduce((acc, p) => acc + (Number(p.valorTotal) || 0), 0);

const formatCurrency = (value?: number | string | null) => {
    const amount = Number(value || 0);
    if (!amount) return "$ 0";
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
};

// Payment chips logic
const localPaidPayments = ref<Record<string, number[]>>({});

const paymentParts = (project: Project) => {
    const value = project.porcentajesPago || "";
    const percentages = value.match(/\d+(?:[.,]\d+)?\s*%/g);
    if (percentages?.length) {
        return percentages.map((p) => p.replace(/\s+/g, ""));
    }
    return value
        .split(/[,-]/)
        .map((p) => p.trim())
        .filter(Boolean);
};

const displayedPaidPayments = (project: Project) => {
    const key = projectKey(project);
    return localPaidPayments.value[key] ?? project.pagosRealizados ?? [];
};

const isPaymentPaid = (project: Project, paymentIndex: number) =>
    displayedPaidPayments(project).map(Number).includes(paymentIndex);

const handlePaymentClick = (project: Project, paymentIndex: number) => {
    const key = projectKey(project);
    const currentPaid = displayedPaidPayments(project).map(Number);
    const lastPaidIndex = currentPaid.length ? Math.max(...currentPaid) : -1;
    const nextLastPaidIndex =
        paymentIndex === lastPaidIndex ? paymentIndex - 1 : paymentIndex;

    const nextPaidPayments =
        nextLastPaidIndex >= 0
            ? Array.from({ length: nextLastPaidIndex + 1 }, (_, i) => i)
            : [];

    localPaidPayments.value[key] = nextPaidPayments;
    emit("payment-toggle", project, nextPaidPayments);
};
</script>

<style scoped>
.kanban-dropzone::-webkit-scrollbar {
    width: 4px;
}

.kanban-dropzone::-webkit-scrollbar-track {
    background: transparent;
}

.kanban-dropzone::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.kanban-dropzone::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

.payment-chip {
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: #a4a4b8;
    padding: 0;
    font-size: 0.62rem;
    line-height: 1;
    font-family: "Montserrat", sans-serif;
    font-weight: 700;
    transition: all 0.2s ease;
}

.payment-chip:hover {
    border-color: rgba(255, 255, 255, 0.25);
    color: #ffffff;
    transform: translateY(-1px);
}

.payment-chip-paid {
    border-color: #005571;
    background: #005571;
    color: #ffffff;
    box-shadow: 0 0 0 2px rgba(0, 85, 113, 0.25);
}

:global(:root.theme-light) .kanban-column {
    background-color: rgba(255, 255, 255, 0.7) !important;
    border-color: rgba(0, 85, 113, 0.12) !important;
}

:global(:root.theme-light) .kanban-card {
    background-color: #ffffff !important;
    border-color: rgba(0, 85, 113, 0.14) !important;
}

:global(:root.theme-light) .payment-chip {
    border-color: rgba(0, 85, 113, 0.16);
    background: rgba(0, 85, 113, 0.05);
    color: #60737c;
}

:global(:root.theme-light) .payment-chip-paid {
    border-color: rgba(0, 85, 113, 0.46);
    background: rgba(0, 85, 113, 0.18);
    color: #005571;
}
</style>
