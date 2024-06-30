import { object } from "prop-types";
import { CodingLanguageEnum, LanguageEnum } from "../components/communications/LanguageEnum";
import useIdleTimeout from "../components/hooks/idleTimeoutHooks";
import useAuthentication from "../components/hooks/useAuthentication";
import { Settings } from "../components/state/stores/SettingsStore";

const logoutUser = useAuthentication().logout;

const onTimeout = () => {
  // Handle timeout event
  console.log("User idle timeout occurred.");

  // Log the timeout event and perform necessary actions
  logoutUser();
  showModal(
    "Session Timeout",
    "Your session has expired due to inactivity. Please log in again."
  );
  resetAppState();
};

// Show modal function
const showModal = (title: any, message: any) => {
  // Display a modal with provided title and message
  console.log(`Showing modal with title: ${title} and message: ${message}`);
};

// Reset application state function
const resetAppState = () => {
  // Reset the application state
  console.log("Resetting application state...");
};

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
    onTimeout: () => void | undefined
  ) => void | undefined;
  toggleActivation: () => Promise<boolean>;
};

export interface UserSettings extends Settings {
  [x: string]:
    | string
    | number
    | NodeJS.Timeout
    | boolean
    | string[]
    | IdleTimeoutType
    | Record<string, string>
    | undefined
    | NodeJS.Timeout
    | null
    | ((key: keyof Settings) => void)
    | ((timeoutDuration: number, onTimeout: () => void) => void)
    | undefined;

  userId: number;
  userSettings: NodeJS.Timeout;
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
  theme: string;
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
  privacySettings: any[]; // Update with PrivacySettings type
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
  userId: 1,
  userSettings: new NodeJS.Timeout(),
  communicationMode: "text",
  enableRealTimeUpdates: true,

  defaultFileType: "document",
  allowedFileTypes: ["document"],
  enableGroupManagement: true,
  enableTeamManagement: true,

  idleTimeout: useIdleTimeout("idleTimeout"),
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
  theme: "",
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
  privacySettings: [],
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
