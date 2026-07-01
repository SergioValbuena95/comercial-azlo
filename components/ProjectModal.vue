<!-- components/ProjectModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="modelValue"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="$emit('update:modelValue', false)"
            >
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <!-- Modal -->
                <div class="relative w-full max-w-lg glass-card border-white/10 shadow-2xl z-10">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-white/[0.07]">
                        <div>
                            <h2 class="font-display font-bold text-white text-lg">
                                {{
                                    project
                                        ? "Editar Proyecto"
                                        : "Nuevo Proyecto"
                                }}
                            </h2>
                            <p class="text-obsidian-500 text-xs font-mono mt-0.5" >
                                {{
                                    project
                                        ? project.proyecto
                                        : "Ingresa los datos del proyecto"
                                }}
                            </p>
                        </div>
                        <button
                            @click="$emit('update:modelValue', false)"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-lg"
                        >
                            ✕
                        </button>
                    </div>

                    <!-- Form -->
                    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div class="grid grid-cols-2 gap-4">
                            <div v-if="canManageProjectState" class="col-span-2">
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Estado general *
                                </label>
                                <select
                                    v-model.number="form.estado"
                                    class="input-dark"
                                >
                                    <option :value="PROJECT_STATES.IN_PROGRESS.id">
                                        En tramite
                                    </option>
                                    <option :value="PROJECT_STATES.SOLD.id">
                                        Vendidos
                                    </option>
                                </select>
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Proyecto *
                                </label>
                                <input
                                    v-model="form.proyecto"
                                    type="text"
                                    class="input-dark"
                                    placeholder="Nombre del proyecto"
                                />
                            </div>
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    País
                                </label>
                                <select v-model="form.pais" class="input-dark">
                                    <option value="">Seleccionar...</option>
                                    <option v-for="p in paises" :key="p">
                                        {{ p }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Ciudad *
                                </label>
                                <input
                                    v-model="form.ciudad"
                                    type="text"
                                    class="input-dark"
                                    placeholder="Ciudad"
                                />
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5" >
                                    Dirección
                                </label>
                                <input
                                    v-model="form.direccion"
                                    type="text"
                                    class="input-dark"
                                    placeholder="Dirección del proyecto"
                                />
                            </div>
                            <!-- Fecha Solicitud * -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5" >
                                    Fecha Solicitud *
                                </label>
                                <input
                                    v-model="form.fechaCreacion"
                                    type="date"
                                    class="input-dark"
                                />
                            </div>
                            <!-- Dias acordados -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Dias acordados *
                                </label>
                                <input
                                    v-model.number="form.diasAcordados"
                                    type="number"
                                    min="0"
                                    step="1"
                                    class="input-dark"
                                    placeholder="0"
                                />
                            </div>
                            <!-- Fecha Despacho -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5" >
                                    Fecha Instalación
                                </label>
                                <input
                                    v-model="form.fechaInstalacion"
                                    type="date"
                                    class="input-dark"
                                />
                            </div>
                            <!-- Fecha Despacho -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5" >
                                    Fecha Despacho
                                </label>
                                <input
                                    v-model="form.fechaDespacho"
                                    type="date"
                                    class="input-dark"
                                />
                            </div>
                            <!-- Encargado * -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5" >
                                    Encargado *
                                </label>
                                <select
                                    v-model="form.encargado"
                                    class="input-dark"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option
                                        v-for="assignee in assigneeOptions"
                                        :key="assignee.value"
                                        :value="assignee.value"
                                    >
                                        {{ assignee.label }}
                                    </option>
                                </select>
                            </div>
                            <!-- Encargado * -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Estado *
                                </label>
                                <select
                                    v-model="form.sub_state"
                                    class="input-dark"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option v-for="s in estados" :key="s">
                                        {{ s }}
                                    </option>
                                </select>
                            </div>
                            <!-- Encargado * -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Valor sub-total
                                </label>
                                <input
                                    v-model.number="form.valorTotal"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    class="input-dark"
                                    placeholder="0"
                                />
                            </div>
                            <!-- Porcentajes acordados -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Porcentajes acordados
                                </label>
                                <input
                                    v-model="form.porcentajesPago"
                                    type="text"
                                    class="input-dark"
                                    placeholder="50%, 30%, 20%"
                                />
                            </div>
                            <!-- Notas -->
                            <div class="col-span-2">
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Notas
                                </label>
                                <textarea
                                    v-model="form.notas"
                                    class="input-dark min-h-24 resize-y"
                                    placeholder="Notas comerciales, acuerdos o próximos pasos"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-end gap-3 p-6 border-t border-white/[0.07]">
                        <button
                            @click="$emit('update:modelValue', false)"
                            class="btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            @click="handleSubmit"
                            :disabled="!isValid"
                            class="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {{ project ? "Guardar cambios" : "Crear proyecto" }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import {
    PROJECT_STATES,
    type Project,
} from "~/composables/useProjects";
import type { AppUser } from "~/composables/useUsers";

