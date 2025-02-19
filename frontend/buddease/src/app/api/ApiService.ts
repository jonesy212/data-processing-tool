import { handleApiError } from "@/app/api/ApiLogs";
import { createSnapshot, snapshotContainer } from '@/app/api/SnapshotApi';
import { generateAllHeaders } from '@/app/api/headers/generateAllHeaders';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { CustomApp } from "@/app/components/web3/dAppAdapter/DApp";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import metadata from '@/app/layout';
import { AxiosError, AxiosRequestConfig } from "axios";
import { Style as DocxStyle } from 'docx';
import { ContentState } from 'draft-js';
import { getAuthToken } from '../components/auth/getAuthToken';
import { EventAttendance } from '../components/calendar/AttendancePrediction';
import { CodingLanguageEnum, LanguageEnum } from '../components/communications/LanguageEnum';
import { ModifiedDate } from "../components/documents/DocType";
import DocumentPermissions from '../components/documents/DocumentPermissions';
import { DocumentAnimationOptions } from '../components/documents/SharedDocumentProps';
import { useBrainstormingPhase, useMeetingsPhase, useProjectManagementPhase, useTeamBuildingPhase } from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import { authenticationPhaseHook, dataAnalysisPhaseHook, generalCommunicationFeaturesPhaseHook, ideationPhaseHook, jobSearchPhaseHook, productBrainstormingPhaseHook, productLaunchPhaseHook, recruiterDashboardPhaseHook, teamCreationPhaseHook } from "../components/hooks/phaseHooks/PhaseHooks";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from "../components/hooks/userInterface/UIPhaseHooks";
import { getCategoryFromFilePath } from '../components/libraries/categories/getCategoryFromFilePath';
import { SupportedData } from "../components/models/CommonData";
import FileData from "../components/models/data/FileData";
import { BorderStyle, DocumentSize } from '../components/models/data/StatusType';
import { K, Meta } from "../components/models/data/dataStoreMethods";
import { DataSharingPreferences } from '../components/settings/PrivacySettings';
import { SnapshotConfigProps } from '../components/snapshots/SnapshotConfigProps';
import { storeProps } from '../components/snapshots/SnapshotStoreProps';
import { AlignmentOptions } from '../components/state/redux/slices/toolbarSlice';
import { Settings } from "../components/state/stores/SettingsStore";
import { useNotification } from '../components/support/NotificationContext';
import UserRoles from '../components/users/UserRoles';
import { generateSnapshotId } from '../components/utils/snapshotUtils';
import useSecureStoreId from '../components/utils/useSecureStoreId';
import { currentAppName } from "../components/versions/AppVersion";
import { VersionData, versionHistory } from "../components/versions/VersionData";
import { backendConfig } from "../configs/BackendConfig";
import { ConfigurationService } from "../configs/ConfigurationService";
import { DataVersions, dataVersions } from '../configs/DataVersionsConfig';
import { determineFileType } from '../configs/DetermineFileType';
import { frontendConfig } from "../configs/FrontendConfig";
import { StructuredMetadata } from '../configs/StructuredMetadata';
import userSettings, { UserSettings } from "../configs/UserSettings";
import BackendStructure, { backendStructure } from "../configs/appStructure/BackendStructure";
import FrontendStructure, { frontendStructure } from "../configs/appStructure/FrontendStructure";
import { CacheData, realtimeData } from "../generators/GenerateCache";
import { determineType } from '../typings/determineType';
import { getBackendStructureFilePath, STORE_KEYS, writeAndUpdateCache } from "../utils/CacheManager";
import { calendarEvent } from './../components/state/stores/CalendarManagerStore';
import { endpoints } from "./ApiEndpoints";
import { getSnapshotConfig, getSnapshotsAndCategory } from "./SnapshotApi";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
import { ThemeEnum } from "../components/libraries/ui/theme/Theme";


// Define the API base URL
const API_BASE_URL = endpoints.data; // Assuming 'endpoints' has a property 'data' for the base URL
const { notify } = useNotification();


type CacheReadOptions<T extends  BaseData<any>> = {
  filePath: string;
  apiKey: string;
  token: string;
  currentEvent: EventAttendance | null;
};

