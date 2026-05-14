import { AssociateRubricDraft, EvaluationOption, PublicRubricOption } from '../hooks/useAssociateRubricDraft';

type AssociateRubricFormProps = {
  draft: AssociateRubricDraft;
  evaluations: EvaluationOption[];
  rubrics: PublicRubricOption[];
  onUpdateField: <K extends keyof AssociateRubricDraft>(field: K, value: AssociateRubricDraft[K]) => void;
};

const AssociateRubricForm = ({ draft, evaluations, rubrics, onUpdateField }: AssociateRubricFormProps) => {
  return (
    <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-black dark:text-white">Asociar rúbrica a evaluación</h1>
        <p className="text-sm text-body">
          HU-10: selecciona una evaluación y una rúbrica publicada para enlazarlas de forma segura.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-black dark:text-white">Evaluación</span>
          <select
            value={draft.evaluationId}
            onChange={(event: { target: { value: string } }) => onUpdateField('evaluationId', event.target.value)}
            className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          >
            <option value="">Selecciona una evaluación</option>
            {evaluations.map((evaluation) => (
              <option key={evaluation.id} value={evaluation.id}>
                {evaluation.name}
                {evaluation.subjectLabel ? ` · ${evaluation.subjectLabel}` : ''}
                {evaluation.rubricTitle ? ` · Actual: ${evaluation.rubricTitle}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-black dark:text-white">Rúbrica publicada</span>
          <select
            value={draft.rubricId}
            onChange={(event: { target: { value: string } }) => onUpdateField('rubricId', event.target.value)}
            className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          >
            <option value="">Selecciona una rúbrica publicada</option>
            {rubrics.map((rubric) => (
              <option key={rubric.id} value={rubric.id}>
                {rubric.title}
                {rubric.subjectLabel ? ` · ${rubric.subjectLabel}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

export default AssociateRubricForm;
