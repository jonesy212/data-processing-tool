import { Task } from "@/app/components/models/tasks/Task";
import { TodoManagerStore } from "@/app/components/state/stores/TodoStore";
import { Idea } from "@/app/components/users/Ideas";
import { object } from "prop-types";
import { NestedEndpoints } from "../api/ApiEndpoints";
import { CalendarEvent } from "../components/calendar/CalendarEvent";
import { CodingLanguageEnum, LanguageEnum } from "../components/communications/LanguageEnum";
import { Attachment } from "../components/documents/Attachment/attachment";
import HighlightEvent from "../components/documents/screenFunctionality/HighlightEvent";
import useIdleTimeout from "../components/hooks/idleTimeoutHooks";
import useAuthentication from "../components/hooks/useAuthentication";
import { CollaborationOptions } from "../components/interfaces/options/CollaborationOptions";
import { Category } from "../components/libraries/categories/generateCategoryProperties";
import { ThemeEnum } from "../components/libraries/ui/theme/Theme";
import { BaseData, Data } from "../components/models/data/Data";
import { Member } from "../components/models/teams/TeamMembers";
import { Phase } from "../components/phases/Phase";
import { DataAnalysisResult } from "../components/projects/DataAnalysisPhase/DataAnalysisResult";
import { InitializedState } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { PrivacySettings, selectedSettings } from "../components/settings/PrivacySettings";
import { SnapshotStoreConfig, SnapshotStoreUnion } from "../components/snapshots";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { resetState } from "../components/state/redux/slices/AppSlice";
import { CustomComment } from "../components/state/redux/slices/BlogSlice";
import BrowserCheckStore from "../components/state/stores/BrowserCheckStore";
import { CalendarManagerStore } from "../components/state/stores/CalendarEvent";
import { DetailsItem } from "../components/state/stores/DetailsListStore";
import { IconStore } from "../components/state/stores/IconStore";
import useSettingManagerStore, { Settings } from "../components/state/stores/SettingsStore";
import { TrackerStore } from "../components/state/stores/TrackerStore";
import { store } from "../components/state/stores/useAppDispatch";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { NotificationSettings } from "../components/support/NotificationSettings";
import TodoImpl, { Todo, UserAssignee } from "../components/todos/Todo";
import { VideoData } from "../components/video/Video";
import { CategoryProperties } from "../pages/personas/ScenarioBuilder";

const logoutUser = useAuthentication().logout;

const onTimeout = () => {
  // Handle timeout event
  console.log("User idle timeout occurred.");

  // Perform actions upon timeout
  logoutUser();
  showModal(
    "Session Timeout",
    "Your session has expired due to inactivity. Please log in again."
  );
  resetAppState();
};


// Show modal function
const showModal = (title: string, message: string) => {
  // Display a modal with provided title and message
  console.log(`Showing modal with title: ${title} and message: ${message}`);
  
  // Implement your modal display logic here
  // Example: Using a library like Bootstrap or a custom modal
  const modal = document.createElement('div');
  modal.className = 'modal'; // Add appropriate classes for styling
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <button id="closeModal">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Add close functionality
  document.getElementById('closeModal')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
};

// Reset application state function
// Assume this is determined elsewhere in your application
const isUsingRedux = true; // Set to false if using MobX

const resetAppState = () => {
  // Logic to reset the application state
  console.log("Resetting application state...");
  
  if (isUsingRedux) {
    // Reset Redux store
    store.dispatch(resetState()); // Use the appropriate reset action for Redux
  } else {
    // Reset MobX store
    useSettingManagerStore().reset(); // Reset settings using the SettingManager store
  }

  // Clear any user-related data
  localStorage.clear(); // Or clear specific keys
  
  // Additional state reset logic can go here
};


// Example of using the onTimeout function
setTimeout(onTimeout, 300000); // Simulate user idle timeout after 5 minutes


type IdleTimeoutType = {
  intervalId: number | undefined;
  isActive: boolean;
  animateIn: (selector: string) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout: () => Promise<void>;
  idleTimeoutId: NodeJS.Timeout | null;
  startIdleTimeout: (
    timeoutDuration: number,
    onTimeout: () => void | undefined,
  ) => void | undefined;
  toggleActivation: () => Promise<boolean>;
  idleTimeoutDuration: number; // Add this property
};

