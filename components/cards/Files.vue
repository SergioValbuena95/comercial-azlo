<template>
    <ul class="space-y-2">
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

    <PreviewModal
        v-model="showPreviewModal"
        :file="previewFile"
    />
</template>

<script setup lang="ts">
import type { ProjectFile } from "~/composables/useProjectFiles";

const { download } = useStorageUpload();

const props = withDefaults(defineProps<{
    projectFiles: ProjectFile[];
}>(), {
    projectFiles: () => [],
});

const emit = defineEmits<{
    close: [];
}>();

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

const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const downloadingFileId = ref<number | null>(null);

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
</script>
