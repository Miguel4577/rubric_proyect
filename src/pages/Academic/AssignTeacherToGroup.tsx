import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import GenericTable from "../../components/GenericTable";
import { Semester, Group, Teacher, GroupRow } from "../../models/Academic";
import { academicService } from "../../services/academicService";

const AssignTeacherToGroup = () => {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
    const [groups, setGroups] = useState<Group[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [reassigningGroupId, setReassigningGroupId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [semesterItems, teacherItems, groupItems] = await Promise.all([
                academicService.getSemesters(),
                academicService.getTeachers(),
                academicService.getGroups(),
            ]);
            setSemesters(semesterItems);
            setTeachers(teacherItems);
            setGroups(groupItems);
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

    const getTeacherFullName = (teacherId: string): string => {
        const teacher = teachers.find((t) => t.id === teacherId);
        return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Sin asignar";
    };

    const mapGroupToRow = (group: Group): GroupRow => {
        return {
            id: group.id || "",
            groupCode: group.group_code,
            name: group.name,
            subject: group.subject?.name || "Desconocida",
            semester: group.semester?.name || "Desconocido",
            teacher: getTeacherFullName(group.teacher_id),
            capacity: `${group.capacity || 30}`,
        };
    };

    const getGroupsForSemester = (): Group[] => {
        if (!selectedSemesterId) return [];
        return groups.filter((g) => g.semester_id === selectedSemesterId);
    };

    const handleAssignTeacher = (groupId: string) => {
        const group = groups.find((g) => g.id === groupId);
        if (!group) return;

        Swal.fire({
            title: "Asignar Docente",
            html: `
                <div style="text-align: left;">
                    <p><strong>Grupo:</strong> ${group.name} (${group.group_code})</p>
                    <p><strong>Asignatura:</strong> ${group.subject?.name || "N/A"}</p>
                    <p><strong>Docente actual:</strong> ${getTeacherFullName(group.teacher_id)}</p>
                </div>
                <select id="teacherSelect" class="swal2-input" style="margin-top: 10px;">
                    <option value="">-- Seleccionar un docente --</option>
                    ${teachers
                        .map(
                            (t) =>
                                `<option value="${t.id}">${t.first_name} ${t.last_name} (${t.specialty || "Sin especialidad"})</option>`
                        )
                        .join("")}
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Asignar",
            cancelButtonText: "Cancelar",
            didOpen: () => {
                const select = document.getElementById("teacherSelect") as HTMLSelectElement;
                if (select) {
                    select.value = group.teacher_id || "";
                }
            },
            preConfirm: () => {
                const select = document.getElementById("teacherSelect") as HTMLSelectElement;
                const selectedTeacherId = select?.value;
                if (!selectedTeacherId) {
                    Swal.showValidationMessage("Debe seleccionar un docente");
                    return null;
                }
                return selectedTeacherId;
            },
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                try {
                    setReassigningGroupId(groupId);
                    await academicService.assignTeacherToGroup(groupId, result.value);
                    Swal.fire({
                        icon: "success",
                        title: "Éxito",
                        text: "Docente asignado correctamente",
                    });
                    await loadData();
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error instanceof Error ? error.message : "No se pudo asignar el docente",
                    });
                } finally {
                    setReassigningGroupId(null);
                }
            }
        });
    };

    const tableData = getGroupsForSemester().map(mapGroupToRow);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Breadcrumb pageName="Asignar Docentes a Grupos" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-bold text-gray-800">Asignar Docentes a Grupos</h2>

                <div className="mb-6">
                    <label className="mb-2 block font-semibold text-gray-700">Seleccionar Semestre</label>
                    <select
                        value={selectedSemesterId}
                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="">-- Seleccionar un semestre --</option>
                        {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id || ""}>
                                {semester.name} ({semester.code})
                                {semester.is_active ? " [ACTIVO]" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedSemesterId && (
                    <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800">
                            Grupos ({tableData.length})
                        </h3>
                        {tableData.length === 0 ? (
                            <p className="text-gray-500">No hay grupos en este semestre</p>
                        ) : (
                            <GenericTable
                                data={tableData}
                                columns={["groupCode", "name", "subject", "teacher", "capacity"]}
                                actions={[{ name: "assign", label: "Asignar" }]}
                                onAction={(action, item) => {
                                    if (action === "assign" && item.id !== reassigningGroupId) {
                                        handleAssignTeacher(item.id as string);
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

export default AssignTeacherToGroup;
