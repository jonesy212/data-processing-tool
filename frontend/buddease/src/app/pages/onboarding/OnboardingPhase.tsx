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
import RegistrationPhase from "./RegistrationPhase";





const handleRegistrationSuccess = (userData: UserData) => { 
  // Handle registration success
  const { notify } = useNotification();
  notify(
    "handleRegistrationSuccess",
    "Registration Success",
    NOTIFICATION_MESSAGES.Registration.REGISTRATION_SUCCESS,
    new Date,
    NotificationTypeEnum.Success
    );
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

  const handleTwoFactorSetup = async () => {
    try {
      // Make an API call to set up two-factor authentication
      const response = await axiosInstance.post("/auth/setup-2fa");
      // Handle response and transition to the next phase if successful
      setCurrentPhase(OnboardingPhase.NEXT_PHASE); // Replace with the actual next phase
    } catch (error) {
      // Handle error
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case OnboardingPhase.REGISTER:
        // Render the registration phase
        return <RegistrationPhase onSuccess={handleRegistrationSuccess} />;
      case OnboardingPhase.EMAIL_CONFIRMATION:
        // Render the email confirmation phase
        return <EmailConfirmationPhase />;
      case OnboardingPhase.WELCOME:
        // Render the welcome phase
        return <WelcomePhase />;
      case OnboardingPhase.QUESTIONNAIRE:
        // Render the questionnaire phase
        return <UserQuestionnaire
          onComplete={() => setCurrentPhase(OnboardingPhase.PROFILE_SETUP)} />;
      case OnboardingPhase.PROFILE_SETUP:
        // Render the profile setup phase
        return <ProfileSetupPhase />;
      case OnboardingPhase.TWO_FACTOR_SETUP:
        // Render the two-factor authentication setup phase
        return <TwoFactorSetupPhase onSetupComplete={handleTwoFactorSetup} />;
      // Add cases for other phases
      default:
        return null;
    }
  };

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

  return <div>{renderPhase()}</div>;
};

export default TempUserData;
UserJourneyManager;























// TwoFactorSetupPhase component
const TwoFactorSetupPhase: React.FC<{ onSetupComplete: () => void }> = ({ onSetupComplete }) => {
  // State for the token input
  const [token, setToken] = useState('');

  // Handler for submitting the two-factor authentication token
  const handleSubmit = async () => {
    try {
      // Make an API call to verify the two-factor authentication token
      const response = await axios.post('/auth/verify-2fa', { token });
      // Handle response and call the onSetupComplete callback if successful
      onSetupComplete();
    } catch (error) {
      // Handle error
    }
  };
