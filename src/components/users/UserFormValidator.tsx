import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    CreateUserPayload,
    UpdateUserPayload,
    User,
    UserRole,
} from "../../models/User";

interface MyFormProps {
    mode: number;
    handleAction: (values: CreateUserPayload | UpdateUserPayload) => void;
    user?: User | null;
}

const UserFormValidator: React.FC<MyFormProps> = ({ mode, handleAction, user }) => {
    const isCreate = mode === 1;

    const initialValues = {
        email: user?.email || "",
        code: user?.code || "",
        role: (user?.role || "TEACHER") as UserRole,
        password: "",
        is_active: user?.is_active ?? true,
        first_name: user?.profile?.first_name || "",
        last_name: user?.profile?.last_name || "",
        identification: user?.profile?.identification || "",
        phone: user?.profile?.phone || "",
        specialty: user?.profile?.specialty || "",
    };

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={Yup.object({
                email: Yup.string()
                    .email("Email inválido")
                    .required("El email es obligatorio"),
                code: Yup.string().required("El código es obligatorio"),
                role: Yup.string().oneOf(["ADMIN", "TEACHER", "STUDENT"]).required(),
                password: isCreate
                    ? Yup.string().min(8, "Mínimo 8 caracteres").required("La contraseña es obligatoria")
                    : Yup.string().min(8, "Mínimo 8 caracteres").notRequired(),
                first_name: Yup.string().required("El nombre es obligatorio"),
                last_name: Yup.string().required("El apellido es obligatorio"),
                identification: Yup.string().required("La identificación es obligatoria"),
                phone: Yup.string().notRequired(),
                specialty: Yup.string().notRequired(),
            })}
            onSubmit={(values) => {
                if (isCreate) {
                    const payload: CreateUserPayload = {
                        email: values.email,
                        password: values.password,
                        code: values.code,
                        role: values.role,
                        first_name: values.first_name,
                        last_name: values.last_name,
                        identification: values.identification,
                        phone: values.role === "TEACHER" ? values.phone || undefined : undefined,
                        specialty: values.role === "TEACHER" ? values.specialty || undefined : undefined,
                    };
                    handleAction(payload);
                    return;
                }

                const payload: UpdateUserPayload = {
                    email: values.email,
                    code: values.code,
                    is_active: values.is_active,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    identification: values.identification,
                    phone: values.role === "TEACHER" ? values.phone || undefined : undefined,
                    specialty: values.role === "TEACHER" ? values.specialty || undefined : undefined,
                };

                if (values.password) {
                    payload.password = values.password;
                }

                handleAction(payload);
            }}
        >
            {({ handleSubmit, values, setFieldValue }) => (
                <Form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 rounded-md bg-white p-6 shadow-md"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                Correo institucional
                            </label>
                            <Field type="email" name="email" className="w-full rounded-md border p-2" />
                            <ErrorMessage name="email" component="p" className="text-sm text-red-500" />
                        </div>

                        <div>
                            <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">
                                Código
                            </label>
                            <Field type="text" name="code" className="w-full rounded-md border p-2" />
                            <ErrorMessage name="code" component="p" className="text-sm text-red-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
                                Rol
                            </label>
                            <Field as="select" name="role" className="w-full rounded-md border p-2" disabled={!isCreate}>
                                <option value="TEACHER">Docente</option>
                                <option value="STUDENT">Estudiante</option>
                                <option value="ADMIN">Administrador</option>
                            </Field>
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                                {isCreate ? "Contraseña" : "Contraseña (opcional)"}
                            </label>
                            <Field
                                type="password"
                                name="password"
                                className="w-full rounded-md border p-2"
                                placeholder={isCreate ? "Mínimo 8 caracteres" : "Dejar vacío para no cambiar"}
                            />
                            <ErrorMessage name="password" component="p" className="text-sm text-red-500" />
                        </div>
                    </div>

                    {!isCreate && (
                        <div>
                            <label htmlFor="is_active" className="mb-1 block text-sm font-medium text-gray-700">
                                Estado
                            </label>
                            <Field
                                as="select"
                                name="is_active"
                                className="w-full rounded-md border p-2"
                                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                    setFieldValue("is_active", event.target.value === "true");
                                }}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </Field>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <Field type="text" name="first_name" className="w-full rounded-md border p-2" />
                            <ErrorMessage name="first_name" component="p" className="text-sm text-red-500" />
                        </div>

                        <div>
                            <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                                Apellido
                            </label>
                            <Field type="text" name="last_name" className="w-full rounded-md border p-2" />
                            <ErrorMessage name="last_name" component="p" className="text-sm text-red-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="identification" className="mb-1 block text-sm font-medium text-gray-700">
                                Identificación
                            </label>
                            <Field type="text" name="identification" className="w-full rounded-md border p-2" />
                            <ErrorMessage name="identification" component="p" className="text-sm text-red-500" />
                        </div>

                        {values.role === "TEACHER" ? (
                            <div>
                                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <Field type="text" name="phone" className="w-full rounded-md border p-2" />
                            </div>
                        ) : null}
                    </div>

                    {values.role === "TEACHER" ? (
                        <div>
                            <label htmlFor="specialty" className="mb-1 block text-sm font-medium text-gray-700">
                                Especialidad
                            </label>
                            <Field type="text" name="specialty" className="w-full rounded-md border p-2" />
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        className={`
                        inline-flex items-center justify-center
                        rounded-full
                        px-6 py-2
                        text-center font-medium text-white
                        transition hover:bg-opacity-90
                        ${isCreate ? "bg-primary" : "bg-meta-3"}
                    `}
                    >
                        {isCreate ? "Crear" : "Actualizar"}
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default UserFormValidator;