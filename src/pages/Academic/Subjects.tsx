import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import { Subject, SubjectPayload } from "../../models/Academic";
import { academicService } from "../../services/academicService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const SubjectsSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es requerido"),
    code: Yup.string().required("El código es requerido"),
    credits: Yup.number().min(1, "Mínimo 1 crédito").required("Los créditos son requeridos"),
    description: Yup.string().optional(),
});

const Subjects = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const data = await academicService.getSubjects();
            setSubjects(data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudieron cargar las asignaturas",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSubjects();
    }, []);

    const handleSubmit = async (values: SubjectPayload, { setSubmitting }: any) => {
        try {
            const existingSubject = subjects.find(
                (s) => s.code === values.code && s.id !== editingId
            );

            if (existingSubject) {
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    text: "Ya existe una asignatura con este código",
                });
                setSubmitting(false);
                return;
            }

            if (editingId) {
                await academicService.updateSubject(editingId, values);
                Swal.fire({
                    icon: "success",
                    title: "Éxito",
                    text: "Asignatura actualizada correctamente",
                });
            } else {
                await academicService.createSubject(values);
                Swal.fire({
                    icon: "success",
                    title: "Éxito",
                    text: "Asignatura creada correctamente",
                });
            }

            setEditingId(null);
            setShowForm(false);
            await loadSubjects();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo guardar la asignatura",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (subject: Subject) => {
        setEditingId(subject.id || null);
        setShowForm(true);
    };

    const handleArchive = async (id: string) => {
        const confirmed = await Swal.fire({
            icon: "question",
            title: "¿Desea archivar esta asignatura?",
            text: "Las asignaturas archivadas no se pueden asociar a nuevos grupos ni versiones de planes de estudio",
            showCancelButton: true,
            confirmButtonText: "Sí, archivar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmed.isConfirmed) return;

        try {
            await academicService.archiveSubject(id);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Asignatura archivada correctamente",
            });
            await loadSubjects();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo archivar la asignatura",
            });
        }
    };

    const handleReactivate = async (id: string) => {
        const confirmed = await Swal.fire({
            icon: "question",
            title: "¿Desea reactivar esta asignatura?",
            text: "La asignatura podrá ser asociada nuevamente a grupos y planes de estudio",
            showCancelButton: true,
            confirmButtonText: "Sí, reactivar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmed.isConfirmed) return;

        try {
            await academicService.reactivateSubject(id);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Asignatura reactivada correctamente",
            });
            await loadSubjects();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo reactivar la asignatura",
            });
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
    };

    const getEditingSubject = (): SubjectPayload => {
        if (!editingId) {
            return { name: "", code: "", credits: 1, description: "" };
        }
        const subject = subjects.find((s) => s.id === editingId);
        return {
            name: subject?.name || "",
            code: subject?.code || "",
            credits: subject?.credits || 1,
            description: subject?.description || "",
        };
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Breadcrumb pageName="Gestionar Asignaturas" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Gestionar Asignaturas</h2>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                        >
                            + Nueva Asignatura
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">
                            {editingId ? "Editar Asignatura" : "Nueva Asignatura"}
                        </h3>

                        <Formik
                            initialValues={getEditingSubject()}
                            validationSchema={SubjectsSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ isSubmitting, isValid }) => (
                                <Form className="space-y-4">
                                    <div>
                                        <label className="block font-semibold text-gray-700">Nombre *</label>
                                        <Field
                                            type="text"
                                            name="name"
                                            placeholder="Nombre de la asignatura"
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                        <ErrorMessage name="name">
                                            {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                        </ErrorMessage>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-gray-700">Código *</label>
                                        <Field
                                            type="text"
                                            name="code"
                                            placeholder="Código único"
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                            disabled={!!editingId}
                                        />
                                        <ErrorMessage name="code">
                                            {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                        </ErrorMessage>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-gray-700">Créditos *</label>
                                        <Field
                                            type="number"
                                            name="credits"
                                            placeholder="Número de créditos"
                                            min="1"
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                        <ErrorMessage name="credits">
                                            {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                        </ErrorMessage>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-gray-700">Descripción</label>
                                        <Field
                                            as="textarea"
                                            name="description"
                                            placeholder="Descripción de la asignatura"
                                            rows="3"
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isValid}
                                            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {isSubmitting ? "Guardando..." : "Guardar"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}

                {subjects.length === 0 ? (
                    <p className="text-gray-500">No hay asignaturas registradas</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">Código</th>
                                    <th className="px-4 py-2 text-left">Nombre</th>
                                    <th className="px-4 py-2 text-center">Créditos</th>
                                    <th className="px-4 py-2 text-left">Descripción</th>
                                    <th className="px-4 py-2 text-center">Estado</th>
                                    <th className="px-4 py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject) => (
                                    <tr key={subject.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-semibold">{subject.code}</td>
                                        <td className="px-4 py-2">{subject.name}</td>
                                        <td className="px-4 py-2 text-center">{subject.credits}</td>
                                        <td className="px-4 py-2 text-gray-600">{subject.description || "-"}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    subject.is_active !== false
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {subject.is_active !== false ? "Activa" : "Archivada"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                {subject.is_active !== false ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(subject)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleArchive(subject.id || "")}
                                                            className="text-yellow-600 hover:text-yellow-800"
                                                        >
                                                            Archivar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivate(subject.id || "")}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Reactivar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subjects;
