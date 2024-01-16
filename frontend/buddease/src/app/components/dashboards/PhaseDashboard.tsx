// PhaseDashboard.tsx
import { OnboardingPhase } from "@/app/pages/onboarding/OnboardingPhase";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProjectManager from "../projects/projectManagement/ProjectManager";

const DraggablePhaseCard: React.FC<{ phase: OnboardingPhase }> = ({
  phase,
}) => {
  const [, drag] = useDrag(() => ({ type: "PHASE_CARD", item: { phase } }));

  return (
    <div
      ref={drag}
      style={{ border: "1px solid", margin: "8px", padding: "8px" }}
    >
      {getPhaseTitle(phase)}
    </div>
  );
};

const PhaseDashboard: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProjectManager />
      <div style={{ display: "flex" }}>
        <DraggablePhaseCard phase={OnboardingPhase.EMAIL_CONFIRMATION} />
        <DraggablePhaseCard phase={OnboardingPhase.WELCOME} />
        {/* Add more draggable cards for other phases */}
      </div>
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

export default PhaseDashboard