import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import {
    Career,
    CareerPayload,
    Semester,
    SemesterPayload,
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

class AcademicService {
    async getCareers(): Promise<Career[]> {
        try {
            const response = await api.get<ApiResponse<Career[]>>(`${API_URL}/careers`);
            return unwrapResponse<Career[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getCareerById(id: string): Promise<Career> {
        try {
            const response = await api.get<ApiResponse<Career>>(`${API_URL}/careers/${id}`);
            return unwrapResponse<Career>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createCareer(payload: CareerPayload): Promise<Career> {
        try {
            const response = await api.post<ApiResponse<Career>>(`${API_URL}/careers`, payload);
            return unwrapResponse<Career>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateCareer(id: string, payload: CareerPayload): Promise<Career> {
        try {
            const response = await api.put<ApiResponse<Career>>(`${API_URL}/careers/${id}`, payload);
            return unwrapResponse<Career>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async archiveCareer(id: string): Promise<Career> {
        try {
            const response = await api.put<ApiResponse<Career>>(`${API_URL}/careers/${id}`, {
                is_active: false,
            });
            return unwrapResponse<Career>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getSemesters(): Promise<Semester[]> {
        try {
            const response = await api.get<ApiResponse<Semester[]>>(`${API_URL}/semesters`);
            return unwrapResponse<Semester[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getSemesterById(id: string): Promise<Semester> {
        try {
            const response = await api.get<ApiResponse<Semester>>(`${API_URL}/semesters/${id}`);
            return unwrapResponse<Semester>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createSemester(payload: SemesterPayload): Promise<Semester> {
        try {
            const response = await api.post<ApiResponse<Semester>>(`${API_URL}/semesters`, payload);
            return unwrapResponse<Semester>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateSemester(id: string, payload: SemesterPayload): Promise<Semester> {
        try {
            const response = await api.put<ApiResponse<Semester>>(`${API_URL}/semesters/${id}`, payload);
            return unwrapResponse<Semester>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }
}

export const academicService = new AcademicService();
