<!-- components/modals/PreviewModal.vue -->
<template>
    <Teleport to="body">
        <Transition name="preview-modal">
            <div
                v-if="modelValue && (activeFile || resolvedUrl)"
                class="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6"
                @click.self="handleClose"
            >
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="handleClose"></div>

                <!-- Modal Window -->
                <div
                    class="relative z-10 flex flex-col w-full glass-card border-white/10 shadow-2xl overflow-hidden transition-all duration-300 bg-obsidian-950/95"
                    :class="isFullscreen ? 'fixed inset-0 rounded-none h-screen w-screen z-50' : 'max-w-5xl h-[88vh] rounded-2xl'"
                >
                    <!-- Header Bar -->
                    <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.08] bg-obsidian-900/90 shrink-0">
                        <!-- File info -->
                        <div class="flex items-center gap-3 min-w-0 pr-2">
                            <span
                                class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 text-xs font-mono font-bold"
                                :class="isPdf ? 'bg-red-500/15 text-red-400 border border-red-500/25' : isImage ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'bg-white/5 text-obsidian-300 border border-white/10'"
                            >
                                {{ isPdf ? 'PDF' : isImage ? 'IMG' : 'DOC' }}
                            </span>
                            <div class="min-w-0">
                                <h3 class="font-display font-bold text-white text-sm leading-tight truncate" :title="displayName">
                                    {{ displayName }}
                                </h3>
                                <p class="text-[11px] font-mono text-obsidian-400 flex items-center gap-1.5 mt-0.5">
                                    <span v-if="displaySize">{{ formatBytes(displaySize) }}</span>
                                    <span v-if="displaySize">&bull;</span>
                                    <span class="text-emerald-400/90">Visualizando en CRM</span>
                                </p>
                            </div>
                        </div>

                        <!-- Actions Toolbar -->
                        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <!-- Image Zoom controls (only for images) -->
                            <div v-if="isImage" class="hidden sm:flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg p-0.5 mr-1">
                                <button
                                    type="button"
                                    class="w-7 h-7 flex items-center justify-center rounded text-obsidian-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                                    :disabled="imageZoom <= 0.5"
                                    title="Alejar (-)"
                                    @click="zoomOut"
                                >
                                    -
                                </button>
                                <span class="px-1.5 text-[11px] font-mono text-obsidian-300 min-w-[3rem] text-center select-none">
                                    {{ Math.round(imageZoom * 100) }}%
                                </span>
                                <button
                                    type="button"
                                    class="w-7 h-7 flex items-center justify-center rounded text-obsidian-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                                    :disabled="imageZoom >= 3"
                                    title="Acercar (+)"
                                    @click="zoomIn"
                                >
                                    +
                                </button>
                                <button
                                    v-if="imageZoom !== 1"
                                    type="button"
                                    class="text-[10px] font-mono text-acid-300 px-1.5 py-0.5 hover:underline"
                                    title="Restablecer tamaño original"
                                    @click="resetZoom"
                                >
                                    100%
                                </button>
                            </div>

                            <!-- Fullscreen toggle -->
                            <button
                                type="button"
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-obsidian-400 hover:text-white transition-colors"
                                :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
                                @click="toggleFullscreen"
                            >
                                <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                                </svg>
                            </button>

                            <!-- Download button -->
                            <button
                                v-if="showDownload"
                                type="button"
                                class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-obsidian-200 hover:text-white transition-colors disabled:opacity-50"
                                title="Descargar archivo"
                                :disabled="downloading"
                                @click="handleDownload"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span class="hidden sm:inline">{{ downloading ? "Descargando..." : "Descargar" }}</span>
                            </button>

                            <!-- Close button -->
                            <button
                                type="button"
                                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-obsidian-300 hover:text-white transition-colors text-lg font-bold ml-1"
                                aria-label="Cerrar vista previa"
                                title="Cerrar (Esc)"
                                @click="handleClose"
                            >
                                &times;
                            </button>
                        </div>
                    </div>

                    <!-- Viewer Content Area -->
                    <div class="relative flex-1 min-h-0 bg-obsidian-950/70 overflow-hidden flex items-center justify-center">
                        <!-- Loading State -->
                        <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 p-8 text-obsidian-300 font-mono text-xs">
                            <span class="animate-spin text-2xl">🌀</span>
                            <span>Cargando previsualización...</span>
                        </div>

                        <!-- PDF Viewer -->
                        <div v-else-if="isPdf && resolvedUrl" class="w-full h-full p-2">
                            <iframe
                                :src="resolvedUrl"
                                class="w-full h-full rounded-xl border border-white/10 bg-white"
                                title="Vista previa de documento PDF"
                            />
                        </div>

                        <!-- Image Viewer -->
                        <div
                            v-else-if="isImage && resolvedUrl"
                            class="w-full h-full overflow-auto flex items-center justify-center p-4 select-none"
                            @dblclick="resetZoom"
                        >
                            <img
                                :src="resolvedUrl"
                                :alt="displayName"
                                class="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
                                :style="{ transform: `scale(${imageZoom})` }"
                            />
                        </div>

                        <!-- Fallback / Unsupported File Type -->
                        <div v-else class="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md">
                            <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                                📄
                            </div>
                            <div>
                                <p class="text-white font-display font-medium text-base mb-1">
                                    Vista previa directa no disponible
                                </p>
                                <p class="text-xs text-obsidian-400 font-mono">
                                    Este tipo de archivo no admite vista previa embebida, pero puedes descargarlo en tu equipo.
                                </p>
                            </div>
                            <button
                                v-if="showDownload"
                                type="button"
                                class="btn-primary flex items-center gap-2"
                                :disabled="downloading"
                                @click="handleDownload"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>{{ downloading ? "Descargando..." : "Descargar archivo" }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useStorageUpload } from "~/composables/useStorageUpload";

