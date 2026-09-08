import type { Database, Tables, TablesInsert } from "~/types/database.types";
import type { UploadedFile } from "~/composables/useStorageUpload";

export type ProjectFile = Tables<"project_files">;
export type ProjectFileInsert = TablesInsert<"project_files">;

export const useProjectFiles = () => {
    const client = useSupabaseClient<Database>();

    const projectFiles = ref<ProjectFile[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchFilesByProject = async (projectId: number): Promise<ProjectFile[]> => {
        loading.value = true;
        error.value = null;
        projectFiles.value = [];

        try {
            const { data, error: supabaseError } = await client
                .from("project_files")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            if (supabaseError) throw supabaseError;

            projectFiles.value = data ?? [];
            return projectFiles.value;
        } catch (err) {
            console.error("Error fetching project files:", err);
            error.value = err instanceof Error ? err.message : "Error al cargar archivos del proyecto";
            projectFiles.value = [];
            return [];
        } finally {
            loading.value = false;
        }
    };

    const saveProjectFiles = async (
        projectId: number,
        files: UploadedFile[],
        createdById?: number | null
    ): Promise<ProjectFile[]> => {
        if (!files || files.length === 0) return [];

        loading.value = true;
        error.value = null;

        try {
            const records: ProjectFileInsert[] = files.map((file) => ({
                project_id: projectId,
                name: file.name,
                storage_path: file.path,
                mime_type: file.mimeType || null,
                size: file.size ?? null,
                created_by: createdById ?? null,
            }));

            const { data, error: supabaseError } = await client
                .from("project_files")
                .insert(records)
                .select();

            if (supabaseError) throw supabaseError;

            if (data) {
                projectFiles.value.unshift(...data);
            }
            return data ?? [];
        } catch (err) {
            console.error("Error saving project files:", err);
            error.value = err instanceof Error ? err.message : "Error al guardar información de archivos";
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteProjectFile = async (id: number): Promise<boolean> => {
        loading.value = true;
        error.value = null;

        try {
            const { error: supabaseError } = await client
                .from("project_files")
                .delete()
                .eq("id", id);

            if (supabaseError) throw supabaseError;

            projectFiles.value = projectFiles.value.filter((file) => file.id !== id);
            return true;
        } catch (err) {
            console.error("Error deleting project file:", err);
            error.value = err instanceof Error ? err.message : "Error al eliminar archivo";
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        projectFiles,
        loading,
        error,
        fetchFilesByProject,
        saveProjectFiles,
        deleteProjectFile,
    };
};
