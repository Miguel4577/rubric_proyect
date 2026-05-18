import { Navigate, Outlet } from "react-router-dom";
import SecurityService from "../../services/securityService";

// Componente de Ruta Protegida
const ProtectedRoute = () => {
    return SecurityService.isAuthenticated() ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;