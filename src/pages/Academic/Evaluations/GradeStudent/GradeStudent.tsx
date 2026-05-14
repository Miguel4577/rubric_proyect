import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../../components/Breadcrumb';
import {
  Criterion,
  Enrollment,
  Evaluation,
  Grade,
  GradeDetail,
  GradePayload,
  Scale,
  Student,
} from '../../../../models/Academic';
import { managementService } from '../../../../services/managementService';
import { evaluationService } from '../../../../services/evaluationService';

type CriterionWithScales = Criterion & { scales: Scale[] };

type CriterionGradeDraft = {
  scaleId: string;
  comment: string;
};

type GradeDraftMap = Record<string, CriterionGradeDraft>;

const GradeStudent = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [rubricCriteria, setRubricCriteria] = useState<CriterionWithScales[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [criterionDraft, setCriterionDraft] = useState<GradeDraftMap>({});
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingRubric, setLoadingRubric] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const studentsById = useMemo(
    () =>
      new Map(
        students.map((student) => [
          student.id || '',
          `${student.first_name} ${student.last_name}`.trim() || student.identification,
        ])
      ),
    [students]
  );

  const selectedEvaluation = useMemo(
    () => evaluations.find((evaluation) => evaluation.id === selectedEvaluationId),
    [evaluations, selectedEvaluationId]
  );

  const availableEnrollments = useMemo(() => {
    if (!selectedEvaluation?.group_id) {
      return [] as Enrollment[];
    }

    return enrollments.filter(
      (enrollment) =>
        enrollment.group_id === selectedEvaluation.group_id && enrollment.status !== 'CANCELLED'
    );
  }, [enrollments, selectedEvaluation]);

  const selectedEnrollment = useMemo(
    () => availableEnrollments.find((enrollment) => enrollment.id === selectedEnrollmentId),
    [availableEnrollments, selectedEnrollmentId]
  );

  const currentGrade = useMemo(() => {
    if (!selectedEnrollmentId || !selectedEvaluation?.rubric_id) {
      return undefined;
    }

    return grades.find(
      (grade) =>
        grade.enrollment_id === selectedEnrollmentId && grade.rubric_id === selectedEvaluation.rubric_id
    );
  }, [grades, selectedEnrollmentId, selectedEvaluation]);

  const scoreByCriterion = useMemo(() => {
    const scores: Record<string, number> = {};

    rubricCriteria.forEach((criterion) => {
      const criterionId = criterion.id || '';
      const selectedScaleId = criterionDraft[criterionId]?.scaleId;
      const selectedScale = criterion.scales.find((scale) => scale.id === selectedScaleId);
      scores[criterionId] = selectedScale ? selectedScale.value * (criterion.weight / 100) : 0;
    });

    return scores;
  }, [criterionDraft, rubricCriteria]);

  const finalScore = useMemo(() => {
    const total = rubricCriteria.reduce((accumulator, criterion) => {
      const criterionId = criterion.id || '';
      return accumulator + (scoreByCriterion[criterionId] || 0);
    }, 0);

    return Number(total.toFixed(2));
  }, [rubricCriteria, scoreByCriterion]);

  const pendingCriteria = useMemo(
    () =>
      rubricCriteria
        .filter((criterion) => {
          const criterionId = criterion.id || '';
          return !criterionDraft[criterionId]?.scaleId;
        })
        .map((criterion) => criterion.name),
    [criterionDraft, rubricCriteria]
  );

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [evaluationData, enrollmentData, studentData, gradeData] = await Promise.all([
        evaluationService.getEvaluations(),
        managementService.getEnrollments(),
        managementService.getStudents(),
        evaluationService.getGrades(),
      ]);

      setEvaluations(evaluationData.filter((evaluation) => evaluation.id && evaluation.rubric_id));
      setEnrollments(enrollmentData);
      setStudents(studentData.filter((student) => student.id));
      setGrades(gradeData);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la información para calificar',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRubricCriteria = async (rubricId: string) => {
    setLoadingRubric(true);
    try {
      const rubric = await evaluationService.getRubricById(rubricId);
      const rubricCriteriaData = (rubric.criteria || []) as Array<Criterion & { scales?: Scale[] }>;

      if (
        rubricCriteriaData.length > 0 &&
        rubricCriteriaData.every((criterion) => Array.isArray(criterion.scales) && criterion.scales.length > 0)
      ) {
        setRubricCriteria(
          rubricCriteriaData.map((criterion) => ({
            ...criterion,
            scales: criterion.scales || [],
          }))
        );
        return;
      }

      const criteria = await evaluationService.getCriteria(rubricId);
      const criteriaWithScales = await Promise.all(
        criteria.map(async (criterion) => ({
          ...criterion,
          scales: criterion.id ? await evaluationService.getScales(criterion.id) : [],
        }))
      );

      setRubricCriteria(criteriaWithScales);
    } catch (error) {
      setRubricCriteria([]);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar criterios y escalas de la rúbrica',
      });
    } finally {
      setLoadingRubric(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedEvaluation?.rubric_id) {
      setRubricCriteria([]);
      setSelectedEnrollmentId('');
      setCriterionDraft({});
      setObservations('');
      return;
    }

    setSelectedEnrollmentId('');
    setCriterionDraft({});
    setObservations('');
    void loadRubricCriteria(selectedEvaluation.rubric_id);
  }, [selectedEvaluation]);

  useEffect(() => {
    if (!selectedEnrollment || rubricCriteria.length === 0) {
      return;
    }

    const nextDraft: GradeDraftMap = {};
    rubricCriteria.forEach((criterion) => {
      if (criterion.id) {
        nextDraft[criterion.id] = { scaleId: '', comment: '' };
      }
    });

    const details = (currentGrade?.details || currentGrade?.grade_details || []) as GradeDetail[];

    details.forEach((detail) => {
      const criterionMatch = rubricCriteria.find((criterion) =>
        criterion.scales.some((scale) => scale.id === detail.scale_id)
      );

      if (criterionMatch?.id && detail.scale_id) {
        nextDraft[criterionMatch.id] = {
          scaleId: detail.scale_id,
          comment: detail.comment || '',
        };
      }
    });

    setCriterionDraft(nextDraft);
    setObservations(currentGrade?.observations || '');
  }, [currentGrade, rubricCriteria, selectedEnrollment]);

  const handleScaleChange = (criterionId: string, scaleId: string) => {
    setCriterionDraft((current) => ({
      ...current,
      [criterionId]: {
        scaleId,
        comment: current[criterionId]?.comment || '',
      },
    }));
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setCriterionDraft((current) => ({
      ...current,
      [criterionId]: {
        scaleId: current[criterionId]?.scaleId || '',
        comment,
      },
    }));
  };

  const persistGrade = async (status: 'DRAFT' | 'SENT') => {
    if (!selectedEvaluation?.id || !selectedEvaluation.rubric_id || !selectedEnrollmentId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Selecciona una evaluación y un estudiante para continuar.',
      });
      return;
    }

    if (status === 'SENT' && pendingCriteria.length > 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Criterios pendientes',
        text: `Faltan criterios por calificar: ${pendingCriteria.join(', ')}`,
      });
      return;
    }

    const details = rubricCriteria
      .map((criterion) => {
        const criterionId = criterion.id || '';
        const draft = criterionDraft[criterionId];

        if (!draft?.scaleId) {
          return null;
        }

        return {
          scale_id: draft.scaleId,
          comment: draft.comment.trim() ? draft.comment.trim() : undefined,
        };
      })
      .filter((detail): detail is { scale_id: string; comment?: string } => Boolean(detail));

    const payload: GradePayload = {
      enrollment_id: selectedEnrollmentId,
      rubric_id: selectedEvaluation.rubric_id,
      evaluation_id: selectedEvaluation.id,
      final_score: finalScore,
      status,
      observations: observations.trim() ? observations.trim() : undefined,
      details,
    };

    setIsSaving(true);
    try {
      await evaluationService.gradeStudent(payload);
      const refreshedGrades = await evaluationService.getGrades();
      setGrades(refreshedGrades);

      await Swal.fire({
        icon: 'success',
        title: status === 'DRAFT' ? 'Borrador guardado' : 'Calificación enviada',
        text:
          status === 'DRAFT'
            ? 'La calificación parcial quedó guardada y puedes continuar después.'
            : 'La calificación quedó enviada para el estudiante seleccionado.',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la calificación',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">
        Cargando datos de evaluación...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Calificar estudiante con rúbrica" />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-black dark:text-white">Calificación por rúbrica</h1>
          <p className="text-sm text-body">
            HU-11: selecciona evaluación, estudiante y registra escala+comentario por criterio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black dark:text-white">Evaluación con rúbrica</span>
            <select
              value={selectedEvaluationId}
              onChange={(event: { target: { value: string } }) => setSelectedEvaluationId(event.target.value)}
              className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              <option value="">Selecciona una evaluación</option>
              {evaluations.map((evaluation) => (
                <option key={evaluation.id} value={evaluation.id}>
                  {evaluation.name}
                  {evaluation.group?.name ? ` · ${evaluation.group.name}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black dark:text-white">Estudiante (inscripción activa)</span>
            <select
              value={selectedEnrollmentId}
              onChange={(event: { target: { value: string } }) => setSelectedEnrollmentId(event.target.value)}
              className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
              disabled={!selectedEvaluationId || availableEnrollments.length === 0}
            >
              <option value="">Selecciona un estudiante</option>
              {availableEnrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.id}>
                  {studentsById.get(enrollment.student_id) || enrollment.student_id}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedEvaluation && (
          <div className="mt-4 grid gap-3 rounded-md bg-gray-2 p-4 text-sm dark:bg-meta-4 md:grid-cols-3">
            <div>
              <p className="text-body">Evaluación</p>
              <p className="font-semibold text-black dark:text-white">{selectedEvaluation.name}</p>
            </div>
            <div>
              <p className="text-body">Rúbrica asociada</p>
              <p className="font-semibold text-black dark:text-white">
                {selectedEvaluation.rubric?.title || selectedEvaluation.rubric_id}
              </p>
            </div>
            <div>
              <p className="text-body">Estado actual</p>
              <p className="font-semibold text-black dark:text-white">
                {currentGrade?.status || 'Sin calificación previa'}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {loadingRubric ? (
          <p className="text-sm text-body">Cargando criterios y escalas...</p>
        ) : !selectedEnrollment ? (
          <p className="text-sm text-body">
            Selecciona una evaluación y un estudiante para habilitar la calificación por criterio.
          </p>
        ) : rubricCriteria.length === 0 ? (
          <p className="text-sm text-body">La rúbrica asociada no tiene criterios y escalas disponibles.</p>
        ) : (
          <div className="space-y-4">
            {rubricCriteria.map((criterion, index) => {
              const criterionId = criterion.id || '';
              const selectedScaleId = criterionDraft[criterionId]?.scaleId || '';
              const criterionScore = scoreByCriterion[criterionId] || 0;

              return (
                <article key={criterionId || `criterion-${index}`} className="rounded-md border border-stroke p-4 dark:border-strokedark">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-black dark:text-white">
                        {index + 1}. {criterion.name}
                      </h3>
                      <p className="text-sm text-body">Peso: {criterion.weight}%</p>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Puntaje criterio: {criterionScore.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-black dark:text-white">Nivel de escala</span>
                      <select
                        value={selectedScaleId}
                        onChange={(event: { target: { value: string } }) =>
                          handleScaleChange(criterionId, event.target.value)
                        }
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                      >
                        <option value="">Selecciona nivel</option>
                        {criterion.scales.map((scale) => (
                          <option key={scale.id} value={scale.id}>
                            {scale.name} · Valor {scale.value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-black dark:text-white">Comentario por criterio</span>
                      <textarea
                        value={criterionDraft[criterionId]?.comment || ''}
                        onChange={(event: { target: { value: string } }) =>
                          handleCommentChange(criterionId, event.target.value)
                        }
                        className="min-h-24 rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="Comentario opcional para este criterio"
                      />
                    </label>
                  </div>
                </article>
              );
            })}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-black dark:text-white">Observaciones generales</span>
              <textarea
                value={observations}
                onChange={(event: { target: { value: string } }) => setObservations(event.target.value)}
                className="min-h-24 rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                placeholder="Observación global de la calificación (opcional)"
              />
            </label>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Resumen de nota</h2>
          <p className="text-sm text-body">
            Estudiante: {selectedEnrollment ? studentsById.get(selectedEnrollment.student_id) || 'N/D' : 'N/D'}
          </p>
          <p className="text-sm font-semibold text-primary">Nota calculada: {finalScore.toFixed(2)}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={!selectedEnrollment || rubricCriteria.length === 0 || isSaving}
            onClick={() => void persistGrade('DRAFT')}
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={!selectedEnrollment || rubricCriteria.length === 0 || isSaving}
            onClick={() => void persistGrade('SENT')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar calificación
          </button>
        </div>
      </section>
    </div>
  );
};

export default GradeStudent;