// Define the structure of the response data
interface CacheResponse<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>, // Metadata type
  ExcludedFields extends keyof T = never
> {
  id?: string | number | undefined;
  data: SupportedData<T>;
}


interface CustomStyle extends DocxStyle {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
  // Add other custom properties as needed
}

const createDefaultVersionData = (overrides?: Partial<VersionData>): VersionData => ({
  versionNumber: "16px",
  id: 0,
  parentId: "",
  parentType: "",
  parentVersion: "",

  parentTitle: "",
  parentContent: "",
  parentName: "",
  parentUrl: "",

  parentChecksum: "",
  parentAppVersion: "",
  parentVersionNumber: "",
  isLatest: false,

  isActive: false,
  isPublished: false,
  publishedAt: new Date(),
  source: "",
  status: "",

  version: "",
  timestamp: "",
  user: "",
  changes: [],

  comments: [],
  workspaceId: "",
  workspaceName: "",
  workspaceType: "",

  workspaceUrl: "",
  workspaceViewers: [],
  workspaceAdmins: [],
  workspaceMembers: [],

  data: {
    childIds: [],
    relatedData: []
  },
  backend: {} as BackendStructure,
  frontend: {} as FrontendStructure,
  name: "",
  url: "",
  documentId: "",
  draft: false,
  userId: "",

  content: "",
  metadata: {
    author: "",
    timestamp: new Date().toISOString(),
    revisionNotes: ""
  },
  major: 0,
  minor: 0,

  patch: 0,
  checksum: "",

  releaseDate: '',
  history: [],
  ...overrides,
});

const storeId = useSecureStoreId()
if (!storeId){
  throw new Error("storeId already exists")
}





const authToken = getAuthToken()

// Usage example:
const cacheKey = STORE_KEYS.USER_PREFERENCES; // Replace with the actual key you want to use

// Get the file path dynamically based on the cache key
const filePath = getBackendStructureFilePath(cacheKey);


// Instantiate configuration service
const configServiceInstance = ConfigurationService.getInstance();


// Retrieve values
const apiKey = configServiceInstance.getApiKey();
const appId = configServiceInstance.getAppId();
const appDescription = configServiceInstance.getAppDescription();
// Create an instance of AppSettings
const appSettings = new AppSettings(apiKey, appId, appDescription);

const currentEvent = calendarEvent.get();
// Create an instance of appData based on the CustomApp interface
const appData: CustomApp = {
  id: appSettings.getAppId(), // Retrieve the actual app ID
  name: currentAppName, // Replace with the actual app name
  description: appSettings.getAppDescription(), // Retrieve the actual description
  authToken: authToken, // Replace with the actual auth token
  apiKey: appSettings.getApiKey(), // Retrieve the actual API key
  relatedData: []
  // Add any additional properties here if needed
};

// Generate headers with the authToken
const options: CacheReadOptions<CustomApp> = {
  apiKey: appData.apiKey, // Assuming `appData` has an apiKey property
  token: authToken,
  filePath: filePath,
  currentEvent: currentEvent,

};

// Example usage when calling getSnapshot
const additionalHeaders: Record<string, string> = generateAllHeaders({ additionalHeaders: { 'Custom-Header': 'value' } }, authToken);


