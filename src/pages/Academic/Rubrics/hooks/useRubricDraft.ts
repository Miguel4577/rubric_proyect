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
