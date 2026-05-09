import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import {
    CreateUserPayload,
    UpdateUserPayload,
    User,
    UserFilters,
} from "../models/User";

const API_URL = "/users/";

interface ApiResponse<T> {
    message: string;
    data: T;
}

const unwrapResponse = <T>(payload: T | ApiResponse<T>): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as ApiResponse<T>).data;
    }
    return payload as T;
};

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === "string") {
            return apiMessage;
        }
    }
    return "Ocurrió un error inesperado";
};

class UserService {
    async getUsers(): Promise<User[]> {
        try {
            const response = await api.get<ApiResponse<User[]>>(API_URL);
            return unwrapResponse<User[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async searchUsers(filters: UserFilters): Promise<User[]> {
        try {
            const params: Record<string, string> = {};

            if (filters.role) {
                params.role = filters.role;
            }
            if (typeof filters.is_active === "boolean") {
                params.is_active = String(filters.is_active);
            }
            if (filters.career) {
                params.career = filters.career;
            }
            if (filters.email) {
                params.email = filters.email;
            }
            if (filters.code) {
                params.code = filters.code;
            }

            const response = await api.get<ApiResponse<User[]>>(`${API_URL}search`, { params });
            return unwrapResponse<User[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getUserById(id: string): Promise<User> {
        try {
            const response = await api.get<ApiResponse<User>>(`${API_URL}${id}`);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createUser(user: CreateUserPayload): Promise<User> {
        try {
            const response = await api.post<ApiResponse<User>>(API_URL, user);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateUser(id: string, user: UpdateUserPayload): Promise<User> {
        try {
            const response = await api.put<ApiResponse<User>>(`${API_URL}${id}`, user);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deactivateUser(id: string): Promise<User> {
        try {
            const response = await api.patch<ApiResponse<User>>(`${API_URL}${id}/deactivate`);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const userService = new UserService();
