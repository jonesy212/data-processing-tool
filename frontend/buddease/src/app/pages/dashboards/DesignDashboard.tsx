import FeedbackLoop from "@/app/components/FeedbackLoop";
import { AdminDashboard } from "@/app/components/admin/AdminDashboard";
import GoogleAnalyticsScript from "@/app/components/analytics/GoogleAnalyticsScript";
import CalendarComponent from "@/app/components/calendar/CalendarComponent";
import ChatCard from "@/app/components/cards/ChatCard";
import WebSocket from "@/app/components/communications/WebSocket";
import DynamicDashboard from "@/app/components/dashboards/DynamicDashboard";
import EditorWithPrompt from "@/app/components/documents/EditorWithPrompt";
import { IdeaLifecyclePhase } from "@/app/components/phases/PhaseManager";
import IdeaLifecycleManager from "@/app/components/phases/ideaPhase/IdeaLifecycleManager";
import LaunchPhase from "@/app/components/phases/onboarding/LaunchPhase";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import PostLaunchActivitiesPhase from "@/app/components/phases/postLaunchPhase/PostLaunchActivitiesPhase";
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import PostLaunchActivitiesManager from "@/app/components/projects/PostLaunchActivitiesManager";
import RefactoringRebrandingPhase from "@/app/components/projects/RefactoringRebrandingPhase";
import TaskManagementManager from "@/app/components/projects/TaskManagementPhase";
import ClearingTimer from "@/app/components/projects/projectManagement/ClearingTimer";
import MainApplicationLogic from "@/app/components/projects/projectManagement/MainApplicationLogic";
import ProjectPhaseService from "@/app/components/projects/projectManagement/ProjectPhaseService.ts";
import RemovingEventListeners from "@/app/components/projects/projectManagement/RemovingEventListeners";

import { DynamicPromptContext } from "@/app/components/prompts/DynamicPromptContext";
import DynamicPromptHookGenerator from "@/app/components/prompts/DynamicPromptHookGenerator";
import PromptComponent from "@/app/components/prompts/PromptComponent";
import PromptPage from "@/app/components/prompts/PromptPage";
import PromptSystem from "@/app/components/prompts/PromptSystem";
import InviteFriends from "@/app/components/referrals/InviteFriends";
import ReferralSystem from "@/app/components/referrals/ReferralSystem";
import SendEmail from "@/app/components/referrals/SendEmail";
import ProtectedRoute from "@/app/components/routing/ProtectedRoute";
import TodoSlice from "@/app/components/state/redux/slices/TodoSlice";
import { Accessibility } from "@/app/components/styling/Accessibility";
import { AnimationsAndTransitions } from "@/app/components/styling/AnimationsAndTansitions";
import ColorPalette from "@/app/components/styling/ColorPalette";
import ColorPicker from "@/app/components/styling/ColorPicker";
import Documentation from "@/app/components/styling/Documentation";
import DynamicColorPalette from "@/app/components/styling/DynamicColorPalette";
import DynamicComponents from "@/app/components/styling/DynamicComponents";
import DynamicIconsAndImages from "@/app/components/styling/DynamicIconsAndImages";
import DynamicSpacingAndLayout from "@/app/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
  BodyTextProps,
  DynamicTypographyProps,
} from "@/app/components/styling/DynamicTypography";
import { Palette } from "@/app/components/styling/Palette";
import PaletteManager from "@/app/components/styling/PaletteManager";
import ResponsiveDesign from "@/app/components/styling/ResponsiveDesign";
import UsageExamplesBox from "@/app/components/styling/UsageExamplesBox";
import NofiticationsSlice from "@/app/components/support/NofiticationsSlice";
import {
  NotificationContext,
  NotificationProvider,
} from "@/app/components/support/NotificationContext";
import NotificationMessages from "@/app/components/support/NotificationMessages";
import NotificationMessagesFactory from "@/app/components/support/NotificationMessagesFactory";
import UserSupport from "@/app/components/support/UserSupport";
import { TaskActions } from "@/app/components/tasks/TaskActions";
import TaskAssignmentSnapshot from "@/app/components/tasks/TaskAssignmentSnapshot";
import TaskManagerComponent from "@/app/components/tasks/TaskManagerComponent";
import { TodoActions } from "@/app/components/todos/TodoActions";
import TodoList from "@/app/components/todos/TodoList";
import { UserActions } from "@/app/components/users/UserActions";
import UserSlice from "@/app/components/users/UserSlice";
import ConceptDevelopment from "@/app/components/users/userJourney/ConceptDevelopment";
import ConceptValidation from "@/app/components/users/userJourney/ConceptValidation";
import IdeaLifecycle from "@/app/components/users/userJourney/IdeaLifecycle";
import IdeaValidation from "@/app/components/users/userJourney/IdeaValidation";
import IdeationPhase from "@/app/components/users/userJourney/IdeationPhase";
import ProofOfConcept from "@/app/components/users/userJourney/ProofOfConcept";
import RequirementsGathering from "@/app/components/users/userJourney/RequirementsGathering";
import TeamBuildingPhaseManagement from "@/app/components/users/userJourney/TeamBuildingPhaseManagement";
import Versioning from "@/app/components/versions/Versioning";
import ConfigurationService from "@/app/configs/ConfigurationService";
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";
import FrontendStructure from "@/app/configs/FrontendStructure";
import MainConfig from "@/app/configs/MainConfig";
import UserPreferences from "@/app/configs/UserPreferences";
import UserSettings from "@/app/configs/UserSettings";
import BatchProcessingAndCache from "@/app/utils/BatchProcessingAndCache";
import React, {
  ComponentType,
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useState,
} from "react";
import OnboardingManager from "../onboarding/OnboardingManager";
import PersonaBuilderDashboard from "../personas/recruiter_dashboard/PersonaBuilderDashboard";
import UserDashboard from "./UserDashboard";

