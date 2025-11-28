// usePhaseManagement.ts
import { useState } from 'react';
import { PhaseData } from '@/app/models/phases/Phase'
import { Phase } from "@/app/models/phases/Phase";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields, DefaultIncludedFields} from '@/app/config/BaseConfig';

export function usePhaseManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  phases: Phase<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[],
  initialPhaseIndex: number = 0
) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhaseIndex);
  const [phaseData, setPhaseData] = useState<Record<string, PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>({});
  const [phaseHistory, setPhaseHistory] = useState<number[]>([]);

  const currentPhase = phases[currentPhaseIndex];
  const currentPhaseData = phaseData[currentPhase.id] || {};

  const updatePhaseStatus = (phaseId: string, updates: Partial<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    setPhaseData(prev => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        ...updates
      } as PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    }));
  };

  const goToNextPhase = (data?: Partial<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    if (currentPhaseIndex < phases.length - 1) {
      // Save data for current phase
      if (data) {
        updatePhaseStatus(currentPhase.id, data);
      }
      
      // Mark current phase as complete
      updatePhaseStatus(currentPhase.id, { 
        isComplete: true,
        endDate: new Date()
      });

      setPhaseHistory(prev => [...prev, currentPhaseIndex]);
      setCurrentPhaseIndex(prev => prev + 1);

      // Initialize next phase
      const nextPhase = phases[currentPhaseIndex + 1];
      updatePhaseStatus(nextPhase.id, {
        isActive: true,
        startDate: new Date()
      });
    }
  };

  const goToPreviousPhase = () => {
    if (phaseHistory.length > 0) {
      const previousPhaseIndex = phaseHistory[phaseHistory.length - 1];
      const currentPhase = phases[currentPhaseIndex];
      const previousPhase = phases[previousPhaseIndex];

      // Deactivate current phase
      updatePhaseStatus(currentPhase.id, { isActive: false });

      setPhaseHistory(prev => prev.slice(0, -1));
      setCurrentPhaseIndex(previousPhaseIndex);

      // Reactivate previous phase
      updatePhaseStatus(previousPhase.id, { isActive: true });
    }
  };

  const goToPhase = (
    phaseId: string, 
    data?: Partial<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    const targetIndex = phases.findIndex(phase => phase.id === phaseId);
    if (targetIndex !== -1) {
      const currentPhase = phases[currentPhaseIndex];
      
      // Deactivate current phase
      updatePhaseStatus(currentPhase.id, { isActive: false });

      setPhaseHistory(prev => [...prev, currentPhaseIndex]);
      setCurrentPhaseIndex(targetIndex);

      const targetPhase = phases[targetIndex];
      
      // Activate and update target phase
      updatePhaseStatus(targetPhase.id, {
        ...data,
        isActive: true,
        startDate: new Date()
      });
    }
  };

  const getCurrentPhaseIndex = () => currentPhaseIndex;
  const isFirstPhase = currentPhaseIndex === 0;
  const isLastPhase = currentPhaseIndex === phases.length - 1;

  // Helper to get phase by ID with proper typing
  const getPhaseById = (phaseId: string): Phase<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined => {
    return phases.find(phase => phase.id === phaseId);
  };

  // Execute phase hooks
  const executePhaseHooks = async (hookType: 'onStart' | 'onEnd') => {
    const phase = currentPhase;
    if (phase.hooks && phase.hooks[hookType]) {
      await phase.hooks[hookType]();
    }
  };

  return {
    currentPhase,
    currentPhaseIndex,
    phaseData,
    phaseHistory,
    phases,
    goToNextPhase,
    goToPreviousPhase,
    goToPhase,
    updatePhaseStatus,
    getCurrentPhaseIndex,
    getPhaseById,
    executePhaseHooks,
    isFirstPhase,
    isLastPhase,
    totalPhases: phases.length
  };
}