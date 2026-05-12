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

export interface Teacher {
    id?: string;
    user_id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    identification: string;
    specialty?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Group {
    id?: string;
    teacher_id: string;
    subject_id: string;
    semester_id: string;
    name: string;
    group_code: string;
    capacity?: number;
    subject?: Subject;
    semester?: Semester;
    teacher?: Teacher;
    created_at?: string;
    updated_at?: string;
}

export interface GroupPayload {
    teacher_id: string;
    subject_id: string;
    semester_id: string;
    name: string;
    group_code: string;
    capacity?: number;
}

export interface GroupRow {
    id: string;
    groupCode: string;
    name: string;
    subject: string;
    semester: string;
    teacher: string;
    capacity: string;
}

export interface Student {
    id?: string;
    user_id: string;
    first_name: string;
    last_name: string;
    identification: string;
    created_at?: string;
    updated_at?: string;
}

export interface Registration {
    id?: string;
    student_id: string;
    career_id: string;
    admission_period: string;
    academic_status: string;
    is_active?: boolean;
    student?: Student;
    career?: Career;
    created_at?: string;
    updated_at?: string;
}

export interface RegistrationPayload {
    student_id: string;
    career_id: string;
    admission_period: string;
    academic_status: string;
    is_active?: boolean;
}

export interface RegistrationRow {
    id: string;
    studentName: string;
    careerName: string;
    admissionPeriod: string;
    academicStatus: string;
    status: string;
}
