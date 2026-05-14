import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../../components/Breadcrumb';
import { Evaluation, Rubric } from '../../../../models/Academic';
import { evaluationService } from '../../../../services/evaluationService';
import AssociateRubricForm from './components/AssociateRubricForm';
import {
  EvaluationOption,
  PublicRubricOption,
  useAssociateRubricDraft,
} from './hooks/useAssociateRubricDraft';

const AssociateRubric = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { draft, selectedEvaluationId, isReadyToAssociate, updateField, resetDraft } = useAssociateRubricDraft();

  const evaluationOptions = useMemo<EvaluationOption[]>(
    () =>
      evaluations.map((evaluation: Evaluation) => ({
        id: evaluation.id || '',
        name: evaluation.name,
        description: evaluation.description,
        subjectLabel: evaluation.subject?.name || evaluation.subject?.code,
        rubricId: evaluation.rubric_id,
        rubricTitle: evaluation.rubric?.title,
      })),
    [evaluations]
  );

  const rubricOptions = useMemo<PublicRubricOption[]>(
    () =>
      rubrics.map((rubric: Rubric) => ({
        id: rubric.id || '',
        title: rubric.title,
        description: rubric.description,
        is_public: rubric.is_public,
      })),
    [rubrics]
  );

  const selectedEvaluation = useMemo(
    () => evaluations.find((evaluation: Evaluation) => evaluation.id === selectedEvaluationId),
    [evaluations, selectedEvaluationId]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [evaluationData, rubricData] = await Promise.all([
        evaluationService.getEvaluations(),
        evaluationService.getRubrics(),
      ]);

      setEvaluations(evaluationData.filter((evaluation) => evaluation.id));
      setRubrics(rubricData.filter((rubric) => rubric.id && rubric.is_public));
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo cargar la información inicial',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const associateRubric = async () => {
    if (!isReadyToAssociate) {
      await Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Debes seleccionar una evaluación y una rúbrica publicada.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const evaluationId = draft.evaluationId;
      const rubricId = draft.rubricId;

      const updatedEvaluation = await evaluationService.associateRubricToEvaluation(evaluationId, rubricId);

      await Swal.fire({
        icon: 'success',
        title: 'Rúbrica asociada',
        text: `La evaluación ${updatedEvaluation.name} quedó vinculada correctamente.`,
      });

      resetDraft();
      await loadData();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo asociar la rúbrica',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">Cargando evaluaciones y rúbricas...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Asociar rúbrica a evaluación" />

      <AssociateRubricForm
        draft={draft}
        evaluations={evaluationOptions}
        rubrics={rubricOptions}
        onUpdateField={updateField}
      />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">Resumen de la selección</h2>
            <p className="text-sm text-body">
              Verifica que la evaluación no tenga una rúbrica incompatible antes de confirmar.
            </p>
          </div>

          <div className="rounded-md bg-gray-2 px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white">
            Estado: {selectedEvaluation?.rubric_id ? 'Ya tiene rúbrica' : 'Sin rúbrica asignada'}
          </div>
        </div>

        {selectedEvaluation ? (
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-md border border-stroke p-4 dark:border-strokedark">
              <p className="text-xs uppercase text-body">Evaluación</p>
              <p className="mt-1 font-semibold text-black dark:text-white">{selectedEvaluation.name}</p>
              <p className="text-sm text-body">{selectedEvaluation.description || 'Sin descripción'}</p>
            </article>

            <article className="rounded-md border border-stroke p-4 dark:border-strokedark">
              <p className="text-xs uppercase text-body">Asignatura</p>
              <p className="mt-1 font-semibold text-black dark:text-white">
                {selectedEvaluation.subject?.name || selectedEvaluation.subject?.code || 'Sin asignar'}
              </p>
            </article>

            <article className="rounded-md border border-stroke p-4 dark:border-strokedark">
              <p className="text-xs uppercase text-body">Rúbrica actual</p>
              <p className="mt-1 font-semibold text-black dark:text-white">
                {selectedEvaluation.rubric?.title || 'No asociada'}
              </p>
            </article>
          </div>
        ) : (
          <p className="text-sm text-body">Selecciona una evaluación para ver su resumen.</p>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Confirmación</h2>
          <p className="text-sm text-body">
            Solo se listan rúbricas publicadas. La asociación queda persistida en la evaluación seleccionada.
          </p>
        </div>

        <button
          type="button"
          disabled={!isReadyToAssociate || isSaving}
          onClick={() => void associateRubric()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Asociar rúbrica
        </button>
      </section>
    </div>
  );
};

export default AssociateRubric;
