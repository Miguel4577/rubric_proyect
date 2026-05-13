import { RubricCriterionDraft, RubricScaleDraft } from '../hooks/useRubricDraft';

type RubricCriteriaEditorProps = {
  criteria: RubricCriterionDraft[];
  onAddCriterion: () => void;
  onRemoveCriterion: (id: string) => void;
  onUpdateCriterion: <K extends keyof RubricCriterionDraft>(
    id: string,
    field: K,
    value: RubricCriterionDraft[K]
  ) => void;
  onAddScale: (criterionId: string) => void;
  onRemoveScale: (criterionId: string, scaleId: string) => void;
  onUpdateScale: <K extends keyof RubricScaleDraft>(
    criterionId: string,
    scaleId: string,
    field: K,
    value: RubricScaleDraft[K]
  ) => void;
};

const RubricCriteriaEditor = ({
  criteria,
  onAddCriterion,
  onRemoveCriterion,
  onUpdateCriterion,
  onAddScale,
  onRemoveScale,
  onUpdateScale,
}: RubricCriteriaEditorProps) => {
  return (
    <section className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">Criterios</h3>
          <p className="text-sm text-body">Agrega los criterios y distribuye el peso total en 100%.</p>
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

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-black dark:text-white">Nombre</span>
                <input
                  value={criterion.name}
                  onChange={(event: { target: { value: string } }) => onUpdateCriterion(criterion.id, 'name', event.target.value)}
                  className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                  placeholder="Nombre del criterio"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-black dark:text-white">Descripción</span>
                <input
                  value={criterion.description}
                  onChange={(event: { target: { value: string } }) => onUpdateCriterion(criterion.id, 'description', event.target.value)}
                  className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                  placeholder="Descripción breve"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-1">
                <span className="text-sm font-medium text-black dark:text-white">Peso %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={criterion.weight}
                  onChange={(event: { target: { value: string } }) => onUpdateCriterion(criterion.id, 'weight', Number(event.target.value))}
                  className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="mt-4 rounded-md bg-gray-2 p-4 dark:bg-meta-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="font-semibold text-black dark:text-white">Escalas</h5>
                <button
                  type="button"
                  onClick={() => onAddScale(criterion.id)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Agregar escala
                </button>
              </div>

              <div className="space-y-3">
                {criterion.scales.map((scale) => (
                  <div
                    key={scale.id}
                    className="grid gap-3 rounded-md border border-stroke bg-white p-3 dark:border-strokedark dark:bg-boxdark md:grid-cols-12 md:items-end"
                  >
                    <label className="flex flex-col gap-2 md:col-span-3">
                      <span className="text-xs font-medium text-black dark:text-white">Etiqueta</span>
                      <input
                        value={scale.name}
                        onChange={(event: { target: { value: string } }) => onUpdateScale(criterion.id, scale.id, 'name', event.target.value)}
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="Excelente"
                      />
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-6">
                      <span className="text-xs font-medium text-black dark:text-white">Descripción</span>
                      <input
                        value={scale.description}
                        onChange={(event: { target: { value: string } }) => onUpdateScale(criterion.id, scale.id, 'description', event.target.value)}
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="Describe este nivel"
                      />
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-xs font-medium text-black dark:text-white">Valor</span>
                      <input
                        type="number"
                        value={scale.value}
                        onChange={(event: { target: { value: string } }) => onUpdateScale(criterion.id, scale.id, 'value', Number(event.target.value))}
                        className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
                        placeholder="5"
                      />
                    </label>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => onRemoveScale(criterion.id, scale.id)}
                        className="text-sm font-medium text-meta-1 hover:underline"
                        disabled={criterion.scales.length <= 2}
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

export default RubricCriteriaEditor;
