// OnboardingPhase.tsx
import axiosInstance from "@/app/api/axiosInstance";
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import CommonDetails, {
  DetailsProps,
  SupportedData,
} from "@/app/components/models/CommonData";
import PaymentProcess from "@/app/components/payment/PaymentProcess";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { UserData } from "@/app/components/users/User";
import React, { ReactNode, useState } from "react";
import generateTimeBasedCode from "../../../../models/realtime/TimeBasedCodeGenerator";
import UserQuestionnaire from "../personas/UserQuestionnaire";
import OfferPage from "./OfferPage";
import onboardingQuestionnaireData from "./OnboardingQuestionnaireData";
import WelcomePage from "./WelcomePage";

export enum OnboardingPhase {
  REGISTER,
  EMAIL_CONFIRMATION,
  WELCOME,
  QUESTIONNAIRE,
  PROFILE_SETUP,
  OFFER,
  PAYMENT_PROCESS,
}

interface TempUserData extends Partial<UserData> {
  questionnaireResponses: { [key: string]: string };
  timeBasedCode?: string; // Add timeBasedCode property to TempUserData

}


const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  const timeBasedCode = generateTimeBasedCode();
  let userData: TempUserData = {
    id: state.user?.data?.id ?? "", // Use optional chaining and nullish coalescing operator to handle undefined id
    ...(state.user?.data || {}),
    questionnaireResponses: {},
    traits: (props: DetailsProps<SupportedData>, context?: any): ReactNode => {
      return <CommonDetails {...props} />;
    },
    timeBasedCode: timeBasedCode,
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
      const response = await axiosInstance.post("/api/questionnaire-submit", {
        userResponses,
        // Include any other relevant data to send to the server
      });

      // Handle the server response if needed
      console.log("Server response:", response.data);

      // Update user state locally
      localStorage.setItem("userData", JSON.stringify(userData));

      // Transition to the next phase (OFFER)
      setCurrentPhase(OnboardingPhase.OFFER);

      // Notify user of successful questionnaire submission
      notify(
        "questionnaireId",
        "Your information has been successfully submitted",
        NOTIFICATION_MESSAGES.Onboarding.QUESTIONNAIRE_SUBMITTED,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      // Handle any network or unexpected errors
      console.error("Error sending questionnaire responses:", error);
      notify(
        "",
        "There was an error saving your submission, try again",
        NOTIFICATION_MESSAGES.Onboarding.PROFILE_SETUP_ERROR,
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  };

  const handleProfileSetup = (profileData: any) => {
    // Logic for handling profile setup data
    console.log("Profile setup data:", profileData);

    // Example: Send profile data to the server using Axios
    // Replace this with your actual API endpoint and data
    axiosInstance
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

  const handlePaymentProcess = (profileData: any) => {
    // Logic for handling profile setup data
    console.log("Profile setup data:", profileData);
    // todo update to use
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
      {currentPhase === OnboardingPhase.PROFILE_SETUP && (
        <ProfileSetupPhase onSubmit={handleProfileSetup} />
      )}
      {currentPhase === OnboardingPhase.OFFER && <OfferPage />}
      {/* Add more phases as needed */}
      {currentPhase === OnboardingPhase.PAYMENT_PROCESS && (
        <PaymentProcess onSubmit={handlePaymentProcess} />
      )}
    </div>
  );
};

export default TempUserData; UserJourneyManager;
