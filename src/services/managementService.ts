import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import {
    Teacher,
    Student,
    Group,
    GroupPayload,
    Registration,
    RegistrationPayload,
} from "../models/Academic";

interface ApiResponse<T> {
    message: string;
    data: T;
}

const API_URL = "/academic";

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

class ManagementService {
    // ============ TEACHERS ============
    async getTeachers(): Promise<Teacher[]> {
        try {
            const response = await api.get<ApiResponse<Teacher[]>>(`${API_URL}/teachers`);
            return unwrapResponse<Teacher[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getTeacherById(id: string): Promise<Teacher> {
        try {
            const response = await api.get<ApiResponse<Teacher>>(`${API_URL}/teachers/${id}`);
            return unwrapResponse<Teacher>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ============ STUDENTS ============
    async getStudents(): Promise<Student[]> {
        try {
            const response = await api.get<ApiResponse<Student[]>>(`${API_URL}/students`);
            return unwrapResponse<Student[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getStudentById(id: string): Promise<Student> {
        try {
            const response = await api.get<ApiResponse<Student>>(`${API_URL}/students/${id}`);
            return unwrapResponse<Student>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ============ GROUPS ============
    async getGroups(): Promise<Group[]> {
        try {
            const response = await api.get<ApiResponse<Group[]>>(`${API_URL}/groups`);
            return unwrapResponse<Group[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getGroupById(id: string): Promise<Group> {
        try {
            const response = await api.get<ApiResponse<Group>>(`${API_URL}/groups/${id}`);
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createGroup(payload: GroupPayload): Promise<Group> {
        try {
            const response = await api.post<ApiResponse<Group>>(`${API_URL}/groups`, payload);
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateGroup(id: string, payload: Partial<GroupPayload>): Promise<Group> {
        try {
            const response = await api.put<ApiResponse<Group>>(`${API_URL}/groups/${id}`, payload);
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async assignTeacherToGroup(groupId: string, teacherId: string): Promise<Group> {
        try {
            const response = await api.patch<ApiResponse<Group>>(
                `${API_URL}/groups/${groupId}/assign-teacher/${teacherId}`
            );
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteGroup(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/groups/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ============ REGISTRATIONS ============
    async getRegistrations(): Promise<Registration[]> {
        try {
            const response = await api.get<ApiResponse<Registration[]>>(`${API_URL}/registrations`);
            return unwrapResponse<Registration[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getRegistrationById(id: string): Promise<Registration> {
        try {
            const response = await api.get<ApiResponse<Registration>>(`${API_URL}/registrations/${id}`);
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createRegistration(payload: RegistrationPayload): Promise<Registration> {
        try {
            const response = await api.post<ApiResponse<Registration>>(`${API_URL}/registrations`, payload);
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateRegistration(id: string, payload: Partial<RegistrationPayload>): Promise<Registration> {
        try {
            const response = await api.put<ApiResponse<Registration>>(`${API_URL}/registrations/${id}`, payload);
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async cancelRegistration(id: string): Promise<Registration> {
        try {
            const response = await api.put<ApiResponse<Registration>>(`${API_URL}/registrations/${id}`, {
                is_active: false,
            });
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }
}

export const managementService = new ManagementService();
