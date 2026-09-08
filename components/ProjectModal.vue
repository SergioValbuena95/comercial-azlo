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
                            <div class="col-span-2">
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Estado general *
                                </label>
                                <select v-model.number="form.estado" class="input-dark">
                                    <option v-for="state in projectStates" :key="state.id" :value="state.id">
                                        {{ state.name }}
                                    </option>
                                </select>
                                <!-- <select
                                    v-model.number="form.estado"
                                    class="input-dark"
                                >
                                    <option :value="PROJECT_STATES.IN_PROGRESS.id">
                                        En tramite {{PROJECT_STATES.IN_PROGRESS.id}}
                                    </option>
                                    <option :value="PROJECT_STATES.SOLD.id">
                                        Vendidos {{PROJECT_STATES.SOLD.id}}
                                    </option>
                                </select> -->
                            </div>
                            <!-- Project Name -->
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
                            <!-- Country -->
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
                            <!-- City -->
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
                            <!-- Address -->
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
                            <!-- Fecha Solicitud -->
                            <template v-if="form.estado === 2">
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
                                        Dias acordados
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
                                <!-- Fecha Instalación -->
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
                            </template>
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
                            <!-- Subestado * -->
                            <div>
                                <label class="block text-xs font-mono text-obsidian-400 uppercase tracking-wider mb-1.5">
                                    Estado *
                                </label>
                                <select
                                    v-model="form.sub_state"
                                    class="input-dark"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option v-for="sub in availableSubStates" :key="sub.id" :value="sub.name">
                                        {{ sub.name }}
                                    </option>
                                </select>
                            </div>
                            <!-- valor sub-total * -->
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
                            <!-- Files -->
                            <div class="col-span-2 space-y-3">
                                <!-- Existing Files when editing -->
                                <div v-if="project && project.id" class="rounded-lg border border-white/10 bg-white/[0.02] p-3 space-y-2">
                                    <p class="text-xs font-mono uppercase tracking-wider text-obsidian-400">
                                        Archivos adjuntos actuales
                                    </p>
                                    <div v-if="filesLoading" class="text-xs text-obsidian-400 font-mono py-1 flex items-center gap-2">
                                        <span class="animate-spin text-xs">🌀</span> Cargando archivos...
                                    </div>
                                    <div v-else-if="existingFiles.length === 0" class="text-xs text-obsidian-500 font-mono py-1">
                                        Sin archivos adjuntos previamente.
                                    </div>
                                    <ul v-else class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                        <li
                                            v-for="file in existingFiles"
                                            :key="file.id"
                                            class="flex items-center justify-between px-3 py-2 text-xs font-mono bg-obsidian-800/60 border border-obsidian-700/60 rounded-md"
                                        >
                                            <div class="flex items-center truncate pr-2">
                                                <span class="mr-2 shrink-0">
                                                    <span v-if="file.name?.toLowerCase().endsWith('.pdf')" class="text-red-400">📕</span>
                                                    <span v-else-if="file.mime_type?.startsWith('image/')" class="text-cyan-400">🖼️</span>
                                                    <span v-else class="text-obsidian-400">📄</span>
                                                </span>
                                                <span class="text-obsidian-200 truncate">{{ file.name }}</span>
                                                <span v-if="file.size" class="text-obsidian-500 ml-2 shrink-0">
                                                    ({{ formatBytes(file.size) }})
                                                </span>
                                            </div>

                                            <div class="flex items-center gap-1.5 shrink-0 ml-2">
                                                <button
                                                    type="button"
                                                    class="text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20"
                                                    @click="previewExistingFile(file)"
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    type="button"
                                                    :disabled="deletingFileId === file.id"
                                                    class="text-obsidian-400 hover:text-red-400 transition-colors text-xs px-1.5 py-0.5 rounded hover:bg-white/5 disabled:opacity-50"
                                                    title="Eliminar archivo"
                                                    @click="handleDeleteExistingFile(file.id)"
                                                >
                                                    {{ deletingFileId === file.id ? "..." : "✕" }}
                                                </button>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <FileUploader
                                        ref="fileUploaderRef"
                                        :label="project ? 'Agregar nuevos archivos' : 'Archivos'"
                                        :multiple="true"
                                        @files-selected="handleFilesSelected"
                                    />
                                    <p v-if="uploadError" class="text-xs text-red-400 mt-1">
                                        {{ uploadError }}
                                    </p>
                                </div>
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
                            :disabled="!isValid || isUploading"
                            class="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span v-if="isUploading" class="animate-spin text-xs">🌀</span>
                            {{ isUploading ? "Subiendo..." : (project ? "Guardar cambios" : "Crear proyecto") }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- In-CRM File Preview Modal -->
        <PreviewModal
            v-model="showPreview"
            :file="previewingFile"
        />
    </Teleport>
</template>

<script setup lang="ts">
import FileUploader from '~/components/FileUploader.vue'
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
const { isAdminUser } = useAccess();
const {
    projectStateType: projectStates,
    loadMainStates
} = useProjectStatesTypes();
const { upload } = useStorageUpload();

const paises = ["Colombia"];

const defaultForm = () => ({
    proyecto: "",
    pais: "Colombia",
    ciudad: "",
    direccion: "",
    fechaCreacion: new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }),
    fechaDespacho: "",
    fechaInstalacion: "",
    diasAcordados: null as number | null,
    encargado: currentUserProfile.value?.roleId === "3" ? currentUserProfile.value.id : "",
    estado: PROJECT_STATES.IN_PROGRESS.id as number,
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
    loadMainStates();
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
    return date.toLocaleDateString("en-CA", {
        timeZone: "America/Bogota",
    });
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
    () => [props.modelValue, props.project, currentUserProfile.value] as const,
    ([isOpen, project, profile]) => {
        if (!isOpen || project || form.encargado || !profile) return;
        if (profile.roleId === "3") {
            form.encargado = profile.id;
        }
    },
);

