import { User, UserRole } from "../models/User";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";

const storage = new LocalStorageProvider();

export const ALL_ROLES: UserRole[] = ["ADMIN", "TEACHER", "STUDENT"];
export const ADMIN_ONLY: UserRole[] = ["ADMIN"];
export const ADMIN_TEACHER: UserRole[] = ["ADMIN", "TEACHER"];
export const STUDENT_ONLY: UserRole[] = ["STUDENT"];

export const getCurrentUser = (): User | null => {
    const storedUser = storage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as User;
    } catch (error) {
        return null;
    }
};

export const getCurrentUserRole = (): UserRole | null => getCurrentUser()?.role ?? null;

export const hasRoleAccess = (allowedRoles: UserRole[] | undefined, role: UserRole | null): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) {
        return true;
    }

    if (!role) {
        return false;
    }

    return allowedRoles.includes(role);
};