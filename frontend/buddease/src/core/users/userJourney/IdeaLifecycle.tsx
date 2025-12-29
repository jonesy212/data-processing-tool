// IdeaLifecycle.tsx
// Updated IdeaLifecycle component
import { allLifecyclePhases } from '@/core/hooks/phases/lifecycles';
import { useLifecycle } from '@/core/hooks/useLifecycle.ts';
import { StepProps } from "@/core/phases/steps/steps";
import React from "react";
import IdeaCreationPhaseManager from "./IdeaCreationPhase";
import IdeaPhase from "./IdeationPhase";

interface IdeaLifecyclePhaseProps extends StepProps {
  initialPhase?: string;
  onPhaseChange?: (from: string | null, to: string) => void;
  duration: number;
  onSubmitProfile: () => void;
  onIdeaSubmission: () => void;
}

const IdeaLifecycle: React.FC<IdeaLifecyclePhaseProps> = ({
  initialPhase = "Idea Lifecycle",
  onPhaseChange,
  duration,
  onSubmit,
  onSubmitProfile,
  onIdeaSubmission,
}) => {
  const {
    currentPhase,
    isTransitioning,
    transitionTo,
    canTransitionTo,
    updateActivity,
    getNextPossiblePhases
  } = useLifecycle({
    phases: allLifecyclePhases,
    initialPhase,
    onPhaseChange: (from, to) => {
      onPhaseChange?.(from?.name || null, to.name);
    }
  });

  const handleTransition = async (targetPhase: string) => {
    updateActivity(); // Track user interaction
    await transitionTo(targetPhase);
  };

  const renderPhaseComponent = () => {
    if (!currentPhase) return null;

    switch (currentPhase.name) {
      case "Idea Creation":
        return (
          <IdeaCreationPhaseManager
            onSubmit={onSubmit}
            onTransition={() => handleTransition("Idea Lifecycle")}
            duration={duration}
          />
        );
      default:
        return (
          <IdeaPhase
            phaseName={currentPhase.name}
            onTransition={handleTransition}
            onSubmit={onSubmit}
            subPhases={currentPhase.subPhases}
          />
        );
    }
  };

  if (!currentPhase) {
    return <div>No phase selected</div>;
  }

  return (
    <div>
      <h2>{currentPhase.name}</h2>
      <div>Sub-phases: {currentPhase.subPhases.join(', ')}</div>
      
      {renderPhaseComponent()}
      
      <div className="phase-navigation">
        <h3>Available Transitions:</h3>
        {getNextPossiblePhases().map(phase => (
          <button
            key={phase.name}
            onClick={() => handleTransition(phase.name)}
            disabled={isTransitioning || !canTransitionTo(phase.name)}
          >
            Go to {phase.name}
          </button>
        ))}
      </div>
      
      {isTransitioning && <div>Transitioning...</div>}
    </div>
  );
};

export default IdeaLifecycle;