import { ScaleLevelDraft } from '../hooks/useScaleDraft';

type ReusableScalePickerProps = {
  reusableLevels: Array<{
    sourceCriterionId: string;
    criterionName: string;
    level: ScaleLevelDraft;
  }>;
  onReuse: (sourceCriterionId: string, level: ScaleLevelDraft) => void;
  targetCriterionId: string;
};

const ReusableScalePicker = ({ reusableLevels, onReuse, targetCriterionId }: ReusableScalePickerProps) => {
  return (
    <section className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white">Reutilizar niveles</h3>
        <p className="text-sm text-body">
          Aquí se mostrarán niveles ya definidos para clonarlos en otro criterio sin repetir trabajo.
        </p>
      </div>

      <div className="space-y-3">
        {reusableLevels.length === 0 ? (
          <p className="text-sm text-body">Todavía no hay niveles disponibles para reutilizar.</p>
        ) : (
          reusableLevels.map(({ sourceCriterionId, criterionName, level }) => (
            <div
              key={`${sourceCriterionId}-${level.id}`}
              className="flex flex-col gap-3 rounded-md border border-stroke p-3 dark:border-strokedark md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h4 className="font-medium text-black dark:text-white">{criterionName}</h4>
                <p className="text-sm text-body">
                  {level.label || 'Sin etiqueta'} - valor {level.value}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onReuse(sourceCriterionId, level)}
                className="rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                disabled={!targetCriterionId}
              >
                Reutilizar
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ReusableScalePicker;
