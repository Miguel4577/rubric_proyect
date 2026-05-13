import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../../components/Breadcrumb';
import { Subject } from '../../../../models/Academic';
import { academicService } from '../../../../services/academicService';
import ReusableScalePicker from './components/ReusableScalePicker';
import ScaleForm from './forms/ScaleForm';
import ScaleLevelsEditor from './components/ScaleLevelsEditor';
import {
  ScaleLevelDraft,
  ScaleDraft,
  createInitialScaleDraft,
} from './hooks/useScaleDraft';

const Scales = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [draft, setDraft] = useState<ScaleDraft>(createInitialScaleDraft());
  const [selectedCriterionId, setSelectedCriterionId] = useState('');
  const [reusableLevels, setReusableLevels] = useState<
    Array<{ sourceCriterionId: string; criterionName: string; level: ScaleLevelDraft }>
  >([]);

  const totalLevels = useMemo(
    () => draft.criteria.reduce((sum, criterion) => sum + criterion.levels.length, 0),
    [draft.criteria]
  );

  const isReadyToPublish =
    draft.rubricName.trim().length > 0 &&
    draft.subjectId.trim().length > 0 &&
    draft.criteria.length > 0 &&
    draft.criteria.every((criterion) => criterion.levels.length >= 2 && criterion.levels.length <= 5);

  const subjectOptions = useMemo(
    () => [
      { value: '', label: 'Selecciona una asignatura' },
      ...subjects.map((subject) => ({ value: subject.id || '', label: `${subject.name} (${subject.code})` })),
    ],
    [subjects]
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === draft.subjectId),
    [draft.subjectId, subjects]
  );

  const previewCriteria = useMemo(
    () =>
      draft.criteria.map((criterion, index) => ({
        ...criterion,
        index: index + 1,
        levelCount: criterion.levels.length,
        hasDuplicateValues: new Set(criterion.levels.map((level) => level.value)).size !== criterion.levels.length,
      })),
    [draft.criteria]
  );

  const previewWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (!draft.rubricName.trim()) {
      warnings.push('Falta el nombre de la rúbrica.');
    }

    if (!draft.subjectId.trim()) {
      warnings.push('Falta seleccionar una asignatura.');
    }

    if (draft.criteria.length === 0) {
      warnings.push('Debes agregar al menos un criterio.');
    }

    draft.criteria.forEach((criterion, index) => {
      if (criterion.levels.length < 2 || criterion.levels.length > 5) {
        warnings.push(`El criterio ${index + 1} debe tener entre 2 y 5 niveles.`);
      }

      if (new Set(criterion.levels.map((level) => level.value)).size !== criterion.levels.length) {
        warnings.push(`El criterio ${index + 1} tiene valores numéricos repetidos.`);
      }
    });

    return warnings;
  }, [draft]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectData, rubricData] = await Promise.all([
        academicService.getSubjects(),
        academicService.getRubrics(),
      ]);

      setSubjects(subjectData.filter((subject) => subject.id));

      const reusable = rubricData.flatMap((rubric) =>
        (rubric.criteria || []).flatMap((criterion) =>
          (criterion.scales || []).map((level) => ({
            sourceCriterionId: criterion.id || '',
            criterionName: criterion.name,
            level: {
              id: level.id || crypto.randomUUID(),
              label: level.name,
              description: level.description || '',
              value: level.value,
              sourceCriterionId: criterion.id,
            },
          }))
        )
      );

      setReusableLevels(reusable);
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

  const updateField = <K extends keyof ScaleDraft>(field: K, value: ScaleDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleReuse = (sourceCriterionId: string, level: ScaleLevelDraft) => {
    if (!selectedCriterionId) {
      void Swal.fire({
        icon: 'info',
        title: 'Selecciona un criterio',
        text: 'Primero selecciona el criterio destino para reutilizar un nivel.',
      });
      return;
    }

    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === selectedCriterionId
          ? {
              ...criterion,
              levels: [
                ...criterion.levels,
                {
                  ...level,
                  id: crypto.randomUUID(),
                  sourceCriterionId,
                },
              ],
            }
          : criterion
      ),
    }));
  };

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  const confirmAndPublish = async () => {
    if (previewWarnings.length > 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Revisa la vista previa',
        text: previewWarnings[0],
      });
      return;
    }

    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Confirmar publicación',
      text: 'Antes de publicar, revisa la vista previa y confirma que la información es correcta.',
      showCancelButton: true,
      confirmButtonText: 'Revisar y publicar',
      cancelButtonText: 'Volver',
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsPreviewOpen(false);
    await persistScaleDraft(true);
  };

  const persistScaleDraft = async (publish: boolean) => {
    if (!isReadyToPublish) {
      await Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Completa la rúbrica, la asignatura y asegúrate de que cada criterio tenga entre 2 y 5 niveles.',
      });
      return;
    }

    const duplicatedLevel = draft.criteria.find((criterion) => {
      const uniqueValues = new Set(criterion.levels.map((level) => level.value));
      return uniqueValues.size !== criterion.levels.length;
    });

    if (duplicatedLevel) {
      await Swal.fire({
        icon: 'warning',
        title: 'Valores duplicados',
        text: 'Cada nivel debe tener un valor numérico único dentro del mismo criterio.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const rubric = await academicService.createRubric({
        subject_id: draft.subjectId,
        title: draft.rubricName,
        description: `Criterios y niveles definidos desde HU-09${draft.rubricId ? ` (${draft.rubricId})` : ''}`,
        is_public: false,
        is_archived: false,
      });

      if (!rubric.id) {
        throw new Error('No se pudo obtener el identificador de la rúbrica');
      }

      for (const criterionDraft of draft.criteria) {
        const criterion = await academicService.addCriterion({
          rubric_id: rubric.id,
          name: criterionDraft.name,
          description: criterionDraft.name,
          weight: 100 / draft.criteria.length,
        });

        if (!criterion.id) {
          throw new Error('No se pudo obtener el identificador del criterio');
        }

        for (const levelDraft of criterionDraft.levels) {
          await academicService.addScale({
            criterion_id: criterion.id,
            name: levelDraft.label,
            description: levelDraft.description,
            value: levelDraft.value,
          });
        }
      }

      if (publish) {
        await academicService.publishRubric(rubric.id);
      }

      await Swal.fire({
        icon: 'success',
        title: publish ? 'Escalas publicadas' : 'Borrador guardado',
        text: publish
          ? 'Las escalas quedaron publicadas correctamente.'
          : 'Las escalas quedaron guardadas como borrador.',
      });
      setDraft(createInitialScaleDraft());
      setSelectedCriterionId('');
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la escala',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">Cargando información...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Definir Criterios y Escalas" />

      <ScaleForm draft={draft} subjectOptions={subjectOptions} onUpdateField={updateField} />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">Seleccionar criterio destino</h2>
            <p className="text-sm text-body">Elige el criterio donde quieres reutilizar niveles ya definidos.</p>
          </div>

          <div className="rounded-md bg-gray-2 px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white">
            Niveles totales: {totalLevels}
          </div>
        </div>

        <select
          value={selectedCriterionId}
          onChange={(event: { target: { value: string } }) => setSelectedCriterionId(event.target.value)}
          className="mb-4 rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
        >
          <option value="">Selecciona un criterio</option>
          {draft.criteria.map((criterion) => (
            <option key={criterion.id} value={criterion.id}>
              {criterion.name || 'Criterio sin nombre'}
            </option>
          ))}
        </select>

        <ReusableScalePicker
          reusableLevels={reusableLevels}
          onReuse={handleReuse}
          targetCriterionId={selectedCriterionId}
        />
      </section>

      <ScaleLevelsEditor
        criteria={draft.criteria}
        onAddCriterion={() => {
          setDraft((current) => ({
            ...current,
            criteria: [...current.criteria, { id: crypto.randomUUID(), name: '', levels: [] }],
          }));
        }}
        onRemoveCriterion={(criterionId) => {
          setDraft((current) => ({
            ...current,
            criteria: current.criteria.length > 1
              ? current.criteria.filter((criterion) => criterion.id !== criterionId)
              : current.criteria,
          }));
        }}
        onUpdateCriterion={(criterionId, field, value) => {
          setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
              criterion.id === criterionId ? { ...criterion, [field]: value } : criterion
            ),
          }));
        }}
        onAddLevel={(criterionId) => {
          setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
              criterion.id === criterionId && criterion.levels.length < 5
                ? {
                    ...criterion,
                    levels: [
                      ...criterion.levels,
                      {
                        id: crypto.randomUUID(),
                        label: '',
                        description: '',
                        value: 0,
                      },
                    ],
                  }
                : criterion
            ),
          }));
        }}
        onRemoveLevel={(criterionId, levelId) => {
          setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
              criterion.id === criterionId && criterion.levels.length > 2
                ? {
                    ...criterion,
                    levels: criterion.levels.filter((level) => level.id !== levelId),
                  }
                : criterion
            ),
          }));
        }}
        onUpdateLevel={(criterionId, levelId, field, value) => {
          setDraft((current) => ({
            ...current,
            criteria: current.criteria.map((criterion) =>
              criterion.id !== criterionId
                ? criterion
                : {
                    ...criterion,
                    levels: criterion.levels.map((level) =>
                      level.id === levelId ? { ...level, [field]: value } : level
                    ),
                  }
            ),
          }));
        }}
      />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">Vista previa de publicación</h2>
            <p className="text-sm text-body">
              Revisa el resumen antes de guardar o publicar la rúbrica.
            </p>
          </div>

          <button
            type="button"
            onClick={openPreview}
            className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white"
          >
            Ver vista previa
          </button>
        </div>

        {isPreviewOpen && (
          <div className="space-y-4 rounded-md border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
            <div className="grid gap-3 md:grid-cols-3">
              <article className="rounded-md bg-white p-4 dark:bg-boxdark">
                <p className="text-xs uppercase text-body">Rúbrica</p>
                <p className="mt-1 font-semibold text-black dark:text-white">{draft.rubricName || 'Sin nombre'}</p>
              </article>
              <article className="rounded-md bg-white p-4 dark:bg-boxdark">
                <p className="text-xs uppercase text-body">Asignatura</p>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'Sin asignar'}
                </p>
              </article>
              <article className="rounded-md bg-white p-4 dark:bg-boxdark">
                <p className="text-xs uppercase text-body">Resumen</p>
                <p className="mt-1 font-semibold text-black dark:text-white">
                  {draft.criteria.length} criterios · {totalLevels} niveles
                </p>
              </article>
            </div>

            {previewWarnings.length > 0 && (
              <div className="rounded-md border border-warning bg-warning/10 p-4 text-sm text-warning">
                <p className="font-semibold">Aún hay puntos por corregir:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {previewWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {previewCriteria.map((criterion) => (
                <article key={criterion.id} className="rounded-md bg-white p-4 dark:bg-boxdark">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-black dark:text-white">
                      {criterion.index}. {criterion.name || 'Criterio sin nombre'}
                    </h3>
                    <span className="text-xs font-medium text-body">
                      {criterion.levelCount} niveles
                      {criterion.hasDuplicateValues ? ' · valores repetidos' : ''}
                    </span>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {criterion.levels.map((level) => (
                      <div key={level.id} className="rounded-md border border-stroke p-3 dark:border-strokedark">
                        <p className="font-medium text-black dark:text-white">{level.label || 'Sin etiqueta'}</p>
                        <p className="text-sm text-body">{level.description || 'Sin descripción'}</p>
                        <p className="mt-1 text-xs font-semibold text-primary">Valor: {level.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                Cerrar vista previa
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void persistScaleDraft(false)}
                className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Guardar borrador desde vista previa
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void confirmAndPublish()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar y publicar
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Acciones</h2>
          <p className="text-sm text-body">Esta base ya queda alineada con HU-09 para continuar con el guardado real.</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            onClick={() => void persistScaleDraft(false)}
            disabled={isSaving}
          >
            Guardar borrador
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReadyToPublish || isSaving}
            onClick={openPreview}
          >
            Publicar con vista previa
          </button>
        </div>
      </section>
    </div>
  );
};

export default Scales;
