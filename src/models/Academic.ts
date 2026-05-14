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
    subject_id?: string;
    name?: string;
    year?: number;
    suggested_semester?: number;
    is_published?: boolean;
    subject?: Subject;
    subjects?: Subject[];
    created_at?: string;
    updated_at?: string;
}

export interface StudyPlanVersionPayload {
    career_id: string;
    subject_id?: string;
    name?: string;
    year: number;
    suggested_semester: number;
    is_published?: boolean;
}

export interface Rubric {
    id?: string;
    subject_id: string;
    title: string;
    description?: string;
    is_public?: boolean;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface RubricPayload {
    subject_id: string;
    title: string;
    description?: string;
    is_public?: boolean;
    is_archived?: boolean;
}

export interface Criterion {
    id?: string;
    rubric_id: string;
    name: string;
    description?: string;
    weight: number;
    created_at?: string;
    updated_at?: string;
}

export interface CriterionPayload {
    rubric_id: string;
    name: string;
    description?: string;
    weight: number;
}

export interface Scale {
    id?: string;
    criterion_id: string;
    name: string;
    description?: string;
    value: number;
    created_at?: string;
    updated_at?: string;
}

export interface ScalePayload {
    criterion_id: string;
    name: string;
    description?: string;
    value: number;
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

// ===== Enrollment (HU-07) =====
export interface Enrollment {
    id?: string;
    student_id: string;
    group_id: string;
    enrollment_date?: string;
    status?: string;
    student?: Student;
    group?: Group;
    created_at?: string;
    updated_at?: string;
}

export interface EnrollmentPayload {
    student_id: string;
    group_id: string;
    status?: string;
}

export interface EnrollmentRow {
    id: string;
    studentName: string;
    groupName: string;
    subject: string;
    semester: string;
    status: string;
}

// ===== Rubric System (HU-08 to HU-12) =====
export interface Rubric {
    id?: string;
    title: string;
    description?: string;
    is_public?: boolean;
    is_archived?: boolean;
    criteria?: Criterion[];
    created_at?: string;
    updated_at?: string;
}

export interface RubricPayload {
    title: string;
    description?: string;
    is_public?: boolean;
}

export interface Criterion {
    id?: string;
    rubric_id: string;
    name: string;
    description?: string;
    weight: number;
    scales?: Scale[];
    created_at?: string;
    updated_at?: string;
}

export interface CriterionPayload {
    rubric_id: string;
    name: string;
    description?: string;
    weight: number;
}

export interface Scale {
    id?: string;
    criterion_id: string;
    name: string;
    description?: string;
    value: number;
    created_at?: string;
    updated_at?: string;
}

export interface ScalePayload {
    criterion_id: string;
    name: string;
    description?: string;
    value: number;
}

export interface Evaluation {
    id?: string;
    subject_id: string;
    rubric_id?: string;
    group_id: string;
    name: string;
    description?: string;
    weight: number;
    subject?: Subject;
    rubric?: Rubric;
    group?: Group;
    created_at?: string;
    updated_at?: string;
}

export interface EvaluationPayload {
    subject_id: string;
    group_id: string;
    name: string;
    description?: string;
    weight: number;
    rubric_id?: string;
}

export interface Grade {
    id?: string;
    enrollment_id: string;
    rubric_id: string;
    final_score: number;
    status: string;
    observations?: string;
    is_locked?: boolean;
    enrollment?: Enrollment;
    rubric?: Rubric;
    grade_details?: GradeDetail[];
    details?: GradeDetail[];
    created_at?: string;
    updated_at?: string;
}

export interface GradeSubmissionDetail {
    scale_id: string;
    comment?: string;
}

export interface GradePayload {
    enrollment_id: string;
    rubric_id: string;
    evaluation_id?: string;
    final_score: number;
    status?: string;
    observations?: string;
    details?: GradeSubmissionDetail[];
}

export interface GradeDetail {
    id?: string;
    scale_id: string;
    student_id: string;
    score: number;
    comment?: string;
    scale?: Scale;
    student?: Student;
    created_at?: string;
    updated_at?: string;
}

export interface GradeDetailPayload {
    scale_id: string;
    student_id: string;
    score: number;
    comment?: string;
}
