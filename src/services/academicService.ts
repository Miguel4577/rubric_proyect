import axios from "axios";
import { api } from "../interceptors/authInterceptor";
import {
    Career,
    CareerPayload,
    Criterion,
    CriterionPayload,
    Semester,
    SemesterPayload,
    Rubric,
    RubricPayload,
    Scale,
    ScalePayload,
    Subject,
    SubjectPayload,
    StudyPlanVersion,
    StudyPlanVersionPayload,
} from "../models/Academic";

interface ApiResponse<T> {
    message: string;
    data: T;
}

const API_URL = "/academic";
const EVALUATION_API_URL = "/evaluation";

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

    async getRubrics(): Promise<Rubric[]> {
        try {
            const response = await api.get<ApiResponse<Rubric[]>>(`${EVALUATION_API_URL}/rubrics`);
            return unwrapResponse<Rubric[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createRubric(payload: RubricPayload): Promise<Rubric> {
        try {
            const response = await api.post<ApiResponse<Rubric>>(`${EVALUATION_API_URL}/rubrics`, payload);
            return unwrapResponse<Rubric>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async addCriterion(payload: CriterionPayload): Promise<Criterion> {
        try {
            const response = await api.post<ApiResponse<Criterion>>(`${EVALUATION_API_URL}/criteria`, payload);
            return unwrapResponse<Criterion>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async addScale(payload: ScalePayload): Promise<Scale> {
        try {
            const response = await api.post<ApiResponse<Scale>>(`${EVALUATION_API_URL}/scales`, payload);
            return unwrapResponse<Scale>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async publishRubric(rubricId: string): Promise<Rubric> {
        try {
            const response = await api.patch<ApiResponse<Rubric>>(`${EVALUATION_API_URL}/rubrics/${rubricId}/publish`);
            return unwrapResponse<Rubric>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }
}

export const academicService = new AcademicService();