// import {
//   DocumentBuilderConfig,
//   FrontendDocumentConfig,
//   GenerateUserPreferences,
//   LazyLoadScriptConfig,
//   StructureMetadata,
//   UpdatePreferences,
// } from "@/app/components/configs";
// import {
//   GenerateCache,
//   GenerateComponent
// } from "@/app/components/generators";
import SubscriptionComponent from "@/app/components/subscriptions/Subscription";
// import { NotificationStore, NotificationTypes } from "@/app/components/support";
// import { TaskService } from "@/app/components/tasks";
// import {
//   FetchTodos,
// } from "@/app/components/todos";

import { ApiConfig } from "@/app/configs/ConfigurationService";

// import {
//   AppCacheManager,
//   CacheManager,
//   CacheUtils,
//   CleanupUtil,
//   FrontendCacheManager,
//   ReadAndWriteCache,
// } from "@/app/components/utils";
// import { Web3Provider } from "@/app/components/web3";
// // import AppCacheManager

// // import ConfirmationModal from "@/app/components/communications/ConfirmationModal";
import { HeadingProps } from "@/app/components/cards/DummyCardLoader";
import ConfirmationModal from "@/app/components/communications/ConfirmationModal";
import connectToChatWebSocket from "@/app/components/communications/WebSocket";
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import ProjectList from "@/app/components/lists/ProjectList";
import TeamList from "@/app/components/lists/TeamList";
import UserList from "@/app/components/lists/UserList";
import DynamicPromptingLogic from "@/app/components/prompts/DynamicPromptingLogic";
import NotificationManager from "@/app/components/support/NotificationManager";
import { UserData } from "@/app/components/users/User";
import { ModalGenerator } from "@/app/generators/GenerateModal";
import DataPreview, {
  DataPreviewProps,
} from "../../components/users/DataPreview";
import SearchComponent from "../searchs/Search";

interface DynamicComponentWrapperProps<T> {
  component: T;
  dynamicProps: {
    condition?: () => boolean;
    asyncEffect?: () => Promise<void>;
    cleanup?: () => void;
    resetIdleTimeout?: () => void;
    isActive?: (selector: string) => void;
  };
  children: (props: T) => React.ReactNode;
}

const DynamicComponentWrapper = <T extends {}>({
  component,
  dynamicProps,
  children,
}: DynamicComponentWrapperProps<T>): React.ReactElement => {
  useEffect(() => {
    const { condition, asyncEffect, cleanup, resetIdleTimeout, isActive } =
      dynamicProps;

    // Your common logic for useEffect
    useEffect(() => {
      if (condition) condition();
      if (asyncEffect) asyncEffect();

      return () => {
        if (cleanup) cleanup();
        if (resetIdleTimeout) resetIdleTimeout();
      };
    }, [condition, asyncEffect, cleanup, resetIdleTimeout]);

    // Your common logic for other properties
    if (isActive) isActive("selector");
  }, [dynamicProps]);

  return <>{children(component)}</>;
};

