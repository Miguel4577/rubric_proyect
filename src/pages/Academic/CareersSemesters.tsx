import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import { Career, CareerPayload, Semester, SemesterPayload } from "../../models/Academic";
import { academicService } from "../../services/academicService";

type Section = "careers" | "semesters";

type CareerFormState = CareerPayload & { id?: string };
type SemesterFormState = SemesterPayload & { id?: string };

const initialCareerForm: CareerFormState = {
    name: "",
    code: "",
    description: "",
    is_active: true,
};

const initialSemesterForm: SemesterFormState = {
    name: "",
    code: "",
    start_date: "",
    end_date: "",
    is_active: false,
};

const CareersSemesters = () => {
    const [activeSection, setActiveSection] = useState<Section>("careers");
    const [careers, setCareers] = useState<Career[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [careerForm, setCareerForm] = useState<CareerFormState>(initialCareerForm);
    const [semesterForm, setSemesterForm] = useState<SemesterFormState>(initialSemesterForm);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [careerItems, semesterItems] = await Promise.all([
                academicService.getCareers(),
                academicService.getSemesters(),
            ]);
            setCareers(careerItems);
            setSemesters(semesterItems);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudieron cargar los datos académicos",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const activeCareers = useMemo(
        () => careers.filter((career) => career.is_active !== false).length,
        [careers]
    );

    const activeSemesters = useMemo(
        () => semesters.filter((semester) => semester.is_active !== false).length,
        [semesters]
    );

    const resetForms = () => {
        setCareerForm(initialCareerForm);
        setSemesterForm(initialSemesterForm);
    };

    const submitCareer = async () => {
        try {
            const payload: CareerPayload = {
                name: careerForm.name.trim(),
                code: careerForm.code.trim(),
                description: careerForm.description?.trim() || undefined,
                is_active: careerForm.is_active,
            };

            if (!payload.name || !payload.code) {
                Swal.fire({ icon: "warning", title: "Faltan datos", text: "Nombre y código son obligatorios" });
                return;
            }

            if (careerForm.id) {
                await academicService.updateCareer(careerForm.id, payload);
            } else {
                await academicService.createCareer(payload);
            }

            Swal.fire({ icon: "success", title: "Completado", text: careerForm.id ? "Carrera actualizada" : "Carrera creada" });
            resetForms();
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo guardar la carrera",
            });
        }
    };

    const submitSemester = async () => {
        try {
            const payload: SemesterPayload = {
                name: semesterForm.name.trim(),
                code: semesterForm.code.trim(),
                start_date: semesterForm.start_date,
                end_date: semesterForm.end_date,
                is_active: semesterForm.is_active,
            };

            if (!payload.name || !payload.code || !payload.start_date || !payload.end_date) {
                Swal.fire({ icon: "warning", title: "Faltan datos", text: "Completa todos los campos obligatorios" });
                return;
            }

            if (semesterForm.id) {
                await academicService.updateSemester(semesterForm.id, payload);
            } else {
                await academicService.createSemester(payload);
            }

            Swal.fire({ icon: "success", title: "Completado", text: semesterForm.id ? "Semestre actualizado" : "Semestre creado" });
            resetForms();
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo guardar el semestre",
            });
        }
    };

    const handleCareerAction = (action: string, item: Record<string, unknown>) => {
        const id = String(item.id ?? "");
        if (!id) return;

        const career = careers.find((entry) => entry.id === id);
        if (!career) return;

        if (action === "edit") {
            setCareerForm({
                id,
                name: career.name,
                code: career.code,
                description: career.description || "",
                is_active: career.is_active !== false,
            });
        }

        if (action === "archive") {
            void Swal.fire({
                title: "¿Archivar carrera?",
                text: "La carrera quedará inactiva en el catálogo.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Archivar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#d33",
            }).then(async (result) => {
                if (!result.isConfirmed) return;
                try {
                    await academicService.archiveCareer(id);
                    await loadData();
                    Swal.fire({ icon: "success", title: "Completado", text: "Carrera archivada" });
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error instanceof Error ? error.message : "No se pudo archivar la carrera",
                    });
                }
            });
        }
    };

    const handleSemesterAction = (action: string, item: Record<string, unknown>) => {
        const id = String(item.id ?? "");
        if (!id) return;

        const semester = semesters.find((entry) => entry.id === id);
        if (!semester) return;

        if (action === "edit") {
            setSemesterForm({
                id,
                name: semester.name,
                code: semester.code,
                start_date: semester.start_date.slice(0, 10),
                end_date: semester.end_date.slice(0, 10),
                is_active: semester.is_active !== false,
            });
        }

        if (action === "toggle") {
            void Swal.fire({
                title: semester.is_active ? "Cerrar semestre" : "Activar semestre",
                text: semester.is_active
                    ? "El semestre quedará cerrado en el catálogo."
                    : "El semestre quedará activo en el catálogo.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: semester.is_active ? "Cerrar" : "Activar",
                cancelButtonText: "Cancelar",
            }).then(async (result) => {
                if (!result.isConfirmed) return;
                try {
                    await academicService.updateSemester(id, {
                        name: semester.name,
                        code: semester.code,
                        start_date: semester.start_date.slice(0, 10),
                        end_date: semester.end_date.slice(0, 10),
                        is_active: !semester.is_active,
                    });
                    await loadData();
                    Swal.fire({ icon: "success", title: "Completado", text: semester.is_active ? "Semestre cerrado" : "Semestre activado" });
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error instanceof Error ? error.message : "No se pudo actualizar el semestre",
                    });
                }
            });
        }
    };

    return (
        <div>
            <Breadcrumb pageName="Carreras y semestres" />

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-body">Carreras activas</p>
                    <h3 className="mt-2 text-3xl font-bold text-black dark:text-white">{activeCareers}</h3>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-body">Semestres activos</p>
                    <h3 className="mt-2 text-3xl font-bold text-black dark:text-white">{activeSemesters}</h3>
                </div>
                <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-body">Modo de trabajo</p>
                    <h3 className="mt-2 text-xl font-bold text-black dark:text-white">Solo frontend</h3>

                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    onClick={() => setActiveSection("careers")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                        activeSection === "careers"
                            ? "bg-primary text-white"
                            : "border border-stroke bg-white text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                    }`}
                >
                    Carreras
                </button>
                <button
                    onClick={() => setActiveSection("semesters")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                        activeSection === "semesters"
                            ? "bg-primary text-white"
                            : "border border-stroke bg-white text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                    }`}
                >
                    Semestres
                </button>
            </div>

            {activeSection === "careers" ? (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-black dark:text-white">Catálogo de carreras</h3>
                            <button
                                onClick={() => {
                                    setCareerForm(initialCareerForm);
                                }}
                                className="rounded-md border border-stroke px-3 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark"
                            >
                                Nueva carrera
                            </button>
                        </div>
                        <GenericTable
                            data={careers.map((career) => ({
                                ...career,
                                status: career.is_active === false ? "Archivada" : "Activa",
                            }))}
                            columns={["code", "name", "description", "status"]}
                            actions={[
                                { name: "edit", label: "Editar" },
                                { name: "archive", label: "Archivar" },
                            ]}
                            onAction={handleCareerAction}
                        />
                    </div>

                    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                            {careerForm.id ? "Editar carrera" : "Nueva carrera"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Nombre</label>
                                <input
                                    value={careerForm.name}
                                    onChange={(event) => setCareerForm((prev) => ({ ...prev, name: event.target.value }))}
                                    className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Código</label>
                                <input
                                    value={careerForm.code}
                                    onChange={(event) => setCareerForm((prev) => ({ ...prev, code: event.target.value }))}
                                    className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Descripción</label>
                                <textarea
                                    value={careerForm.description}
                                    onChange={(event) => setCareerForm((prev) => ({ ...prev, description: event.target.value }))}
                                    rows={4}
                                    className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                />
                            </div>
                            <label className="flex items-center gap-3 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={careerForm.is_active !== false}
                                    onChange={(event) => setCareerForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                                />
                                Activa
                            </label>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => void submitCareer()}
                                    disabled={loading}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    Guardar carrera
                                </button>
                                <button
                                    onClick={resetForms}
                                    className="rounded-md border border-stroke px-4 py-2 text-sm font-medium dark:border-strokedark"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-black dark:text-white">Catálogo de semestres</h3>
                            <button
                                onClick={() => {
                                    setSemesterForm(initialSemesterForm);
                                }}
                                className="rounded-md border border-stroke px-3 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark"
                            >
                                Nuevo semestre
                            </button>
                        </div>
                        <GenericTable
                            data={semesters.map((semester) => ({
                                ...semester,
                                status: semester.is_active === false ? "Cerrado" : "Activo",
                            }))}
                            columns={["code", "name", "start_date", "end_date", "status"]}
                            actions={[
                                { name: "edit", label: "Editar" },
                                { name: "toggle", label: "Cambiar estado" },
                            ]}
                            onAction={handleSemesterAction}
                        />
                    </div>

                    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                            {semesterForm.id ? "Editar semestre" : "Nuevo semestre"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Nombre</label>
                                <input
                                    value={semesterForm.name}
                                    onChange={(event) => setSemesterForm((prev) => ({ ...prev, name: event.target.value }))}
                                    className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Código</label>
                                <input
                                    value={semesterForm.code}
                                    onChange={(event) => setSemesterForm((prev) => ({ ...prev, code: event.target.value }))}
                                    className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Fecha inicio</label>
                                    <input
                                        type="date"
                                        value={semesterForm.start_date}
                                        onChange={(event) => setSemesterForm((prev) => ({ ...prev, start_date: event.target.value }))}
                                        className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Fecha fin</label>
                                    <input
                                        type="date"
                                        value={semesterForm.end_date}
                                        onChange={(event) => setSemesterForm((prev) => ({ ...prev, end_date: event.target.value }))}
                                        className="w-full rounded border border-stroke px-3 py-2 outline-none dark:border-strokedark dark:bg-meta-4"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={semesterForm.is_active === true}
                                    onChange={(event) => setSemesterForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                                />
                                Activo
                            </label>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => void submitSemester()}
                                    disabled={loading}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                                >
                                    Guardar semestre
                                </button>
                                <button
                                    onClick={resetForms}
                                    className="rounded-md border border-stroke px-4 py-2 text-sm font-medium dark:border-strokedark"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareersSemesters;
