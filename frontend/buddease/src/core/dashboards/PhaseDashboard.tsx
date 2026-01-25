// PhaseDashboard.tsx
import React from 'react';

import EmailSetupForm from "@/core/components/communications/email/EmailSetUpForm";
import { DndProvider, useDrag } from "@/core/libraries/animations/DraggableAnimation/useDrag";
import { OnboardingPhase } from "@/core/pages/personas/UserJourneyManager";
import ProjectManagerComponent from "@/core/projects/projectManagement/ProjectManager";
import { HTML5Backend } from "react-dnd-html5-backend";

export const dragRef = useRef<HTMLDivElement>(null);
const DraggablePhaseCard: React.FC<{ phase: OnboardingPhase }> = ({
  phase,
}) => {
  const [text, setText] = useState("");

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "PHASE_CARD",
      item: { phase },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [phase]
  );

  return (
    <div
      ref={dragRef}
      style={{
        border: "1px solid",
        margin: "8px",
        padding: "8px",
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {getPhaseTitle(phase)}
    </div>
  );
};

const PhaseDashboard: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectManagerComponent />
      <div style={{ display: "flex" }}>
        <DraggablePhaseCard phase={OnboardingPhase.EMAIL_CONFIRMATION} />
        <DraggablePhaseCard phase={OnboardingPhase.WELCOME} />
        {/* Add more draggable cards for other phases */}
      </div>
      {/* Include EmailSetupForm component */}
      <EmailSetupForm handleRegisterEmail={() => {}} />
    </DndProvider>
  );
};

// Utility function to get phase title
const getPhaseTitle = (phase: OnboardingPhase): string => {
  switch (phase) {
    case OnboardingPhase.WELCOME:
      return "Sign Up";
    case OnboardingPhase.EMAIL_CONFIRMATION:
      return "Email Confirmation";
    case OnboardingPhase.WELCOME:
      return "Welcome";
    // Add titles for other phases as needed
    default:
      return "";
  }
};

export default PhaseDashboard;
