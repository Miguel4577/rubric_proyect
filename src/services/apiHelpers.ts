import axios from "axios";

export interface ApiResponse<T> {
    message: string;
    data: T;
}

export const unwrapResponse = <T>(payload: T | ApiResponse<T>): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as ApiResponse<T>).data;
    }
    return payload as T;
};

export const getApiErrorMessage = (error: unknown, fallback = "Ocurrió un error inesperado"): string => {
    if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === "string") {
            return apiMessage;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};

export const getErrorMessage = getApiErrorMessage;