// Usage example:
const cacheData: SupportedData<Data<BaseData<any>>> = {

  options: {
    previousContent: {} as ContentState,
    lastModifiedDate: {} as ModifiedDate,
    accessHistory: [],
    tableCells: {
      enabled: true,
      padding: 10,
      fontSize: 12,
      alignment: "left",
      borders: {
        top: {
          style: BorderStyle.SOLID,
          width: 1,
          color: "black"
        },
        bottom: {
          style: BorderStyle.SOLID,
          width: 1,
          color: "black"
        },
        left: {
          style: BorderStyle.SOLID,
          width: 1,
          color: "black"
        },
        right: {
          style: BorderStyle.SOLID,
          width: 1,
          color: "black"
        },
      },
    },

    table: true,
    tableRows: 5,
    tableColumns: 3,

    codeBlock: {
      enabled: true,
    },

    blockquote: {
      enabled: true,
    },
    codeInline: {
      enabled: true,
    },
    quote: {

      enabled: true,
    },
    todoList: {
      enabled: true,
    },

    orderedTodoList: {
      enabled: true,
    },
    unorderedTodoList: {
      enabled: true,
    },

    color: "red",
    colorCoding: {
      primary: "#ff0000",
      secondary: "#00ff00",
    },

    highlight: {
      enabled: true,
      colors: {
        important: "#ffff00",
        note: "#ff00ff",
      },
    },


    customSettings: {
      customOption1: "value1",
      customOption2: 42,
    },

    documents: [],

    includeType: { enabled: true, format: "none" },

    footnote: { enabled: true, format: "standard" },
    defaultZoomLevel: 1.5,

    customProperties: {
      property1: "value1",
      property2: 42,
    },

    value: true,
    includeTitle: { enabled: true },
    includeContent: { enabled: false },
    includeStatus: true,

    includeAdditionalInfo: { enabled: true },

    metadata: defaultMetadata(),

    userSettings: {
      theme: ThemeEnum.DARK,
      darkMode: true,
      fontSize: 14,
      language: LanguageEnum.English,
      defaultFileType: "pdf",
      allowedFileTypes: ["pdf", "docx", "txt"],
      enableEmojis: true,
      enableGIFs: true,
      projectColorScheme: "blue",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12hr",
      defaultProjectView: "list",
      showCompletedTasks: true,
      defaultTeamDashboard: "overview",
      paginationEnabled: true,
      sortingEnabled: true,
      themeSwitchingEnabled: true,


      notifications: [],
      emailNotifications: true,
      pushNotifications: true,
      notificationEmailEnabled: true,
      notificationSound: "default",
      notificationSoundEnabled: true,
      loggingAndNotificationsEnabled: true,
      toastNotificationsEnabled: true,

      userId: 123,
      sessionTimeout: 300,
      twoFactorAuthenticationEnabled: true,
      accessControlEnabled: true,
      passwordExpirationDays: 90,
      privacySettings: {
        dataSharing: {} as DataSharingPreferences,
        thirdPartyTracking: false,
        isDataSharingEnabled: false,

      },
      enableDatabaseEncryption: true,
      passwordStrengthEnabled: true,

      communicationMode: "chat",
      enableRealTimeUpdates: true,
      realTimeChatEnabled: true,
      enableAudioChat: true,
      enableVideoChat: true,
      enableFileSharing: true,
      enableBlockchainCommunication: true,
      enableDecentralizedStorage: true,

      idleTimeout: {
        intervalId: 0,
        isActive: false,  
        idleTimeoutDuration: 300,
        animateIn: (selector: string) => {},
        startAnimation: () => {},
       
        stopAnimation: () => { },
        resetIdleTimeout: async () => {},
        idleTimeoutId: null,
        startIdleTimeout: (timeoutDuration: number, onTimeout: () => void | undefined) => {},
        toggleActivation: async () => false,
      },
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {},
      idleTimeoutDuration: 300,
      idleTimeoutEnabled: true,
      browserHistoryEnabled: true,
      clipboardInteractionEnabled: true,
      dragAndDropEnabled: true,

      enableGroupManagement: true,
      enableTeamManagement: true,
      projectManagementEnabled: true,
      taskManagementEnabled: true,
      todoManagementEnabled: true,
      showTeamCalendar: true,
      teamViewSettings: [],
      collaborationToolsEnabled: true,
      enableScreenSharing: true,
      enableWhiteboard: true,

      selectDatabaseVersion: "v2.1",
      selectAppVersion: "1.0.0",
      versionControlEnabled: true,
      userProfilesEnabled: true,
      documentationSystemEnabled: true,
      analyticsEnabled: true,
      securityFeaturesEnabled: true,
      deviceDetectionEnabled: true,

      appName: "Project Manager",
      id: "user_123",
      customProperties: {},
      filter: (key: keyof Settings) => {},
      customTaskLabels: ["urgent", "important"],
      customProjectCategories: ["design", "development"],
      customTags: ["feature", "bugfix"],
      dataExportPreferences: {
        format: [],
        includeArchived: false,
      },
      dashboardWidgets: ["weather", "stockTracker"],
      externalCalendarSync: true,
      modalManagementEnabled: true,
      loadingSpinnerEnabled: true,
      errorHandlingEnabled: true,
      datePickerEnabled: true,
      imageUploadingEnabled: true,
      webSocketsEnabled: true,
      geolocationEnabled: true,

    },

    dataVersions: {
      backend: { result: 1, hydrated: true },
      frontend: Promise.resolve("2.0.0"),
    },



    additionalOptions: "",
    language: LanguageEnum.English,
    documentPhase: "",
    versionData: createDefaultVersionData(),

    isDynamic: false,
    size: DocumentSize.A4,
    animations: {} as DocumentAnimationOptions,
    layout: undefined,

    panels: {},
    pageNumbers: {
      enabled: true,
      format: "1, 2, 3",
    },
    footer: "",
    watermark: {
      enabled: true,
      text: "Your Watermark Text",
      color: "rgba(0, 0, 0, 0.5)",
      opacity: 0.5,
      fontSize: 12,
      size: "100px",
      x: 10,
      y: 10,
      rotation: 0,
      borderStyle: "solid",
    },
    headerFooterOptions: {
      enabled: true,
      showHeader: true,
      showFooter: true,


      headerContent: "Header Content",
      footerContent: "Footer Content",
      differentFirstPage: false,
      differentOddEven: false,
    },
    zoom: {
      enabled: true,
      value: 1,
      levels: [
        { name: "100%", value: 1 },
        { name: "125%", value: 1.25 },
        { name: "150%", value: 1.5 },
      ],
    },
    showRuler: true,
    showDocumentOutline: true,
    showComments: true,
    showRevisions: true,
    spellCheck: true,
    grammarCheck: true,

    visibility: "",
    fontSize: 0,
    font: "",
    textColor: "",

    backgroundColor: "",
    fontFamily: "",
    lineSpacing: 0,
    alignment: AlignmentOptions.LEFT,

    indentSize: 0,
    bulletList: {
      symbol: "•",
      style: "disc",
    },
    numberedList: {
      style: "bullet",
      format: "decimal",
    },
    headingLevel: {
      enabled: true,
    },
    toc: {



      enabled: true,
      format: "detailed",
      levels: 3,
    },
    bold: {

      enabled: true,
    },
    italic: {
      enabled: true,
    },
    underline: {
      enabled: true,
    },
    strikethrough: {
      enabled: true,
    },
    subscript: {
      enabled: true,
    },
    superscript: {
      enabled: true,
    },

    hyperlink: "",

    textStyles: {
      heading: {
        fontSize: "16px",
        fontWeight: "bold",
      } as CustomStyle,
      paragraph: {
        fontSize: "14px",
        lineHeight: "1.5",
      } as CustomStyle,
    },
    image: { enabled: true, allow: true },
    links: true,
    embeddedContent: {
      enabled: true,
      allow: true,
      language: CodingLanguageEnum.Javascript,
    },
    bookmarks: {
      enabled: true,
    },
    crossReferences: true,
    footnotes: {
      enabled: true,
      format: "superscript",
    },
    endnotes: {
      enabled: true,
      format: "numerical",
    },
    comments: {
      enabled: true,
      author: "Author Name",
      dateFormat: "MM/DD/YYYY",
    },
    revisions: {
      author: "Author Name",
      dataFormat: "MM/DD/YYYY",

      enabled: true,
      allow: true,

    },
    embeddedMedia: {
      enabled: true,
      allow: true,
    },
    embeddedCode: {
      enabled: true,
      language: CodingLanguageEnum.Javascript,
      allow: true,
    },
    styles: {
      normal: {

        fontSize: "14px",
        fontFamily: "Arial",
      } as CustomStyle,
      heading: {
        fontSize: "20px",
        fontWeight: "bold",
      } as CustomStyle,
    },

    previousMetadata: {} as UnifiedMetaDataOptions<any, any>,
    currentMetadata: {} as UnifiedMetaDataOptions<any, any>,
    currentContent: {} as ContentState,
    additionalOptionsLabel: "",
    uniqueIdentifier: "",
    documentType: "",
    documentSize: {} as DocumentSize,

    createdBy: "",
    lastModifiedBy: "",
    limit: 0,
    page: 0,
    levels: {
      enabled: false,
      startLevel: 0,
      endLevel: 0,
      format: "",
      separator: "",
      style: {
        main: "",
        styles: [
          {
            format: [],
            separator: [],
            style: {
              format: [""],
              separator: [""],
              style: ["", ""],
            },
          },
        ],
      }
    },
  },  
  
  language: "",
  documentPhase: "",

  levels: "",
  versionData: {},
  isDynamic: "",
  size: 0,
  animations: "",
  layout: "",
  panels: "",
  pageNumbers: "",
  footer: "",

  watermark: "",
  headerFooterOptions: "",
  zoom: "",
  showRuler: "",

  showDocumentOutline: "",
  showComments: "",
  showRevisions: "",
  spellCheck: "",

  grammarCheck: "",
  visibility: "",
  fontSize: "",
  font: "",

  textColor: "",
  backgroundColor: "",
  fontFamily: "",
  lineSpacing: "",

  alignment: "",
  indentSize: "",
  bulletList: "",
  numberedList: "",

  headingLevel: "",
  toc: "",
  bold: () => "",
  italic: "",

  underline: "",
  strikethrough: "",
  subscript: "",
  superscript: "",

  hyperlink: "",
  textStyles: "",
  image: "",
  links: "",

  embeddedContent: "",
  bookmarks: "",
  crossReferences: "",

  footnotes: "",
  endnotes: "",
  comments: [],
  revisions: "",

  embeddedMedia: "",
  embeddedCode: "",
  styles: "",
  previousMetadata: { area: "", currentMeta: {}, metadataEntries: {}},

  currentMetadata: { area: "", currentMeta: {}, metadataEntries: {}},
  currentContent: {},
  previousContent: "",
  lastModifiedDate: {value: "", isModified: "",} as ModifiedDate,

  accessHistory: [],
  tableCells: "",
  table: "",
  tableRows: "",

  tableColumns: "",
  codeBlock: "",
  blockquote: "",
  codeInline: "",

  quote: "",
  todoList: "",
  orderedTodoList: "",
  unorderedTodoList: "",

  color: "",
  colorCoding: "",
  highlight: "",
  highlightColor: "",

  customSettings: "",
  includeType: "",
  footnote: "",

  defaultZoomLevel: "",
  customProperties: "",
  value: "",
  includeTitle: "",

  includeContent: "",
  includeStatus: "",
  includeAdditionalInfo: "",
  metadata: {} as UnifiedMetaDataOptions<any>,

  userSettings: {} as UserSettings,
  dataVersions: {} as DataVersions,
  folderPath: "",

  // Provide actual data for SupportedData< BaseData<any>> type
  userId: 0, // Example property from UserData
  title: 'Sample Todo', // Example property from Todo
  taskId: 'task-1', // Example property from Task
  type: 'SomeType', // Example type if AllTypes is a union of strings
  storeId: 0,
  role: UserRoles.Guest,

  _id: "",
  id: "",
  done: false,
  todos: [],

  description: "",
  dueDate: new Date(),
  priority: undefined,
  assignedTo: null,

  assigneeId: "",
  assignee: {
    username: "",
    firstName: "",
    lastName: "",
    email: "",

    fullName: "",
    avatarUrl: "",

  },
  assignedUsers: [],
  collaborators: [],
  labels: [],
  save: async () => { },
  snapshot: snapshot,
  timestamp: new Date(),
  previouslyAssignedTo: [],
  source: "system",
  startDate: new Date(),
  endDate: new Date(),
  isActive: true,



  name: "",
  projects: [],
  teams: [],
  teamMembers: [],

  content: "",
  documents: [],
  permissions: new DocumentPermissions(false, false),
  folders: [],


};


