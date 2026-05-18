import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../../components/Breadcrumb';
import { getCurrentUser } from '../../../../config/accessControl';
import { Criterion, Evaluation, Group, Rubric, Scale, Student, Enrollment } from '../../../../models/Academic';
import { evaluationService } from '../../../../services/evaluationService';
import { managementService } from '../../../../services/managementService';

type RubricCriterion = Criterion & { scales: Scale[] };

type RubricConsultationView = {
  evaluation: Evaluation;
  groupName: string;
  subjectName: string;
  rubric: Rubric;
  criteria: RubricCriterion[];
};

const formatDate = (value?: string) => {
  if (!value) {
    return 'Sin fecha de publicación';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleDateString('es-ES');
};

const RubricConsultation = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');
  const [rubricView, setRubricView] = useState<RubricConsultationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRubric, setLoadingRubric] = useState(false);

  const currentUser = getCurrentUser();

  const currentStudent = useMemo(
    () => students.find((student) => student.user_id === currentUser?.id),
    [currentUser?.id, students]
  );

  const groupById = useMemo(() => new Map(groups.map((group) => [group.id || '', group])), [groups]);

  const publicRubricsById = useMemo(
    () => new Map(rubrics.filter((rubric) => rubric.id && rubric.is_public).map((rubric) => [rubric.id || '', rubric])),
    [rubrics]
  );

  const activeEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          enrollment.student_id === currentStudent?.id && enrollment.status !== 'CANCELLED'
      ),
    [currentStudent?.id, enrollments]
  );

  const availableEvaluations = useMemo(
    () =>
      evaluations
        .filter(
          (evaluation) =>
            Boolean(evaluation.id) &&
            Boolean(evaluation.rubric_id) &&
            publicRubricsById.has(evaluation.rubric_id || '') &&
            activeEnrollments.some((enrollment) => enrollment.group_id === evaluation.group_id)
        )
        .sort((first, second) => first.name.localeCompare(second.name)),
    [activeEnrollments, evaluations, publicRubricsById]
  );

  const selectedEvaluation = useMemo(
    () => availableEvaluations.find((evaluation) => evaluation.id === selectedEvaluationId),
    [availableEvaluations, selectedEvaluationId]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentData, groupData, enrollmentData, evaluationData, rubricData] = await Promise.all([
        managementService.getStudents(),
        managementService.getGroups(),
        managementService.getEnrollments(),
        evaluationService.getEvaluations(),
        evaluationService.getRubrics(),
      ]);

      setStudents(studentData.filter((student) => student.id));
      setGroups(groupData.filter((group) => group.id));
      setEnrollments(enrollmentData);
      setEvaluations(evaluationData.filter((evaluation) => evaluation.id));
      setRubrics(rubricData.filter((rubric) => rubric.id));
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la información de rúbricas',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const loadRubric = async () => {
      if (!selectedEvaluation?.rubric_id) {
        setRubricView(null);
        return;
      }

      setLoadingRubric(true);
      try {
        const rubric = publicRubricsById.get(selectedEvaluation.rubric_id);

        if (!rubric) {
          throw new Error('La rúbrica seleccionada no está publicada o ya no está disponible.');
        }

        const criteria = await evaluationService.getCriteria(selectedEvaluation.rubric_id);

        const criteriaWithScales = await Promise.all(
          criteria.map(async (criterion) => ({
            ...criterion,
            scales: criterion.id ? await evaluationService.getScales(criterion.id) : [],
          }))
        );

        const group = groupById.get(selectedEvaluation.group_id || '');

        setRubricView({
          evaluation: selectedEvaluation,
          groupName: group?.name ? `${group.name} · ${group.group_code}` : selectedEvaluation.group_id,
          subjectName:
            selectedEvaluation.subject?.name || selectedEvaluation.subject?.code || 'Asignatura',
          rubric,
          criteria: criteriaWithScales,
        });
      } catch (error) {
        setRubricView(null);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error instanceof Error ? error.message : 'No se pudo cargar la rúbrica seleccionada',
        });
      } finally {
        setLoadingRubric(false);
      }
    };

    void loadRubric();
  }, [groupById, publicRubricsById, selectedEvaluation]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">Cargando rúbricas del estudiante...</div>;
  }

  if (!currentUser) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 text-sm text-body shadow-default dark:border-strokedark dark:bg-boxdark">
        Debes iniciar sesión para consultar la rúbrica.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Consultar rúbrica" />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Consultar rúbrica de evaluación</h1>
            <p className="text-sm text-body">
              HU-13: consulta de solo lectura para estudiantes con evaluaciones activas y rúbricas publicadas.
            </p>
          </div>

          <div className="rounded-md bg-gray-2 px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white">
            {availableEvaluations.length} evaluación(es) disponibles
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-stroke bg-gray-2 px-4 py-3 text-sm text-body dark:border-strokedark dark:bg-meta-4">
            <p className="text-xs uppercase tracking-wide">Estudiante</p>
            <p className="mt-1 font-medium text-black dark:text-white">
              {currentStudent ? `${currentStudent.first_name} ${currentStudent.last_name}` : currentUser.email}
            </p>
          </div>

          <div className="rounded-md border border-stroke bg-gray-2 px-4 py-3 text-sm text-body dark:border-strokedark dark:bg-meta-4">
            <p className="text-xs uppercase tracking-wide">Matrículas activas</p>
            <p className="mt-1 font-medium text-black dark:text-white">{activeEnrollments.length}</p>
          </div>

          <div className="rounded-md border border-stroke bg-gray-2 px-4 py-3 text-sm text-body dark:border-strokedark dark:bg-meta-4">
            <p className="text-xs uppercase tracking-wide">Rúbricas públicas</p>
            <p className="mt-1 font-medium text-black dark:text-white">{publicRubricsById.size}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">Evaluaciones disponibles</h2>
              <p className="text-sm text-body">
                Solo se muestran evaluaciones de tus grupos activos con rúbricas publicadas.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {availableEvaluations.length} disponibles
            </span>
          </div>

          {availableEvaluations.length === 0 ? (
            <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
              No tienes evaluaciones con rúbrica publicada todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {availableEvaluations.map((evaluation) => {
                const isSelected = evaluation.id === selectedEvaluationId;
                const group = groupById.get(evaluation.group_id || '');

                return (
                  <button
                    key={evaluation.id}
                    type="button"
                    onClick={() => setSelectedEvaluationId(evaluation.id || '')}
                    className={`w-full rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm dark:hover:border-primary ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-stroke bg-white dark:border-strokedark dark:bg-boxdark'
                    }`}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-black dark:text-white">{evaluation.name}</h3>
                        <p className="text-sm text-body">
                          {evaluation.description || 'Sin descripción'}
                        </p>
                      </div>
                      <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                        Rúbrica asignada
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-body md:grid-cols-3">
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-body">Grupo</span>
                        <span className="text-black dark:text-white">
                          {group?.name ? `${group.name} · ${group.group_code}` : evaluation.group_id}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-body">Asignatura</span>
                        <span className="text-black dark:text-white">
                          {evaluation.subject?.name || evaluation.subject?.code || 'N/D'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-body">Publicada</span>
                        <span className="text-black dark:text-white">
                          {formatDate(publicRubricsById.get(evaluation.rubric_id || '')?.created_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">Detalle de rúbrica</h2>
              <p className="text-sm text-body">Esta información es de solo lectura para el estudiante.</p>
            </div>
            {loadingRubric && (
              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                Cargando detalle...
              </span>
            )}
          </div>

          {!selectedEvaluation ? (
            <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
              Selecciona una evaluación para ver su rúbrica.
            </div>
          ) : !rubricView ? (
            <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
              No se pudo cargar el detalle de la rúbrica seleccionada.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg bg-gray-2 p-4 shadow-sm dark:bg-meta-4">
                <p className="text-xs uppercase tracking-[0.2em] text-body">{rubricView.subjectName}</p>
                <h3 className="mt-1 text-xl font-bold text-black dark:text-white">{rubricView.rubric.title}</h3>
                <p className="mt-2 text-sm text-body">{rubricView.rubric.description || 'Sin descripción'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-body">
                  <span className="rounded-full bg-white px-3 py-1 dark:bg-boxdark">Evaluación: {rubricView.evaluation.name}</span>
                  <span className="rounded-full bg-white px-3 py-1 dark:bg-boxdark">Grupo: {rubricView.groupName}</span>
                  <span className="rounded-full bg-white px-3 py-1 dark:bg-boxdark">Publicada: {formatDate(rubricView.rubric.created_at)}</span>
                </div>
              </div>

              {rubricView.criteria.length === 0 ? (
                <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
                  Esta rúbrica todavía no tiene criterios cargados.
                </div>
              ) : (
                <div className="space-y-4">
                  {rubricView.criteria.map((criterion, index) => (
                    <article key={criterion.id || `${criterion.name}-${index}`} className="rounded-lg border border-stroke p-4 shadow-sm dark:border-strokedark">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h4 className="font-semibold text-black dark:text-white">{criterion.name}</h4>
                          <p className="text-sm text-body">{criterion.description || 'Sin descripción'}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Peso {criterion.weight}%
                        </span>
                      </div>

                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-stroke text-left text-black dark:border-strokedark dark:text-white">
                              <th className="py-2 pr-4">Nivel</th>
                              <th className="py-2 pr-4">Descripción</th>
                              <th className="py-2 pr-4">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {criterion.scales.length === 0 ? (
                              <tr>
                                <td className="py-3 text-sm text-body" colSpan={3}>
                                  Este criterio todavía no tiene escalas definidas.
                                </td>
                              </tr>
                            ) : (
                              criterion.scales.map((scale) => (
                                <tr key={scale.id} className="border-b border-stroke last:border-b-0 dark:border-strokedark">
                                  <td className="py-2 pr-4 font-medium text-black dark:text-white">{scale.name}</td>
                                  <td className="py-2 pr-4 text-body">{scale.description || 'Sin descripción'}</td>
                                  <td className="py-2 pr-4 text-primary">{scale.value}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RubricConsultation;