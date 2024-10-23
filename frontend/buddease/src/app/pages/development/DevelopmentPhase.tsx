// DevelopmentPhase.tsx
import React from "react";
import { DevelopmentPhaseEnum } from "@/app/components/models/data/StatusType";
import RegistrationPhaseComponent from "../onboarding/RegistrationPhaseComponent";
import { OnboardingPhase } from "../personas/UserJourneyManager";

// Union type of all possible phase values from DevelopmentPhaseEnum and OnboardingPhase
export type PhaseUnion = DevelopmentPhaseEnum | OnboardingPhase;

export interface DevelopmentPhase {
  phase: PhaseUnion; // Adjust type to union type
  title: string;
  render(): JSX.Element;
}



// Implement the registration phase
const RegistrationPhase: React.FC<{
  onSuccess: any,
  onSubmit: any
  
 }> = ({ onSuccess }) => {
  const title = "Registration";
  const phase = OnboardingPhase.REGISTER;
  return (
    <div>
      <h2>{title}</h2>
      <RegistrationPhaseComponent onSuccess={onSuccess} />
    </div>
  );
};


export default RegistrationPhase
 
export const DesignPhase: DevelopmentPhase = {
  phase: {} as PhaseUnion,
  title: "Design",
  render: () => {
    return <div>Developement Phase UI</div>;
    // Render design phase UI and logic
  },
};

// Define other phases similarly...
