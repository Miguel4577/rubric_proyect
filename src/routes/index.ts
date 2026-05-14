import { lazy } from 'react';

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

const coreRoutes = [
  {
    path: '/users/list',
    title: 'Users',
    component: UserList,
  },
  {
    path: '/users/create',
    title: 'Create User',
    component: UserCreate,
  },
  {
    path: '/users/update/:id',
    title: 'Edit User',
    component: UserUpdate,
  },
  {
    path: '/roles-list',
    title: 'Roles',
    component: RoleList,
  },
  {
    path: '/academic/careers-semesters',
    title: 'Carreras y semestres',
    component: CareersSemesters,
  },
  {
    path: '/academic/study-plans',
    title: 'Gestionar Plan de Estudios',
    component: StudyPlans,
  },
  {
    path: '/academic/subjects',
    title: 'Gestionar Asignaturas',
    component: Subjects,
  },
  {
    path: '/academic/scales',
    title: 'Definir Criterios y Escalas',
    component: Scales,
  },
  {
    path: '/academic/rubrics',
    title: 'Gestionar Rúbricas',
    component: Rubrics,
  },
  {
    path: '/academic/evaluations/associate-rubric',
    title: 'Asociar Rúbrica a Evaluación',
    component: AssociateRubric,
  },
  {
    path: '/academic/evaluations/grade-student',
    title: 'Calificar Estudiante con Rúbrica',
    component: GradeStudent,
  },
  {
    path: '/academic/evaluations/final-scores',
    title: 'Registrar Nota Final',
    component: FinalScores,
  },
  {
    path: '/academic/assign-teacher',
    title: 'Asignar Docentes',
    component: AssignTeacherToGroup,
  },

    {
    path: '/academic/student-enrollment',
    title: 'Inscribir Estudiante en Grupo',
    component: StudentEnrollment,
  },
  {
    path: '/academic/groups',
    title: 'Gestionar Grupos',
    component: Groups,
  },
  {
    path: '/academic/student-registration',
    title: 'Matricular Estudiantes',
    component: StudentRegistration,
  },
  {
    path: '/calendar',
    title: 'Calender',
    component: Calendar,
  },
  {
    path: '/profile',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/forms/form-elements',
    title: 'Forms Elements',
    component: FormElements,
  },
  {
    path: '/forms/form-layout',
    title: 'Form Layouts',
    component: FormLayout,
  },
  {
    path: '/tables',
    title: 'Tables',
    component: Tables,
  },
  {
    path: '/settings',
    title: 'Settings',
    component: Settings,
  },
  {
    path: '/ui/alerts',
    title: 'Alerts',
    component: Alerts,
  },
  {
    path: '/ui/buttons',
    title: 'Buttons',
    component: Buttons,
  },
  
];

const routes = [...coreRoutes];
export default routes;
