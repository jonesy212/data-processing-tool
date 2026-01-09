DevelopmentPhase.tsx
import { DevelopmentPhaseEnum } from "@/core/models/data/StatusType";
import RegistrationPhaseComponent from "@/core/pages/onboarding/RegistrationPhaseComponent";
import { OnboardingPhase } from "@/core/pages/personas/UserJourneyManager";
import React from "react";

// Union type of all possible phase values from DevelopmentPhaseEnum and OnboardingPhase
export type PhaseUnion = DevelopmentPhaseEnum | OnboardingPhase;

export interface DevelopmentPhase {
  phase: PhaseUnion; // Adjust type to union type
  title: string;
  render(): React.JSX.Element; 

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
