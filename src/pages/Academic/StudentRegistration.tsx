import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import {
    Career,
    Student,
    Registration,
    RegistrationPayload,
    RegistrationRow,
} from "../../models/Academic";
import { academicService } from "../../services/academicService";
import { managementService } from "../../services/managementService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const RegistrationSchema = Yup.object().shape({
    student_id: Yup.string().required("El estudiante es requerido"),
    career_id: Yup.string().required("La carrera es requerida"),
    admission_period: Yup.string().required("El período de admisión es requerido"),
    academic_status: Yup.string().required("El estado académico es requerido"),
});

const StudentRegistration = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [careers, setCareers] = useState<Career[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentItems, careerItems, registrationItems] = await Promise.all([
                managementService.getStudents(),
                academicService.getCareers(),
                managementService.getRegistrations(),
            ]);
            setStudents(studentItems);
            setCareers(careerItems.filter((c) => c.is_active !== false));
            setRegistrations(registrationItems);
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

    const getStudentFullName = (studentId: string): string => {
        const student = students.find((s) => s.id === studentId);
        return student ? `${student.first_name} ${student.last_name}` : "Desconocido";
    };

    const getCareerName = (careerId: string): string => {
        const career = careers.find((c) => c.id === careerId);
        return career ? career.name : "Desconocida";
    };

    const mapRegistrationToRow = (registration: Registration): RegistrationRow => {
        return {
            id: registration.id || "",
            studentName: getStudentFullName(registration.student_id),
            careerName: getCareerName(registration.career_id),
            admissionPeriod: registration.admission_period,
            academicStatus: registration.academic_status,
            status: registration.is_active ? "Activa" : "Cancelada",
        };
    };

    const handleSubmit = async (values: RegistrationPayload, { setSubmitting }: any) => {
        try {
            const existingRegistration = registrations.find(
                (r) =>
                    r.student_id === values.student_id &&
                    r.career_id === values.career_id &&
                    r.is_active !== false
            );

            if (existingRegistration) {
                Swal.fire({
                    icon: "warning",
                    title: "Error",
                    text: "Este estudiante ya tiene una matrícula activa en esta carrera",
                });
                setSubmitting(false);
                return;
            }

            await managementService.createRegistration(values);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Estudiante matriculado correctamente",
            });

            setShowForm(false);
            setSelectedStudentId("");
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo matricular el estudiante",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelRegistration = async (id: string) => {
        const confirmed = await Swal.fire({
            icon: "question",
            title: "¿Desea cancelar esta matrícula?",
            text: "El estudiante será retirado de esta carrera",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No, mantener",
        });

        if (!confirmed.isConfirmed) return;

        try {
            await managementService.cancelRegistration(id);
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: "Matrícula cancelada correctamente",
            });
            await loadData();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudo cancelar la matrícula",
            });
        }
    };

    const tableData = getStudentRegistrations().map(mapRegistrationToRow);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Breadcrumb pageName="Matricular Estudiantes" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Matricular Estudiantes</h2>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                        >
                            + Nueva Matrícula
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Nueva Matrícula</h3>

                        <Formik
                            initialValues={{
                                student_id: "",
                                career_id: "",
                                admission_period: "",
                                academic_status: "ACTIVE",
                                is_active: true,
                            }}
                            validationSchema={RegistrationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, isValid }) => (
                                <Form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold text-gray-700">Estudiante *</label>
                                            <Field
                                                as="select"
                                                name="student_id"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            >
                                                <option value="">-- Seleccionar estudiante --</option>
                                                {students.map((student) => (
                                                    <option key={student.id} value={student.id || ""}>
                                                        {student.first_name} {student.last_name} ({student.identification})
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="student_id">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">Carrera *</label>
                                            <Field
                                                as="select"
                                                name="career_id"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            >
                                                <option value="">-- Seleccionar carrera --</option>
                                                {careers.map((career) => (
                                                    <option key={career.id} value={career.id || ""}>
                                                        {career.name} ({career.code})
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="career_id">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">
                                                Período de Admisión *
                                            </label>
                                            <Field
                                                type="text"
                                                name="admission_period"
                                                placeholder="Ej: 2024-I, 2024-II"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            />
                                            <ErrorMessage name="admission_period">
                                                {(msg) => <div className="text-red-500 text-sm">{msg}</div>}
                                            </ErrorMessage>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-gray-700">
                                                Estado Académico *
                                            </label>
                                            <Field
                                                as="select"
                                                name="academic_status"
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            >
                                                <option value="ACTIVE">Activo</option>
                                                <option value="SUSPENDED">Suspendido</option>
                                                <option value="ON_LEAVE">Licencia</option>
                                                <option value="WITHDRAWN">Retirado</option>
                                            </Field>
                                            <ErrorMessage name="academic_status">
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
                                            {isSubmitting ? "Guardando..." : "Matricular"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
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

                <div className="mb-6">
                    <label className="block font-semibold text-gray-700 mb-2">Seleccionar Estudiante</label>
                    <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="">-- Seleccionar un estudiante --</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id || ""}>
                                {student.first_name} {student.last_name} ({student.identification})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedStudentId && (
                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800">
                            Matrículas ({tableData.length})
                        </h3>
                        {tableData.length === 0 ? (
                            <p className="text-gray-500">Este estudiante no tiene matrículas registradas</p>
                        ) : (
                            <GenericTable
                                data={tableData}
                                columns={["careerName", "admissionPeriod", "academicStatus", "status"]}
                                actions={[{ name: "cancel", label: "Cancelar" }]}
                                onAction={(action, item) => {
                                    if (action === "cancel" && item.status !== "Cancelada") {
                                        void handleCancelRegistration(item.id as string);
                                    }
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentRegistration;
