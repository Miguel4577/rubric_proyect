import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import { Career, StudyPlanVersion, Subject, StudyPlanVersionPayload } from "../../models/Academic";
import { academicService } from "../../services/academicService";

interface SubjectItem {
    subject: Subject;
    suggested_semester: number;
}

const StudyPlans = () => {
    const [careers, setCareers] = useState<Career[]>([]);
    const [selectedCareer, setSelectedCareer] = useState<string>("");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [studyPlanItems, setStudyPlanItems] = useState<StudyPlanVersion[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [careerItems, subjectItems] = await Promise.all([
                academicService.getCareers(),
                academicService.getSubjects(),
            ]);
            setCareers(careerItems);
            setSubjects(subjectItems);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudieron cargar los datos",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadStudyPlans = async (careerId: string) => {
        if (!careerId) {
            setStudyPlanItems([]);
            setSelectedSubjects([]);
            return;
        }
        try {
            const plans = await academicService.getStudyPlanVersions(careerId);
            setStudyPlanItems(plans);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo cargar el plan de estudios",
            });
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    useEffect(() => {
        void loadStudyPlans(selectedCareer);
    }, [selectedCareer]);

    const addSubjectToStudyPlan = (subjectId: string) => {
        const subject = subjects.find((s) => s.id === subjectId);
        if (!subject) return;

        const exists = selectedSubjects.some((s) => s.subject.id === subjectId);
        if (exists) {
            Swal.fire({ icon: "warning", title: "Duplicado", text: "Esta asignatura ya está en el plan" });
            return;
        }

        setSelectedSubjects([...selectedSubjects, { subject, suggested_semester: 1 }]);
    };

    const updateSubjectSemester = (index: number, semester: number) => {
        const updated = [...selectedSubjects];
        updated[index].suggested_semester = semester;
        setSelectedSubjects(updated);
    };

    const removeSubjectFromStudyPlan = (index: number) => {
        setSelectedSubjects(selectedSubjects.filter((_, i) => i !== index));
    };

    const deleteStudyPlanSubject = async (planId: string) => {
        const confirmed = await Swal.fire({
            icon: "question",
            title: "¿Desea eliminar esta asignatura?",
            text: "Esta acción no se puede deshacer",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmed.isConfirmed) return;

        try {
            await academicService.deleteStudyPlanSubject(planId);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Asignatura eliminada del plan de estudios",
            });
            await loadStudyPlans(selectedCareer);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo eliminar la asignatura",
            });
        }
    };

    const saveStudyPlan = async () => {
        if (!selectedCareer) {
            Swal.fire({ icon: "warning", title: "Error", text: "Debe seleccionar una carrera" });
            return;
        }

        if (selectedSubjects.length === 0) {
            Swal.fire({ icon: "warning", title: "Error", text: "Debe agregar al menos una asignatura al plan" });
            return;
        }

        try {
            let successCount = 0;
            for (const item of selectedSubjects) {
                const payload: StudyPlanVersionPayload = {
                    career_id: selectedCareer,
                    subject_id: item.subject.id || "",
                    suggested_semester: item.suggested_semester,
                    name: `${item.subject.name} - Semestre ${item.suggested_semester}`,
                };
                await academicService.addStudyPlanSubject(payload);
                successCount++;
            }

            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: `${successCount} asignatura(s) agregada(s) al plan de estudios`,
            });
            setSelectedSubjects([]);
            await loadStudyPlans(selectedCareer);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo guardar el plan",
            });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Breadcrumb pageName="Gestionar Plan de Estudios" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-bold text-gray-800">Gestionar Plan de Estudios</h2>

                <div className="mb-6">
                    <label className="mb-2 block font-semibold text-gray-700">Seleccionar Carrera</label>
                    <select
                        value={selectedCareer}
                        onChange={(e) => setSelectedCareer(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="">-- Seleccionar una carrera --</option>
                        {careers
                            .filter((c) => c.is_active !== false)
                            .map((career) => (
                                <option key={career.id} value={career.id || ""}>
                                    {career.name}
                                </option>
                            ))}
                    </select>
                </div>

                {selectedCareer && (
                    <>
                        <div className="mb-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-800">Agregar Asignaturas</h3>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            addSubjectToStudyPlan(e.target.value);
                                            e.target.value = "";
                                        }
                                    }}
                                    className="flex-1 rounded border border-gray-300 px-3 py-2"
                                >
                                    <option value="">-- Seleccionar asignatura --</option>
                                    {subjects
                                        .filter((s) => s.is_active !== false)
                                        .map((subject) => (
                                            <option key={subject.id} value={subject.id || ""}>
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-800">
                                Asignaturas en el Plan ({selectedSubjects.length})
                            </h3>
                            {selectedSubjects.length === 0 ? (
                                <p className="text-gray-500">No hay asignaturas agregadas</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Código</th>
                                                <th className="px-4 py-2 text-left">Asignatura</th>
                                                <th className="px-4 py-2 text-left">Créditos</th>
                                                <th className="px-4 py-2 text-left">Semestre Sugerido</th>
                                                <th className="px-4 py-2 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSubjects.map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2">{item.subject.code}</td>
                                                    <td className="px-4 py-2">{item.subject.name}</td>
                                                    <td className="px-4 py-2">{item.subject.credits}</td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={item.suggested_semester}
                                                            onChange={(e) =>
                                                                updateSubjectSemester(index, parseInt(e.target.value))
                                                            }
                                                            className="w-16 rounded border border-gray-300 px-2 py-1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            onClick={() => removeSubjectFromStudyPlan(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <button
                                onClick={saveStudyPlan}
                                disabled={selectedSubjects.length === 0}
                                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Guardar Plan de Estudios
                            </button>
                        </div>

                        {studyPlanItems.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-gray-800">Asignaturas en el Plan</h3>
                                <GenericTable
                                    data={studyPlanItems.map((item) => ({
                                        id: item.id || "",
                                        code: item.subject?.code || "",
                                        name: item.subject?.name || "",
                                        credits: (item.subject?.credits || 0).toString(),
                                        semester: (item.suggested_semester || 0).toString(),
                                        created: item.created_at?.substring(0, 10) || "",
                                    }))}
                                    columns={["code", "name", "credits", "semester", "created"]}
                                    actions={[{ name: "delete", label: "Eliminar" }]}
                                    onAction={(action, item) => {
                                        if (action === "delete") {
                                            void deleteStudyPlanSubject(item.id as string);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StudyPlans;
