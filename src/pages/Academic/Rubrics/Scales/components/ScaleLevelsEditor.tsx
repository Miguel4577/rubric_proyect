import { ScaleCriterionDraft, ScaleLevelDraft } from '../hooks/useScaleDraft';

type ScaleLevelsEditorProps = {
  criteria: ScaleCriterionDraft[];
  onAddCriterion: () => void;
  onRemoveCriterion: (criterionId: string) => void;
  onUpdateCriterion: <K extends keyof ScaleCriterionDraft>(
    criterionId: string,
    field: K,
    value: ScaleCriterionDraft[K]
  ) => void;
  onAddLevel: (criterionId: string) => void;
  onRemoveLevel: (criterionId: string, levelId: string) => void;
  onUpdateLevel: <K extends keyof ScaleLevelDraft>(
    criterionId: string,
    levelId: string,
    field: K,
    value: ScaleLevelDraft[K]
  ) => void;
};

const ScaleLevelsEditor = ({
  criteria,
  onAddCriterion,
  onRemoveCriterion,
  onUpdateCriterion,
  onAddLevel,
  onRemoveLevel,
  onUpdateLevel,
}: ScaleLevelsEditorProps) => {
  return (
    <section className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">Criterios y niveles</h3>
          <p className="text-sm text-body">
            Cada criterio debe tener entre 2 y 5 niveles, con etiqueta, descripción y valor único.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddCriterion}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          Agregar criterio
        </button>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <article key={criterion.id} className="rounded-lg border border-stroke p-4 dark:border-strokedark">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-semibold text-black dark:text-white">Criterio {index + 1}</h4>
              <button
                type="button"
                onClick={() => onRemoveCriterion(criterion.id)}
                className="text-sm font-medium text-meta-1 hover:underline"
                disabled={criteria.length === 1}
              >
                Eliminar
              </button>
            </div>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-black dark:text-white">Nombre del criterio</span>
                <input
                  value={criterion.name}
                  onChange={(event: { target: { value: string } }) => onUpdateCriterion(criterion.id, 'name', event.target.value)}
                  className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                  placeholder="Ej. Calidad técnica"
                />
              </label>
            </div>

            <div className="rounded-md bg-gray-2 p-4 dark:bg-meta-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="font-semibold text-black dark:text-white">Niveles</h5>
                <button
                  type="button"
                  onClick={() => onAddLevel(criterion.id)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Agregar nivel
                </button>
              </div>

              <div className="space-y-3">
                {criterion.levels.map((level) => (
                  <div key={level.id} className="grid gap-3 rounded-md border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark md:grid-cols-12 md:items-end">
                    <label className="flex flex-col gap-2 md:col-span-3">
                      <span className="text-xs font-medium text-black dark:text-white">Etiqueta</span>
                      <input
                        value={level.label}
                        onChange={(event: { target: { value: string } }) => onUpdateLevel(criterion.id, level.id, 'label', event.target.value)}
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="Insuficiente"
                      />
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-6">
                      <span className="text-xs font-medium text-black dark:text-white">Descripción</span>
                      <input
                        value={level.description}
                        onChange={(event: { target: { value: string } }) => onUpdateLevel(criterion.id, level.id, 'description', event.target.value)}
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="Describe el nivel"
                      />
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-xs font-medium text-black dark:text-white">Valor</span>
                      <input
                        type="number"
                        value={level.value}
                        onChange={(event: { target: { value: string } }) => onUpdateLevel(criterion.id, level.id, 'value', Number(event.target.value))}
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="0"
                      />
                    </label>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => onRemoveLevel(criterion.id, level.id)}
                        className="text-sm font-medium text-meta-1 hover:underline"
                        disabled={criterion.levels.length <= 2}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ScaleLevelsEditor;
