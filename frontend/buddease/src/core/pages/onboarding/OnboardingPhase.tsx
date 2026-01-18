// OnboardingPhase.tsx
import axiosInstance from '@/core/api/csrfToken';
import DetailsProps from "@/core/components/models/data/Details";
import { CommonDetails } from '@/core/components/models/details/CommonDetails';
import EmailConfirmationPhase from "@/core/components/phases/EmailConfirmationPhase";
import TwoFactorSetupPhase from "@/core/components/phases/TwoFactorSetupPhase";
import ProfileSetupPhase from "@/core/components/phases/onboarding/ProfileSetupPhase";
import WelcomePhase from "@/core/components/phases/onboarding/WelcomePhase";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { SupportedData } from "@/core/models/CommonData";
import generateTimeBasedCode from "@/core/models/realtime/TimeBasedCodeGenerator";
import { OnboardingPhase } from "@/core/pages/personas/UserJourneyManager";
import UserQuestionnaire from "@/core/pages/personas/UserQuestionnaire";
import { useAuth } from "@/core/state/context/AuthContext";
import { useNotification } from '@/core/state/context/NotificationContext';
import { UserData } from "@/core/users/User";
import React, { useState } from "react";
import onboardingQuestionnaireData from "./OnboardingQuestionnaireData";
import RegistrationPhase from "./RegistrationPhase";





const handleRegistrationSuccess = (userData: UserData) => { 
  // Handle registration success
  const { notify } = useNotification();
  
  notify({
    id: `registration_success_${userData.id || Date.now()}`,
    message: NOTIFICATION_MESSAGES.Registration.REGISTRATION_SUCCESS || "Registration successful",
    data: {
      entityType: 'user',
      entityId: userData.id || 'new_user',
      action: 'registration',
      userData: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        // Add other relevant user data fields
      },
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_SUCCESS,
    level: 'success' as const,
    metadata: {
      registrationType: userData.registrationType || 'standard',
      source: userData.source || 'web',
      hasVerifiedEmail: userData.emailVerified || false,
      requiresEmailVerification: userData.requiresEmailVerification || false
    }
  });
  
  // Optional: Additional actions after successful registration
  if (userData.requiresEmailVerification) {
    notify({
      id: `registration_verification_needed_${Date.now()}`,
      message: "Please check your email to verify your account",
      data: {
        entityType: 'user',
        entityId: userData.id,
        action: 'verification_required',
        userEmail: userData.email
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const,
      action: {
        label: "Resend Verification Email",
        onClick: () => resendVerificationEmail(userData.email)
      }
    });
  }
};

// Optional helper function
const resendVerificationEmail = (email: string) => {
  console.log(`Resending verification email to: ${email}`);
  // Implement actual resend logic here
  // await authService.resendVerificationEmail(email);
};


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
        return <WelcomePhase
          onNextPhase={() => setCurrentPhase(OnboardingPhase.QUESTIONNAIRE)}
        />;
      case OnboardingPhase.QUESTIONNAIRE:
        // Render the questionnaire phase
        return <UserQuestionnaire
          onSubmit={handleQuestionnaireSubmitWrapper}
          onSubmitProfile={handleProfileSetupSubmit}
          onIdeaSubmission={() => {setCurrentPhase(OnboardingPhase.IDEA_SUBMISSION)}}
          onComplete={async () =>  setCurrentPhase(OnboardingPhase.PROFILE_SETUP)} />;
      case OnboardingPhase.PROFILE_SETUP:
        // Render the profile setup phase
        return <ProfileSetupPhase
          onSubmit={handleProfileSetupSubmit}
        />;
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
    traits: (props: DetailsProps<SupportedData>) => {
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

      // Success notification using object format
      const { notify } = useNotification();
      notify({
        id: `questionnaire_submit_success_${userData.id || 'anonymous'}_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Onboarding.QUESTIONNAIRE_SUBMITTED || "Your information has been successfully submitted",
        data: {
          entityType: 'user',
          entityId: userData.id || 'anonymous',
          action: 'questionnaire_submit',
          extra: {
            userId: userData.id,
            questionnaireResponses: userResponses,
            responseCount: Object.keys(userResponses).length,
            responseData: response.data,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const,
        metadata: {
          phase: 'onboarding',
          step: 'questionnaire',
          nextPhase: OnboardingPhase.OFFER,
          hasResponses: Object.keys(userResponses).length > 0
        }
      });
      
    } catch (error: any) {
      // Handle any network or unexpected errors
      console.error("Error sending questionnaire responses:", error);
      
      // Error notification using object format
      const { notify } = useNotification();
      const axiosError = error as AxiosError;
      
      let userMessage = "There was an error saving your submission, try again";
      let errorType = "QUESTIONNAIRE_SUBMIT_ERROR";
      
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 400:
            userMessage = "Invalid questionnaire data";
            break;
          case 401:
            userMessage = "Authentication required to submit questionnaire";
            break;
          case 403:
            userMessage = "You don't have permission to submit this questionnaire";
            break;
          case 409:
            userMessage = "Questionnaire already submitted";
            break;
          case 422:
            userMessage = "Questionnaire validation failed";
            break;
          case 500:
            userMessage = "Server error while processing questionnaire";
            break;
        }
      } else if (axiosError.request) {
        userMessage = "Network error: Unable to submit questionnaire";
        errorType = "QUESTIONNAIRE_NETWORK_ERROR";
      }
      
      notify({
        id: `questionnaire_submit_error_${userData.id || 'anonymous'}_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: 'user',
          entityId: userData.id || 'anonymous',
          action: 'questionnaire_submit',
          originalError: axiosError.message,
          extra: {
            userId: userData.id,
            questionnaireResponses: userResponses,
            responseCount: Object.keys(userResponses).length,
            statusCode: axiosError.response?.status,
            errorType: errorType,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const,
        metadata: {
          phase: 'onboarding',
          step: 'questionnaire',
          isRetryable: true,
          requiresUserAction: true
        },
        action: {
          label: "Try Again",
          onClick: () => handleQuestionnaireSubmit(userResponses)
        }
      });
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

  const handleProfileSetupSubmit = async (profileData: any) => { 
    await handleProfileSetup(profileData);
  
  }

  return <div>{renderPhase()}</div>;
};

export default TempUserData;