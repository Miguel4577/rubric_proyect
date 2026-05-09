import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { userService } from "../../services/userService";
import Swal from "sweetalert2";

import { UpdateUserPayload, User } from "../../models/User";
import Breadcrumb from "../../components/Breadcrumb";
import UserFormValidator from "../../components/users/UserFormValidator";

const UpdateUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;

            try {
                const userData = await userService.getUserById(id);
                setUser(userData);
            } catch (error) {
                Swal.fire({
                    title: "Error",
                    text: error instanceof Error ? error.message : "No se pudo cargar el usuario",
                    icon: "error",
                    timer: 3000,
                });
                navigate("/users/list");
            }
        };

        void fetchUser();
    }, [id, navigate]);

    const handleUpdateUser = async (theUser: UpdateUserPayload) => {
        try {
            await userService.updateUser(user?.id || "", theUser);
            Swal.fire({
                title: "Completado",
                text: "Se ha actualizado correctamente el registro",
                icon: "success",
                timer: 3000,
            });
            navigate("/users/list");
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error instanceof Error ? error.message : "Existe un problema al momento de actualizar el registro",
                icon: "error",
                timer: 3000,
            });
        }
    };

    if (!user) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <Breadcrumb pageName="Actualizar Usuario" />
            <UserFormValidator
                handleAction={handleUpdateUser}
                mode={2}
                user={user}
            />
        </>
    );
};

export default UpdateUserPage;