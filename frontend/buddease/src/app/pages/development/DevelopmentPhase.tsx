// DevelopmentPhase.tsx

import { DevelopmentPhaseEnum } from "@/app/components/models/data/StatusType";
import { OnboardingPhase } from "../personas/UserJourneyManager";
import RegistrationPhaseComponent from "../onboarding/RegistrationPhaseComponent";
import EmailConfirmationPhaseComponent from "./EmailConfirmationPhaseComponent";

// Union type of all possible phase values from DevelopmentPhaseEnum and OnboardingPhase
type PhaseUnion = DevelopmentPhaseEnum | OnboardingPhase;

export interface DevelopmentPhase {
  phase: PhaseUnion; // Adjust type to union type
  title: string;
  render(): JSX.Element;
}

const handleRegistrationSuccess = () => { 
  // transition to next phase
}

// Implement the registration phase
const RegistrationPhase: DevelopmentPhase = {
    phase: OnboardingPhase.REGISTER,
    title: 'Registration',
    render: () => {
      // Implement registration phase UI and logic
      return (
        <RegistrationPhaseComponent onSuccess={handleRegistrationSuccess} />
      );
    }
};
  
// Implement the email confirmation phase
const EmailConfirmationPhase: DevelopmentPhase = {
    phase: OnboardingPhase.EMAIL_CONFIRMATION,
    title: 'Email Confirmation',
    render: () => {
      // Implement email confirmation phase UI and logic
      return (
        <EmailConfirmationPhaseComponent
          onSuccess={handleRegistrationSuccess} />
        
  
      );
    }
};

export const PlanningPhase: DevelopmentPhase = {
  phase: {} as PhaseUnion,
  title: "Planning",
  render(): JSX.Element{
    return(
      <div>
        Planning Phase UI
      </div>
    )
  }
};

export const DesignPhase: DevelopmentPhase = {
  phase: {} as PhaseUnion,
  title: "Design",
  render: () => {
    return <div>Developement Phase UI</div>;
    // Render design phase UI and logic
  },
};

// Define other phases similarly...
