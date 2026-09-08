<!-- components/ProjectInfoModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="modelValue && project"
                class="fixed inset-0 z-50 flex items-center justify-center p-4"
                @click.self="$emit('update:modelValue', false)"
            >
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                <div class="relative z-10 w-full max-w-2xl glass-card border-white/10 shadow-2xl">
                    <div class="flex items-start justify-between gap-4 p-6 border-b border-white/[0.07]">
                        <div class="min-w-0">
                            <p class="text-xs font-mono uppercase tracking-wider text-obsidian-500 mb-1">
                                Informacion del proyecto
                            </p>
                            <h2 class="font-display font-bold text-white text-lg leading-tight truncate">
                                {{ project.proyecto || "Proyecto sin nombre" }}
                            </h2>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors"
                                aria-label="Editar proyecto"
                                title="Editar proyecto"
                                @click="emitEdit"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="w-4 h-4"
                                    aria-hidden="true"
                                >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors text-lg"
                                aria-label="Cerrar informacion"
                                @click="$emit('update:modelValue', false)"
                            >
                                x
                            </button>
                        </div>
                    </div>

                    <div class="p-6 max-h-[72vh] overflow-y-auto space-y-6">
                        <div class="flex flex-wrap items-center gap-3">
                            <StatusBadge :estado="projectSubState(project)" />
                            <span class="text-xs font-mono text-obsidian-500 border border-white/10 rounded-lg px-2.5 py-1">
                                {{ responsibleName(project.encargado) || "Sin encargado" }}
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <InfoItem label="Pais" :value="project.pais" />
                            <InfoItem label="Ciudad" :value="project.ciudad" />
                            <InfoItem
                                label="Direccion"
                                :value="project.direccion"
                                class="col-span-2"
                            />
                            <InfoItem
                                label="Fecha creacion"
                                :value="formatDate(project.fechaCreacion)"
                            />
                            <InfoItem
                                label="Fecha despacho"
                                :value="formatDate(project.fechaDespacho)"
                            />
                            <InfoItem
                                label="Fecha instalacion"
                                :value="formatDate(project.fechaInstalacion)"
                            />
                            <InfoItem
                                label="Dias acordados"
                                :value="formatNumber(project.diasAcordados)"
                            />
                            <InfoItem
                                label="Valor sub-total"
                                :value="formatCurrency(project.valorTotal)"
                            />
                            <InfoItem
                                label="Porcentajes acordados"
                                :value="project.porcentajesPago"
                            />
                        </div>

                        <div>
                            <p class="text-xs font-mono uppercase tracking-wider text-obsidian-500 mb-2">
                                Notas
                            </p>
                            <p class="min-h-20 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-obsidian-200 whitespace-pre-wrap">
                                {{ project.notas?.trim() || "Sin notas registradas." }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs font-mono uppercase tracking-wider text-obsidian-500 mb-2">
                                Archivos
                            </p>
                            <div class="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-obsidian-200">
                                <div v-if="filesLoading" class="text-xs text-obsidian-400 font-mono py-2 flex items-center gap-2">
                                    <span class="animate-spin text-xs">🌀</span> Cargando archivos...
                                </div>
                                <div v-else-if="filesError" class="text-xs text-red-400 font-mono py-2">
                                    {{ filesError }}
                                </div>
                                <div v-else-if="projectFiles.length === 0" class="text-xs text-obsidian-400 font-mono py-2">
                                    Sin archivos adjuntos.
                                </div>
                                <ul v-else class="space-y-2">
                                    <li
                                        v-for="file in projectFiles"
                                        :key="file.id"
                                        class="flex items-center justify-between px-3 py-2 text-xs font-mono bg-obsidian-800/60 border border-obsidian-700/60 rounded-md hover:border-obsidian-500 transition-colors"
                                    >
                                        <div
                                            class="flex items-center truncate pr-2 cursor-pointer group"
                                            title="Ver archivo"
                                            @click="handleViewFile(file)"
                                        >
                                            <span class="mr-2 shrink-0">
                                                <span v-if="isPdfFile(file)" class="text-red-400">📕</span>
                                                <span v-else-if="isImageFile(file)" class="text-cyan-400">🖼️</span>
                                                <span v-else class="text-obsidian-400">📄</span>
                                            </span>
                                            <span class="text-obsidian-200 truncate group-hover:text-white transition-colors">{{ file.name }}</span>
                                            <span v-if="file.size" class="text-obsidian-500 ml-2 shrink-0">
                                                ({{ formatBytes(file.size) }})
                                            </span>
                                        </div>

                                        <div class="flex items-center gap-2 shrink-0 ml-3">
                                            <button
                                                type="button"
                                                class="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-xs px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center gap-1.5"
                                                @click="handleViewFile(file)"
                                            >
                                                Ver
                                            </button>
                                            <button
                                                type="button"
                                                :disabled="downloadingFileId === file.id"
                                                class="text-obsidian-300 hover:text-white transition-colors font-medium text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50"
                                                @click="handleDownloadFile(file)"
                                            >
                                                {{ downloadingFileId === file.id ? "Descargando..." : "Descargar" }}
                                            </button>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end p-6 border-t border-white/[0.07]">
                        <button
                            type="button"
                            class="btn-ghost"
                            @click="$emit('update:modelValue', false)"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <PreviewModal
            v-model="showPreviewModal"
            :file="previewFile"
        />
    </Teleport>
</template>

<script setup lang="ts">
import { projectSubState, type Project } from "~/composables/useProjects";
import { useProjectFiles, type ProjectFile } from "~/composables/useProjectFiles";
import { useStorageUpload } from "~/composables/useStorageUpload";

const props = defineProps<{
    modelValue: boolean;
    project?: Project | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    edit: [project: Project];
}>();

const { users, loadUsers } = useUsers();
const { projectFiles, loading: filesLoading, error: filesError, fetchFilesByProject } = useProjectFiles();
const { download } = useStorageUpload();

const downloadingFileId = ref<number | null>(null);

// Preview Modal State
const showPreviewModal = ref(false);
const previewFile = ref<ProjectFile | null>(null);

const isImageFile = (file: ProjectFile) => {
    if (file.mime_type?.toLowerCase().startsWith("image/")) return true;
    const ext = file.name?.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext || "");
};

