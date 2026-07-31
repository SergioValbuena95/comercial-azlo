export interface SubState {
    id: number;
    name: string;
    state_id: number;
    created_at?: string;
}

export interface ProjectState {
    id: number;
    name: string;
    created_at?: string;
    sub_state?: SubState[];
    [key: string]: unknown;
}

export interface ProjectStateCreateInput {
    name: string;
}

export type ProjectStateUpdateInput = ProjectStateCreateInput;

export function useProjectStatesTypes() {
    const projectStateType = ref<ProjectState[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const client = useSupabaseClient();
    let projectStateTypesChannel: any = null;

    const loadMainStates = async () => {
        loading.value = true;
        error.value = null;

        try {
            // Load main states
            const { data, error: err } = await (client as any)
                .from("states")
                .select(`
                    *,
                    sub_state (*)
                `)
                .order("id", { ascending: true });

            if (err) throw err;

            projectStateType.value = (data || []);

            if (!projectStateTypesChannel) {
                projectStateTypesChannel = client
                    .channel("states-changes")
                    .on(
                        "postgres_changes",
                        { event: "*", schema: "public", table: "states" },
                        () => {
                            loadMainStates();
                        },
                    )
                    .on(
                        "postgres_changes",
                        { event: "*", schema: "public", table: "sub_state" },
                        () => {
                            loadMainStates();
                        },
                    )
                    .subscribe();
            }
        } catch (err: any) {
            console.error(err);
            error.value = "No se pudieron cargar los estados de los proyectos.";
        } finally {
            loading.value = false;
        }
    };

    const addProjectState = async (data: ProjectStateCreateInput) => {
        const name = data.name.trim();

        if (!name) {
            error.value = "El nombre del estado es obligatorio.";
            throw new Error(error.value);
        }

        try {
            const { data, error: err } = await (client as any)
                .from("states")
                .insert({
                    name,
                })
                .select()
                .single();

            if (err) throw err;
            if (data) {
                projectStateType.value.push({ ...data, sub_state: [] });
            }
        } catch (err) {
            console.error(err);
            error.value = "No se pudo crear el estado.";
            throw err;
        }
    };

    const updateProjectState = async (
        id: number,
        data: ProjectStateUpdateInput,
    ) => {
        const name = data.name.trim();

        if (!name) {
            error.value = "El nombre del estado es obligatorio.";
            throw new Error(error.value);
        }

        try {
            const { error: err } = await (client as any)
                .from("states")
                .update({
                    name,
                })
                .eq("id", id);

            if (err) throw err;
            const index = projectStateType.value.findIndex(s => s.id === id);
            if (index !== -1) {
                projectStateType.value[index].name = name;
            }
        } catch (err) {
            console.error(err);
            error.value = "No se pudo actualizar el estado.";
            throw err;
        }
    };

    const deleteProjectState = async (id: number) => {
        try {
            const { error: err } = await (client as any)
                .from("states")
                .delete()
                .eq("id", id);

            if (err) throw err;
            projectStateType.value = projectStateType.value.filter(s => s.id !== id);
        } catch (err) {
            console.error(err);
            error.value = "No se pudo eliminar el estado.";
            throw err;
        }
    };

    const addSubState = async (state_id: number, name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) throw new Error("El nombre es obligatorio.");

        try {
            const { data, error: err } = await (client as any)
                .from("sub_state")
                .insert({ name: trimmedName, state_id })
                .select()
                .single();

            if (err) throw err;
            if (data) {
                const parentState = projectStateType.value.find(s => s.id === state_id);
                if (parentState) {
                    if (!parentState.sub_state) parentState.sub_state = [];
                    parentState.sub_state.push(data);
                }
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const updateSubState = async (id: number, name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) throw new Error("El nombre es obligatorio.");

        try {
            const { error: err } = await (client as any)
                .from("sub_state")
                .update({ name: trimmedName })
                .eq("id", id);

            if (err) throw err;
            for (const state of projectStateType.value) {
                if (state.sub_state) {
                    const subIndex = state.sub_state.findIndex(s => s.id === id);
                    if (subIndex !== -1) {
                        state.sub_state[subIndex].name = trimmedName;
                        break;
                    }
                }
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteSubState = async (id: number) => {
        try {
            const { error: err } = await (client as any)
                .from("sub_state")
                .delete()
                .eq("id", id);

            if (err) throw err;
            for (const state of projectStateType.value) {
                if (state.sub_state) {
                    const subIndex = state.sub_state.findIndex(s => s.id === id);
                    if (subIndex !== -1) {
                        state.sub_state.splice(subIndex, 1);
                        break;
                    }
                }
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    onScopeDispose(() => {
        if (projectStateTypesChannel) {
            client.removeChannel(projectStateTypesChannel);
            projectStateTypesChannel = null;
        }
    });

    return {
        projectStateType,
        loading,
        error,
        loadMainStates,
        addProjectState,
        updateProjectState,
        deleteProjectState,
        addSubState,
        updateSubState,
        deleteSubState,
    };
}
