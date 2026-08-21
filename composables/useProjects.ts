// composables/useProjects.ts
export interface Project {
    id?: string;
    proyecto: string;
    pais: string;
    ciudad: string;
    direccion: string;
    fechaCreacion: string;
    fechaDespacho?: string;
    fechaInstalacion: string;
    diasAcordados?: number | null;
    encargado: string;
    sub_state?: string;
    estado?: ProjectStateId | string;
    valorTotal?: number | null;
    porcentajesPago?: string;
    pagosRealizados?: number[];
    notas?: string;
    // created_by?: unknown;
    // createdByRef?: unknown;
    // createdByUid?: string;
    // createdByEmail?: string;
    // createdByName?: string;
    createdAt?: string;
}

export const PROJECT_STATES = {
    IN_PROGRESS: {
        id: 1,
        label: "En tramite",
    },
    SOLD: {
        id: 2,
        label: "Vendido",
    },
} as const;

export type ProjectStateId =
    (typeof PROJECT_STATES)[keyof typeof PROJECT_STATES]["id"];

export const projectStateLabel = (state?: Project["estado"]) => {
    const numericState = Number(state);
    const match = Object.values(PROJECT_STATES).find(
        (projectState) => projectState.id === numericState,
    );

    return match?.label || "";
};

const projectPayloadWithState = <T extends Partial<Project>>(data: T): T => {
    const subState = String(data.sub_state || "").trim().toLowerCase();

    if (subState === "facturado") {
        return {
            ...data,
            estado: PROJECT_STATES.SOLD.id,
        };
    }

    return data;
};

const normalizeProject = (project: Project): Project => ({
    fechaDespacho: "",
    diasAcordados: null,
    valorTotal: null,
    porcentajesPago: "",
    notas: "",
    estado: PROJECT_STATES.IN_PROGRESS.id,
    // createdByUid: "",
    // createdByEmail: "",
    // createdByName: "",
    createdAt: "",
    ...project,
    sub_state:
        project.sub_state ||
        (typeof project.estado === "string" ? project.estado : ""),
    pagosRealizados: Array.isArray(project.pagosRealizados)
        ? project.pagosRealizados
            .map(Number)
            .filter((value) => Number.isInteger(value) && value >= 0)
        : [],
});

export const projectSubState = (project: Project) =>
    project.sub_state ||
    (typeof project.estado === "string" ? project.estado : "");

const subStateMap = new Map<number, string>();
const subStateNameToIdMap = new Map<string, number>();

const mapDbToProject = (row: any, subStates: Map<number, string>): Project => {
    let subStateStr = "";
    if (row["sub_state"] && subStates.has(row["sub_state"])) {
        subStateStr = subStates.get(row["sub_state"]) || "";
    } else {
        subStateStr = String(row["sub_state"] || "");
    }

    let pagosArr: number[] = [];
    if (Array.isArray(row.payments_completed)) {
        pagosArr = row.payments_completed.map(Number).filter(Number.isFinite);
    }

    return {
        id: String(row.id),
        proyecto: row.name || "",
        pais: row.country || "",
        ciudad: row.city || "",
        direccion: row.address || "",
        fechaCreacion: row.request_date || "",
        fechaDespacho: row.shipment_date || "",
        fechaInstalacion: row.installation_date || "",
        diasAcordados: row.agreed_days,
        encargado: row.reponsible || "",
        estado: row.state || PROJECT_STATES.IN_PROGRESS.id,
        sub_state: subStateStr,
        valorTotal: row.total_value,
        porcentajesPago: row.agreed_percentages || "",
        pagosRealizados: pagosArr,
        notas: row.notes || "",
        // createdByUid: row.reponsible_id ? String(row.reponsible_id) : "",
        // createdByEmail: row.created_by_email || "",
        // createdByName: row.created_by_name || row.reponsible || "",
        createdAt: row.created_at || "",
    };
};