const canAssignAnyUser = computed(() =>
    isAdminUser(currentUserProfile.value),
);

// Track selected files from FileUploader
const fileUploaderRef = ref<any>(null);
const selectedFiles = ref<File[]>([]);
const isUploading = ref(false);
const uploadError = ref<string | null>(null);

// Existing Files Management
const {
    projectFiles: existingFiles,
    loading: filesLoading,
    fetchFilesByProject,
    deleteProjectFile,
} = useProjectFiles();

const deletingFileId = ref<number | null>(null);
const showPreview = ref(false);
const previewingFile = ref<any>(null);

const loadExistingFiles = async () => {
    if (!props.project?.id) {
        existingFiles.value = [];
        return;
    }
    const numericId = Number(props.project.id);
    if (numericId) {
        await fetchFilesByProject(numericId);
    }
};

const previewExistingFile = (file: any) => {
    previewingFile.value = file;
    showPreview.value = true;
};

const handleDeleteExistingFile = async (fileId: number) => {
    if (!confirm("¿Deseas eliminar este archivo adjunto del proyecto?")) return;
    deletingFileId.value = fileId;
    try {
        await deleteProjectFile(fileId);
    } catch (e) {
        console.error("Error al eliminar archivo:", e);
    } finally {
        deletingFileId.value = null;
    }
};

const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const handleFilesSelected = (files: File[]) => {
    selectedFiles.value = files;
    uploadError.value = null;
};

const clearSelectedFiles = () => {
    selectedFiles.value = [];
    uploadError.value = null;
    fileUploaderRef.value?.clear();
};

watch(
    () => [props.modelValue, props.project?.id] as const,
    ([isOpen, projectId]) => {
        if (isOpen && projectId) {
            loadExistingFiles();
        } else if (!isOpen) {
            clearSelectedFiles();
            existingFiles.value = [];
            showPreview.value = false;
            previewingFile.value = null;
        }
    },
    { immediate: true }
);

const canManageProjectState = computed(() => canAssignAnyUser.value);

const userDisplayName = (appUser: Pick<AppUser, "displayName" | "email">) =>
    appUser.displayName || appUser.email || "Usuario sin nombre";

const currentUserOption = computed(() => {
    if (!user.value) return null;
    if (!currentUserProfile.value) return null;

    return {
        value: currentUserProfile.value.id,
        label:
            currentUserProfile.value?.displayName ||
            user.value.displayName ||
            user.value.email ||
            "Usuario actual",
    };
});

const assigneeOptions = computed(() => {
    const options = canAssignAnyUser.value
        ? users.value.map((appUser) => {
            return {
              value: appUser.id,
              label: userDisplayName(appUser),
          };
        })
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

const availableSubStates = computed(() => {
    const currentState = projectStates.value.find((s) => s.id === form.estado);
    return currentState?.sub_state || [];
});

const isValid = computed(
    () =>
        form.proyecto &&
        form.ciudad &&
        form.encargado &&
        form.sub_state,
);

const handleSubmit = async () => {
    if (!isValid.value || isUploading.value) return;
    
    isUploading.value = true;
    uploadError.value = null;

    try {
        const uploadedFileResults = [];
        if (selectedFiles.value.length > 0) {
            for (const file of selectedFiles.value) {
                const uploaded = await upload(file);
                uploadedFileResults.push(uploaded);
            }
        }

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
            ...(uploadedFileResults.length > 0 ? { files: uploadedFileResults } : {}),
        } as Omit<Project, "id">);

        emit("update:modelValue", false);
    } catch (err: any) {
        console.error("Error al subir archivos:", err);
        uploadError.value = err?.message || "Ocurrió un error al subir los archivos.";
    } finally {
        isUploading.value = false;
    }
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
