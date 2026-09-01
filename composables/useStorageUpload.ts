import type { Database } from "~/types/database.types";

const BUCKET = "azlo";
const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6 MB

const ACCEPTED_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export type UploadedFile = {
    bucket: typeof BUCKET;
    path: string;
    name: string;
    mimeType: string;
    size: number;
};

export function useStorageUpload() {
    const client = useSupabaseClient<Database>();

    const upload = async (file: File): Promise<UploadedFile> => {
        if (!ACCEPTED_TYPES.has(file.type)) {
            throw new Error("Solo se permiten imágenes JPG, PNG, WEBP, GIF o archivos PDF.");
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error("El archivo no puede superar 6 MB.");
        }

        const { data: authData, error: authError } = await client.auth.getUser();

        if (authError || !authData.user) {
            throw new Error("Debes iniciar sesión para subir archivos.");
        }

        const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
        const path = [
            authData.user.id,
            new Date().getFullYear(),
            String(new Date().getMonth() + 1).padStart(2, "0"),
            `${crypto.randomUUID()}.${extension}`,
        ].join("/");

        const { data, error } = await client.storage
            .from(BUCKET)
            .upload(path, file, {
                cacheControl: "3600",
                contentType: file.type,
                upsert: false,
            });

        if (error) throw error;

        return {
            bucket: BUCKET,
            path: data.path,
            name: file.name,
            mimeType: file.type,
            size: file.size,
        };
    };

    const createSignedUrl = async (path: string, expiresIn = 3600) => {
        const { data, error } = await client.storage
            .from(BUCKET)
            .createSignedUrl(path, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    };

    return { upload, createSignedUrl };
}