// EmailConfirmationPhase.tsx

import { useNavigate } from 'react-router-dom';
import { OnboardingPhase } from "../personas/UserJourneyManager";
import { DevelopmentPhase } from "./DevelopmentPhase";
import EmailConfirmationPhaseComponent from "./EmailConfirmationPhaseComponent";
import { generateNextPhaseRoute } from '@/app/components/event/DynamicEventHandlerExample';
import React from 'react';


const handleRegistrationSuccess = (condition: boolean, dynamicData: any) => {
    const navigate = useNavigate();
    // Generate the next phase route dynamically based on condition and dynamic data
    const nextPhaseRoute = generateNextPhaseRoute(condition, dynamicData);
    // Transition to the next phase by pushing the generated route
    navigate(nextPhaseRoute);
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
