import React from "react";
import IdeaCreationPhaseManager from "./IdeaCreationPhase";
import IdeaPhase from "./IdeationPhase";
import { StepProps } from "../../phases/steps/steps";

interface IdeaLifecyclePhaseProps extends StepProps {
  phaseName: string;
  onTransition: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  duration: number;
  onSubmitProfile: () => void;
  onIdeaSubmission: () => void;
}

const IdeaLifecycle: React.FC<IdeaLifecyclePhaseProps> = ({
  phaseName,
  onTransition,
  duration,
  onSubmit,
  onSubmitProfile,
  onIdeaSubmission,
}) => {
  return (
    <div>
      <h2>Idea Lifecycle</h2>
      {/* Render different phases based on your application state */}
      <IdeaCreationPhaseManager
        onSubmit={() => {}}
        onTransition={() => {}}
        duration={0}
        // phaseName="Idea Creation"
      />
      <IdeaPhase
        phaseName="Idea"
        onTransition={onTransition} onSubmit={onSubmit}
        />
      <IdeaPhase
        phaseName="Team Building"
        onTransition={onTransition} onSubmit={onSubmit}      />
      <IdeaPhase
        phaseName="Ideation"
        onTransition={onTransition} onSubmit={onSubmit}      />
      {/* Add more phases as needed */}
    </div>
  );
};

export default IdeaLifecycle;
