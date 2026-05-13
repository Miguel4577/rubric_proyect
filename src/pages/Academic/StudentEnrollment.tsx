import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import {
    Career,
    Student,
    Registration,
    Group,
    Enrollment,
    EnrollmentPayload,
    EnrollmentRow,
    StudyPlanVersion,
    Subject,
} from "../../models/Academic";
import { academicService } from "../../services/academicService";
import { managementService } from "../../services/managementService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const EnrollmentSchema = Yup.object().shape({
    student_id: Yup.string().required("El estudiante es requerido"),
    registration_id: Yup.string().required("La matrícula es requerida"),
    group_id: Yup.string().required("El grupo es requerido"),
});

const StudentEnrollment = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [studyPlans, setStudyPlans] = useState<StudyPlanVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<string>("");

    const loadData = async () => {
        setLoading(true);
        try {
            const [
                studentItems,
                careerItems,
                registrationItems,
                groupItems,
                enrollmentItems,
                subjectItems,
                studyPlanItems,
            ] = await Promise.all([
                managementService.getStudents(),
                academicService.getCareers(),
                managementService.getRegistrations(),
                managementService.getGroups(),
                managementService.getEnrollments(),
                academicService.getSubjects(),
                academicService.getStudyPlanVersions(""),
            ]);
            setStudents(studentItems);
            setCareers(careerItems);
            setRegistrations(registrationItems.filter((r) => r.is_active !== false));
            setGroups(groupItems);
            setEnrollments(enrollmentItems);
            setSubjects(subjectItems.filter((s) => s.is_active !== false));
            setStudyPlans(studyPlanItems);
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

    const getStudentRegistrations = (): Registration[] => {
        if (!selectedStudentId) return [];
        return registrations.filter((r) => r.student_id === selectedStudentId);
    };

    const getAvailableGroups = (): Group[] => {
        if (!selectedRegistrationId || !selectedStudentId) return [];

        // Get the selected registration to find the career
        const selectedReg = registrations.find((r) => r.id === selectedRegistrationId);
        if (!selectedReg) return [];

        // Filter groups that:
        // 1. Have an active semester
        // 2. Student is not already enrolled
        const availableGroups = groups.filter((g) => {
            // Check if student is not already enrolled in this group
            const alreadyEnrolled = enrollments.some(
                (e) =>
                    e.student_id === selectedStudentId &&
                    e.group_id === g.id &&
                    e.status !== "CANCELLED"
            );

            return !alreadyEnrolled;
        });

        return availableGroups;
    };

    const getStudentFullName = (studentId: string): string => {
        const student = students.find((s) => s.id === studentId);
        return student ? `${student.first_name} ${student.last_name}` : "Desconocido";
    };

    const getSubjectName = (subjectId: string): string => {
        const subject = subjects.find((s) => s.id === subjectId);
        return subject ? subject.name : "Desconocida";
    };

    const getCareerName = (careerId: string): string => {
        const career = careers.find((c) => c.id === careerId);
        return career ? career.name : "Desconocida";
    };

    const getGroupInfo = (groupId: string): { name: string; subject: string } => {
        const group = groups.find((g) => g.id === groupId);
        return {
            name: group?.name || "Desconocido",
            subject: getSubjectName(group?.subject_id || ""),
        };
    };

    const mapEnrollmentToRow = (enrollment: Enrollment): EnrollmentRow => {
        const groupInfo = getGroupInfo(enrollment.group_id);
        const group = groups.find((g) => g.id === enrollment.group_id);
        const semester = group?.semester?.name || "Desconocido";

        return {
            id: enrollment.id || "",
            studentName: getStudentFullName(enrollment.student_id),
            groupName: groupInfo.name,
            subject: groupInfo.subject,
            semester: semester,
            status: enrollment.status === "CANCELLED" ? "Cancelada" : "Activa",
        };
    };

    const handleSubmit = async (values: EnrollmentPayload, { setSubmitting, resetForm }: any) => {
        try {
            // Check if already enrolled in this group
            const existingEnrollment = enrollments.find(
                (e) =>
                    e.student_id === values.student_id &&
                    e.group_id === values.group_id &&
                    e.status !== "CANCELLED"
            );

            if (existingEnrollment) {
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    text: "Este estudiante ya está inscrito en este grupo",
                });
                setSubmitting(false);
                return;
            }

            await managementService.createEnrollment(values);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Estudiante inscrito correctamente",
            });
            setShowForm(false);
            resetForm();
            setSelectedStudentId("");
            setSelectedRegistrationId("");
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo inscribir el estudiante",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "¿Cancelar inscripción?",
            text: "Esta acción no se puede deshacer",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No",
        });

        if (result.isConfirmed) {
            try {
                await managementService.cancelEnrollment(id);
                Swal.fire({
                    icon: "success",
                    title: "Éxito",
                    text: "Inscripción cancelada correctamente",
                });
                await loadData();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error instanceof Error ? error.message : "No se pudo cancelar la inscripción",
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <Breadcrumb pageName="Inscribir Estudiante en Grupo" />
                <div className="text-center py-8">
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Breadcrumb pageName="Inscribir Estudiante en Grupo" />

            <div className="mb-8">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
                >
                    {showForm ? "Cancelar" : "Nuevo Enrollment"}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
                    <Formik
                        initialValues={{
                            student_id: "",
                            registration_id: "",
                            group_id: "",
                            status: "ACTIVE",
                        }}
                        validationSchema={EnrollmentSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, setFieldValue, values }) => (
                            <Form>
                                <div className="mb-5">
                                    <label className="mb-3 block text-black dark:text-white">
                                        Estudiante
                                    </label>
                                    <Field
                                        as="select"
                                        name="student_id"
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            setFieldValue("student_id", e.target.value);
                                            setSelectedStudentId(e.target.value);
                                            setFieldValue("registration_id", "");
                                            setSelectedRegistrationId("");
                                        }}
                                        className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm outline-none"
                                    >
                                        <option value="">Selecciona un estudiante</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.first_name} {student.last_name}
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="student_id">
                                        {(msg) => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                    </ErrorMessage>
                                </div>

                                {values.student_id && getStudentRegistrations().length > 0 && (
                                    <div className="mb-5">
                                        <label className="mb-3 block text-black dark:text-white">
                                            Matrícula Activa
                                        </label>
                                        <Field
                                            as="select"
                                            name="registration_id"
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                setFieldValue("registration_id", e.target.value);
                                                setSelectedRegistrationId(e.target.value);
                                                setFieldValue("group_id", "");
                                            }}
                                            className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm outline-none"
                                        >
                                            <option value="">Selecciona una matrícula</option>
                                            {getStudentRegistrations().map((registration) => (
                                                <option key={registration.id} value={registration.id}>
                                                    {getCareerName(registration.career_id)}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="registration_id">
                                            {(msg) => (
                                                <div className="text-red-500 text-sm mt-1">{msg}</div>
                                            )}
                                        </ErrorMessage>
                                    </div>
                                )}

                                {values.registration_id && getAvailableGroups().length > 0 && (
                                    <div className="mb-5">
                                        <label className="mb-3 block text-black dark:text-white">
                                            Grupo
                                        </label>
                                        <Field
                                            as="select"
                                            name="group_id"
                                            className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm outline-none"
                                        >
                                            <option value="">Selecciona un grupo</option>
                                            {getAvailableGroups().map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name} - {getSubjectName(group.subject_id)}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="group_id">
                                            {(msg) => (
                                                <div className="text-red-500 text-sm mt-1">{msg}</div>
                                            )}
                                        </ErrorMessage>
                                    </div>
                                )}

                                {values.registration_id && getAvailableGroups().length === 0 && (
                                    <div className="mb-5 p-4 bg-yellow-100 text-yellow-800 rounded">
                                        No hay grupos disponibles para esta matrícula
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {isSubmitting ? "Guardando..." : "Inscribir"}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}

            <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
                <h3 className="mb-4 font-medium text-black dark:text-white">
                    Inscripciones de Estudiantes
                </h3>
                <GenericTable
                    data={enrollments.map((enrollment) => mapEnrollmentToRow(enrollment))}
                    columns={["studentName", "groupName", "subject", "semester", "status"]}
                    columnHeaders={{
                        studentName: "Estudiante",
                        groupName: "Grupo",
                        subject: "Asignatura",
                        semester: "Semestre",
                        status: "Estado",
                    }}
                    actions={[{ name: "delete", label: "Cancelar" }]}
                    onAction={(action, item) => {
                        if (action === "delete") {
                            void handleDelete(item.id);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default StudentEnrollment;
