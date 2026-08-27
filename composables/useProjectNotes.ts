import type { Tables } from "~/types/database.types";

type Note = Tables<"notes">;

export const useProjectNotes = () => {
    const client = useSupabaseClient();

    const historialNotes = ref<Note[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchNotes = async (projectId: number) => {
        loading.value = true;
        error.value = null;
        historialNotes.value = [];

        try {
            const { data, error: supabaseError } = await client
                .from("notes")
                .select("*")
                .eq("project_id", projectId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (supabaseError) throw supabaseError;

            historialNotes.value = data ?? [];
        } catch (err) {
            console.error("Error fetching project notes:", err);
            error.value = err instanceof Error ? err.message : "Failed to fetch project notes";
            historialNotes.value = [];
        } finally {
            loading.value = false;
        }
    };

    const addNote = async (projectId: number, note: string): Promise<Note | null> => {
        error.value = null;

        try {
            const { data, error: supabaseError } = await client
                .from("notes")
                .insert({
                    project_id: projectId,
                    note,
                })
                .select()
                .single();

            if (supabaseError) throw supabaseError;

            historialNotes.value.unshift(data);
            return data;
        } catch (err) {
            console.error("Error adding project note:", err);
            error.value = err instanceof Error ? err.message : "Failed to add project note";
            return null;
        }
    };

    return {
        historialNotes,
        loading,
        error,
        fetchNotes,
        addNote,
    };
};