export interface PreviewFileItem {
    id?: number | string;
    name: string;
    size?: number | null;
    mime_type?: string | null;
    storage_path?: string | null;
    url?: string | null;
}

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        file?: PreviewFileItem | null;
        url?: string | null;
        fileName?: string;
        fileSize?: number | null;
        mimeType?: string | null;
        loading?: boolean;
        showDownload?: boolean;
    }>(),
    {
        file: null,
        url: null,
        fileName: "",
        fileSize: null,
        mimeType: null,
        loading: false,
        showDownload: true,
    }
);

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    close: [];
    download: [file: PreviewFileItem | null];
}>();

const { createSignedUrl, download } = useStorageUpload();

const activeFile = computed(() => props.file);
const internalUrl = ref<string>("");
const isInternalBlob = ref(false);
const internalLoading = ref(false);
const downloading = ref(false);
const isFullscreen = ref(false);
const imageZoom = ref(1);

const resolvedUrl = computed(() => props.url || internalUrl.value);
const isLoading = computed(() => props.loading || internalLoading.value);

const displayName = computed(() => {
    return props.file?.name || props.fileName || "Archivo";
});

const displaySize = computed(() => {
    return props.file?.size ?? props.fileSize ?? null;
});

const effectiveMime = computed(() => {
    return (props.file?.mime_type || props.mimeType || "").toLowerCase();
});

const isPdf = computed(() => {
    if (effectiveMime.value === "application/pdf") return true;
    const name = displayName.value.toLowerCase();
    return name.endsWith(".pdf");
});

const isImage = computed(() => {
    if (effectiveMime.value.startsWith("image/")) return true;
    const name = displayName.value.toLowerCase();
    const ext = name.split(".").pop();
    return ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext || "");
});

const zoomIn = () => {
    imageZoom.value = Math.min(Number((imageZoom.value + 0.25).toFixed(2)), 3);
};

const zoomOut = () => {
    imageZoom.value = Math.max(Number((imageZoom.value - 0.25).toFixed(2)), 0.5);
};

