import { api } from "../interceptors/authInterceptor";
import {
    CreateUserPayload,
    UpdateUserPayload,
    User,
    UserFilters,
} from "../models/User";
import { ApiResponse, getApiErrorMessage, unwrapResponse } from "./apiHelpers";

const API_URL = "/users/";

class UserService {
    async getUsers(): Promise<User[]> {
        try {
            const response = await api.get<ApiResponse<User[]>>(API_URL);
            return unwrapResponse<User[]>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
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
            throw new Error(getApiErrorMessage(error));
        }
    }

    async getUserById(id: string): Promise<User> {
        try {
            const response = await api.get<ApiResponse<User>>(`${API_URL}${id}`);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async createUser(user: CreateUserPayload): Promise<User> {
        try {
            const response = await api.post<ApiResponse<User>>(API_URL, user);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async updateUser(id: string, user: UpdateUserPayload): Promise<User> {
        try {
            const response = await api.put<ApiResponse<User>>(`${API_URL}${id}`, user);
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async deactivateUser(id: string): Promise<User> {
        try {
            const response = await api.put<ApiResponse<User>>(`${API_URL}${id}`, { is_active: false });
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async activateUser(id: string): Promise<User> {
        try {
            const response = await api.put<ApiResponse<User>>(`${API_URL}${id}`, { is_active: true });
            return unwrapResponse<User>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const userService = new UserService();
