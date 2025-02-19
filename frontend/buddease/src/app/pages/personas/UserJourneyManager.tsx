// UserJourneyManager.tsx
import {IdeaLifecycleProcess} from '@app/components/phases/IdeaLifecycleProcess'
import { TaskPhase } from '@/app/components/phases/TaskPhaseEnum'
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import {
  DevelopmentPhaseEnum,
  ProjectPhaseTypeEnum,
} from "@/app/components/models/data/StatusType";
import {UserSupportPhase} from "@/app/components/libraries/ui/components/UserSupportPhaseComponent";
import { DataAnalysisSubPhase } from "@/app/components/projects/DataAnalysisPhase";
import { PhaseActions } from "@/app/components/phases/PhaseActions";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import { User, UserData } from "@/app/components/users/User";
import IdeaCreationPhase from "@/app/components/users/userJourney/IdeaCreationPhase";
import IdeationPhase from "@/app/components/users/userJourney/IdeationPhase";
import axios from "axios";
import React, { useState } from "react";
import  PlanningPhase, {
  DevelopmentPhase
} from "../development/DevelopmentPhase";
import OfferPage from "../onboarding/OfferPage";
import onboardingQuestionnaireData from "../onboarding/OnboardingQuestionnaireData";
import WelcomePage from "../onboarding/WelcomePage";
import UserQuestionnaire from "./UserQuestionnaire";
import ContentManagementPhase from "@/app/components/phases/ContentManagementPhase";
import { TeamCreationPhase } from "@/app/components/phases/actions/TeamCreation";
import { ContentManagementPhaseEnum } from "@/app/components/phases/ContentManagementPhase";
import FeedbackProcess, {
  FeedbackPhaseEnum,
} from "@/app/components/phases/FeedbackPhase";
import { TaskManagementPhase } from "@/app/components/projects/TaskManagementPhase";
import PostLaunchActivitiesPhase from "@/app/components/phases/postLaunchPhase/PostLaunchActivitiesPhase";
import TaskProcess from "@/app/components/phases/TaskProcess";
import UserRoles from "@/app/components/users/UserRoles";
import {
  ContentItemSelection,
  ContentEditing,
  ContentCreation,
  ContentOrganization,
  ContentPublishing,
} from "@/app/components/phases/ContentMaintenance";
import TeamCreationProcess from "@/app/components/phases/actions/TeamCreationManager";
import { TradingPhase } from "@/app/components/phases/crypto/CryptoTradingPhase";
import TradingProcess from "@/app/components/phases/TradingProcess";
import { IdeaLifecyclePhase } from "@/app/components/phases/ideaPhase/IdeaLifecyclePhase";

export enum OnboardingPhase {
  REGISTER,
  EMAIL_CONFIRMATION,
  WELCOME,
  QUESTIONNAIRE,
  OFFER,

  PROFILE_SETUP,
  TWO_FACTOR_SETUP,
  PAYMENT_PROCESS,
  NEXT_PHASE,
  IDEA_SUBMISSION,
}

type PhaseOptions =
  | OnboardingPhase
  | DevelopmentPhaseEnum
  | ContentManagementPhaseEnum;
interface UserJourneyManagerProps {
  user: User;
  phaseName: PhaseOptions;
}

