import { api } from "../interceptors/authInterceptor";
import {
    Rubric,
    RubricPayload,
    Criterion,
    CriterionPayload,
    Scale,
    ScalePayload,
    Evaluation,
    EvaluationPayload,
    Grade,
    GradePayload,
    GradeDetail,
    GradeDetailPayload,
} from "../models/Academic";

interface ApiResponse<T> {
    message: string;
    data: T;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Utility functions
const unwrapResponse = <T>(response: ApiResponse<T>): T => response.data;

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
        return error.message;
    }
    return "An unknown error occurred";
};

class EvaluationService {
    // ===== Rubric Methods =====
    async getRubrics(): Promise<Rubric[]> {
        try {
            const response = await api.get<ApiResponse<Rubric[]>>(`${API_URL}/rubrics`);
            return unwrapResponse<Rubric[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getRubricById(id: string): Promise<Rubric> {
        try {
            const response = await api.get<ApiResponse<Rubric>>(`${API_URL}/rubrics/${id}`);
            return unwrapResponse<Rubric>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createRubric(payload: RubricPayload): Promise<Rubric> {
        try {
            const response = await api.post<ApiResponse<Rubric>>(`${API_URL}/rubrics`, payload);
            return unwrapResponse<Rubric>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateRubric(id: string, payload: Partial<RubricPayload>): Promise<Rubric> {
        try {
            const response = await api.put<ApiResponse<Rubric>>(`${API_URL}/rubrics/${id}`, payload);
            return unwrapResponse<Rubric>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async publishRubric(id: string): Promise<Rubric> {
        try {
            const response = await api.patch<ApiResponse<Rubric>>(`${API_URL}/rubrics/${id}/publish`);
            return unwrapResponse<Rubric>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteRubric(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/rubrics/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ===== Criterion Methods =====
    async getCriteria(rubricId: string): Promise<Criterion[]> {
        try {
            const response = await api.get<ApiResponse<Criterion[]>>(
                `${API_URL}/criteria?rubric_id=${rubricId}`
            );
            return unwrapResponse<Criterion[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getCriterionById(id: string): Promise<Criterion> {
        try {
            const response = await api.get<ApiResponse<Criterion>>(`${API_URL}/criteria/${id}`);
            return unwrapResponse<Criterion>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async addCriterion(payload: CriterionPayload): Promise<Criterion> {
        try {
            const response = await api.post<ApiResponse<Criterion>>(`${API_URL}/criteria`, payload);
            return unwrapResponse<Criterion>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateCriterion(id: string, payload: Partial<CriterionPayload>): Promise<Criterion> {
        try {
            const response = await api.put<ApiResponse<Criterion>>(`${API_URL}/criteria/${id}`, payload);
            return unwrapResponse<Criterion>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteCriterion(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/criteria/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ===== Scale Methods =====
    async getScales(criterionId: string): Promise<Scale[]> {
        try {
            const response = await api.get<ApiResponse<Scale[]>>(
                `${API_URL}/scales?criterion_id=${criterionId}`
            );
            return unwrapResponse<Scale[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getScaleById(id: string): Promise<Scale> {
        try {
            const response = await api.get<ApiResponse<Scale>>(`${API_URL}/scales/${id}`);
            return unwrapResponse<Scale>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async addScale(payload: ScalePayload): Promise<Scale> {
        try {
            const response = await api.post<ApiResponse<Scale>>(`${API_URL}/scales`, payload);
            return unwrapResponse<Scale>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateScale(id: string, payload: Partial<ScalePayload>): Promise<Scale> {
        try {
            const response = await api.put<ApiResponse<Scale>>(`${API_URL}/scales/${id}`, payload);
            return unwrapResponse<Scale>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteScale(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/scales/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ===== Evaluation Methods =====
    async getEvaluations(): Promise<Evaluation[]> {
        try {
            const response = await api.get<ApiResponse<Evaluation[]>>(`${API_URL}/evaluations`);
            return unwrapResponse<Evaluation[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getEvaluationById(id: string): Promise<Evaluation> {
        try {
            const response = await api.get<ApiResponse<Evaluation>>(`${API_URL}/evaluations/${id}`);
            return unwrapResponse<Evaluation>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createEvaluation(payload: EvaluationPayload): Promise<Evaluation> {
        try {
            const response = await api.post<ApiResponse<Evaluation>>(`${API_URL}/evaluations`, payload);
            return unwrapResponse<Evaluation>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateEvaluation(id: string, payload: Partial<EvaluationPayload>): Promise<Evaluation> {
        try {
            const response = await api.put<ApiResponse<Evaluation>>(`${API_URL}/evaluations/${id}`, payload);
            return unwrapResponse<Evaluation>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async associateRubricToEvaluation(evaluationId: string, rubricId: string): Promise<Evaluation> {
        try {
            const response = await api.patch<ApiResponse<Evaluation>>(
                `${API_URL}/evaluations/${evaluationId}/associate-rubric/${rubricId}`
            );
            return unwrapResponse<Evaluation>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteEvaluation(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/evaluations/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ===== Grade Methods =====
    async getGrades(): Promise<Grade[]> {
        try {
            const response = await api.get<ApiResponse<Grade[]>>(`${API_URL}/grades`);
            return unwrapResponse<Grade[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getGradeById(id: string): Promise<Grade> {
        try {
            const response = await api.get<ApiResponse<Grade>>(`${API_URL}/grades/${id}`);
            return unwrapResponse<Grade>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createGrade(payload: GradePayload): Promise<Grade> {
        try {
            const response = await api.post<ApiResponse<Grade>>(`${API_URL}/grades`, payload);
            return unwrapResponse<Grade>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async gradeStudent(payload: GradePayload): Promise<Grade> {
        try {
            const response = await api.post<ApiResponse<Grade>>(`${API_URL}/grades`, payload);
            return unwrapResponse<Grade>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateGrade(id: string, payload: Partial<GradePayload>): Promise<Grade> {
        try {
            const response = await api.put<ApiResponse<Grade>>(`${API_URL}/grades/${id}`, payload);
            return unwrapResponse<Grade>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async registerFinalScores(groupId: string): Promise<any> {
        try {
            const response = await api.post<ApiResponse<any>>(
                `${API_URL}/groups/${groupId}/register-final-scores`
            );
            return unwrapResponse<any>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    // ===== GradeDetail Methods =====
    async getGradeDetails(): Promise<GradeDetail[]> {
        try {
            const response = await api.get<ApiResponse<GradeDetail[]>>(`${API_URL}/grade-details`);
            return unwrapResponse<GradeDetail[]>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async getGradeDetailById(id: string): Promise<GradeDetail> {
        try {
            const response = await api.get<ApiResponse<GradeDetail>>(`${API_URL}/grade-details/${id}`);
            return unwrapResponse<GradeDetail>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async createGradeDetail(payload: GradeDetailPayload): Promise<GradeDetail> {
        try {
            const response = await api.post<ApiResponse<GradeDetail>>(
                `${API_URL}/grade-details`,
                payload
            );
            return unwrapResponse<GradeDetail>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async updateGradeDetail(id: string, payload: Partial<GradeDetailPayload>): Promise<GradeDetail> {
        try {
            const response = await api.put<ApiResponse<GradeDetail>>(
                `${API_URL}/grade-details/${id}`,
                payload
            );
            return unwrapResponse<GradeDetail>(response.data);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }

    async deleteGradeDetail(id: string): Promise<void> {
        try {
            await api.delete(`${API_URL}/grade-details/${id}`);
        } catch (error) {
            throw new Error(getErrorMessage(error));
        }
    }
}

export const evaluationService = new EvaluationService();
