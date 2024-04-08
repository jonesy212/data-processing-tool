import useIdleTimeout from '../components/hooks/idleTimeoutHooks';
import { Settings } from '../components/state/stores/SettingsStore';
 

export interface UserSettings extends Settings {
  communicationMode: string;
  enableRealTimeUpdates: boolean;
  defaultFileType: string;
  allowedFileTypes: string[];
  enableGroupManagement: boolean;
  enableTeamManagement: boolean;
  idleTimeout: ReturnType<typeof useIdleTimeout>;
  startIdleTimeout: () => void;
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
  language: string;
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
  thirdPartyApiKeys: Record<string, string>;
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
}


const userSettings: UserSettings = {
  communicationMode: "text",
  enableRealTimeUpdates: true,

  defaultFileType: "document",
  allowedFileTypes: ["document"],
  enableGroupManagement: true,
  enableTeamManagement: true,

  idleTimeout: useIdleTimeout('idleTimeout'),
  startIdleTimeout: useIdleTimeout('idleTimeout').startIdleTimeout(timeoutDuration, onTimeout),
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
  language: "",
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
}



export default userSettings;

