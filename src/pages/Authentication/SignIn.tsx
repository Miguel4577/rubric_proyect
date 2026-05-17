import React, { useState } from "react";
import { Field, Form, Formik, ErrorMessage } from "formik";
import * as Yup from "yup";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import Breadcrumb from "../../components/Breadcrumb";
import { firebaseAuth } from "../../config/firebase";
import { User } from "../../models/User";
import SecurityService from "../../services/securityService";
import Swal from "sweetalert2";
import { userService } from "../../services/userService";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [activeLogin, setActiveLogin] = useState<"password" | "google" | null>(null);

  const handlePasswordLogin = async (values: { email: string; password: string }) => {
    setActiveLogin("password");

    try {
      const response = await SecurityService.login({
        email: values.email,
        password: values.password,
      });

      if (!response.user) {
        throw new Error("No se pudo crear la sesión del usuario");
      }

      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setActiveLogin(null);
    }
  };

  const handleGoogleLogin = async () => {
    setActiveLogin("google");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credential = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser = credential.user;

      if (!firebaseUser.email) {
        throw new Error("No se pudo obtener el correo de Google");
      }

      const matchedUsers = await userService.searchUsers({ email: firebaseUser.email });
      const backendUser = matchedUsers[0];

      if (!backendUser) {
        throw new Error("Tu correo de Google no está registrado en el sistema");
      }

      if (backendUser.is_active === false) {
        throw new Error("El usuario está inactivo");
      }

      const accessToken = await firebaseUser.getIdToken();
      const sessionUser: User = {
        ...backendUser,
        id: backendUser.id,
        email: backendUser.email,
      };

      SecurityService.setSession({
        access_token: accessToken,
        token_type: "Bearer",
        user: sessionUser,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión con Google", error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión con Google";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setActiveLogin(null);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Iniciar sesión" />

      <div className="rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Acceso seguro
            </p>
            <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Inicia sesión en tu cuenta
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-sm border border-stroke p-6 dark:border-strokedark">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Usuario y contraseña
              </h3>

              <Formik
                initialValues={{
                  email: "",
                  password: "",
                }}
                validationSchema={Yup.object({
                  email: Yup.string().email("Email inválido").required("El email es obligatorio"),
                  password: Yup.string().required("La contraseña es obligatoria"),
                })}
                onSubmit={(values) => {
                  void handlePasswordLogin(values);
                }}
              >
                {() => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        placeholder="tu-correo@institucion.edu"
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary dark:border-strokedark dark:text-white"
                      />
                      <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Contraseña
                      </label>
                      <Field
                        type="password"
                        name="password"
                        placeholder="********"
                        className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary dark:border-strokedark dark:text-white"
                      />
                      <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-500" />
                    </div>

                    <button
                      type="submit"
                      disabled={activeLogin === "password"}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {activeLogin === "password" ? "Ingresando..." : "Ingresar"}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>

            <div className="rounded-sm border border-stroke p-6 dark:border-strokedark">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Continuar con Google
              </h3>
              <p className="mb-6 text-sm text-body">
                Usa tu cuenta de Google para autenticarte con Firebase.
              </p>

              <button
                type="button"
                disabled={activeLogin === "google"}
                onClick={() => {
                  void handleGoogleLogin();
                }}
                className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-stroke bg-white px-6 py-4 text-sm font-medium text-black transition hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
              >
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_191_13499)">
                      <path d="M19.999 10.2217C20.0111 9.53428 19.9387 8.84788 19.7834 8.17737H10.2031V11.8884H15.8266C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.9986 13.2661 19.9986 10.2217" fill="#4285F4" />
                      <path d="M10.2055 19.9999C12.9605 19.9999 15.2734 19.111 16.9629 17.5777L13.7429 15.1331C12.8813 15.7221 11.7248 16.1333 10.2055 16.1333C8.91513 16.1259 7.65991 15.7205 6.61791 14.9745C5.57592 14.2286 4.80007 13.1801 4.40044 11.9777L4.28085 11.9877L1.13101 14.3765L1.08984 14.4887C1.93817 16.1456 3.24007 17.5386 4.84997 18.5118C6.45987 19.4851 8.31429 20.0004 10.2059 19.9999" fill="#34A853" />
                      <path d="M4.39899 11.9777C4.1758 11.3411 4.06063 10.673 4.05807 9.99996C4.06218 9.32799 4.1731 8.66075 4.38684 8.02225L4.38115 7.88968L1.19269 5.4624L1.0884 5.51101C0.372763 6.90343 0 8.4408 0 9.99987C0 11.5589 0.372763 13.0963 1.0884 14.4887L4.39899 11.9777Z" fill="#FBBC05" />
                      <path d="M10.2059 3.86663C11.668 3.84438 13.0822 4.37803 14.1515 5.35558L17.0313 2.59996C15.1843 0.901848 12.7383 -0.0298855 10.2059 -3.6784e-05C8.31431 -0.000477834 6.4599 0.514732 4.85001 1.48798C3.24011 2.46124 1.9382 3.85416 1.08984 5.51101L4.38946 8.02225C4.79303 6.82005 5.57145 5.77231 6.61498 5.02675C7.65851 4.28118 8.9145 3.87541 10.2059 3.86663Z" fill="#EB4335" />
                    </g>
                    <defs>
                      <clipPath id="clip0_191_13499">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                {activeLogin === "google" ? "Iniciando sesión..." : "Continuar con Google"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;