// Define the mapping of phases to components
const phaseComponents: Record<string, React.FC<any>> = {
  // Onboarding Phases
  [OnboardingPhase.EMAIL_CONFIRMATION]: EmailConfirmationPage,
  [OnboardingPhase.WELCOME]: WelcomePage,
  [OnboardingPhase.QUESTIONNAIRE]: UserQuestionnaire,
  [OnboardingPhase.OFFER]: OfferPage,
  [OnboardingPhase.PROFILE_SETUP]: ProfileSetupPhase,

  // Development Phases
  [DevelopmentPhaseEnum.PLANNING]: IdeationPhase,
  [DevelopmentPhaseEnum.IDEA_CREATION]: IdeaCreationPhase,

  // Content Management Phases
  [ContentManagementPhaseEnum.CONTENT_ITEM_SELECTION]: ContentItemSelection,
  [ContentManagementPhaseEnum.CONTENT_EDITING]: ContentEditing,
  [ContentManagementPhaseEnum.CONTENT_CREATION]: ContentCreation,
  [ContentManagementPhaseEnum.CONTENT_ORGANIZATION]: ContentOrganization,
  [ContentManagementPhaseEnum.CONTENT_PUBLISHING]: ContentPublishing,

  // Feedback Phases
  [FeedbackPhaseEnum.FEEDBACK_SELECTION]: FeedbackProcess,
  [FeedbackPhaseEnum.FEEDBACK_PROVIDING]: FeedbackProcess,
  [FeedbackPhaseEnum.FEEDBACK_PROCESSING]: FeedbackProcess,
  [FeedbackPhaseEnum.FEEDBACK_ANALYSIS]: FeedbackProcess,
  [FeedbackPhaseEnum.FEEDBACK_REPORTING]: FeedbackProcess,

  // Task Phases
  [TaskPhase.Planning]: TaskProcess,
  [TaskPhase.Execution]: TaskProcess,
  [TaskPhase.Testing]: TaskProcess,
  [TaskPhase.Completion]: TaskProcess,

  // Team Creation Phases
  [TeamCreationPhase.QUESTIONNAIRE]: TeamCreationProcess,
  [TeamCreationPhase.CONFIRMATION]: TeamCreationProcess,

  // Trading Phases
  [TradingPhase.VERIFICATION]: TradingProcess,
  [TradingPhase.RISK_ASSESSMENT]: TradingProcess,
  [TradingPhase.TRADER_TYPE_SELECTION]: TradingProcess,
  [TradingPhase.PROFESSIONAL_TRADER_PROFILE]: TradingProcess,
  [TradingPhase.PROFESSIONAL_TRADER_DASHBOARD]: TradingProcess,
  [TradingPhase.PROFESSIONAL_TRADER_CALLS]: TradingProcess,
  [TradingPhase.PROFESSIONAL_TRADER_CONTENT_MANAGEMENT]: TradingProcess,

  // Idea Lifecycle Phases
  [IdeaLifecyclePhase.CONCEPT_DEVELOPMENT]: IdeaLifecycleProcess,
  [IdeaLifecyclePhase.IDEA_VALIDATION]: IdeaLifecycleProcess,
  [IdeaLifecyclePhase.PROOF_OF_CONCEPT]: IdeaLifecycleProcess,

  // Post-Launch Activities Phases
  [PostLaunchActivitiesPhase.REFACTORING_REBRANDING]:
    PostLaunchActivitiesProcess,
  [PostLaunchActivitiesPhase.COLLABORATION_SETTINGS]:
    PostLaunchActivitiesProcess,

  // Task Management Phases
  [TaskManagementPhase.LAUNCH]: TaskManagementProcess,
  [TaskManagementPhase.DATA_ANALYSIS]: TaskManagementProcess,
  [TaskManagementPhase.TEAM_PLANNING]: TaskManagementProcess,
  [TaskManagementPhase.EXECUTION]: TaskManagementProcess,
  [TaskManagementPhase.TESTING]: TaskManagementProcess,
  [TaskManagementPhase.COMPLETION]: TaskManagementProcess,

  // Data Analysis Sub Phases
  [DataAnalysisSubPhase.DEFINE_OBJECTIVE]: DataAnalysisSubProcess,
  [DataAnalysisSubPhase.DATA_COLLECTION]: DataAnalysisSubProcess,
  [DataAnalysisSubPhase.CLEAN_DATA]: DataAnalysisSubProcess,
  [DataAnalysisSubPhase.DATA_ANALYSIS]: DataAnalysisSubProcess,
  [DataAnalysisSubPhase.DATA_VISUALIZATION]: DataAnalysisSubProcess,
  [DataAnalysisSubPhase.TRANSFORM_INSIGHTS]: DataAnalysisSubProcess,

  // Progress Phases
  [ProgressPhase.Ideation]: ProgressPhaseProcess,
  [ProgressPhase.TeamFormation]: ProgressPhaseProcess,
  [ProgressPhase.ProductDevelopment]: ProgressPhaseProcess,
  [ProgressPhase.LaunchPreparation]: ProgressPhaseProcess,
  [ProgressPhase.DataAnalysis]: ProgressPhaseProcess,

  // User Support Phases
  [UserSupportPhase.USER_PHASE_PLANNING]: UserSupportProcess,
  [UserSupportPhase.EXECUTION]: UserSupportProcess,
  [UserSupportPhase.MONITORING]: UserSupportProcess,
  [UserSupportPhase.CLOSURE]: UserSupportProcess,
};

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const [currentPhase, setCurrentPhase] =
    useState<DevelopmentPhase>(PlanningPhase);

  let userData: UserData = {
    ...(state.user as User)?.data,
    questionnaireResponses: {},
    role: (state.user as User)?.data?.role || UserRoles.USER, // Ensure role is defined
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
      setCurrentPhase(PlanningPhase); // Update to the actual next phase
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
        setCurrentPhase(PlanningPhase); // Update to the actual next phase
      })
      .catch((error) => {
        // Handle errors
        console.error("Error sending profile setup data:", error);
      });
  };

  const handlePhaseTransition = (phase: DevelopmentPhase) => {
    setCurrentPhase(phase);
  };

  const handleIdeaSubmission = (ideaData: any) => {
    // Logic for handling idea submission
    console.log("Idea submission data:", ideaData);
    // Example: Send idea data to the server using Axios
    // Replace this with your actual API endpoint and data
    axios.post("/api/idea-submission", ideaData).then((response) => {
      // Handle successful submission
      console.log("Idea submitted successfully:", response.data);
      // Transition to the next phase
      PhaseActions.setCurrentPhase(ProjectPhaseTypeEnum.Ideation);
      //  Transition to the next phase after idea submission
      PhaseActions.setNextPhase(ProjectPhaseTypeEnum.TeamFormation);
    });
  };

  const handleQuestionnaireSubmitWrapper = async (userResponses: any) => {
    await handleQuestionnaireSubmit(userResponses);
  };

  const PhaseComponent = phaseComponents[Number(currentPhase.phase)];

  return (
    <div>
      <PhaseComponent
        phaseName={currentPhase.phase}
        onSubmit={handleQuestionnaireSubmitWrapper}
        onComplete={handleQuestionnaireSubmit}
        onSubmitProfile={handleProfileSetup}
        onIdeaSubmission={handleIdeaSubmission}
        onTransition={handlePhaseTransition}
      />
      {currentPhase.phase ===
        OnboardingPhase[OnboardingPhase.EMAIL_CONFIRMATION] && (
        <EmailConfirmationPage />
      )}
      {currentPhase.phase === OnboardingPhase[OnboardingPhase.WELCOME] && (
        <WelcomePage />
      )}
      {currentPhase.phase ===
        OnboardingPhase[OnboardingPhase.QUESTIONNAIRE] && (
        <UserQuestionnaire
          onSubmit={handleQuestionnaireSubmitWrapper}
          onComplete={handleQuestionnaireSubmit}
          onSubmitProfile={handleProfileSetup}
          onIdeaSubmission={() => {
            setCurrentPhase({
              title: "Idea Submission",
              render: () => <div>Idea Submission</div>,
              phase: DevelopmentPhaseEnum.IDEA_SUBMISSION,
            });
          }}
        />
      )}
      {currentPhase.phase === OnboardingPhase[OnboardingPhase.OFFER] && (
        <OfferPage />
      )}
      {currentPhase.phase ===
        OnboardingPhase[OnboardingPhase.PROFILE_SETUP] && (
        <ProfileSetupPhase onSubmit={handleProfileSetup} />
      )}
      {currentPhase.phase === PlanningPhase.phase && (
        <IdeationPhase
          phaseName="Ideation"
          onTransition={handlePhaseTransition}
        />
      )}
      {currentPhase.phase === DevelopmentPhaseEnum.Deployment && (
        <IdeaCreationPhase
          duration={0}
          onSubmit={handleIdeaSubmission}
          onTransition={handlePhaseTransition}
        />
      )}

      {/* Add more phases as needed */}
    </div>
  );
};

export default UserJourneyManager;
