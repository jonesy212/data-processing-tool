// UserJourneyManager.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import { User } from "@/app/components/todos/tasks/User";
import React, { useState } from "react";
import OfferPage from "./OfferPage";
import UserQuestionnaire from "./UserQuestionnaire"; // Adjust the import path as needed
import WelcomePage from "./WelcomePage";

export enum UserJourneyPhase {
  SIGNUP,
  EMAIL_CONFIRMATION,
  WELCOME,
  QUESTIONNAIRE,
  OFFER,
}

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<UserJourneyPhase>(
    UserJourneyPhase.SIGNUP
  );

  // Placeholder for user data
  interface UserData {
    datasets?: string;
    tasks?: string;
    questionnaireResponses?: any;
  }

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
    setCurrentPhase(UserJourneyPhase.OFFER);
  };

  return (
    <div>
      {currentPhase === UserJourneyPhase.EMAIL_CONFIRMATION && (
        <EmailConfirmationPage />
      )}
      {currentPhase === UserJourneyPhase.WELCOME && <WelcomePage />}
      {currentPhase === UserJourneyPhase.QUESTIONNAIRE && (
        <UserQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      )}
      {currentPhase === UserJourneyPhase.OFFER && <OfferPage />}
      {/* Add more phases as needed */}
    </div>
  );
};

export default UserJourneyManager;
