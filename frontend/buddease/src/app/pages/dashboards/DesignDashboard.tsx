import FeedbackLoop from "@/app/components/FeedbackLoop";
import {
  AdminDashboard,
  AdminDashboardProps,
} from "@/app/components/admin/AdminDashboard";
import GoogleAnalyticsScript from "@/app/components/analytics/GoogleAnalyticsScript";
import CalendarComponent from "@/app/components/calendar/CalendarComponent";
import ChatCard from "@/app/components/cards/ChatCard";
import DynamicDashboard from "@/app/components/dashboards/DynamicDashboard";
import { IdeaLifecyclePhase } from "@/app/components/phases/PhaseManager";
import IdeaLifecycleManager from "@/app/components/phases/ideaPhase/IdeaLifecycleManager";
import LaunchPhase from "@/app/components/phases/onboarding/LaunchPhase";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import PostLaunchActivitiesPhase from "@/app/components/phases/postLaunchPhase/PostLaunchActivitiesPhase";
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import TaskManagementManager from "@/app/components/projects/TaskManagementPhase";
import ClearingTimer from "@/app/components/projects/projectManagement/ClearingTimer";
import MainApplicationLogic from "@/app/components/projects/projectManagement/MainApplicationLogic";
import ProjectPhaseService from "@/app/components/projects/projectManagement/ProjectPhaseService.ts";
import RemovingEventListeners from "@/app/components/projects/projectManagement/RemovingEventListeners";
import InviteFriends from "@/app/components/referrals/InviteFriends";
import ReferralSystem from "@/app/components/referrals/ReferralSystem";
import SendEmail from "@/app/components/referrals/SendEmail";
import ProtectedRoute from "@/app/components/routing/ProtectedRoute";
import { AnimationsAndTransitions } from "@/app/components/styling/AnimationsAndTansitions";
import ColorPalette from "@/app/components/styling/ColorPalette";
import ColorPicker from "@/app/components/styling/ColorPicker";
import Documentation from "@/app/components/styling/Documentation";
import DynamicComponents from "@/app/components/styling/DynamicComponents";
import DynamicIconsAndImages from "@/app/components/styling/DynamicIconsAndImages";
import DynamicSpacingAndLayout from "@/app/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
  BodyTextProps,
  DynamicTypographyProps,
  HeadingProps,
} from "@/app/components/styling/DynamicTypography";
import { TaskActions } from "@/app/components/tasks/TaskActions";
import TaskAssignmentSnapshot from "@/app/components/tasks/TaskAssignmentSnapshot";
import TaskManagerComponent from "@/app/components/tasks/TaskManagerComponent";
import TodoList from "@/app/components/todos/TodoList";
import { UserActions } from "@/app/components/users/UserActions";
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
import MainConfig from "@/app/configs/MainConfig";
import UserPreferences from "@/app/configs/UserPreferences";
import UserSettings from "@/app/configs/UserSettings";
import { ModalGenerator } from "@/app/generators/GenerateModal";
import BatchProcessingAndCache from "@/app/utils/BatchProcessingAndCache";
import React, { useEffect, useState } from "react";
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
// import { NotificationStore, NotificationTypes } from "@/app/components/support";
// import { TaskService } from "@/app/components/tasks";
// import {
//   FetchTodos,
// } from "@/app/components/todos";

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
import connectToChatWebSocket from "@/app/components/communications/WebSocket";
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import ProjectList from "@/app/components/lists/ProjectList";
import TeamList from "@/app/components/lists/TeamList";
import UserList from "@/app/components/lists/UserList";
import NotificationManager from "@/app/components/support/NotificationManager";
import { User, UserData, UserDetails } from "@/app/components/users/User";

