import React from "react";
import { Navigate } from "react-router-dom";

import { UserRole } from "../../models/User";
import { getCurrentUserRole, hasRoleAccess } from "../../config/accessControl";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, redirectTo = "/" }) => {
    const userRole = getCurrentUserRole();

    if (!hasRoleAccess(allowedRoles, userRole)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;