export interface UserSettings extends Settings {
  [x: string]:
    | string
    | number
    | NodeJS.Timeout
    | boolean
    | Date
    | string[]
    | IdleTimeoutType
    | PrivacySettings
    | NotificationData[]
    | BrowserCheckStore
    | VideoData
    | UserAssignee
    | DataAnalysisResult[]
    | Category
    | CategoryProperties
    | Attachment[]
    | CollaborationOptions[]
    | NestedEndpoints
    | (Comment | CustomComment)[]
    | DetailsItem<Data>
    | TrackerStore
    | IconStore
    | Phase<BaseData> 
    | HighlightEvent[]
    | Idea[]
    | SnapshotStore<SnapshotStoreUnion<Data>, Data>[]
    | InitializedState<BaseData, Meta, BaseData>
    | Member[]
    | NotificationSettings
    | Todo[]
    | Task[]
    | TodoManagerStore
    | TodoImpl<Todo, any>[]
    | CalendarEvent<BaseData, Meta, BaseData>[]
    | CalendarManagerStore<BaseData, Meta, BaseData>
    | SnapshotStoreConfig<Data, Data>[]
    | Record<string, string>
    | undefined
    | NodeJS.Timeout
    | null
    | ((key: keyof Settings) => void)
    | ((timeoutDuration: number, onTimeout: () => void) => void)
    | undefined;

  userId: number;
  sessionTimeout?: number;
  communicationMode: string;
  enableRealTimeUpdates: boolean;
  defaultFileType: string;
  allowedFileTypes: string[];
  enableGroupManagement: boolean;
  enableTeamManagement: boolean;
  idleTimeout: IdleTimeoutType | undefined;
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  idleTimeoutDuration: number;
  activePhase: string;
  realTimeChatEnabled: boolean;
  todoManagementEnabled: boolean;
  notificationEmailEnabled: boolean;
  analyticsEnabled: boolean;
  twoFactorAuthenticationEnabled: boolean;
  projectManagementEnabled: boolean;
  documentationSystemEnabled: boolean;
  versionControlEnabled: boolean;
  userProfilesEnabled: boolean;
  accessControlEnabled: boolean;
  taskManagementEnabled: boolean;
  loggingAndNotificationsEnabled: boolean;
  securityFeaturesEnabled: boolean;
  collaborationPreference1?: any;
  collaborationPreference2?: any;
  theme: ThemeEnum | undefined;
  language: LanguageEnum | CodingLanguageEnum;
  fontSize: number;
  darkMode: boolean;
  enableEmojis: boolean;
  enableGIFs: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationSound: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  defaultProjectView: string;
  taskSortOrder: string;
  showCompletedTasks: boolean;
  projectColorScheme: string;
  showTeamCalendar: boolean;
  teamViewSettings: any[];
  defaultTeamDashboard: string;
  passwordExpirationDays: number;
  // privacySettings: PrivacySettings
  thirdPartyApiKeys: Record<string, string> | undefined;
  externalCalendarSync: boolean;
  dataExportPreferences: any[];
  dashboardWidgets: any[];
  customTaskLabels: any[];
  customProjectCategories: any[];
  customTags: any[];
  additionalPreference1?: any;
  additionalPreference2?: any;
  formHandlingEnabled: boolean;
  paginationEnabled: boolean;
  modalManagementEnabled: boolean;
  sortingEnabled: boolean;
  notificationSoundEnabled: boolean;
  localStorageEnabled: boolean;
  clipboardInteractionEnabled: boolean;
  deviceDetectionEnabled: boolean;
  loadingSpinnerEnabled: boolean;
  errorHandlingEnabled: boolean;
  toastNotificationsEnabled: boolean;
  datePickerEnabled: boolean;
  themeSwitchingEnabled: boolean;
  imageUploadingEnabled: boolean;
  passwordStrengthEnabled: boolean;
  browserHistoryEnabled: boolean;
  geolocationEnabled: boolean;
  webSocketsEnabled: boolean;
  dragAndDropEnabled: boolean;
  idleTimeoutEnabled: boolean;
  enableAudioChat: boolean;
  enableVideoChat: boolean;
  enableFileSharing: boolean;
  enableBlockchainCommunication: boolean;
  enableDecentralizedStorage: boolean;
  selectDatabaseVersion: string;
  selectAppVersion: string;
  enableDatabaseEncryption: boolean;
}

