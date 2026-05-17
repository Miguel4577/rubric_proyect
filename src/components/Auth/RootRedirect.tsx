import { Navigate } from "react-router-dom";

import SecurityService from "../../services/securityService";

const RootRedirect = () => {
    return SecurityService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth/signin" replace />;
};

export default RootRedirect;