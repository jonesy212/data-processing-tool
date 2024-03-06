// UserJourneyManager.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import { User, UserData } from '@/app/components/users/User';
import IdeaCreationPhase from "@/app/components/users/userJourney/IdeaCreationPhase";
import IdeationPhase from "@/app/components/users/userJourney/IdeationPhase";
import axios from "axios";
import React, { useState } from 'react';
import OfferPage from '../onboarding/OfferPage';
import onboardingQuestionnaireData from '../onboarding/OnboardingQuestionnaireData';
import WelcomePage from '../onboarding/WelcomePage';
import UserQuestionnaire from './UserQuestionnaire';



export enum OnboardingPhase {
  REGISTER,
  EMAIL_CONFIRMATION,
  WELCOME,
  QUESTIONNAIRE,
  PROFILE_SETUP,
  OFFER,
  TWO_FACTOR_SETUP,
  PAYMENT_PROCESS,
  NEXT_PHASE
}

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  let userData: UserData = {
    ...(state.user as User)?.data,
    questionnaireResponses: {},
  };

  onboardingQuestionnaireData.forEach((question: any) => {
    userData.questionnaireResponses[question.id] = "";
  });

  const handleQuestionnaireSubmit = async (userResponses: any) => {
    try {
      // Add logic to handle questionnaire submission

      // Update user data locally
      userData = {
        ...userData,
        questionnaireResponses: userResponses,
      };

      // Example: Send responses to the server using Axios
      const response = await axios.post("/api/questionnaire-submit", {
        userResponses,
        // Include any other relevant data to send to the server
      });

      // Handle the server response if needed
      console.log("Server response:", response.data);

      // Update user state locally
      localStorage.setItem("userData", JSON.stringify(userData));

      // Transition to the next phase (OFFER)
      setCurrentPhase(OnboardingPhase.OFFER);
    } catch (error) {
      // Handle any network or unexpected errors
      console.error("Error sending questionnaire responses:", error);
    }
  };

  const handleProfileSetup = (profileData: any) => {
    // Logic for handling profile setup data
    console.log("Profile setup data:", profileData);

    // Example: Send profile data to the server using Axios
    // Replace this with your actual API endpoint and data
    axios.post("/api/profile-setup", profileData)
      .then((response) => {
        // Handle the server response if needed
        console.log("Server response:", response.data);

        // Transition to the next phase (OFFER) after profile setup
        setCurrentPhase(OnboardingPhase.OFFER);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error sending profile setup data:", error);
      });
  };

  const handleQuestionnaireSubmitWrapper = async (userResponses: any) => {
    await handleQuestionnaireSubmit(userResponses);
  };

  return (
    <div>
      {currentPhase === OnboardingPhase.EMAIL_CONFIRMATION && (
        <EmailConfirmationPage />
      )}
      {currentPhase === OnboardingPhase.WELCOME && <WelcomePage />}
      {currentPhase === OnboardingPhase.QUESTIONNAIRE && (
        <UserQuestionnaire onComplete={handleQuestionnaireSubmit} onSubmit={handleQuestionnaireSubmitWrapper} />
      )}
      {currentPhase === OnboardingPhase.OFFER && <OfferPage />}
      {currentPhase === OnboardingPhase.PROFILE_SETUP && (
        <ProfileSetupPhase onSubmit={handleProfileSetup} />
      )}
      {currentPhase === 0 && (
        <IdeationPhase onTransition={handlePhaseTransition} />
      )}
      {currentPhase === 1 && (
        <IdeaCreationPhase onTransition={handlePhaseTransition} />
      )}
      {/* Add more phases as needed */}
    </div>
  );
};

export default UserJourneyManager;