const getUserByUsername = async (username: string): Promise<any> => {
  try {
    // Send a GET request with axiosInstance to fetch user data by username
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/users/${username}`,
      {
        headers: headersConfig,
      }
    );
    
    // Return the user data received from the API response
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user by username:", error);
    const errorMessage = error.message;
    handleApiError(error, errorMessage);
    throw error; // Propagate the error to the calling code
  }
};


const writePath = './path/to/cache/data'; // Replace with the actual file path

writeAndUpdateCache(writePath, cacheData)
  .then(() => {
    console.log("Cache write successful");
  })
  .catch((error) => {
    console.error("Failed to write cache:", error);
  });


// Update readCache to return SupportedData<T>
const readCache = async <T extends BaseData<any>>(
  { filePath, currentEvent }: CacheReadOptions<T> & { currentEvent: EventAttendance | null }
): Promise<SupportedData<T> | undefined> => {
  try {

    function handleEvent(event: SnapshotEvent): void {
      if (isTaskEvent(event)) {
        console.log("Task event:", event.action, event.taskId);
      } else if (isUserEvent(event)) {
        console.log("User action:", event.action, event.userId);
      } else {
        console.warn("Unhandled event type:", event.eventType);
      }
    }

    if (currentEvent) {
      if (isEventAttendance(currentEvent)) {
        console.log("Handling EventAttendance:", currentEvent.attendees);
        // Specific logic for EventAttendance
      } else if (isSystemEvent(currentEvent)) {
        console.log("Handling SystemEvent:", currentEvent.systemMessage);
        // Specific logic for SystemEvent
      } else {
        console.warn("Unhandled event type:", currentEvent.eventType);
      }
    }
    // Example values for missing arguments
    const category = getCategoryFromFilePath(filePath);  // Define this function or use a suitable value
    const snapshotId = generateSnapshotId;             // Generate or retrieve snapshotId
    const createdSnapshot = createSnapshot(snapshot);                   // Create or retrieve a snapshot instance
    // Determine type based on filePath
    const type = determineType(filePath);
    // Retrieve the current event
    const event = currentEvent;   
    

    const subscriberId = subscriberApi.getSubscriberId.toString();

    // SnapshotConfigProps for getSnapshotConfig
    const snapshotConfigProps: SnapshotConfigProps<T> = {
      id: String(numericId), // Ensure numericId is used correctly here
      subscriberId: subscriberId, // Assume subscriberId is available
      dataStoreMethods: dataStoreMethods, // Assume these are available
      dataStore: dataStore, // Assume these are available
      metadata: metadata, // Replace with the correct metadata
      endpointCategory: endpointCategory, // Category for the endpoint
      storeProps: storeProps, // Store props
      snapshotConfigData: snapshotConfigData, // Snapshot config data
      snapshotStoreConfigData: snapshotStoreConfigData, // Snapshot store config data
      snapshotContainer: snapshotContainer, // Snapshot container
    };
    
    
    
    // Call getSnapshotConfig with the correct arguments
    const snapshotConfig =  getSnapshotConfig(
      String(numericId),
      snapshotId,
      criteria,
      category,
      categoryProperties,
      snapshotConfigProps.subscriberId, // subscriberId
      delegate,
      snapshotData,
      snapshot,
      data,
      events,
      dataItems,
      newData,
      payload,
      store,
      callback,
      snapshotConfigProps.storeProps, // storeProps
      snapshotConfigProps.endpointCategory, // endpointCategory
      snapshotConfigProps.snapshotContainer // snapshotContainer
    );
       
    // Retrieve snapshot configuration
 
    // Fetch user information dynamically by username
    const username = ""; // Ideally set this dynamically (e.g., from user context or another source)
    const userData = await getUserByUsername(username); // Fetch user data
    const foundUserName = userData?.username; // Access the username property, or handle undefined if user not found

    // Handle case when user data or username is not found
    if (!foundUserName) {
      throw new Error("User not found or username is invalid.");
    }

    // Now you can call getSnapshotsAndCategory with all required arguments
    const dynamicCategory = await getSnapshotsAndCategory(
      category, snapshotId, createdSnapshot, type, event, snapshotConfig
    );

    // Fetch cache data using the file path and foundUserName
    const cacheResponse: CacheResponse<T, K<T>, Meta<T, K>> | undefined = await fetchCacheData(filePath, dynamicCategory, foundUserName);

    if (cacheResponse) {
      // Example: Extract relevant data from cacheResponse
      const data: SupportedData<T> = cacheResponse.data; // Assuming cacheResponse.data is of type SupportedData<T>
      return data;
    }
    // Handle the response as needed
    return dynamicCategory;
  } catch (error) {
    console.error("Error reading cache:", error);
    throw error; // Rethrow the error after logging
  }

  return undefined; // Explicitly return undefined if no cacheResponse is found
};


readCache(options)
  .then((data) => {
    console.log("Cache data:", data);
  })
  .catch((error) => {
    console.error("Failed to read cache:", error);
  });


// Function to fetch cache data (mock implementation)
const fetchCacheData = async <
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
>(filePath: string, categoryName: string, username: string): Promise<CacheResponse<T, Meta>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate fetching data from a server by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const fileType = determineFileType(filePath); // Assuming determineFileType takes filePath

    const generatedID = UniqueIDGenerator.generateIDForCache(categoryName, username);

    // Mock cache data object using the CacheResponse interface
    const mockCacheData: CacheData = {
      _id: generatedID, // Example data for CacheData
      id: "",
      // #todo
      // minor, patch, createdBy
      lastUpdated: versionHistory,
      userSettings: userSettings,
      dataVersions: dataVersions ?? [],
      frontendStructure: frontendStructure,
      backendStructure: backendStructure,
      backendConfig: backendConfig,
      frontendConfig: frontendConfig,
      realtimeData: realtimeData,
      notificationBarPhaseHook: notificationBarPhaseHook,
      darkModeTogglePhaseHook: darkModeTogglePhaseHook,
      authenticationPhaseHook: authenticationPhaseHook,
      jobSearchPhaseHook: jobSearchPhaseHook,
      recruiterDashboardPhaseHook: recruiterDashboardPhaseHook,
      teamBuildingPhaseHook: useTeamBuildingPhase,
      brainstormingPhaseHook: useBrainstormingPhase,
      projectManagementPhaseHook: useProjectManagementPhase,
      meetingsPhaseHook: useMeetingsPhase,
      ideationPhaseHook: ideationPhaseHook,
      teamCreationPhaseHook: teamCreationPhaseHook,
      productBrainstormingPhaseHook: productBrainstormingPhaseHook,
      productLaunchPhaseHook: productLaunchPhaseHook,
      dataAnalysisPhaseHook: dataAnalysisPhaseHook,
      generalCommunicationFeaturesPhaseHook: generalCommunicationFeaturesPhaseHook,
      calendarEvent: calendarEvent,
      fileType: fileType,
      analysisResults: [],
      data: {}, // Adjust based on your SupportedData<T> structure
    };

    // Correct usage of T and M based on constraints
    const cacheResponse: CacheResponse<T, Meta> = {
      id: "exampleId",
      data: mockCacheData as SupportedData<T>, // Ensure data matches SupportedData<T>
    };

    // Return a Promise that resolves to the mock cache data
    return Promise.resolve<CacheResponse<T, Meta>>({
      id: "exampleId",
      data: cacheResponse.data as SupportedData<T>, // Ensure type consistency
    });

  } catch (error: any) {
    // Handle any errors that occur during the mock fetch
    console.error("Error fetching cache data:", error);

    // Call the handleError function to handle and log the error
    const errorMessage = "Error fetching cache data";
    handleError(errorMessage, { componentStack: error.stack });

    throw error;
  }
};




// Class to manage API calls and cache data
class ApiService {
  private API_BASE_URL: string;

  constructor(API_BASE_URL: string) {
    this.API_BASE_URL = API_BASE_URL;
  }

  // Define the post method
  public async post(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.post(endpoint, requestData, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to call ${endpointPath}`);
      throw error;
    }
  }

  // Define the get method
  public async get(endpointPath: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to get ${endpointPath}`);
      throw error;
    }
  }

  // Define the callApi method
  public async callApi(endpointPath: string, requestData: any): Promise<any> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.post(endpoint, requestData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to call ${endpointPath}`);
      throw error;
    }
  }

  // Define sendFileChangeEvent method to send file change data
  public async sendFileChangeEvent(file: FileData): Promise<void> {
    try {
      const endpointPath = '/file/change-event';  // Define your endpoint path
      const requestData = {
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        filePath: file.filePath,
        uploader: file.uploader,
        uploadDate: file.uploadDate,
        attachments: file.attachments,
        imageData: file.imageData,
      };

      // Call the post method to send file change event
      await this.post(endpointPath, requestData);
    } catch (error) {
      console.error('Error in sendFileChangeEvent:', error);
      throw error;
    }
  }
}

export default ApiService;
export { getUserByUsername, readCache };
export type { CustomStyle };