const userSettings: UserSettings = {
  

  calendarEvents, todos, tasks, snapshotStores, 
  

  userId: 1,
  userSettings: new NodeJS.Timeout(),
  communicationMode: "text",
  enableRealTimeUpdates: true,

  defaultFileType: "document",
  allowedFileTypes: ["document"],
  enableGroupManagement: true,
  enableTeamManagement: true,

  idleTimeout: useIdleTimeout("idleTimeout", {
    intervalId: 0,
    isActive: false,
    animateIn: (selector: string) => {},
    startAnimation: () => {},
    stopAnimation: () => {},
    resetIdleTimeout: async () => {},
    idleTimeoutId: null,
    startIdleTimeout: (
      timeoutDuration: number,
      onTimeout: () => void,
    ) => {},
    toggleActivation: () => Promise.resolve(false),
    idleTimeoutDuration: 0,
  }),
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
    if (
      typeof userSettings.idleTimeout === "object" &&
      userSettings.idleTimeout !== null
    ) {
      (
        userSettings.idleTimeout as { idleTimeoutId?: NodeJS.Timeout }
      ).idleTimeoutId = setTimeout(() => {
        onTimeout();
      }, timeoutDuration);
    }
  },

  idleTimeoutDuration: 0,
  activePhase: "current phase",
  realTimeChatEnabled: false,
  todoManagementEnabled: false,
  notificationEmailEnabled: false,
  analyticsEnabled: false,
  twoFactorAuthenticationEnabled: false,
  projectManagementEnabled: false,
  documentationSystemEnabled: false,
  versionControlEnabled: false,
  userProfilesEnabled: false,
  accessControlEnabled: false,
  taskManagementEnabled: false,
  loggingAndNotificationsEnabled: false,
  securityFeaturesEnabled: false,
  collaborationPreference1: undefined,
  collaborationPreference2: undefined,
  theme: ThemeEnum.LIGHT,
  language: LanguageEnum.English,
  fontSize: 0,
  darkMode: false,
  enableEmojis: false,
  enableGIFs: false,
  emailNotifications: false,
  pushNotifications: false,
  notificationSound: "",
  timeZone: "",
  dateFormat: "",
  timeFormat: "",
  defaultProjectView: "",
  taskSortOrder: "",
  showCompletedTasks: false,
  projectColorScheme: "",
  showTeamCalendar: false,
  teamViewSettings: [],
  defaultTeamDashboard: "",
  passwordExpirationDays: 0,
  privacySettings: selectedSettings,
  thirdPartyApiKeys: {} as Record<string, string>,
  externalCalendarSync: false,
  dataExportPreferences: [],
  dashboardWidgets: [],
  customTaskLabels: [],
  customProjectCategories: [],
  customTags: [],
  additionalPreference1: undefined,
  additionalPreference2: undefined,
  formHandlingEnabled: false,
  paginationEnabled: false,
  modalManagementEnabled: false,
  sortingEnabled: false,
  notificationSoundEnabled: false,
  localStorageEnabled: false,
  clipboardInteractionEnabled: false,
  deviceDetectionEnabled: false,
  loadingSpinnerEnabled: false,
  errorHandlingEnabled: false,
  toastNotificationsEnabled: false,
  datePickerEnabled: false,
  themeSwitchingEnabled: false,
  imageUploadingEnabled: false,
  passwordStrengthEnabled: false,
  browserHistoryEnabled: false,
  geolocationEnabled: false,
  webSocketsEnabled: false,
  dragAndDropEnabled: false,
  idleTimeoutEnabled: false,
  enableAudioChat: false,
  enableVideoChat: false,
  enableFileSharing: false,
  enableBlockchainCommunication: false,
  enableDecentralizedStorage: false,
  id: "",
  filter: function (key: keyof Settings): void {
    // filter settings
    object;
  },
  appName: "",
  selectDatabaseVersion: "",
  selectAppVersion: "",

  enableDatabaseEncryption: false,
  idleTimeoutId: null,
};

export default userSettings;

export type { IdleTimeoutType };