const mapProjectToDb = (project: any, nameToIdMap: Map<string, number>) => {
    let subStateId: number | null | undefined = undefined;
    if (project.sub_state !== undefined) {
        const subStateNameLower = String(project.sub_state || "").trim().toLowerCase();
        if (subStateNameLower && nameToIdMap.has(subStateNameLower)) {
            subStateId = nameToIdMap.get(subStateNameLower) || null;
        } else if (Number.isInteger(Number(project.sub_state))) {
            subStateId = Number(project.sub_state);
        } else {
            subStateId = null;
        }
    }

    const result: any = {};
    if (project.proyecto !== undefined) result.name = project.proyecto;
    if (project.pais !== undefined) result.country = project.pais;
    if (project.ciudad !== undefined) result.city = project.ciudad;
    if (project.direccion !== undefined) result.address = project.direccion;
    if (project.fechaCreacion !== undefined) result.request_date = project.fechaCreacion || null;
    if (project.fechaDespacho !== undefined) result.shipment_date = project.fechaDespacho || null;
    if (project.fechaInstalacion !== undefined) result.installation_date = project.fechaInstalacion || null;
    if (project.diasAcordados !== undefined) result.agreed_days = project.diasAcordados;
    if (project.encargado !== undefined) result.reponsible = project.encargado;
    if (project.estado !== undefined) result.state = project.estado !== null ? Number(project.estado) : null;
    if (project.sub_state !== undefined) result["sub_state"] = subStateId;
    if (project.valorTotal !== undefined) result.total_value = project.valorTotal !== null ? Number(project.valorTotal) : 0;
    if (project.porcentajesPago !== undefined) result.agreed_percentages = project.porcentajesPago;
    if (project.pagosRealizados !== undefined) result.payments_completed = project.pagosRealizados;
    if (project.notas !== undefined) result.notes = project.notas;

    return result;
};

