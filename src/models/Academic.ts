export interface Career {
    id?: string;
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Semester {
    id?: string;
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CareerPayload {
    name: string;
    code: string;
    description?: string;
    is_active?: boolean;
}

export interface SemesterPayload {
    name: string;
    code: string;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}
