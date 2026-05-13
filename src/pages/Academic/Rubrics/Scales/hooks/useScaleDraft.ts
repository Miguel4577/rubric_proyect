import { useMemo, useState } from 'react';

export interface ScaleLevelDraft {
  id: string;
  label: string;
  description: string;
  value: number;
  sourceCriterionId?: string;
}

export interface ScaleCriterionDraft {
  id: string;
  name: string;
  levels: ScaleLevelDraft[];
}

export interface ScaleDraft {
  rubricId: string;
  rubricName: string;
  subjectId: string;
  status: 'draft' | 'published';
  criteria: ScaleCriterionDraft[];
}

export const createScaleLevel = (seed?: Partial<ScaleLevelDraft>): ScaleLevelDraft => ({
  id: crypto.randomUUID(),
  label: seed?.label || '',
  description: seed?.description || '',
  value: seed?.value ?? 0,
  sourceCriterionId: seed?.sourceCriterionId,
});

export const createScaleCriterion = (seed?: Partial<ScaleCriterionDraft>): ScaleCriterionDraft => ({
  id: crypto.randomUUID(),
  name: seed?.name || '',
  levels: seed?.levels || [createScaleLevel(), createScaleLevel()],
});

export const createInitialScaleDraft = (): ScaleDraft => ({
  rubricId: '',
  rubricName: '',
  subjectId: '',
  status: 'draft',
  criteria: [createScaleCriterion()],
});

export const useScaleDraft = () => {
  const [draft, setDraft] = useState<ScaleDraft>(createInitialScaleDraft);

  const totalLevels = useMemo(
    () => draft.criteria.reduce((sum, criterion) => sum + criterion.levels.length, 0),
    [draft.criteria]
  );

  const isReadyToPublish =
    draft.rubricName.trim().length > 0 &&
    draft.subjectId.trim().length > 0 &&
    draft.criteria.length > 0 &&
    draft.criteria.every((criterion) => criterion.levels.length >= 2 && criterion.levels.length <= 5);

  const updateField = <K extends keyof ScaleDraft>(field: K, value: ScaleDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateCriterion = <K extends keyof ScaleCriterionDraft>(
    criterionId: string,
    field: K,
    value: ScaleCriterionDraft[K]
  ) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === criterionId ? { ...criterion, [field]: value } : criterion
      ),
    }));
  };

  const updateLevel = <K extends keyof ScaleLevelDraft>(
    criterionId: string,
    levelId: string,
    field: K,
    value: ScaleLevelDraft[K]
  ) => {
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
  };

  const addCriterion = () => {
    setDraft((current) => ({
      ...current,
      criteria: [...current.criteria, createScaleCriterion()],
    }));
  };

  const removeCriterion = (criterionId: string) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.length > 1
        ? current.criteria.filter((criterion) => criterion.id !== criterionId)
        : current.criteria,
    }));
  };

  const addLevel = (criterionId: string) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === criterionId && criterion.levels.length < 5
          ? { ...criterion, levels: [...criterion.levels, createScaleLevel()] }
          : criterion
      ),
    }));
  };

  const removeLevel = (criterionId: string, levelId: string) => {
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
  };

  const reuseLevel = (criterionId: string, sourceCriterionId: string, level: ScaleLevelDraft) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === criterionId
          ? {
              ...criterion,
              levels: [
                ...criterion.levels,
                {
                  ...createScaleLevel({
                    label: level.label,
                    description: level.description,
                    value: level.value,
                    sourceCriterionId,
                  }),
                },
              ],
            }
          : criterion
      ),
    }));
  };

  const resetDraft = () => {
    setDraft(createInitialScaleDraft());
  };

  return {
    draft,
    totalLevels,
    isReadyToPublish,
    updateField,
    updateCriterion,
    updateLevel,
    addCriterion,
    removeCriterion,
    addLevel,
    removeLevel,
    reuseLevel,
    resetDraft,
  };
};
