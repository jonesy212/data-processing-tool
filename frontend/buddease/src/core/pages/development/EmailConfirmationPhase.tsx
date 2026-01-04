EmailConfirmationPhase.tsx

import { DevelopmentPhase } from "@/core/components/phases/DevelopmentPhase";
import { OnboardingPhase } from "@/core/pages/personas/UserJourneyManager";
import { generateNextPhaseRoute } from '@/core/typings/eventHandlers/factoryHandlers';
import { useNavigate } from 'react-router-dom';
import EmailConfirmationPhaseComponent from "./EmailConfirmationPhaseComponent";


const handleRegistrationSuccess = (condition: boolean, dynamicData: any) => {
    const navigate = useNavigate();
    // Generate the next phase route dynamically based on condition and dynamic data
    const nextPhaseRoute = generateNextPhaseRoute(condition, dynamicData);
    // Transition to the next phase by pushing the generated route
    navigate(nextPhaseRoute);
  };
 

Implement the email confirmation phase
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