const isPdfFile = (file: ProjectFile) => {
    if (file.mime_type?.toLowerCase() === "application/pdf") return true;
    return file.name?.toLowerCase().endsWith(".pdf") ?? false;
};

const handleViewFile = (file: ProjectFile) => {
    previewFile.value = file;
    showPreviewModal.value = true;
};

const loadFiles = async () => {
    if (!props.project?.id) return;
    const numericId = Number(props.project.id);
    if (numericId) {
        await fetchFilesByProject(numericId);
    }
};

watch(
    () => [props.modelValue, props.project?.id] as const,
    ([isOpen, projectId]) => {
        if (isOpen && projectId) {
            loadFiles();
        } else if (!isOpen) {
            showPreviewModal.value = false;
            previewFile.value = null;
        }
    },
    { immediate: true }
);

onMounted(() => {
    loadUsers();
    if (props.modelValue && props.project?.id) {
        loadFiles();
    }
});

const handleDownloadFile = async (file: ProjectFile) => {
    if (!file.storage_path) return;
    downloadingFileId.value = file.id;

    try {
        const blob = await download(file.storage_path);
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
    } catch (err: any) {
        console.error("Error downloading file:", err);
        const msg = err?.data?.statusMessage || err?.message || "No se pudo descargar el archivo.";
        alert(msg);
    } finally {
        downloadingFileId.value = null;
    }
};

const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const responsibleName = (uid?: string) => {
    if (!uid) return "";
    const appUser = users.value.find((user) => user.uid === uid);
    return appUser?.displayName || appUser?.email || uid;
};

const emitEdit = () => {
    if (!props.project) return;
    emit("edit", props.project);
};

const formatDate = (value?: string) => {
    if (!value) return "Sin fecha";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
};

const formatNumber = (value?: number | null) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return "Sin definir";
    return new Intl.NumberFormat("es-CO").format(value);
};

const formatCurrency = (value?: number | string | null) => {
    const amount = Number(value || 0);
    if (!amount) return "Sin valor";
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
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
