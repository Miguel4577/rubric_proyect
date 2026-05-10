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

export interface Subject {
    id?: string;
    name: string;
    code: string;
    credits: number;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SubjectPayload {
    name: string;
    code: string;
    credits: number;
    description?: string;
}

export interface StudyPlanSubject {
    id?: string;
    subject_id: string;
    semester: number;
    subject?: Subject;
}

export interface StudyPlanVersion {
    id?: string;
    career_id: string;
    subject_id: string;
    name?: string;
    year?: number;
    suggested_semester?: number;
    is_published?: boolean;
    subject?: Subject;
    created_at?: string;
    updated_at?: string;
}

export interface StudyPlanVersionPayload {
    career_id: string;
    subject_id: string;
    name?: string;
    year?: number;
    suggested_semester: number;
    is_published?: boolean;
}
