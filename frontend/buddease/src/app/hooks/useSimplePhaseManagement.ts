// useSimplePhaseManagement.ts
import { useState } from 'react';
import { Phase, PhaseLite } from '@/app/types/phases';

// Simplified version for UI components that don't need full generic complexity
export function useSimplePhaseManagement(
  phases: PhaseLite[],
  initialPhaseIndex: number = 0
) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhaseIndex);
  const [phaseStatus, setPhaseStatus] = useState<Record<string, Partial<PhaseLite>>>({});

  const currentPhase = phases[currentPhaseIndex];

  const goToNextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex(prev => prev + 1);
    }
  };

  const goToPreviousPhase = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(prev => prev - 1);
    }
  };

  const goToPhase = (phaseId: string) => {
    const targetIndex = phases.findIndex(phase => phase.id === phaseId);
    if (targetIndex !== -1) {
      setCurrentPhaseIndex(targetIndex);
    }
  };

  return {
    currentPhase,
    currentPhaseIndex,
    goToNextPhase,
    goToPreviousPhase,
    goToPhase,
    isFirstPhase: currentPhaseIndex === 0,
    isLastPhase: currentPhaseIndex === phases.length - 1,
    totalPhases: phases.length
  };
}