import FileUploadModal from "@/app/components/cards/modal/FileUploadModal";
import DataProcessingComponent from "@/app/components/models/data/DataProcessingComponent";
import responsiveDesignStore from "@/app/components/styling/ResponsiveDesign";
import { Notification } from "@/app/components/support/NofiticationsSlice";
import { NotificationType } from "@/app/components/support/NotificationContext";
import { PermissionsEditor } from "@/app/components/users/PermissionsEditor";
import { UserRolesEditor } from "@/app/components/users/UserRolesEditor";
import { saveProfile } from "@/app/components/users/userSnapshotData";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import BackendStructureWrapper from "@/app/configs/appStructure/BackendStructureWrapper";
import ExtendedBackendStructure from "@/app/configs/appStructure/ExtendedBackendStructure";
import { FrontendStructure } from "@/app/configs/appStructure/FrontendStructureComponent";
import { traverseDirectory } from "@/app/configs/declarations/traverseFrontend";
import DesignComponent from "@/app/css/DesignComponent";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import AppCacheManagerBase from "@/app/utils/AppCacheManager";
import MyPromise from "@/app/utils/MyPromise";
import getAppPath from "../../../../appPath";
import ChatRoom from "../../components/communications/chat/ChatRoom";
import YourParentComponent from "../../components/prompts/YourParentComponent";
import DataPreview, {
  DataPreviewProps,
} from "../../components/users/DataPreview";
import SearchComponent, {
  SearchComponentProps,
} from "../searchs/SearchComponent";
import useModalFunctions from "./ModalFunctions";
type customNotifications = "customNotifications1" | "customNotifications2";
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

// Define the shape of the Notification context value
export interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;
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

// Update the type of backendStructure
const backendStructure: ExtendedBackendStructure = {
  ...responsiveDesignStore.backendStructure,
  structure: {} as Record<string, AppStructureItem>,
  customMethod: async () => {},
  traverseDirectory: {} as (dir: string) => Promise<AppStructureItem[]>,
  getStructure: async () => {
    const structure = {} as Record<string, AppStructureItem>;
    const files = traverseDirectory(getAppPath());
    files.forEach((file: AppStructureItem) => {
      structure[file.path] = file;
    });
    return structure;
  },
};

