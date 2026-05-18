import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Breadcrumb from '../../../../components/Breadcrumb';
import { getCurrentUser } from '../../../../config/accessControl';
import {
  Criterion,
  Enrollment,
  Evaluation,
  Grade,
  GradeDetail,
  Group,
  Rubric,
  Scale,
  Student,
} from '../../../../models/Academic';
import { managementService } from '../../../../services/managementService';
import { evaluationService } from '../../../../services/evaluationService';

type CriterionWithScales = Criterion & { scales: Scale[] };

type EvaluationRow = {
  evaluation: Evaluation;
  enrollment: Enrollment;
  grade: Grade;
  groupName: string;
  subjectName: string;
  finalScore: number;
  contribution: number;
};

type CriterionDetailRow = {
  criterion: Criterion;
  scale?: Scale;
  detail?: GradeDetail;
};

const formatDate = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleDateString('es-ES');
};

const GradeDetails = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeDetails, setGradeDetails] = useState<GradeDetail[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('');
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [rubricCriteria, setRubricCriteria] = useState<CriterionWithScales[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRubric, setLoadingRubric] = useState(false);

  const currentUser = getCurrentUser();

  const currentStudent = useMemo(
    () => students.find((student) => student.user_id === currentUser?.id),
    [currentUser?.id, students]
  );

  const groupById = useMemo(() => new Map(groups.map((group) => [group.id || '', group])), [groups]);

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
      evaluations.filter((evaluation) => {
        if (!evaluation.id || !evaluation.rubric_id) {
          return false;
        }

        const enrollment = activeEnrollments.find((item) => item.group_id === evaluation.group_id);
        if (!enrollment?.id) {
          return false;
        }

        return grades.some(
          (grade) =>
            grade.enrollment_id === enrollment.id &&
            grade.rubric_id === evaluation.rubric_id &&
            (grade.status === 'SENT' || Boolean(grade.is_locked))
        );
      }),
    [activeEnrollments, evaluations, grades]
  );

  const evaluationRows = useMemo<EvaluationRow[]>(() => {
    return availableEvaluations
      .map((evaluation) => {
        const enrollment = activeEnrollments.find((item) => item.group_id === evaluation.group_id);
        const grade = enrollment?.id
          ? grades.find(
              (item) =>
                item.enrollment_id === enrollment.id &&
                item.rubric_id === evaluation.rubric_id &&
                (item.status === 'SENT' || Boolean(item.is_locked))
            )
          : undefined;

        if (!enrollment?.id || !grade) {
          return undefined;
        }

        const group = groupById.get(evaluation.group_id || '');
        const finalScore = Number(grade.final_score.toFixed(2));
        const contribution = Number((grade.final_score * (evaluation.weight / 100)).toFixed(2));

        return {
          evaluation,
          enrollment,
          grade,
          groupName: group?.name ? `${group.name} · ${group.group_code}` : evaluation.group_id,
          subjectName: evaluation.subject?.name || evaluation.subject?.code || 'Asignatura',
          finalScore,
          contribution,
        };
      })
      .filter((row): row is EvaluationRow => Boolean(row))
      .sort((first, second) => first.evaluation.name.localeCompare(second.evaluation.name));
  }, [activeEnrollments, availableEvaluations, grades, groupById]);

  const overallFinalScore = useMemo(
    () => Number(evaluationRows.reduce((sum, row) => sum + row.contribution, 0).toFixed(2)),
    [evaluationRows]
  );

  const selectedEvaluation = useMemo(
    () => evaluationRows.find((row) => row.evaluation.id === selectedEvaluationId) || evaluationRows[0],
    [evaluationRows, selectedEvaluationId]
  );

  const currentGradeDetails = useMemo(() => {
    if (!selectedEvaluation?.grade) {
      return [] as GradeDetail[];
    }

    const nestedDetails = (selectedEvaluation.grade.details || selectedEvaluation.grade.grade_details || []) as GradeDetail[];
    if (nestedDetails.length > 0) {
      return nestedDetails;
    }

    const rubricScaleIds = new Set(
      rubricCriteria.flatMap((criterion) => criterion.scales.map((scale) => scale.id).filter(Boolean) as string[])
    );

    return gradeDetails.filter(
      (detail) => detail.student_id === currentStudent?.id && rubricScaleIds.has(detail.scale_id)
    );
  }, [currentStudent?.id, gradeDetails, rubricCriteria, selectedEvaluation]);

  const selectedCriterionDetails = useMemo<CriterionDetailRow[]>(() => {
    return rubricCriteria.map((criterion) => {
      const detail = currentGradeDetails.find((item) =>
        criterion.scales.some((scale) => scale.id === item.scale_id)
      );

      const scale = detail ? criterion.scales.find((item) => item.id === detail.scale_id) : undefined;

      return {
        criterion,
        scale,
        detail,
      };
    });
  }, [currentGradeDetails, rubricCriteria]);

  const hasComments = useMemo(
    () => selectedCriterionDetails.some((item) => Boolean(item.detail?.comment?.trim())),
    [selectedCriterionDetails]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentData, groupData, enrollmentData, evaluationData, gradeData, detailData] = await Promise.all([
        managementService.getStudents(),
        managementService.getGroups(),
        managementService.getEnrollments(),
        evaluationService.getEvaluations(),
        evaluationService.getGrades(),
        evaluationService.getGradeDetails(),
      ]);

      setStudents(studentData.filter((student) => student.id));
      setGroups(groupData.filter((group) => group.id));
      setEnrollments(enrollmentData);
      setEvaluations(evaluationData.filter((evaluation) => evaluation.id));
      setGrades(gradeData);
      setGradeDetails(detailData);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la información de calificaciones',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRubric = async (rubricId: string) => {
    setLoadingRubric(true);
    try {
      const rubricData = await evaluationService.getRubricById(rubricId);
      const rubricCriteriaData = (rubricData.criteria || []) as Array<Criterion & { scales?: Scale[] }>;

      if (
        rubricCriteriaData.length > 0 &&
        rubricCriteriaData.every((criterion) => Array.isArray(criterion.scales) && criterion.scales.length > 0)
      ) {
        setRubric(rubricData);
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

      setRubric(rubricData);
      setRubricCriteria(criteriaWithScales);
    } catch (error) {
      setRubric(null);
      setRubricCriteria([]);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la rúbrica de la evaluación',
      });
    } finally {
      setLoadingRubric(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (availableEvaluations.length === 0) {
      setSelectedEvaluationId('');
      setRubric(null);
      setRubricCriteria([]);
      return;
    }

    if (!selectedEvaluationId || !availableEvaluations.some((row) => row.evaluation.id === selectedEvaluationId)) {
      setSelectedEvaluationId(availableEvaluations[0].evaluation.id || '');
    }
  }, [availableEvaluations, selectedEvaluationId]);

  useEffect(() => {
    if (!selectedEvaluation?.evaluation.rubric_id) {
      setRubric(null);
      setRubricCriteria([]);
      return;
    }

    void loadRubric(selectedEvaluation.evaluation.rubric_id);
  }, [selectedEvaluation]);

  const handleDownloadPdf = () => {
    if (!currentStudent) {
      void Swal.fire({
        icon: 'warning',
        title: 'Sin estudiante',
        text: 'No se pudo identificar al estudiante autenticado.',
      });
      return;
    }

    if (evaluationRows.length === 0) {
      void Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay calificaciones publicadas para generar un reporte.',
      });
      return;
    }

    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString('es-ES');
    const fullName = `${currentStudent.first_name} ${currentStudent.last_name}`.trim() || currentStudent.identification;

    doc.setFontSize(14);
    doc.text('Reporte de calificaciones - HU-14', 14, 15);
    doc.setFontSize(10);
    doc.text(`Estudiante: ${fullName}`, 14, 23);
    doc.text(`Fecha de generación: ${generatedAt}`, 14, 29);
    doc.text(`Nota final acumulada: ${overallFinalScore.toFixed(2)}`, 14, 35);

    autoTable(doc, {
      startY: 42,
      head: [['Evaluación', 'Grupo', 'Nota', 'Ponderación', 'Aporte']],
      body: evaluationRows.map((row) => [
        row.evaluation.name,
        row.groupName,
        row.finalScore.toFixed(2),
        `${row.evaluation.weight}%`,
        row.contribution.toFixed(2),
      ]),
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [24, 119, 242],
      },
    });

    if (selectedEvaluation && selectedCriterionDetails.length > 0) {
      const detailStart = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 42;

      doc.setFontSize(11);
      doc.text(`Detalle de evaluación: ${selectedEvaluation.evaluation.name}`, 14, detailStart + 10);

      autoTable(doc, {
        startY: detailStart + 14,
        head: [['Criterio', 'Nivel', 'Puntaje', 'Comentario']],
        body: selectedCriterionDetails.map((item) => [
          item.criterion.name,
          item.scale?.name || 'Sin nivel',
          item.detail?.score != null ? Number(item.detail.score).toFixed(2) : '0.00',
          item.detail?.comment || 'Sin comentario',
        ]),
        styles: {
          fontSize: 8,
        },
        headStyles: {
          fillColor: [17, 24, 39],
        },
      });
    }

    if (selectedEvaluation?.grade.observations) {
      const detailStart = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 42;
      doc.setFontSize(10);
      doc.text(`Observaciones: ${selectedEvaluation.grade.observations}`, 14, detailStart + 10);
    }

    doc.save(`calificaciones-${fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">
        Cargando calificaciones detalladas...
      </div>
    );
  }

  if (!currentUser || !currentStudent) {
    return (
      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-sm text-body">No se pudo identificar al estudiante autenticado para mostrar sus calificaciones.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Ver calificaciones detalladas" />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Calificaciones detalladas</h1>
            <p className="text-sm text-body">
              HU-14: revisa tu nota final, el desglose por evaluación y los comentarios por criterio.
            </p>
          </div>

          <div className="rounded-md bg-gray-2 px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white">
            {evaluationRows.length} evaluación(es) calificadas
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-stroke bg-gray-2 px-4 py-3 text-sm text-body dark:border-strokedark dark:bg-meta-4">
            <p className="text-xs uppercase tracking-wide">Estudiante</p>
            <p className="mt-1 font-medium text-black dark:text-white">
              {`${currentStudent.first_name} ${currentStudent.last_name}`.trim() || currentStudent.identification}
            </p>
          </div>

          <div className="rounded-md border border-stroke bg-gray-2 px-4 py-3 text-sm text-body dark:border-strokedark dark:bg-meta-4">
            <p className="text-xs uppercase tracking-wide">Nota final acumulada</p>
            <p className="mt-1 font-medium text-black dark:text-white">{overallFinalScore.toFixed(2)}</p>
          </div>

          <div className="rounded-md border border-stroke bg-gray-2 px-4 py-3 text-sm text-body dark:border-strokedark dark:bg-meta-4">
            <p className="text-xs uppercase tracking-wide">Reporte</p>
            <p className="mt-1 font-medium text-black dark:text-white">Disponible para descarga</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">Evaluaciones calificadas</h2>
              <p className="text-sm text-body">Selecciona una evaluación para ver su detalle por criterio.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {evaluationRows.length} disponibles
            </span>
          </div>

          {evaluationRows.length === 0 ? (
            <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
              Aún no tienes calificaciones publicadas para mostrar.
            </div>
          ) : (
            <div className="space-y-3">
              {evaluationRows.map((row) => {
                const isSelected = row.evaluation.id === selectedEvaluation?.evaluation.id;

                return (
                  <button
                    key={row.evaluation.id}
                    type="button"
                    onClick={() => setSelectedEvaluationId(row.evaluation.id || '')}
                    className={`w-full rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm dark:hover:border-primary ${
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-stroke bg-white dark:border-strokedark dark:bg-boxdark'
                    }`}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-semibold text-black dark:text-white">{row.evaluation.name}</h3>
                        <p className="text-sm text-body">{row.subjectName}</p>
                      </div>

                      <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                        Publicada
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-body md:grid-cols-3">
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-body">Grupo</span>
                        <span className="text-black dark:text-white">{row.groupName}</span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-body">Nota</span>
                        <span className="text-black dark:text-white">{row.finalScore.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-body">Aporte</span>
                        <span className="text-black dark:text-white">{row.contribution.toFixed(2)}</span>
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
              <h2 className="text-lg font-semibold text-black dark:text-white">Detalle de evaluación</h2>
              <p className="text-sm text-body">Nivel, puntaje y comentarios por criterio.</p>
            </div>

            {loadingRubric && (
              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                Cargando detalle...
              </span>
            )}
          </div>

          {!selectedEvaluation ? (
            <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
              Selecciona una evaluación para ver el desglose.
            </div>
          ) : !rubric ? (
            <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
              No se pudo cargar la rúbrica de esta evaluación.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg bg-gray-2 p-4 shadow-sm dark:bg-meta-4">
                <p className="text-xs uppercase tracking-[0.2em] text-body">{selectedEvaluation.subjectName}</p>
                <h3 className="mt-1 text-xl font-bold text-black dark:text-white">{rubric.title}</h3>
                <p className="mt-2 text-sm text-body">{rubric.description || 'Sin descripción'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-body">
                  <span className="rounded-full bg-white px-3 py-1 dark:bg-boxdark">
                    Evaluación: {selectedEvaluation.evaluation.name}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 dark:bg-boxdark">
                    Fecha: {formatDate(selectedEvaluation.grade.updated_at || selectedEvaluation.grade.created_at)}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 dark:bg-boxdark">
                    Final: {selectedEvaluation.finalScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedCriterionDetails.length === 0 ? (
                <div className="rounded-md border border-dashed border-stroke p-6 text-sm text-body dark:border-strokedark">
                  Aún no hay detalles por criterio disponibles para esta evaluación.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCriterionDetails.map((item, index) => (
                    <article key={item.criterion.id || `${item.criterion.name}-${index}`} className="rounded-lg border border-stroke p-4 shadow-sm dark:border-strokedark">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h4 className="font-semibold text-black dark:text-white">{item.criterion.name}</h4>
                          <p className="text-sm text-body">{item.criterion.description || 'Sin descripción'}</p>
                        </div>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Peso {item.criterion.weight}%
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-md bg-gray-2 p-3 dark:bg-meta-4">
                          <p className="text-xs uppercase tracking-wide text-body">Nivel obtenido</p>
                          <p className="mt-1 text-sm font-semibold text-black dark:text-white">
                            {item.scale?.name || 'Sin nivel'}
                          </p>
                          <p className="mt-1 text-sm text-body">
                            {item.scale?.description || 'Sin descripción del nivel'}
                          </p>
                        </div>

                        <div className="rounded-md bg-gray-2 p-3 dark:bg-meta-4">
                          <p className="text-xs uppercase tracking-wide text-body">Puntaje</p>
                          <p className="mt-1 text-lg font-semibold text-black dark:text-white">
                            {item.detail?.score != null ? Number(item.detail.score).toFixed(2) : '0.00'}
                          </p>
                        </div>

                        <div className="rounded-md bg-gray-2 p-3 dark:bg-meta-4">
                          <p className="text-xs uppercase tracking-wide text-body">Comentario</p>
                          <p className="mt-1 text-sm text-black dark:text-white">
                            {item.detail?.comment || 'Sin comentario'}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {selectedEvaluation.grade.observations && (
                <div className="rounded-md border border-warning bg-warning/10 p-4 text-sm text-warning">
                  Observaciones generales: {selectedEvaluation.grade.observations}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Reporte de desempeño</h2>
          <p className="text-sm text-body">
            Descarga un reporte con el desglose por evaluación y los comentarios disponibles.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={evaluationRows.length === 0}
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Descargar PDF
          </button>

          <div className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">
            {hasComments ? 'Comentarios disponibles' : 'Sin comentarios en esta vista'}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GradeDetails;