const DesignDashboard: React.FC<{ colors: string[] }> = ({ colors }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

useEffect(() => {
  // Replace 'roomId' with the actual room ID you want to connect to
  const roomId = "your_room_id";
  
  // Your retry configuration
  const retryConfig = {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  // Establish WebSocket connection
  const newSocket = connectToChatWebSocket(roomId, retryConfig) as WebSocket;

  // Check if the newSocket is not null before attempting to set it
  if (newSocket) {
    setSocket(newSocket);
  }

  // Cleanup on component unmount
  return () => {
    // Check if socket is not null and in the OPEN or CONNECTING state
    if (socket && [socket.OPEN, socket.CONNECTING].includes(0 || 1)) {
      socket.close();
    }
  };
}, [socket]);

    
  const handleColorChange = (
    colorIndex: number,
    newColor: string
  ): string[] => {
    const updatedColors = [...colors];
    updatedColors.splice(colorIndex, 1, newColor);
    return updatedColors;
  };

  return (
    <div>
      <h1>Dev/Design Dashboard</h1>

      {/* New Components */}
      <DynamicComponentWrapper
        component={<IdeaLifecycleManager />}
        dynamicProps={{
          condition: () => true,
          asyncEffect: () => Promise.resolve(),
        }}
      >
        {(component) => component}
      </DynamicComponentWrapper>

      {/* Display different sections or components */}
      <UserDashboard />
      <PersonaBuilderDashboard />

      {/* Admin Dashboard  */}
      <AdminDashboard apiConfig={{} as ApiConfig}>
        <div>
          <h2>Admin Dashboard</h2>

          {/* Admin Components */}
          <UserList />
          <TeamList />
          <ProjectList tasks={[]} />

          <NotificationManager notifications={{} as Notification[]} />

          <ModalGenerator
            isOpen={false}
            closeModal={() => {
              // close modal logic
            }}
            modalComponent={
              <ConfirmationModal
                isOpen={false}
                onConfirm={function (): void {
                  throw new Error("Function not implemented.");
                }}
                onCancel={function (): void {
                  throw new Error("Function not implemented.");
                }}
              >
                Are you sure you want to close this modal?
              </ConfirmationModal>
            }
          />
        </div>
      </AdminDashboard>
      <FeedbackLoop feedback={""} />
      <GoogleAnalyticsScript />
      <ChatCard sender={""} message={""} timestamp={""} />
      <WebSocket />
      <CalendarComponent />

      {/* Existing Components */}
      <DynamicDashboard title={""} content={undefined} />
      <EditorWithPrompt userId="123" teamId="456" project="Project XYZ" />

      {/* New Components */}
      <IdeaLifecycleManager />
      <IdeaLifecyclePhase />
      <LaunchPhase />
      <ProfileSetupPhase
        onSubmit={function (profileData: any): Promise<void> {
          // Save profile data
          return profileDataService.saveProfile(profileData);
        }}
      />
      <PostLaunchActivitiesPhase />
      <AnalyzeData projectId={""} />
      <DataPreview data={{} as DataPreviewProps & UserData} />
      <DataProcessing />
      <PostLaunchActivitiesManager />
      <Project />
      <RefactoringRebrandingPhase />
      <TaskManagementManager />
      <ClearingTimer />
      <MainApplicationLogic />
      <ProjectPhaseService />
      <RemovingEventListeners documentOptions={{} as DocumentOptions} />
      <DynamicPromptContext />
      <DynamicPromptHookGenerator
        condition={function (): Promise<boolean> {
          return Promise.resolve(true);
        }}
        asyncEffect={function (): Promise<void> {
          throw new Error("Function not implemented.");
        }}
        resetIdleTimeout={function (): void {
          throw new Error("Function not implemented.");
        }}
        isActive={false}
      />
      <DynamicPromptingLogic />
      <PromptComponent title={""} description={""} prompts={[]} />
      <PromptPage title={""} description={""} prompts={[]} />
      <PromptSystem
        onUserResponse={function (response: string): void {
          throw new Error("Function not implemented.");
        }}
        documentType={""}
        userIdea={""}
      />
      <generatePromptIdea />
      <promptGenerator />
      <InviteFriends />
      <ReferralSystem />
      <SendEmail />
      <ProtectedRoute component={} />
      <search />
      <AssignBaseStore />
      <RootSlice />
      <mobx_react />
      <reactions />
      <Accessibility examples={[]} />
      <AnimationsAndTransitions examples={[]} />
      <ColorPalette
        swatches={[]}
        colorCodingEnabled={false}
        brandingSwatches={[]}
      />
      <ColorPicker
        color={""}
        onChange={(newColor: string): void => {
          const updatedColors = handleColorChange(0, newColor);
          // Now you can use the updatedColors array as needed in your component
          console.log(updatedColors);
        }}
        colorCodingEnabled={false}
      />
      <Documentation />
      <DynamicColorPalette
        colorCodingEnabled={false}
        brandingSwatches={[]}
        colors={[]}
      />
      {/* New Components */}
      <DynamicComponents
        dynamicContent
        label="Click me"
        // OR
        title="Card Title"
        content="Card Content"
      />
      <DynamicIconsAndImages />
      <DynamicSpacingAndLayout />
      <DynamicTypography
        {...({} as DynamicTypographyProps & (BodyTextProps | HeadingProps))}
      />
      <Palette
        colors={colors}
        swatches={[]}
        onColorChange={handleColorChange}
        onAddColor={() => {
          throw new Error("Function not implemented.");
        }}
        onRemoveColor={(colorIndex: number) => {
          throw new Error("Function not implemented.");
        }}
      />
      <PaletteManager />
      <ResponsiveDesign />
      <UsageExamplesBox />
      <SubscriptionComponent />
      <NofiticationsSlice notifications={[]} />
      <NotificationContext />
      <NotificationEditingPhaseHook />
      <NotificationMessages />
      <NotificationMessagesFactory />
      <NotificationProvider children={undefined} />
      <NotificationStore />
      <NotificationTypes />
      <UserSupport />
      <updateNotificationSettings />
      <TaskActions />
      <TaskAssignmentSnapshot taskId={""} />
      <TaskManagerComponent
        taskId={function (): string {
          throw new Error("Function not implemented.");
        }}
      />
      <TaskService />
      <FetchTodos />
      <Todo />
      <TodoActions />
      <TodoList />
      <TodoService />
      <TodoSlice ids={[]} entities={undefined} />
      <DataProcessingTask />
      <DataSetModel />
      <InviteFriends />
      <ReferralSystem />
      <SendEmail />
      <ProtectedRoute component={{} as ComponentType} />
      <SearchComponent componentSpecificData={{ componentSpecificData }} />
      <User />
      <UserActions />
      <UserService />
      <UserSlice
        users={[]}
        fullName={""}
        bio={""}
        profilePicture={""}
        notification={""}
        data={{} as UserData}
        uploadQuota={0}
      />
      <ConceptDevelopment />
      <ConceptValidation />
      <IdeaLifecycle />
      <IdeaValidation />
      <IdeationPhase phaseName={""} />
      <ProofOfConcept />
      <RequirementsGathering />
      <TeamBuildingPhaseManagement />
      <commonUtils />
      <dataAnalysisUtils />
      <chat />
      <search />
      <generate />
      <directMessaging />
      <OnboardingManager />
      <userManagement />
      <Versioning version={""} />
      <Web3Provider />
      <useAqua />
      <crossPlatformLayer />
      <dAppAdapter />
      <fluenceProtocolIntegration />
      <pluginSystem />
      <webConfigs />
      <aquaConfig />
      <ApiConfig />
      <BackendDocumentConfig />
      <ConfigurationService />
      <DataVersionsConfig />
      <DetermineFileType />
      <DocumentBuilderConfig />
      <FrontendDocumentConfig />
      <FrontendStructure />
      <GenerateUserPreferences />
      <LazyLoadScriptConfig />
      <MainConfig />
      <StructureMetadata />
      <UpdatePreferences />
      <UserPreferences />
      <UserSettings />
      <global />
      <traverseFrontend />
      <chat />
      <search />
      <stylesheet />
      <favicon />
      <GenerateCache />
      <generateChatInterfaces />
      <GenerateComponent />
      <generatedInterfaces />
      <ModalGenerator
        children={{} as ReactElement<any, string | JSXElementConstructor<any>>}
        isOpen={false}
        closeModal={function (): void {
          throw new Error("Function not implemented.");
        }}
        modalComponent={{
          close: function (): void {},
          isOpen: function (): boolean {
            return false;
          },
          setNotificationPreferences: function (
            preferences: NotificationPreferences
          ): void {
            modalComponent.setNotificationPreferences(preferences);
          },
          setAudioOptions: function (options: AudioOptions): void {
            throw new Error("Function not implemented.");
          },
          setVideoOptions: function (options: VideoOptions): void {
            throw new Error("Function not implemented.");
          },
          setCollaborationPreferences: function (
            preferences: CollaborationPreferences
          ): void {
            throw new Error("Function not implemented.");
          },
        }}
      />
      <generateNewTask />
      <getUserIdeaFromForm />
      <clipboard />
      <events />
      <dataAnalysisTypes />
      <AppCacheManager />
      <BatchProcessingAndCache />
      <CacheManager />
      <CacheUtils />
      <CleanupUtil />
      <FrontendCacheManager />
      <ReadAndWriteCache />
      {/* Add more components or sections as needed */}
    </div>
  );
};

export default DesignDashboard;