const DesignDashboard: React.FC<{
  colors: string[];
  frontendStructure: FrontendStructure;
  backendStructure: BackendStructure;
  onCloseFileUploadModal: () => void;
  onHandleFileUpload: (file: FileList | null) => void;
}> = ({ colors, frontendStructure, backendStructure, onHandleFileUpload }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { isModalOpen, handleCloseModal, handleFileUpload } =
    useModalFunctions();
  const [isFileUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const backendStructureWrapper = new BackendStructureWrapper(getAppPath());

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const initialNotification: Notification = {
    id: UniqueIDGenerator.generateNotificationID(
      {} as Notification & NotificationType,
      Date.now() as Date & number,
      "customNotifications1" as NotificationType
    ),
    createdAt: new Date(),
    date: new Date(),
    type: "customNotifications1" as NotificationType,
    message: "New notification added",
    content: "This is a test notification",
  };

  // Function to add a notification
  const notify = (
    message: string,
    type: NotificationType,
    content: any,
    date: Date
  ) => {
    let newNotification: Notification = {
      id: UniqueIDGenerator.generateNotificationID(
        initialNotification, // Pass the actual notification object
        date,
        type
      ),
      date,
      type,
      message,
      content,
      createdAt: new Date(),
    };

    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification,
    ]);
  };

  // Sample usage of the notify function
  notify(
    "New message",
    "customNotifications1" as NotificationType,
    "Notification content",
    new Date()
  );

  // Notification context value
  const notificationContextValue: NotificationContextValue = {
    notifications,
    notify(
      message: string,
      content: any,
      date: Date = new Date(),
      type: NotificationType
    ) {
      notify(message, type, content, date);
      return Promise.resolve();
    },
    addNotification: function (notification: Notification): void {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    },
    removeNotification: function (id: string): void {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    },
  };

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

  // return notificationContextValue;

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
        {(component: any) => component}
      </DynamicComponentWrapper>

      {/* User Communication and Collaboration */}
      <ChatRoom roomId={""} />
      <CalendarComponent />
      <FeedbackLoop feedback={""} feedbackType={""} />
      <GoogleAnalyticsScript />
      <ChatCard sender={""} message={""} timestamp={""} />

      {/* User and Team Management */}
      <UserDashboard />
      <PersonaBuilderDashboard />
      <AdminDashboard {...({} as AdminDashboardProps)}>
        <div>
          <h2>Admin Dashboard</h2>
          <UserList />
          <TeamList />
          <ProjectList tasks={[]} />
          <NotificationManager
            notifications={[]}
            setNotifications={() => { }}
            notify={() => {
              // Implement logic to handle notification
              console.log("Notification triggered");
              return Promise.resolve();
             }}
          />

          <ModalGenerator
            isOpen={isModalOpen}
            closeModal={() => {
              console.log("Modal closed");
              // Change from onCloseFileUploadModal(); to handleCloseModal();
              handleCloseModal();
            }}
            modalComponent={FileUploadModal}
            onFileUpload={(files: FileList) => {
              // Implement logic to handle file upload
              console.log("Files uploaded:", files);
              onHandleFileUpload(files); // Call the provided function to handle file upload
            }}
            children={null}
          />
        </div>
      </AdminDashboard>

      {/* Project Lifecycle */}
      <IdeaLifecycleManager />
      <IdeaLifecyclePhase />
      <LaunchPhase />
      <ProfileSetupPhase
        onSubmit={(profileData: any): MyPromise => {
          // Save profile data

          return saveProfile(profileData);
        }}
      />
      <PostLaunchActivitiesPhase />
      <AnalyzeData projectId={""} />

      {/* Data Management */}
      <DataPreview data={{} as DataPreviewProps & UserData} />
      <DataProcessingComponent datasetPath={""} onDataProcessed={() => {}} />

      {/* Task Management */}
      <TaskManagementManager />
      <ClearingTimer />

      {/* Main Application Logic */}
      <MainApplicationLogic />
      <ProjectPhaseService />
      <RemovingEventListeners documentOptions={{} as DocumentOptions} />

      {/* Dynamic Components */}
      <DynamicDashboard title={""} content={undefined} />
      <DynamicComponents
        dynamicContent
        label="Click me"
        title="Card Title"
        content="Card Content"
      />
      <DynamicIconsAndImages />
      <DynamicSpacingAndLayout />
      <DynamicTypography
        {...({} as DynamicTypographyProps & (BodyTextProps | HeadingProps))}
      />

      {/* Design and Styling */}
      <ColorPalette
        swatches={[]}
        colorCodingEnabled={false}
        brandingSwatches={[]}
      />
      <ColorPicker
        color={""}
        onChange={(newColor: string): void => {
          const updatedColors = handleColorChange(0, newColor);
          console.log(updatedColors);
        }}
        colorCodingEnabled={false}
      />
      <AnimationsAndTransitions examples={[]} />
      <DesignComponent />

      {/* User Interaction */}
      <SearchComponent componentSpecificData={{ componentSpecificData }} />
      <TaskActions />
      <TaskAssignmentSnapshot taskId={""} />
      <TaskManagerComponent taskId={() => "taskId"} />
      <TodoList />
      <InviteFriends />
      <ReferralSystem />
      <SendEmail />
      {/* how to set up a protected rout */}
      <ProtectedRoute component={YourParentComponent} />

      <SearchComponent componentSpecificData={{} as SearchComponentProps} />
      <User />
      <UserActions />

      {/* Idea and Concept Development */}
      <ConceptDevelopment />
      <ConceptValidation />
      <IdeaLifecycle />
      <IdeaValidation />
      <IdeationPhase phaseName={""} />
      <ProofOfConcept />
      <RequirementsGathering />
      <TeamBuildingPhaseManagement />

      {/* Configuration and Settings */}
      <ApiConfig />
      <BackendDocumentConfig />
      <ConfigurationService />
      <DataVersionsConfig dataPath="" />
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
      <Global />
      <TraverseFrontend />
      <Stylesheet />
      <Favicon />
      <GenerateCache />
      <GenerateChatInterfaces />
      <GenerateComponent />
      <GeneratedInterfaces />

      {/* Cache Management */}
      <AppCacheManagerBase />
      <BatchProcessingAndCache />
      <CacheManager />
      <CacheUtils />
      <CleanupUtil />
      <FrontendCacheManager />
      <ReadAndWriteCache />

      {/* Miscellaneous */}
      <Documentation />
      <Versioning version={""} />
      <generateNewTask />
      <getUserIdeaFromForm />
      <Clipboard />
      <Events />
      <DataAnalysisTypes />

      {/*User Managment Components */}
      <UserList />
      <UserDetails user={{} as User} />
      <UserRolesEditor />
      <PermissionsEditor permissions={{}} />

      {/*User Managment Functionalities */}
    </div>
  );
};

export default DesignDashboard;
