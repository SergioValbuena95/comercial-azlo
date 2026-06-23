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
    estado: string;
    valorTotal?: number | null;
    porcentajesPago?: string;
    pagosRealizados?: number[];
    notas?: string;
}

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
        estado: "Vendido",
    },
    {
        proyecto: "DESINFUR SAS",
        pais: "Colombia",
        ciudad: "Concepción",
        direccion: "Av. Principal #53-38",
        fechaCreacion: "2026-01-13",
        fechaInstalacion: "2026-04-14",
        encargado: "Tatiana Ortega",
        estado: "Vendido",
    },
    {
        proyecto: "Residencial Nexus 3",
        pais: "Colombia",
        ciudad: "Trujillo",
        direccion: "Av. Principal #99-14",
        fechaCreacion: "2026-11-24",
        fechaInstalacion: "2026-01-01",
        encargado: "Tatiana Ortega",
        estado: "Vendido",
    },
    {
        proyecto: "Hospital Nexus 4",
        pais: "Colombia",
        ciudad: "CDMX",
        direccion: "Av. Principal #96-98",
        fechaCreacion: "2026-09-16",
        fechaInstalacion: "2026-11-14",
        encargado: "Tatiana Ortega",
        estado: "Vendido",
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
    ...project,
    pagosRealizados: Array.isArray(project.pagosRealizados)
        ? project.pagosRealizados
              .map(Number)
              .filter((value) => Number.isInteger(value) && value >= 0)
        : [],
});

export function useProjects() {
    const projects = ref<Project[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const useFirebase = ref(false);
    let unsubscribeProjects: (() => void) | null = null;

    // Try to load from Firebase, fallback to seed data
    const loadProjects = async () => {
        loading.value = true;
        error.value = null;

        try {
            const { $db, $firebase } = useNuxtApp() as any;

            if ($db && $firebase) {
                const q = $firebase.query(
                    $firebase.collection($db, "projects"),
                    $firebase.orderBy("fechaCreacion", "desc"),
                );

                // Use onSnapshot for real-time updates
                unsubscribeProjects?.();
                unsubscribeProjects = $firebase.onSnapshot(
                    q,
                    (snapshot: any) => {
                        if (snapshot.empty) {
                            // Seed data to Firebase on first load
                            seedToFirebase($db, $firebase);
                        } else {
                            projects.value = snapshot.docs
                                .map((doc: any) => ({
                                    id: doc.id,
                                    ...doc.data(),
                                }))
                                .map(normalizeProject);
                            useFirebase.value = true;
                        }
                        loading.value = false;
                    },
                    (err: any) => {
                        console.warn("Firebase error, using local data:", err);
                        projects.value = SEED_DATA.map((p, i) =>
                            normalizeProject({ ...p, id: String(i + 1) }),
                        );
                        loading.value = false;
                    },
                );
            } else {
                throw new Error("Firebase not available");
            }
        } catch {
            projects.value = SEED_DATA.map((p, i) =>
                normalizeProject({ ...p, id: String(i + 1) }),
            );
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
            const { $db, $firebase } = useNuxtApp() as any;
            if ($db && $firebase && useFirebase.value) {
                await $firebase.addDoc(
                    $firebase.collection($db, "projects"),
                    project,
                );
            } else {
                projects.value.unshift(
                    normalizeProject({ ...project, id: Date.now().toString() }),
                );
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateProject = async (id: string, data: Partial<Project>) => {
        const idx = projects.value.findIndex((p) => p.id === id);
        if (idx !== -1) {
            projects.value[idx] = normalizeProject({
                ...projects.value[idx],
                ...data,
            });
        }

        try {
            const { $db, $firebase } = useNuxtApp() as any;
            if ($db && $firebase && useFirebase.value) {
                await $firebase.updateDoc(
                    $firebase.doc($db, "projects", id),
                    data,
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
                acc[p.estado] = (acc[p.estado] || 0) + 1;
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
            (p) => p.estado.trim().toLowerCase() !== "facturado",
        ).length;
        const completed = projects.value.filter(
            (p) => p.estado.trim().toLowerCase() === "instalado",
        ).length;
        const closed = projects.value.filter(
            (p) => p.estado.trim().toLowerCase() === "facturado",
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
