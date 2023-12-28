// OnboardingPhase.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import { User, UserData } from "@/app/components/todos/tasks/User";
import axios from "axios";
import React, { useState } from "react";
import OfferPage from "./OfferPage";
import onboardingQuestionnaireData from "./OnboardingQuestionnaireData";
import UserQuestionnaire from "./UserQuestionnaire";
import WelcomePage from "./WelcomePage";

export enum OnboardingPhase {
  REGISTER,
  EMAIL_CONFIRMATION,
  WELCOME,
  QUESTIONNAIRE,
  PROFILE_SETUP,
  OFFER,
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
      // handle questionnaire submission
      
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
    axios
      .post("/api/profile-setup", profileData)
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
        <UserQuestionnaire onSubmit={handleQuestionnaireSubmitWrapper} />
      )}
      {currentPhase === OnboardingPhase.OFFER && <OfferPage />}
      {/* Add more phases as needed */}
      {currentPhase === OnboardingPhase.PROFILE_SETUP && (
        <ProfileSetupPhase onSubmit={handleProfileSetup} />
      )}
    </div>
  );
};

export default UserJourneyManager;
