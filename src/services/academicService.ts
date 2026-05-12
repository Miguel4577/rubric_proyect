import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import {
    Career,
    CareerPayload,
    Semester,
    SemesterPayload,
    Subject,
    SubjectPayload,
    StudyPlanVersion,
    StudyPlanVersionPayload,
    Teacher,
    Group,
    GroupPayload,
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

    async getSubjects(): Promise<Subject[]> {
        try {
            const response = await api.get<ApiResponse<Subject[]>>(`${API_URL}/subjects`);
            return unwrapResponse<Subject[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getSubjectById(id: string): Promise<Subject> {
        try {
            const response = await api.get<ApiResponse<Subject>>(`${API_URL}/subjects/${id}`);
            return unwrapResponse<Subject>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createSubject(payload: SubjectPayload): Promise<Subject> {
        try {
            const response = await api.post<ApiResponse<Subject>>(`${API_URL}/subjects`, payload);
            return unwrapResponse<Subject>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateSubject(id: string, payload: SubjectPayload): Promise<Subject> {
        try {
            const response = await api.put<ApiResponse<Subject>>(`${API_URL}/subjects/${id}`, payload);
            return unwrapResponse<Subject>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async archiveSubject(id: string): Promise<Subject> {
        try {
            const response = await api.put<ApiResponse<Subject>>(`${API_URL}/subjects/${id}`, {
                is_active: false,
            });
            return unwrapResponse<Subject>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async reactivateSubject(id: string): Promise<Subject> {
        try {
            const response = await api.put<ApiResponse<Subject>>(`${API_URL}/subjects/${id}`, {
                is_active: true,
            });
            return unwrapResponse<Subject>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getStudyPlanVersions(careerId: string): Promise<StudyPlanVersion[]> {
        try {
            const response = await api.get<ApiResponse<StudyPlanVersion[]>>(`${API_URL}/study-plans`);
            const allPlans = unwrapResponse<StudyPlanVersion[]>(response.data);
            return allPlans.filter((plan) => plan.career_id === careerId);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async addStudyPlanSubject(payload: StudyPlanVersionPayload): Promise<StudyPlanVersion> {
        try {
            const response = await api.post<ApiResponse<StudyPlanVersion>>(`${API_URL}/study-plans`, payload);
            return unwrapResponse<StudyPlanVersion>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createStudyPlanVersion(payload: StudyPlanVersionPayload): Promise<StudyPlanVersion> {
        try {
            const response = await api.post<ApiResponse<StudyPlanVersion>>(`${API_URL}/study-plans`, payload);
            return unwrapResponse<StudyPlanVersion>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getStudyPlanVersionHistory(careerId: string): Promise<StudyPlanVersion[]> {
        try {
            const response = await api.get<ApiResponse<StudyPlanVersion[]>>(`${API_URL}/study-plans`);
            const allPlans = unwrapResponse<StudyPlanVersion[]>(response.data);
            return allPlans.filter((plan) => plan.career_id === careerId);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteStudyPlanSubject(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/study-plans/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

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
}

export const academicService = new AcademicService();
