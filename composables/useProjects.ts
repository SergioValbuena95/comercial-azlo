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
    created_by?: unknown;
    createdByRef?: unknown;
    createdByUid?: string;
    createdByEmail?: string;
    createdByName?: string;
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

// Seed data from CSV
const SEED_DATA: Omit<Project, "id">[] = [
    {
        proyecto: "CLUB NAVAL DE OFICIALES",
        pais: "Colombia",
        ciudad: "Cartagena",
        direccion: "Cartagena",
        fechaCreacion: "2026-07-24",
        fechaInstalacion: "2026-10-02",
        encargado: "Tatiana Ortega",
        sub_state: "Vendido",
    },
    {
        proyecto: "DESINFUR SAS",
        pais: "Colombia",
        ciudad: "Concepción",
        direccion: "Av. Principal #53-38",
        fechaCreacion: "2026-01-13",
        fechaInstalacion: "2026-04-14",
        encargado: "Tatiana Ortega",
        sub_state: "Vendido",
    },
    {
        proyecto: "Residencial Nexus 3",
        pais: "Colombia",
        ciudad: "Trujillo",
        direccion: "Av. Principal #99-14",
        fechaCreacion: "2026-11-24",
        fechaInstalacion: "2026-01-01",
        encargado: "Tatiana Ortega",
        sub_state: "Vendido",
    },
    {
        proyecto: "Hospital Nexus 4",
        pais: "Colombia",
        ciudad: "CDMX",
        direccion: "Av. Principal #96-98",
        fechaCreacion: "2026-09-16",
        fechaInstalacion: "2026-11-14",
        encargado: "Tatiana Ortega",
        sub_state: "Vendido",
    },
    {
        proyecto: "Hospital Nexus 5",
        pais: "Colombia",
        ciudad: "Puebla",
        direccion: "Av. Principal #36-72",
        fechaCreacion: "2026-03-03",
        fechaInstalacion: "2026-06-06",
        encargado: "Tatiana Ortega",
        estado: "Vendido instalación",
    },
];

const normalizeProject = (project: Project): Project => ({
    fechaDespacho: "",
    diasAcordados: null,
    valorTotal: null,
    porcentajesPago: "",
    notas: "",
    estado: PROJECT_STATES.IN_PROGRESS.id,
    createdByUid: "",
    createdByEmail: "",
    createdByName: "",
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

export function useProjects() {
    const projects = ref<Project[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const useFirebase = ref(false);
    let unsubscribeProjects: (() => void) | null = null;

    // Load only projects created by the current Firebase user.
    const loadProjects = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $db, $firebase } = useNuxtApp() as any;
            const { user, initAuth } = useAuth();
            const { getUser } = useUsers();
            const { getIsAdminUser } = useAccess();
            await initAuth();

            if ($db && $firebase && user.value) {
                const currentUserProfile = await getUser(user.value.uid);
                const canSeeAllProjects =
                    await getIsAdminUser(currentUserProfile);
                const currentUserRef = $firebase.doc(
                    $db,
                    "users",
                    user.value.uid,
                );
                const projectsCollection = $firebase.collection(
                    $db,
                    "projects",
                );
                const q = canSeeAllProjects
                    ? $firebase.query(projectsCollection)
                    : $firebase.query(
                          projectsCollection,
                          $firebase.where("created_by", "==", currentUserRef),
                      );

                // Use onSnapshot for real-time updates
                unsubscribeProjects?.();
                unsubscribeProjects = $firebase.onSnapshot(
                    q,
                    (snapshot: any) => {
                        projects.value = snapshot.docs
                            .map((doc: any) => ({
                                id: doc.id,
                                ...doc.data(),
                            }))
                            .map(normalizeProject);
                        useFirebase.value = true;
                        loading.value = false;
                    },
                    (err: any) => {
                        console.error("Firebase projects error:", err);
                        projects.value = [];
                        error.value =
                            "No se pudieron cargar los proyectos desde Firebase.";
                        loading.value = false;
                    },
                );
            } else {
                projects.value = [];
                loading.value = false;
            }
        } catch (err) {
            console.error("Projects load error:", err);
            projects.value = [];
            error.value = "No se pudieron cargar los proyectos.";
            loading.value = false;
        }
    };

    const seedToFirebase = async (db: any, firebase: any) => {
        try {
            for (const project of SEED_DATA) {
                await firebase.addDoc(
                    firebase.collection(db, "projects"),
                    normalizeProject(project),
                );
            }
        } catch (e) {
            console.warn("Could not seed Firebase:", e);
            projects.value = SEED_DATA.map((p, i) =>
                normalizeProject({ ...p, id: String(i + 1) }),
            );
            loading.value = false;
        }
    };

    const addProject = async (project: Omit<Project, "id">) => {
        try {
            const projectWithState = projectPayloadWithState(project);
            const { $db, $firebase } = useNuxtApp() as any;
            const { user, initAuth } = useAuth();
            const { getUser } = useUsers();
            await initAuth();

            const currentUser = user.value;
            const currentUserProfile = currentUser
                ? await getUser(currentUser.uid)
                : null;
            const projectWithCreator = currentUser
                  ? {
                        ...projectWithState,
                      encargado: projectWithState.encargado || currentUser.uid,
                      created_by: $firebase.doc(
                          $db,
                          "users",
                          currentUser.uid,
                      ),
                      createdByRef: $firebase.doc(
                          $db,
                          "users",
                          currentUser.uid,
                      ),
                      createdByUid: currentUser.uid,
                      createdByEmail: currentUser.email || "",
                      createdByName:
                          currentUserProfile?.displayName ||
                          currentUser.displayName ||
                          currentUser.email ||
                          "",
                      createdAt: new Date().toISOString(),
                  }
                : projectWithState;

            if ($db && $firebase && useFirebase.value) {
                await $firebase.addDoc(
                    $firebase.collection($db, "projects"),
                    projectWithCreator,
                );
            } else {
                projects.value.unshift(
                    normalizeProject({
                        ...projectWithCreator,
                        id: Date.now().toString(),
                    }),
                );
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateProject = async (id: string, data: Partial<Project>) => {
        const dataWithState = projectPayloadWithState(data);
        const idx = projects.value.findIndex((p) => p.id === id);
        if (idx !== -1) {
            projects.value[idx] = normalizeProject({
                ...projects.value[idx],
                ...dataWithState,
            });
        }

        try {
            const { $db, $firebase } = useNuxtApp() as any;
            if ($db && $firebase && useFirebase.value) {
                await $firebase.updateDoc(
                    $firebase.doc($db, "projects", id),
                    dataWithState,
                );
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const { $db, $firebase } = useNuxtApp() as any;
            if ($db && $firebase && useFirebase.value) {
                await $firebase.deleteDoc($firebase.doc($db, "projects", id));
            } else {
                projects.value = projects.value.filter((p) => p.id !== id);
            }
        } catch (e) {
            console.error(e);
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
                const month = p.fechaCreacion.slice(0, 7);
                acc[month] = (acc[month] || 0) + Number(p.valorTotal || 0);
                return acc;
            },
            {} as Record<string, number>,
        );
        const totalSoldCurrentYear = projects.value.reduce((sum, p) => {
            if (!p.fechaCreacion.startsWith(currentYear)) return sum;
            return sum + Number(p.valorTotal || 0);
        }, 0);
        const totalSoldCurrentMonth = projects.value.reduce((sum, p) => {
            if (!p.fechaCreacion.startsWith(currentMonth)) return sum;
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
        unsubscribeProjects?.();
        unsubscribeProjects = null;
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
