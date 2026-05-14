import { useMemo, useState } from 'react';

export interface RubricCriterionDraft {
  id: string;
  name: string;
  description: string;
  weight: number;
  scales: RubricScaleDraft[];
}

export interface RubricScaleDraft {
  id: string;
  name: string;
  description: string;
  value: number;
}

export interface RubricDraft {
  name: string;
  description: string;
  subjectId: string;
  status: 'draft' | 'published';
  criteria: RubricCriterionDraft[];
}

export const createCriterion = (): RubricCriterionDraft => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  weight: 0,
  scales: [
    { id: crypto.randomUUID(), name: '', description: '', value: 0 },
    { id: crypto.randomUUID(), name: '', description: '', value: 0 },
  ],
});

export const createInitialDraft = (): RubricDraft => ({
  name: '',
  description: '',
  subjectId: '',
  status: 'draft',
  criteria: [createCriterion()],
});

export const useRubricDraft = () => {
  const [draft, setDraft] = useState<RubricDraft>(createInitialDraft);

  const totalWeight = useMemo(
    () => draft.criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0),
    [draft.criteria]
  );

  const isReadyToPublish =
    draft.name.trim().length > 0 &&
    draft.description.trim().length > 0 &&
    draft.subjectId.trim().length > 0 &&
    draft.criteria.length > 0 &&
    totalWeight === 100;

  const updateField = <K extends keyof RubricDraft>(field: K, value: RubricDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateCriterion = <K extends keyof RubricCriterionDraft>(
    id: string,
    field: K,
    value: RubricCriterionDraft[K]
  ) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === id ? { ...criterion, [field]: value } : criterion
      ),
    }));
  };

  const updateScale = <K extends keyof RubricScaleDraft>(
    criterionId: string,
    scaleId: string,
    field: K,
    value: RubricScaleDraft[K]
  ) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id !== criterionId
          ? criterion
          : {
              ...criterion,
              scales: criterion.scales.map((scale) =>
                scale.id === scaleId ? { ...scale, [field]: value } : scale
              ),
            }
      ),
    }));
  };

  const addCriterion = () => {
    setDraft((current) => ({
      ...current,
      criteria: [...current.criteria, createCriterion()],
    }));
  };

  const removeCriterion = (id: string) => {
    setDraft((current) => ({
      ...current,
      criteria:
        current.criteria.length > 1
          ? current.criteria.filter((criterion) => criterion.id !== id)
          : current.criteria,
    }));
  };

  const addScale = (criterionId: string) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === criterionId && criterion.scales.length < 5
          ? {
              ...criterion,
              scales: [...criterion.scales, { id: crypto.randomUUID(), name: '', description: '', value: 0 }],
            }
          : criterion
      ),
    }));
  };

  const removeScale = (criterionId: string, scaleId: string) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) =>
        criterion.id === criterionId && criterion.scales.length > 2
          ? {
              ...criterion,
              scales: criterion.scales.filter((scale) => scale.id !== scaleId),
            }
          : criterion
      ),
    }));
  };

  const resetDraft = () => {
    setDraft(createInitialDraft());
  };

  return {
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
  };
};