export function useProjects() {
    const projects = ref<Project[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const useFirebase = ref(false);
    const client = useSupabaseClient();
    let projectsChannel: any = null;

    const loadSubStates = async () => {
        try {
            const { data, error } = await client.from("sub_state").select("id, name");
            if (!error && data) {
                subStateMap.clear();
                subStateNameToIdMap.clear();
                data.forEach((row: any) => {
                    if (row.id && row.name) {
                        subStateMap.set(row.id, row.name);
                        subStateNameToIdMap.set(row.name.toLowerCase().trim(), row.id);
                    }
                });
            }
        } catch (e) {
            console.warn("Could not load sub_states mapping:", e);
        }
    };

    const loadProjects = async () => {
        loading.value = true;
        error.value = null;

        try {
            await loadSubStates();

            const { user, initAuth } = useAuth();
            const { currentUserProfile, loadCurrentUserProfile } = useUsers();
            const { getIsAdminUser } = useAccess();
            await initAuth();

            if (user.value) {
                if (!currentUserProfile.value) {
                    await loadCurrentUserProfile();
                }
                const profile = currentUserProfile.value;
                const canSeeAllProjects = await getIsAdminUser(profile);

                let query = client.from("projects").select("*").is("deleted_at", null);

                if (!canSeeAllProjects && profile) {
                    query = query.eq("reponsible_id", Number(profile.id));
                }

                const { data, error: err } = await query;
                if (err) throw err;

                projects.value = (data || [])
                    .map((row: any) => mapDbToProject(row, subStateMap))
                    .sort((a: Project, b: Project) =>
                        a.proyecto.localeCompare(b.proyecto, "es", {
                            sensitivity: "base",
                        }),
                    );

                // Set up real-time subscription
                if (!projectsChannel) {
                    projectsChannel = client
                        .channel(`projects-changes-${Date.now()}-${Math.random()}`)
                        .on(
                            "postgres_changes",
                            { event: "*", schema: "public", table: "projects" },
                            (payload) => {
                                // console.log("Realtime event received! Payload:", payload);
                                const eventType = payload.eventType;

                                if (eventType === "INSERT" && payload.new) {
                                    const newProject = mapDbToProject(payload.new, subStateMap);
                                    projects.value.push(newProject);
                                    projects.value.sort((a, b) => a.proyecto.localeCompare(b.proyecto, "es", { sensitivity: "base" }));
                                } else if (eventType === "UPDATE" && payload.new) {
                                    const index = projects.value.findIndex(p => p.id === String(payload.new.id));
                                    if (payload.new.deleted_at) {
                                        if (index !== -1) {
                                            projects.value.splice(index, 1);
                                        }
                                    } else {
                                        if (index !== -1) {
                                            projects.value[index] = mapDbToProject(payload.new, subStateMap);
                                            projects.value.sort((a, b) => a.proyecto.localeCompare(b.proyecto, "es", { sensitivity: "base" }));
                                        }
                                    }
                                } else if (eventType === "DELETE" && payload.old) {
                                    const index = projects.value.findIndex(p => p.id === String(payload.old.id));
                                    if (index !== -1) {
                                        projects.value.splice(index, 1);
                                    }
                                }
                            },
                        )
                        .subscribe((status) => {
                            console.log("Supabase Realtime subscription status:", status);
                        });
                }
            } else {
                projects.value = [];
            }
        } catch (err) {
            console.error("Projects load error:", err);
            projects.value = [];
            error.value = "No se pudieron cargar los proyectos.";
        } finally {
            loading.value = false;
        }
    };

    const addProject = async (project: Omit<Project, "id">) => {
        try {
            const projectWithState = projectPayloadWithState(project);
            const { user, initAuth } = useAuth();
            const { currentUserProfile, loadCurrentUserProfile } = useUsers();
            await initAuth();

            if (user.value) {
                if (!currentUserProfile.value) {
                    await loadCurrentUserProfile();
                }
                const profile = currentUserProfile.value;

                const payload = mapProjectToDb(projectWithState, subStateNameToIdMap);
                payload.reponsible_id = profile ? Number(profile.id) : null;
                if (!payload.reponsible) {
                    payload.reponsible = profile ? profile.displayName : user.value.email || "";
                }
                // payload.created_by = profile ? Number(profile.id) : null;
                // payload.created_by_email = user.value.email || "";
                // payload.created_by_name = profile ? profile.displayName : "";

                const { error: err } = await client.from("projects").insert(payload);
                if (err) throw err;
            }
        } catch (e) {
            console.error("Error adding project:", e);
        }
    };

    const updateProject = async (id: string, data: Partial<Project>) => {
        try {
            const dataWithState = projectPayloadWithState(data);
            const payload = mapProjectToDb(dataWithState, subStateNameToIdMap);

            const currentProject = projects.value.find(p => p.id === String(id));
            const currentStateId = payload.state !== undefined
                ? payload.state
                : (currentProject ? Number(currentProject.estado) : undefined);

            if (currentStateId === 1 && payload.sub_state === 10) {
                payload.state = 2;
            }

            // Filter out undefined keys to prevent updating them
            const cleanPayload: any = {};
            for (const key of Object.keys(payload)) {
                if (payload[key] !== undefined) {
                    cleanPayload[key] = payload[key];
                }
            }

            const { error: err } = await client
                .from("projects")
                .update(cleanPayload)
                .eq("id", Number(id));

            if (err) throw err;
        } catch (e) {
            console.error("Error updating project:", e);
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const { error: err } = await client
                .from("projects")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", Number(id));

            if (err) throw err;
        } catch (e) {
            console.error("Error deleting project:", e);
        }
    };

    // Computed stats
    const stats = computed(() => {
        const now = new Date();
        const currentYear = String(now.getFullYear());
        const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const total = projects.value.length;
        const byStatus = projects.value.reduce(
            (acc, p) => {
                const subState = projectSubState(p) || "Sin estado";
                acc[subState] = (acc[subState] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const byCity = projects.value.reduce(
            (acc, p) => {
                const city = p.ciudad || "Sin ciudad";
                acc[city] = (acc[city] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const byResponsible = projects.value.reduce(
            (acc, p) => {
                acc[p.encargado] = (acc[p.encargado] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const byMonth = projects.value.reduce(
            (acc, p) => {
                const month = p.fechaCreacion.slice(0, 7);
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const valueByMonth = projects.value.reduce(
            (acc, p) => {
                if (Number(p.estado) === PROJECT_STATES.IN_PROGRESS.id)
                    return acc;

                const month = p.fechaCreacion.slice(0, 7);
                acc[month] = (acc[month] || 0) + Number(p.valorTotal || 0);
                return acc;
            },
            {} as Record<string, number>,
        );
        const totalSoldCurrentYear = projects.value.reduce((sum, p) => {
            if (
                Number(p.estado) === PROJECT_STATES.IN_PROGRESS.id ||
                !p.fechaCreacion.startsWith(currentYear)
            )
                return sum;

            return sum + Number(p.valorTotal || 0);
        }, 0);
        const totalSoldCurrentMonth = projects.value.reduce((sum, p) => {
            if (
                Number(p.estado) === PROJECT_STATES.IN_PROGRESS.id ||
                !p.fechaCreacion.startsWith(currentMonth)
            )
                return sum;

            return sum + Number(p.valorTotal || 0);
        }, 0);

        const active = projects.value.filter(
            (p) => projectSubState(p).trim().toLowerCase() !== "facturado",
        ).length;
        const completed = projects.value.filter(
            (p) => projectSubState(p).trim().toLowerCase() === "instalado",
        ).length;
        const closed = projects.value.filter(
            (p) => projectSubState(p).trim().toLowerCase() === "facturado",
        ).length;

        return {
            total,
            byStatus,
            byCity,
            byResponsible,
            byMonth,
            valueByMonth,
            totalSoldCurrentYear,
            totalSoldCurrentMonth,
            active,
            completed,
            closed,
        };
    });

    onScopeDispose(() => {
        if (projectsChannel) {
            client.removeChannel(projectsChannel);
            projectsChannel = null;
        }
    });

    return {
        projects,
        loading,
        error,
        stats,
        loadProjects,
        addProject,
        updateProject,
        deleteProject,
        useFirebase,
    };
}
