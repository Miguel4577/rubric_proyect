import { useMemo, useState } from 'react';

export interface EvaluationOption {
  id: string;
  name: string;
  description?: string;
  subjectLabel?: string;
  rubricId?: string;
  rubricTitle?: string;
}

export interface PublicRubricOption {
  id: string;
  title: string;
  description?: string;
  subjectLabel?: string;
  is_public?: boolean;
}

export interface AssociateRubricDraft {
  evaluationId: string;
  rubricId: string;
}

export const createInitialAssociateRubricDraft = (): AssociateRubricDraft => ({
  evaluationId: '',
  rubricId: '',
});

export const useAssociateRubricDraft = () => {
  const [draft, setDraft] = useState<AssociateRubricDraft>(createInitialAssociateRubricDraft());

  const isReadyToAssociate = draft.evaluationId.trim().length > 0 && draft.rubricId.trim().length > 0;

  const updateField = <K extends keyof AssociateRubricDraft>(field: K, value: AssociateRubricDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const resetDraft = () => {
    setDraft(createInitialAssociateRubricDraft());
  };

  const selectedEvaluationId = useMemo(() => draft.evaluationId, [draft.evaluationId]);

  return {
    draft,
    selectedEvaluationId,
    isReadyToAssociate,
    updateField,
    resetDraft,
  };
};
