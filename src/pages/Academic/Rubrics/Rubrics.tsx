import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../../../components/Breadcrumb';
import { Subject } from '../../../models/Academic';
import { academicService } from '../../../services/academicService';
import RubricCriteriaEditor from './components/RubricCriteriaEditor';
import { useRubricDraft } from './hooks/useRubricDraft';

const Rubrics = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const {
    draft,
    totalWeight,
    isReadyToPublish,
    updateField,
    updateCriterion,
    updateScale,
    addCriterion,
    removeCriterion,
    addScale,
    removeScale,
    resetDraft,
  } = useRubricDraft();

  const subjectOptions = useMemo(
    () => [
      { value: '', label: 'Selecciona una asignatura' },
      ...subjects.map((subject) => ({ value: subject.id || '', label: `${subject.name} (${subject.code})` })),
    ],
    [subjects]
  );

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await academicService.getSubjects();
      setSubjects(data.filter((subject) => subject.id));
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudieron cargar las asignaturas',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, []);

  const persistRubric = async (publish: boolean) => {
    if (!isReadyToPublish) {
      await Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Completa nombre, descripción, asignatura y asegura que el peso total sea 100%.',
      });
      return;
    }

    if (draft.criteria.some((criterion) => criterion.scales.length < 2 || criterion.scales.length > 5)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Escalas inválidas',
        text: 'Cada criterio debe tener entre 2 y 5 escalas.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const rubric = await academicService.createRubric({
        title: draft.name,
        description: draft.description,
        is_public: false,
        is_archived: false,
      });

      if (!rubric.id) {
        throw new Error('No se recibió el identificador de la rúbrica');
      }

      for (const criterionDraft of draft.criteria) {
        const criterion = await academicService.addCriterion({
          rubric_id: rubric.id,
          name: criterionDraft.name,
          description: criterionDraft.description,
          weight: criterionDraft.weight,
        });

        if (!criterion.id) {
          throw new Error('No se recibió el identificador del criterio');
        }

        for (const scaleDraft of criterionDraft.scales) {
          await academicService.addScale({
            criterion_id: criterion.id,
            name: scaleDraft.name,
            description: scaleDraft.description,
            value: scaleDraft.value,
          });
        }
      }

      if (publish) {
        await academicService.publishRubric(rubric.id);
      }

      await Swal.fire({
        icon: 'success',
        title: publish ? 'Rúbrica publicada' : 'Borrador guardado',
        text: publish ? 'La rúbrica quedó publicada correctamente.' : 'La rúbrica quedó guardada como borrador.',
      });

      resetDraft();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'No se pudo guardar la rúbrica',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-black dark:text-white">Cargando asignaturas...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb pageName="Gestionar Rúbricas" />

      <section className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Crear rúbrica de evaluación</h1>
            <p className="text-sm text-body">
              Base inicial para la HU-08: nombre, descripción, asignatura, criterios y estado de borrador.
            </p>
          </div>

          <div className="rounded-md bg-gray-2 px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white">
            Peso total: {totalWeight}%
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black dark:text-white">Nombre de la rúbrica</span>
            <input
              value={draft.name}
              onChange={(event: { target: { value: string } }) => updateField('name', event.target.value)}
              className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
              placeholder="Ej. Rúbrica de proyecto final"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black dark:text-white">Asignatura</span>
            <select
              value={draft.subjectId}
              onChange={(event: { target: { value: string } }) => updateField('subjectId', event.target.value)}
              className="rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
            >
              {subjectOptions.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-black dark:text-white">Descripción</span>
            <textarea
              value={draft.description}
              onChange={(event: { target: { value: string } }) => updateField('description', event.target.value)}
              className="min-h-28 rounded-md border border-stroke bg-transparent px-3 py-2 outline-none focus:border-primary dark:border-strokedark"
              placeholder="Describe el propósito de la rúbrica"
            />
          </label>
        </div>
      </section>

      <RubricCriteriaEditor
        criteria={draft.criteria}
        onAddCriterion={addCriterion}
        onRemoveCriterion={removeCriterion}
        onUpdateCriterion={updateCriterion}
        onAddScale={addScale}
        onRemoveScale={removeScale}
        onUpdateScale={updateScale}
      />

      <section className="flex flex-col gap-3 rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white">Estado de publicación</h2>
          <p className="text-sm text-body">
            Por ahora esta pantalla queda como borrador de HU-08; la validación real se conectará al backend.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            onClick={() => void persistRubric(false)}
            disabled={isSaving}
          >
            Guardar borrador
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReadyToPublish || isSaving}
            onClick={() => void persistRubric(true)}
          >
            Publicar rúbrica
          </button>
        </div>
      </section>
    </div>
  );
};

export default Rubrics;
