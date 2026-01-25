// UserJourney.tsx
UserJourneyManager.tsx
import { TempUserData } from '@/core/models/phases/Phase';
import React, { useState } from "react";
import { OnboardingPhase } from "./UserJourneyManager";

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  // Generate time-based code for user
  const timeBasedCode = generateTimeBasedCode();
  
  // Initialize user data
  let userData: TempUserData = {
    id: state.user?.data?.id ?? "",
    ...(state.user?.data || {}),
    questionnaireResponses: {},
    traits: (props: DetailsProps<SupportedData>) => {
      return <CommonDetails {...props} />;
    },
    timeBasedCode: timeBasedCode,
  };

  // Initialize questionnaire responses
  onboardingQuestionnaireData.forEach((question: any) => {
    userData.questionnaireResponses[question.id] = "";
  });

  const handleTwoFactorSetup = async () => {
    try {
      const response = await axiosInstance.post("/auth/setup-2fa");
      setCurrentPhase(OnboardingPhase.NEXT_PHASE); // Replace with actual next phase
    } catch (error) {
      notify(
        "2fa-error",
        "Failed to setup two-factor authentication",
        NOTIFICATION_MESSAGES.Onboarding.TWO_FACTOR_ERROR,
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
    }
  };

  const handleQuestionnaireSubmit = async (userResponses: any) => {
    try {
      userData = {
        ...userData,
        questionnaireResponses: userResponses,
      };

      await axiosInstance.post("/api/questionnaire-submit", {
        userResponses,
      });

      localStorage.setItem("userData", JSON.stringify(userData));
      setCurrentPhase(OnboardingPhase.OFFER);

      notify(
        "questionnaireId",
        "Your information has been successfully submitted",
        NOTIFICATION_MESSAGES.Onboarding.QUESTIONNAIRE_SUBMITTED,
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
    } catch (error) {
      console.error("Error sending questionnaire responses:", error);
      notify(
        "",
        "There was an error saving your submission, try again",
        NOTIFICATION_MESSAGES.Onboarding.PROFILE_SETUP_ERROR,
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
    }
  };

  const handleProfileSetup = async (profileData: any) => {
    try {
      await axiosInstance.post("/api/profile-setup", profileData);
      setCurrentPhase(OnboardingPhase.OFFER);
    } catch (error) {
      console.error("Error sending profile setup data:", error);
      throw error; // Re-throw for component-level handling
    }
  };

  const handlePaymentProcess = (profileData: any) => {
    console.log("Profile setup data:", profileData);
    // TODO: Implement payment processing
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case OnboardingPhase.REGISTER:
        return <RegistrationPhase onSuccess={() => setCurrentPhase(OnboardingPhase.EMAIL_CONFIRMATION)} />;
      
      case OnboardingPhase.EMAIL_CONFIRMATION:
        return <EmailConfirmationPhase />;
      
      case OnboardingPhase.WELCOME:
        return <WelcomePhase onNextPhase={() => setCurrentPhase(OnboardingPhase.QUESTIONNAIRE)} />;
      
      case OnboardingPhase.QUESTIONNAIRE:
        return (
          <UserQuestionnaire
            onSubmit={handleQuestionnaireSubmit}
            onSubmitProfile={handleProfileSetup}
            onIdeaSubmission={() => setCurrentPhase(OnboardingPhase.IDEA_SUBMISSION)}
            onComplete={() => setCurrentPhase(OnboardingPhase.PROFILE_SETUP)}
          />
        );
      
      case OnboardingPhase.PROFILE_SETUP:
        return <ProfileSetupPhase onSubmit={handleProfileSetup} />;
      
      case OnboardingPhase.TWO_FACTOR_SETUP:
        return <TwoFactorSetupPhase onSetupComplete={handleTwoFactorSetup} />;
      
      case OnboardingPhase.OFFER:
        return <OfferPhase onPaymentProcess={handlePaymentProcess} />;
      
      default:
        return null;
    }
  };

  return <div className="user-journey-container">{renderPhase()}</div>;
};

export default UserJourneyManager;
