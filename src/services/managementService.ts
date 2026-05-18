import { api } from "../interceptors/authInterceptor";
import {
    Teacher,
    Student,
    Group,
    GroupPayload,
    Registration,
    RegistrationPayload,
    Enrollment,
    EnrollmentPayload,
} from "../models/Academic";
import { ApiResponse, getApiErrorMessage, unwrapResponse } from "./apiHelpers";

const API_URL = "/academic";

class ManagementService {
    // ============ TEACHERS ============
    async getTeachers(): Promise<Teacher[]> {
        try {
            const response = await api.get<ApiResponse<Teacher[]>>(`${API_URL}/teachers`);
            return unwrapResponse<Teacher[]>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async getTeacherById(id: string): Promise<Teacher> {
        try {
            const response = await api.get<ApiResponse<Teacher>>(`${API_URL}/teachers/${id}`);
            return unwrapResponse<Teacher>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    // ============ STUDENTS ============
    async getStudents(): Promise<Student[]> {
        try {
            const response = await api.get<ApiResponse<Student[]>>(`${API_URL}/students`);
            return unwrapResponse<Student[]>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async getStudentById(id: string): Promise<Student> {
        try {
            const response = await api.get<ApiResponse<Student>>(`${API_URL}/students/${id}`);
            return unwrapResponse<Student>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    // ============ GROUPS ============
    async getGroups(): Promise<Group[]> {
        try {
            const response = await api.get<ApiResponse<Group[]>>(`${API_URL}/groups`);
            return unwrapResponse<Group[]>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async getGroupById(id: string): Promise<Group> {
        try {
            const response = await api.get<ApiResponse<Group>>(`${API_URL}/groups/${id}`);
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async createGroup(payload: GroupPayload): Promise<Group> {
        try {
            const response = await api.post<ApiResponse<Group>>(`${API_URL}/groups`, payload);
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async updateGroup(id: string, payload: Partial<GroupPayload>): Promise<Group> {
        try {
            const response = await api.put<ApiResponse<Group>>(`${API_URL}/groups/${id}`, payload);
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async assignTeacherToGroup(groupId: string, teacherId: string): Promise<Group> {
        try {
            const response = await api.patch<ApiResponse<Group>>(
                `${API_URL}/groups/${groupId}/assign-teacher/${teacherId}`
            );
            return unwrapResponse<Group>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async deleteGroup(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/groups/${id}`);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    // ============ REGISTRATIONS ============
    async getRegistrations(): Promise<Registration[]> {
        try {
            const response = await api.get<ApiResponse<Registration[]>>(`${API_URL}/registrations`);
            return unwrapResponse<Registration[]>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async getRegistrationById(id: string): Promise<Registration> {
        try {
            const response = await api.get<ApiResponse<Registration>>(`${API_URL}/registrations/${id}`);
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async createRegistration(payload: RegistrationPayload): Promise<Registration> {
        try {
            const response = await api.post<ApiResponse<Registration>>(`${API_URL}/registrations`, payload);
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async updateRegistration(id: string, payload: Partial<RegistrationPayload>): Promise<Registration> {
        try {
            const response = await api.put<ApiResponse<Registration>>(`${API_URL}/registrations/${id}`, payload);
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async cancelRegistration(id: string): Promise<Registration> {
        try {
            const response = await api.put<ApiResponse<Registration>>(`${API_URL}/registrations/${id}`, {
                is_active: false,
            });
            return unwrapResponse<Registration>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    // ============ ENROLLMENTS (HU-07) ============
    async getEnrollments(): Promise<Enrollment[]> {
        try {
            const response = await api.get<ApiResponse<Enrollment[]>>(`${API_URL}/enrollments`);
            return unwrapResponse<Enrollment[]>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async getEnrollmentById(id: string): Promise<Enrollment> {
        try {
            const response = await api.get<ApiResponse<Enrollment>>(`${API_URL}/enrollments/${id}`);
            return unwrapResponse<Enrollment>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async createEnrollment(payload: EnrollmentPayload): Promise<Enrollment> {
        try {
            const response = await api.post<ApiResponse<Enrollment>>(`${API_URL}/enrollments`, payload);
            return unwrapResponse<Enrollment>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async updateEnrollment(id: string, payload: Partial<EnrollmentPayload>): Promise<Enrollment> {
        try {
            const response = await api.put<ApiResponse<Enrollment>>(`${API_URL}/enrollments/${id}`, payload);
            return unwrapResponse<Enrollment>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }

    async cancelEnrollment(id: string): Promise<Enrollment> {
        try {
            const response = await api.put<ApiResponse<Enrollment>>(`${API_URL}/enrollments/${id}`, {
                status: "CANCELLED",
            });
            return unwrapResponse<Enrollment>(response.data);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }
}

export const managementService = new ManagementService();
