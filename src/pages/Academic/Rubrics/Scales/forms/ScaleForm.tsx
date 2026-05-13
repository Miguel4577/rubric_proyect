import { ScaleDraft } from '../hooks/useScaleDraft';

type ScaleFormProps = {
  draft: ScaleDraft;
  subjectOptions: Array<{ value: string; label: string }>;
  onUpdateField: <K extends keyof ScaleDraft>(field: K, value: ScaleDraft[K]) => void;
};

const ScaleForm = ({ draft, subjectOptions, onUpdateField }: ScaleFormProps) => {
  return (
    <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-black dark:text-white">Definir criterios y escalas</h1>
        <p className="text-sm text-body">
          Base inicial de la HU-09: niveles, valores únicos y reutilización entre criterios.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-black dark:text-white">Nombre de la rúbrica</span>
          <input
            value={draft.rubricName}
            onChange={(event: { target: { value: string } }) => onUpdateField('rubricName', event.target.value)}
            className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
            placeholder="Ej. Rúbrica de exposición oral"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-black dark:text-white">Asignatura</span>
          <select
            value={draft.subjectId}
            onChange={(event: { target: { value: string } }) => onUpdateField('subjectId', event.target.value)}
            className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
          >
            {subjectOptions.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

export default ScaleForm;
