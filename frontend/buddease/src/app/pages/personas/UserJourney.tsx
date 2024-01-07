// UserJourneyManager.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import { User, UserData } from "@/app/components/users/User";
import React, { useState } from "react";
import OfferPage from "../onboarding/OfferPage";
import { OnboardingPhase } from "../onboarding/OnboardingPhase";
import WelcomePage from "../onboarding/WelcomePage";
import UserQuestionnaire from "./UserQuestionnaire"; // Adjust the import path as needed
import { personalityTraits } from "./recruiter_dashboard/PersonaBuilderDashboard";

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  let userData: UserData = {
    ...(state.user as User)?.data,
    questionnaireResponses: {},
  };

  const handleQuestionnaireSubmitWrapper = async (userResponses: any) => {
    await handleQuestionnaireSubmit(userResponses);

    // After handling the questionnaire, process text data
    const textResponses = Object.values(userResponses) as string[];
    const extractedTraits = processTextData(textResponses , personalityTraits);

    // Use the extractedTraits as needed (e.g., update state, send to the server, etc.)
    console.log('Extracted Traits:', extractedTraits);
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

const processTextData = (textResponses: string[], personalityTraits: any) => {
  const extractedTraits: { [key: string]: string } = {};

  Object.keys(personalityTraits).forEach(
    (traitKey: string) => {
      const traitKeywords = personalityTraits[traitKey];
      extractedTraits[traitKey] = determineTrait(
        textResponses,
        traitKeywords
      );
    }
  );

  return extractedTraits;
};

const determineTrait = (
  textResponses: string[],
  traitKeywords: string[]
): string => {
  const traitMentions = textResponses.filter((response: string) =>
    traitKeywords.some((keyword: string) =>
      response.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return traitMentions.length > textResponses.length / 2
    ? traitKeywords[1]
    : traitKeywords[0];
};

export default UserJourneyManager;
