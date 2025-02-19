import React from "react";
import { PhaseUnion } from "./DevelopmentPhase";
interface PhaseProps {
    onSubmit: () => void;

}

interface PlanningPhaseProps extends PhaseProps {
  phase: PhaseUnion;
  title: string;
}

export const PlanningPhase: React.FC<PlanningPhaseProps> = ({ phase, title, onSubmit }) => {
  return (
    <div>
      <h2>{title}</h2>
      {/* Render phase-specific content here */}
      <div>
        Planning Phase UI
      </div>
    </div>
  );
};

export type { PhaseProps };
