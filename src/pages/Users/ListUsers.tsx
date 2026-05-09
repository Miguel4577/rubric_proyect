import React, { useEffect, useState } from "react";
import { User, UserRole } from "../../models/User";
import GenericTable from "../../components/GenericTable";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";

interface UserRow {
    id: string;
    code: string;
    fullName: string;
    email: string;
    role: string;
    career: string;
    status: string;
}

interface ListFilters {
    role: "" | UserRole;
    career: string;
    status: "" | "true" | "false";
    email: string;
    code: string;
}

const Users: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<UserRow[]>([]);
    const [careerOptions, setCareerOptions] = useState<{ id: string; label: string }[]>([]);
    const [filters, setFilters] = useState<ListFilters>({
        role: "",
        career: "",
        status: "",
        email: "",
        code: "",
    });

    const mapUserToRow = (user: User): UserRow => {
        const firstName = user.profile?.first_name ?? "";
        const lastName = user.profile?.last_name ?? "";
        const careerLabel = user.careers?.length
            ? user.careers.map((career) => career.name).join(", ")
            : "Sin carrera";

        return {
            id: user.id ?? "",
            code: user.code ?? "",
            fullName: `${firstName} ${lastName}`.trim() || "Sin nombre",
            email: user.email ?? "",
            role: user.role ?? "",
            career: careerLabel,
            status: user.is_active ? "Activo" : "Inactivo",
        };
    };

    const buildCareerOptions = (users: User[]) => {
        const map = new Map<string, string>();
        users.forEach((user) => {
            user.careers?.forEach((career) => {
                map.set(career.id, `${career.name} (${career.code})`);
            });
        });
        setCareerOptions(Array.from(map.entries()).map(([id, label]) => ({ id, label })));
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const users = await userService.getUsers();
            buildCareerOptions(users);
            setData(users.map(mapUserToRow));
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudieron cargar los usuarios",
                icon: "error",
            });
        }
    };

    const applyFilters = async () => {
        try {
            const users = await userService.searchUsers({
                role: filters.role || undefined,
                career: filters.career || undefined,
                is_active:
                    filters.status === ""
                        ? undefined
                        : filters.status === "true",
                email: filters.email || undefined,
                code: filters.code || undefined,
            });
            setData(users.map(mapUserToRow));
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error instanceof Error ? error.message : "No se pudieron filtrar los usuarios",
                icon: "error",
            });
        }
    };

    const clearFilters = async () => {
        setFilters({
            role: "",
            career: "",
            status: "",
            email: "",
            code: "",
        });
        await fetchInitialData();
    };

    const handleAction = (action: string, item: Record<string, unknown>) => {
        const userId = String(item.id ?? "");
        if (action === "edit") {
            navigate(`/users/update/${userId}`);
        } else if (action === "deactivate") {
            deactivateUser(userId);
        }
    };

    const deactivateUser = async (id: string) => {
        Swal.fire({
            title: "¿Deseas desactivar este usuario?",
            text: "El usuario no podrá iniciar sesión mientras esté inactivo.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1f8b4c",
            cancelButtonColor: "#d33",
            confirmButtonText: "Desactivar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await userService.deactivateUser(id);
                    Swal.fire("Completado", "El usuario fue desactivado", "success");
                    await applyFilters();
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error instanceof Error ? error.message : "No se pudo desactivar el usuario",
                    });
                }
            }
        });
    };

    const handleCreate = () => {
        navigate("/users/create");
    };

    return (
        <div>
            <Breadcrumb pageName="Usuarios" />

            <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <input
                        type="text"
                        value={filters.email}
                        onChange={(event) => setFilters((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="Filtrar por correo"
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                    <input
                        type="text"
                        value={filters.code}
                        onChange={(event) => setFilters((prev) => ({ ...prev, code: event.target.value }))}
                        placeholder="Filtrar por código"
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    />
                    <select
                        value={filters.role}
                        onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value as ListFilters["role"] }))}
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                        <option value="">Todos los roles</option>
                        <option value="TEACHER">Docente</option>
                        <option value="STUDENT">Estudiante</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                    <select
                        value={filters.career}
                        onChange={(event) => setFilters((prev) => ({ ...prev, career: event.target.value }))}
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                        <option value="">Todas las carreras</option>
                        {careerOptions.map((careerOption) => (
                            <option key={careerOption.id} value={careerOption.id}>
                                {careerOption.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as ListFilters["status"] }))}
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
                    >
                        <option value="">Todos los estados</option>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            void applyFilters();
                        }}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90"
                    >
                        Buscar
                    </button>
                    <button
                        onClick={() => {
                            void clearFilters();
                        }}
                        className="inline-flex items-center justify-center rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-2 dark:border-strokedark dark:text-white"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center rounded-md bg-meta-3 px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90"
                    >
                        Nuevo usuario
                    </button>
                </div>
            </div>

            <GenericTable
                data={data}
                columns={["code", "fullName", "email", "role", "career", "status"]}
                actions={[
                    { name: "edit", label: "Editar" },
                    { name: "deactivate", label: "Desactivar" },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};

export default Users;
