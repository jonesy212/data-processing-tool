// UserJourneyManager.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import { User, UserData } from "@/app/components/users/User";
import React, { useState } from "react";
import OfferPage from "../onboarding/OfferPage";
import { OnboardingPhase } from "../onboarding/OnboardingPhase";
import WelcomePage from "../onboarding/WelcomePage";
import UserQuestionnaire from "./UserQuestionnaire"; // Adjust the import path as needed

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  let userData: UserData = {
    ...(state.user as User)?.data,
    questionnaireResponses: {},
  };

  const handleQuestionnaireSubmit = (userResponses: any) => {
    // Update user state locally
    userData = {
      ...userData,
      questionnaireResponses: userResponses,
      // Update other properties as needed
    };

    // Transition to the next phase (OFFER)
    setCurrentPhase(OnboardingPhase.OFFER);
  };

  return (
    <div>
      {currentPhase === OnboardingPhase.EMAIL_CONFIRMATION && (
        <EmailConfirmationPage />
      )}
      {currentPhase === OnboardingPhase.WELCOME && <WelcomePage />}
      {currentPhase === OnboardingPhase.QUESTIONNAIRE && (
        <UserQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      )}
      {currentPhase === OnboardingPhase.OFFER && <OfferPage />}
      {/* Add more phases as needed */}
    </div>
  );
};

export default UserJourneyManager;