const props = defineProps<{
    modelValue: boolean;
    project?: Project | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    save: [project: Omit<Project, "id">];
}>();

const { user, initAuth } = useAuth();
const {
    users,
    currentUserProfile,
    loadUsers,
    loadCurrentUserProfile
} = useUsers();

const paises = ["Colombia"];
const estados = [
    "Vendido",
    "Fabricación",
    "Despacho",
    "Instalacion",
    "Instalado",
    "Facturado",
];

const defaultForm = () => ({
    proyecto: "",
    pais: "",
    ciudad: "",
    direccion: "",
    fechaCreacion: new Date().toISOString().slice(0, 10),
    fechaDespacho: "",
    fechaInstalacion: "",
    diasAcordados: null as number | null,
    encargado: user.value?.uid || "",
    estado: PROJECT_STATES.IN_PROGRESS.id,
    sub_state: "Vendido",
    valorTotal: null as number | null,
    porcentajesPago: "50%, 30%, 20%",
    notas: "",
});

const form = reactive(defaultForm());

onMounted(async () => {
    await initAuth();
    loadCurrentUserProfile();
    loadUsers();
});

watch(
    () => props.project,
    (p: Project | null | undefined) => {
        if (p)
            Object.assign(form, defaultForm(), p, {
                sub_state: p.sub_state || p.estado || "",
            });
        else Object.assign(form, defaultForm());
    },
    { immediate: true },
);

const addDays = (dateValue: string, days: number) => {
    const [year, month, day] = dateValue.split("-").map(Number);
    if (!year || !month || !day) return "";
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
};

watch(
    () => [form.fechaCreacion, form.diasAcordados] as const,
    ([fechaCreacion, diasAcordados]) => {
        if (
            !fechaCreacion ||
            typeof diasAcordados !== "number" ||
            !Number.isFinite(diasAcordados) ||
            diasAcordados < 0
        ) {
            return;
        }
        form.fechaInstalacion = addDays(fechaCreacion, diasAcordados);
    },
);

watch(
    () => [props.modelValue, props.project, user.value?.uid] as const,
    ([isOpen, project, uid]) => {
        if (!isOpen || project || form.encargado || !uid) return;
        form.encargado = uid;
    },
);

const roleName = computed(() =>
    (currentUserProfile.value?.roleName || "").trim().toLowerCase(),
);

const canAssignAnyUser = computed(() =>
    ["admin", "superadmin", "super admin"].includes(roleName.value),
);

const canManageProjectState = computed(() => canAssignAnyUser.value);

const userDisplayName = (appUser: Pick<AppUser, "displayName" | "email">) =>
    appUser.displayName || appUser.email || "Usuario sin nombre";

const currentUserOption = computed(() => {
    if (!user.value) return null;

    return {
        value: user.value.uid,
        label:
            currentUserProfile.value?.displayName ||
            user.value.displayName ||
            user.value.email ||
            "Usuario actual",
    };
});

const assigneeOptions = computed(() => {
    const options = canAssignAnyUser.value
        ? users.value.map((appUser) => ({
              value: appUser.uid,
              label: userDisplayName(appUser),
          }))
        : currentUserOption.value
          ? [currentUserOption.value]
          : [];

    if (
        form.encargado &&
        !options.some((option) => option.value === form.encargado)
    ) {
        return [
            ...options,
            {
                value: form.encargado,
                label: "Usuario asignado",
            },
        ];
    }

    return options;
});

const isValid = computed(
    () =>
        form.proyecto &&
        form.ciudad &&
        form.fechaCreacion &&
        form.encargado &&
        form.sub_state &&
        typeof form.diasAcordados === "number" &&
        Number.isFinite(form.diasAcordados) &&
        form.diasAcordados >= 0,
);

const handleSubmit = () => {
    if (!isValid.value) return;
    const { id: _id, ...projectData } = form as typeof form & { id?: string };

    emit("save", {
        ...projectData,
        sub_state: form.sub_state,
        diasAcordados:
            typeof form.diasAcordados === "number"
                ? form.diasAcordados
                : null,
        valorTotal:
            typeof form.valorTotal === "number" ? form.valorTotal : null,
        porcentajesPago: form.porcentajesPago.trim(),
        notas: form.notas.trim(),
    });
    emit("update:modelValue", false);
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-from .relative {
    transform: scale(0.96) translateY(8px);
}
.modal-leave-to .relative {
    transform: scale(0.96);
}
</style>
