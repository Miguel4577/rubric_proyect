import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import { Semester, Group, GroupRow, Subject, Teacher, GroupPayload } from "../../models/Academic";
import { academicService } from "../../services/academicService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const GroupsSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es requerido"),
    group_code: Yup.string().required("El código es requerido"),
    subject_id: Yup.string().required("La asignatura es requerida"),
    semester_id: Yup.string().required("El semestre es requerido"),
    teacher_id: Yup.string().required("El docente es requerido"),
    capacity: Yup.number().min(1, "La capacidad mínima es 1").required("La capacidad es requerida"),
});

const Groups = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

    const loadData = async () => {
        setLoading(true);
        try {
            const [groupItems, semesterItems, subjectItems, teacherItems] = await Promise.all([
                academicService.getGroups(),
                academicService.getSemesters(),
                academicService.getSubjects(),
                academicService.getTeachers(),
            ]);
            setGroups(groupItems);
            setSemesters(semesterItems);
            setSubjects(subjectItems);
            setTeachers(teacherItems);
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

    useEffect(() => {
        void loadData();
    }, []);

    const getFilteredGroups = (): Group[] => {
        let filtered = groups;
        if (selectedSemesterId) {
            filtered = filtered.filter((g) => g.semester_id === selectedSemesterId);
        }
        if (selectedSubjectId) {
            filtered = filtered.filter((g) => g.subject_id === selectedSubjectId);
        }
        return filtered;
    };

    const getTeacherFullName = (teacherId: string): string => {
        const teacher = teachers.find((t) => t.id === teacherId);
        return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Desconocido";
    };

    const getSubjectName = (subjectId: string): string => {
        const subject = subjects.find((s) => s.id === subjectId);
        return subject ? subject.name : "Desconocida";
    };

    const getSemesterName = (semesterId: string): string => {
        const semester = semesters.find((s) => s.id === semesterId);
        return semester ? semester.name : "Desconocido";
    };

    const mapGroupToRow = (group: Group): GroupRow => {
        return {
            id: group.id || "",
            groupCode: group.group_code,
            name: group.name,
            subject: getSubjectName(group.subject_id),
            semester: getSemesterName(group.semester_id),
            teacher: getTeacherFullName(group.teacher_id),
            capacity: `${group.capacity || 30}`,
        };
    };

    const handleSubmit = async (values: GroupPayload, { setSubmitting }: any) => {
        try {
            const existingGroup = groups.find(
                (g) => g.group_code === values.group_code && g.id !== editingId
            );

            if (existingGroup) {
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    text: "Ya existe un grupo con este código",
                });
                setSubmitting(false);
                return;
            }

            if (editingId) {
                await academicService.updateGroup(editingId, values);
                Swal.fire({
                    icon: "success",
                    title: "Éxito",
                    text: "Grupo actualizado correctamente",
                });
            } else {
                await academicService.createGroup(values);
                Swal.fire({
                    icon: "success",
                    title: "Éxito",
                    text: "Grupo creado correctamente",
                });
            }

            setEditingId(null);
            setShowForm(false);
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo guardar el grupo",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (group: Group) => {
        setEditingId(group.id || null);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await Swal.fire({
            icon: "question",
            title: "¿Desea eliminar este grupo?",
            text: "Esta acción no se puede deshacer",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirmed.isConfirmed) return;

        try {
            await academicService.deleteGroup(id);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Grupo eliminado correctamente",
            });
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo eliminar el grupo",
            });
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setShowForm(false);
    };

    const getEditingGroup = (): GroupPayload => {
        if (!editingId) {
            return {
                name: "",
                group_code: "",
                subject_id: "",
                semester_id: "",
                teacher_id: "",
                capacity: 30,
            };
        }
        const group = groups.find((g) => g.id === editingId);
        return {
            name: group?.name || "",
            group_code: group?.group_code || "",
            subject_id: group?.subject_id || "",
            semester_id: group?.semester_id || "",
            teacher_id: group?.teacher_id || "",
            capacity: group?.capacity || 30,
        };
    };

    const tableData = getFilteredGroups().map(mapGroupToRow);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Breadcrumb pageName="Gestionar Grupos" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Gestionar Grupos</h2>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                        >
                            + Nuevo Grupo
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">
                            {editingId ? "Editar Grupo" : "Nuevo Grupo"}
                        </h3>

                        <Formik
                            initialValues={getEditingGroup()}
                            validationSchema={GroupsSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
                        >
                            {({ isSubmitting, isValid }) => (
                                <Form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold text-gray-700">Nombre *</label>
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Nombre del grupo"
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
                                                name="group_code"
                                                placeholder="Código único"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                                disabled={!!editingId}
                                            />
                                            <ErrorMessage name="group_code">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">Asignatura *</label>
                                            <Field
                                                as="select"
                                                name="subject_id"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            >
                                                <option value="">-- Seleccionar asignatura --</option>
                                                {subjects
                                                    .filter((s) => s.is_active !== false)
                                                    .map((subject) => (
                                                        <option key={subject.id} value={subject.id || ""}>
                                                            {subject.name} ({subject.code})
                                                        </option>
                                                    ))}
                                            </Field>
                                            <ErrorMessage name="subject_id">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">Semestre *</label>
                                            <Field
                                                as="select"
                                                name="semester_id"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            >
                                                <option value="">-- Seleccionar semestre --</option>
                                                {semesters.map((semester) => (
                                                    <option key={semester.id} value={semester.id || ""}>
                                                        {semester.name} ({semester.code})
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="semester_id">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">Docente *</label>
                                            <Field
                                                as="select"
                                                name="teacher_id"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            >
                                                <option value="">-- Seleccionar docente --</option>
                                                {teachers.map((teacher) => (
                                                    <option key={teacher.id} value={teacher.id || ""}>
                                                        {teacher.first_name} {teacher.last_name}
                                                        {teacher.specialty ? ` (${teacher.specialty})` : ""}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="teacher_id">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">Capacidad *</label>
                                            <Field
                                                type="number"
                                                name="capacity"
                                                placeholder="Capacidad del grupo"
                                                min="1"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            />
                                            <ErrorMessage name="capacity">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>
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

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">Filtrar por Semestre</label>
                        <select
                            value={selectedSemesterId}
                            onChange={(e) => setSelectedSemesterId(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        >
                            <option value="">-- Todos los semestres --</option>
                            {semesters.map((semester) => (
                                <option key={semester.id} value={semester.id || ""}>
                                    {semester.name} ({semester.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">Filtrar por Asignatura</label>
                        <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        >
                            <option value="">-- Todas las asignaturas --</option>
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

                {tableData.length === 0 ? (
                    <p className="text-gray-500">No hay grupos registrados</p>
                ) : (
                    <GenericTable
                        data={tableData}
                        columns={["groupCode", "name", "subject", "semester", "teacher", "capacity"]}
                        actions={[
                            { name: "edit", label: "Editar" },
                            { name: "delete", label: "Eliminar" },
                        ]}
                        onAction={(action, item) => {
                            const group = groups.find((g) => g.id === item.id);
                            if (!group) return;
                            if (action === "edit") {
                                handleEdit(group);
                            } else if (action === "delete") {
                                void handleDelete(item.id as string);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Groups;
