export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface UserProfile {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    identification?: string;
    specialty?: string;
}

export interface UserCareer {
    id: string;
    name: string;
    code: string;
}

export interface User {
    id?: string;
    email?: string;
    code?: string;
    role?: UserRole;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    profile?: UserProfile | null;
    careers?: UserCareer[];

    // Campos legacy para compatibilidad con auth/plantilla
    name?: string;
    username?: string;
    phone?: string;
    password?: string;
}

export interface UserFilters {
    role?: UserRole;
    is_active?: boolean;
    career?: string;
    email?: string;
    code?: string;
}

export interface CreateUserPayload {
    email: string;
    password: string;
    code: string;
    role: UserRole;
    first_name: string;
    last_name: string;
    identification: string;
    phone?: string;
    specialty?: string;
}

export interface UpdateUserPayload {
    email?: string;
    password?: string;
    code?: string;
    is_active?: boolean;
    first_name?: string;
    last_name?: string;
    identification?: string;
    phone?: string;
    specialty?: string;
}