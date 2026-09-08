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

    const cleanPath = (p: string) => {
        if (!p) return "";
        let cleaned = p.trim();
        if (cleaned.startsWith(`${BUCKET}/`)) {
            cleaned = cleaned.slice(BUCKET.length + 1);
        }
        return cleaned.replace(/^\/+/, "");
    };

    const createSignedUrl = async (path: string, expiresIn = 3600): Promise<string> => {
        const sanitized = cleanPath(path);
        if (!sanitized) throw new Error("Ruta de archivo no válida.");

        try {
            const res = await $fetch<{ signedUrl: string }>("/api/storage/sign", {
                method: "POST",
                body: { path: sanitized, expiresIn },
            });
            if (res?.signedUrl) {
                return res.signedUrl;
            }
        } catch (serverErr: any) {
            console.warn("Server sign endpoint failed, falling back to client storage:", serverErr?.message || serverErr);
        }

        const { data, error } = await client.storage
            .from(BUCKET)
            .createSignedUrl(sanitized, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    };

    const download = async (path: string): Promise<Blob> => {
        const sanitized = cleanPath(path);
        if (!sanitized) throw new Error("Ruta de archivo no válida.");

        try {
            const signedUrl = await createSignedUrl(sanitized);
            if (signedUrl) {
                const response = await fetch(signedUrl);
                if (response.ok) {
                    return await response.blob();
                }
            }
        } catch (signedErr: any) {
            console.warn("Could not download via signed URL, falling back to direct storage download:", signedErr?.message || signedErr);
        }

        const { data, error } = await client.storage
            .from(BUCKET)
            .download(sanitized);

        if (error) throw error;
        return data; // returns Blob
    };

    const getPublicUrl = (path: string) => {
        const sanitized = cleanPath(path);
        const { data } = client.storage
            .from(BUCKET)
            .getPublicUrl(sanitized);

        return data.publicUrl;
    };

    return { upload, createSignedUrl, download, getPublicUrl, cleanPath };
}