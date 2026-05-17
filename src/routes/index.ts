import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { ADMIN_ONLY, ADMIN_TEACHER, ALL_ROLES } from '../config/accessControl';
import { UserRole } from '../models/User';

interface AppRoute {
  path: string;
  title: string;
  component: LazyExoticComponent<ComponentType<any>>;
  allowedRoles?: UserRole[];
}

const Calendar = lazy(() => import('../pages/Calendar'));
const FormElements = lazy(() => import('../pages/Form/FormElements'));
const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Tables = lazy(() => import('../pages/Tables'));
const Alerts = lazy(() => import('../pages/UiElements/Alerts'));
const Buttons = lazy(() => import('../pages/UiElements/Buttons'));
const CareersSemesters = lazy(() => import('../pages/Academic/CareersSemesters'));
const StudyPlans = lazy(() => import('../pages/Academic/StudyPlans'));
const Subjects = lazy(() => import('../pages/Academic/Subjects'));
const Scales = lazy(() => import('../pages/Academic/Rubrics/Scales/Scales'));
const AssociateRubric = lazy(() => import('../pages/Academic/Evaluations/AssociateRubric'));
const GradeStudent = lazy(() => import('../pages/Academic/Evaluations/GradeStudent/index'));
const FinalScores = lazy(() => import('../pages/Academic/Evaluations/FinalScores/index'));
const AssignTeacherToGroup = lazy(() => import('../pages/Academic/AssignTeacherToGroup'));
const Groups = lazy(() => import('../pages/Academic/Groups'));
const StudentRegistration = lazy(() => import('../pages/Academic/StudentRegistration'));
const Rubrics = lazy(() => import('../pages/Academic/Rubrics/Rubrics'));
const UserList= lazy(() => import('../pages/Users/ListUsers'));
const UserCreate= lazy(() => import('../pages/Users/Create'));
const UserUpdate= lazy(() => import('../pages/Users/Update'));
const RoleList= lazy(() => import('../pages/Roles/List'));
const StudentEnrollment = lazy(() => import('../pages/Academic/StudentEnrollment'));

const coreRoutes: AppRoute[] = [
  {
    path: '/users/list',
    title: 'Users',
    component: UserList,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/users/create',
    title: 'Create User',
    component: UserCreate,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/users/update/:id',
    title: 'Edit User',
    component: UserUpdate,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/roles-list',
    title: 'Roles',
    component: RoleList,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/academic/careers-semesters',
    title: 'Carreras y semestres',
    component: CareersSemesters,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/academic/study-plans',
    title: 'Gestionar Plan de Estudios',
    component: StudyPlans,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/academic/subjects',
    title: 'Gestionar Asignaturas',
    component: Subjects,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/academic/scales',
    title: 'Definir Criterios y Escalas',
    component: Scales,
    allowedRoles: ADMIN_TEACHER,
  },
  {
    path: '/academic/rubrics',
    title: 'Gestionar Rúbricas',
    component: Rubrics,
    allowedRoles: ADMIN_TEACHER,
  },
  {
    path: '/academic/evaluations/associate-rubric',
    title: 'Asociar Rúbrica a Evaluación',
    component: AssociateRubric,
    allowedRoles: ADMIN_TEACHER,
  },
  {
    path: '/academic/evaluations/grade-student',
    title: 'Calificar Estudiante con Rúbrica',
    component: GradeStudent,
    allowedRoles: ADMIN_TEACHER,
  },
  {
    path: '/academic/evaluations/final-scores',
    title: 'Registrar Nota Final',
    component: FinalScores,
    allowedRoles: ADMIN_TEACHER,
  },
  {
    path: '/academic/assign-teacher',
    title: 'Asignar Docentes',
    component: AssignTeacherToGroup,
    allowedRoles: ADMIN_ONLY,
  },

    {
    path: '/academic/student-enrollment',
    title: 'Inscribir Estudiante en Grupo',
    component: StudentEnrollment,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/academic/groups',
    title: 'Gestionar Grupos',
    component: Groups,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/academic/student-registration',
    title: 'Matricular Estudiantes',
    component: StudentRegistration,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
    allowedRoles: ALL_ROLES,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
    allowedRoles: ALL_ROLES,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
    allowedRoles: ALL_ROLES,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
    allowedRoles: ADMIN_ONLY,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
    allowedRoles: ADMIN_ONLY,
  },
  
];

const routes = [...coreRoutes];
export default routes;