const resetZoom = () => {
    imageZoom.value = 1;
};

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
};

const cleanupBlobUrl = () => {
    if (isInternalBlob.value && internalUrl.value) {
        URL.revokeObjectURL(internalUrl.value);
    }
    internalUrl.value = "";
    isInternalBlob.value = false;
};

const handleClose = () => {
    cleanupBlobUrl();
    imageZoom.value = 1;
    isFullscreen.value = false;
    emit("update:modelValue", false);
    emit("close");
};

// Automatic file loading when storage_path is present and no URL is provided
const loadFileFromStorage = async () => {
    cleanupBlobUrl();
    imageZoom.value = 1;

    if (props.url) {
        return;
    }

    const path = props.file?.storage_path;
    if (!path) return;

    internalLoading.value = true;

    try {
        if (isPdf.value) {
            // For PDFs, downloading blob and creating an Object URL avoids iframe X-Frame/CORS blocks
            try {
                const blob = await download(path);
                if (blob) {
                    const typedBlob = new Blob([blob], { type: "application/pdf" });
                    internalUrl.value = URL.createObjectURL(typedBlob);
                    isInternalBlob.value = true;
                }
            } catch (blobErr) {
                console.warn("Blob download failed, fallback to signed URL:", blobErr);
                internalUrl.value = await createSignedUrl(path);
            }
        } else {
            // For images, signed URL is instantaneous
            try {
                internalUrl.value = await createSignedUrl(path);
            } catch (signedErr) {
                console.warn("Signed URL failed, fallback to blob:", signedErr);
                const blob = await download(path);
                if (blob) {
                    const typedBlob = props.file?.mime_type
                        ? new Blob([blob], { type: props.file.mime_type })
                        : blob;
                    internalUrl.value = URL.createObjectURL(typedBlob);
                    isInternalBlob.value = true;
                }
            }
        }
    } catch (err: any) {
        console.error("Error loading preview in PreviewModal:", err);
        const msg = err?.data?.statusMessage || err?.message || "No se pudo cargar la vista previa del archivo.";
        alert(msg);
        handleClose();
    } finally {
        internalLoading.value = false;
    }
};

const handleDownload = async () => {
    emit("download", props.file || null);

    // If storage_path is available, download directly
    if (props.file?.storage_path) {
        downloading.value = true;
        try {
            const blob = await download(props.file.storage_path);
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = props.file.name || "descarga";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 10000);
            }
        } catch (err: any) {
            console.error("Error downloading file:", err);
            alert(err?.data?.statusMessage || err?.message || "Error al descargar el archivo.");
        } finally {
            downloading.value = false;
        }
    } else if (resolvedUrl.value) {
        // Direct download via URL
        const a = document.createElement("a");
        a.href = resolvedUrl.value;
        a.download = displayName.value;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && props.modelValue) {
        event.stopPropagation();
        handleClose();
    }
};

watch(
    () => [props.modelValue, props.file?.storage_path, props.url] as const,
    ([isOpen, path, url]) => {
        if (isOpen) {
            if (!url && path) {
                loadFileFromStorage();
            }
        } else {
            cleanupBlobUrl();
            imageZoom.value = 1;
            isFullscreen.value = false;
        }
    },
    { immediate: true }
);

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
    cleanupBlobUrl();
});

const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
</script>

<style scoped>
.preview-modal-enter-active,
.preview-modal-leave-active {
    transition: opacity 0.2s ease;
}
.preview-modal-enter-active .relative,
.preview-modal-leave-active .relative {
    transition:
        transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
        opacity 0.2s ease;
}
.preview-modal-enter-from,
.preview-modal-leave-to {
    opacity: 0;
}
.preview-modal-enter-from .relative {
    transform: scale(0.97) translateY(6px);
}
.preview-modal-leave-to .relative {
    transform: scale(0.97);
}
</style>
