import { CustomApp } from "@/app/components/web3/dAppAdapter/DApp";
import { Meta } from "@/app/components/models/data/dataStoreMethods";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Data } from '@/app/components/models/data/Data';
import * as snapshotApi from '@/app/api/SnapshotApi';
import {generateAllHeaders} from '@/app/api/headers/generateAllHeaders'
import { handleApiError } from "@/app/api/ApiLogs";
import { calendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { AxiosError, AxiosRequestConfig } from "axios";
import { useBrainstormingPhase, useMeetingsPhase, useProjectManagementPhase, useTeamBuildingPhase } from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import { authenticationPhaseHook, dataAnalysisPhaseHook, generalCommunicationFeaturesPhaseHook, ideationPhaseHook, jobSearchPhaseHook, productBrainstormingPhaseHook, productLaunchPhaseHook, recruiterDashboardPhaseHook, teamCreationPhaseHook } from "../components/hooks/phaseHooks/PhaseHooks";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from "../components/hooks/userInterface/UIPhaseHooks";
import FileData from "../components/models/data/FileData";
import { useNotification } from '../components/support/NotificationContext';
import { VersionData, versionHistory } from "../components/versions/VersionData";
import { backendConfig } from "../configs/BackendConfig";
import { DataVersions, dataVersions } from '../configs/DataVersionsConfig';
import { determineFileType } from '../configs/DetermineFileType';
import { frontendConfig } from "../configs/FrontendConfig";
import userSettings, { UserSettings } from "../configs/UserSettings";
import BackendStructure, { backendStructure } from "../configs/appStructure/BackendStructure";
import FrontendStructure, { frontendStructure } from "../configs/appStructure/FrontendStructure";
import { CacheData, realtimeData } from "../generators/GenerateCache";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";
import { SupportedData } from "../components/models/CommonData";
import UserRoles from '../components/users/UserRoles';
import DocumentPermissions from '../components/documents/DocumentPermissions';
import { StructuredMetadata } from '../configs/StructuredMetadata';
import { BorderStyle, DocumentSize } from '../components/models/data/StatusType';
import { CodingLanguageEnum, LanguageEnum } from '../components/communications/LanguageEnum';
import { DocumentAnimationOptions } from '../components/documents/SharedDocumentProps';
import { AlignmentOptions } from '../components/state/redux/slices/toolbarSlice';
import { Style as DocxStyle } from 'docx';
import { ContentState } from 'draft-js';
import { ModifiedDate } from "../components/documents/DocType";
import { CacheWriteOptions, getBackendStructureFilePath, STORE_KEYS, writeAndUpdateCache } from "../utils/CacheManager";
import { Settings } from "../components/state/stores/SettingsStore";
import { snapshotContainer, snapshotStoreConfig } from "../components/snapshots";
import useSecureStoreId from '../components/utils/useSecureStoreId';
import { getAuthToken } from '../components/auth/getAuthToken';
import { DataSharingPreferences } from '../components/settings/PrivacySettings';
import configurationService, { ConfigurationService } from "../configs/ConfigurationService";
import { currentAppName } from "../components/versions/AppVersion";
import { appConfig } from "../configs/AppConfig";


// Define the API base URL
const API_BASE_URL = endpoints.data; // Assuming 'endpoints' has a property 'data' for the base URL
const { notify } = useNotification();


type CacheReadOptions<T extends Data> = {
  filePath: string;
  apiKey: string;
  token: string;
};

// Define the structure of the response data
interface CacheResponse<T extends Data, Meta extends UnifiedMetaDataOptions> {
  id?: string | number | undefined;
  data: SupportedData<T, Meta>;
}


interface CustomStyle extends DocxStyle {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
  // Add other custom properties as needed
}

const createDefaultVersionData = (): VersionData => ({
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
 
  data: {},
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
     revisionNotes:  ""

   },
  major: 0,
  minor: 0,
 
  patch: 0,
  checksum: "",
 
  releaseDate: '', // Example defaults
  // Add other defaults if needed
  // todo
  // workspaceUrl, workspaceViewers, workspaceAdmins, workspaceMembers,
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
const configurationService = new ConfigurationService();

// Retrieve values
const apiKey = configurationService.getApiKey();
const appId = configurationService.getAppId();
const appDescription = configurationService.getAppDescription();
// Create an instance of AppSettings
const appSettings = new AppSettings(apiKey, appId, appDescription);

// Create an instance of appData based on the CustomApp interface
const appData: CustomApp = {
  id: appSettings.getAppId(), // Retrieve the actual app ID
  name: currentAppName, // Replace with the actual app name
  description: appSettings.getAppDescription(), // Retrieve the actual description
  authToken: authToken, // Replace with the actual auth token
  apiKey: appSettings.getApiKey(), // Retrieve the actual API key
  // Add any additional properties here if needed
};

// Generate headers with the authToken
const options:  CacheReadOptions<Data> = {
  apiKey: appData.apiKey, // Assuming `appData` has an apiKey property
  token: authToken,
  filePath: filePath,
};



const additionalHeaders = generateAllHeaders(options, authToken);
  
const snapshotObj =   snapshotStoreConfig.getSnapshot(snapshot)
const criteria = snapshotApi.getSnapshotCriteria(snapshotContainer, snapshotObj)
const snapshotId = snapshotApi.getSnapshotId(criteria)
const snapshot = snapshotApi.getSnapshot(String(snapshotId), storeId, additionalHeaders)

// Usage example:
const cacheData: SupportedData<Data, Meta> = {

  options: {
    previousContent: {} as ContentState,
    lastModifiedDate: {} as ModifiedDate,
    accessHistory: [],
    tableCells: {
      enabled: true,
      padding: 10, // Example value for padding
      fontSize: 12, // Example value for fontSize
      alignment: "left",
      borders: {
        top: {
          style: BorderStyle.SOLID,
          width: 1,
          color: "black"
        }, // Use BorderStyle enum value
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
      enabled: true, // Example value
    },
    codeInline: {

    },
    quote: {

      enabled: true,
    },
    todoList: {
      enabled: true, // Example value
    },

    orderedTodoList: {
      enabled: true, // Example value
    },
    unorderedTodoList: {
      enabled: true, // Example value
    },

    color: "red", // Example string
    colorCoding: {
      primary: "#ff0000", // Example key-value pair
      secondary: "#00ff00",
    },

    highlight: {
      enabled: true,
      colors: {
        important: "#ffff00", // Example color mapping
        note: "#ff00ff",
      },
    },


    customSettings: {
      customOption1: "value1", // Example custom settings
      customOption2: 42,
    },

    documents: [],

    includeType: { enabled: true, format: "none" }, // Example value matching expected type

    // Expecting a specific type, update accordingly:
    footnote: { enabled: true, format: "standard" }, // Example of correct type, assuming it expects a similar object
    defaultZoomLevel: 1.5, // Assign a number if it's expecting a numeric zoom level

    // Expecting 'Record<string, any>'
    customProperties: {
      property1: "value1",
      property2: 42,
    },

    // Expecting 'boolean | { enabled: boolean; }'
    value: true, // Example value
    includeTitle: { enabled: true }, // Correct type, either boolean or object
    includeContent: { enabled: false }, // Correct type
    includeStatus: true, // Use a boolean or object as required

    includeAdditionalInfo: { enabled: true }, // Example value with correct type

    // Expecting 'StructuredMetadata | undefined'
    metadata: {
      key1: "value1", // Assuming this matches 'StructuredMetadata' structure
      key2: "value2",
    },

    userSettings: {
      // UI Settings
      theme: "dark", // Example value matching UserSettings type
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


      notifications: true,
      emailNotifications: true,
      pushNotifications: true,
      notificationEmailEnabled: true,
      notificationSound: "default",
      notificationSoundEnabled: true,
      loggingAndNotificationsEnabled: true,
      toastNotificationsEnabled: true,

      // Security Settings
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

      // Communication Settings
      communicationMode: "chat",
      enableRealTimeUpdates: true,
      realTimeChatEnabled: true,
      enableAudioChat: true,
      enableVideoChat: true,
      enableFileSharing: true,
      enableBlockchainCommunication: true,
      enableDecentralizedStorage: true,

      // User Interaction Settings
      idleTimeout: {
        intervalId: 0,
        isActive: false,  
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

      // Collaboration & Project Management
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

      // System Features
      selectDatabaseVersion: "v2.1",
      selectAppVersion: "1.0.0",
      versionControlEnabled: true,
      userProfilesEnabled: true,
      documentationSystemEnabled: true,
      analyticsEnabled: true,
      securityFeaturesEnabled: true,
      deviceDetectionEnabled: true,

      // Miscellaneous Settings
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
      // # todo
      // collaborationToolsEnabled, projectManagementEnabled, taskManagementEnabled,
      // enableScreenSharing, enableWhiteboard, enableScreenRecording, enableScreenCapture,

    },

    // Expecting 'DataVersions | undefined'
    dataVersions: {
      backend: { result: 1, hydrated: true }, // Example value for IHydrateResult<number>
      frontend: Promise.resolve("2.0.0"), // Example value for Promise<string>
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
      enabled: true, // or false, depending on whether the watermark should be active
      text: "Your Watermark Text", // The text for the watermark
      color: "rgba(0, 0, 0, 0.5)", // Color of the watermark
      opacity: 0.5, // Opacity of the watermark (0 to 1)
      fontSize: 12, // Font size for the watermark
      size: "100px", // Size of the watermark
      x: 10, // X position of the watermark
      y: 10, // Y position of the watermark
      rotation: 0, // Rotation angle of the watermark
      borderStyle: "solid", // Border style if applicable
    },
    headerFooterOptions: {
      enabled: true, // Change based on whether you want it enabled
      showHeader: true,
      showFooter: true,


      headerContent: "Header Content",
      footerContent: "Footer Content",
      differentFirstPage: false,
      differentOddEven: false,
    },
    zoom: {
      enabled: true, // If you want to enable zoom options
      value: 1, // Example value; adjust based on your needs
      levels: [
        { name: "100%", value: 1 },
        { name: "125%", value: 1.25 },
        { name: "150%", value: 1.5 },
      ],
    },
    showRuler: true, // Set to true or false
    showDocumentOutline: true, // Set to true or false
    showComments: true, // Set to true or false
    showRevisions: true, // Set to true or false
    spellCheck: true, // Set to true or false
    grammarCheck: true, // Set to true or false

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
      symbol: "•", // The bullet symbol
      style: "disc", // The style of the bullet
    },
    numberedList: {
      style: "bullet", // or "numbered", depending on your needs
      format: "decimal", // e.g., "decimal", "lower-alpha", "upper-alpha", etc.
    },
    headingLevel: {
      enabled: true, // Change to true or false based on your needs
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
      enabled: true, // Set to true to enable italic
    },
    underline: {
      enabled: true, // Set to true to enable underline
    },
    strikethrough: {
      enabled: true, // Set to true to enable strikethrough
    },
    subscript: {
      enabled: true, // Set to true to enable subscript
    },
    superscript: {
      enabled: true, // Set to true to enable superscript
    },

    hyperlink: "",

    textStyles: {
      heading: {
        fontSize: "16px", // Example property of Style
        fontWeight: "bold",
      } as CustomStyle,
      paragraph: {
        fontSize: "14px", // Example property of Style
        lineHeight: "1.5",
      } as CustomStyle,
    },
    image: { enabled: true, allow: true }, // if you want to use an object
    links: true, // or { enabled: true, allow: true } if you want to use an object
    embeddedContent: {
      enabled: true,
      allow: true,
      language: CodingLanguageEnum.Javascript, // Adjust based on your use case
    },
    bookmarks: {
      enabled: true, // Set to true or false based on your needs
    },
    crossReferences: true, // or { enabled: true, allow: true }
    footnotes: {
      enabled: true,
      format: "superscript", // or other format types as needed
    },
    endnotes: {
      enabled: true,
      format: "numerical", // or other format types as needed
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
      language: CodingLanguageEnum.Javascript, // Adjust based on your use case
      allow: true,
    },
    styles: {
      normal: {

        fontSize: "14px",
        fontFamily: "Arial",
      } as CustomStyle,
      heading: {
        fontSize: "20px", // Example property of Style
        fontWeight: "bold",
      } as CustomStyle,
    },

    previousMetadata: {} as StructuredMetadata,
    currentMetadata: {} as StructuredMetadata,
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
            format: [], // Adjust according to your actual data type
            separator: [], // Adjust according to your actual data type
            style: {
              format: [""],
              separator: [""],
              style: ["", ""],
            },
          },
        ],
      }
    },
    // showGridLines, showPageBorders,
    // textDirection, textAlignment, textColor, backgroundColor,
    // tableColumns, tableRows, tableColumns, tableRows, tableColumns,
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
  previousMetadata: {},

  currentMetadata: {},
  currentContent: {},
  previousContent: "",
  lastModifiedDate: {},

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
  metadata: {} as UnifiedMetaDataOptions,

  userSettings: {} as UserSettings,
  dataVersions: {} as DataVersions,
  folderPath: "",

  // Provide actual data for SupportedData<Data> type
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


const writePath = './path/to/cache/data'; // Replace with the actual file path

writeAndUpdateCache(writePath, cacheData)
  .then(() => {
    console.log("Cache write successful");
  })
  .catch((error) => {
    console.error("Failed to write cache:", error);
  });





// Update readCache to return SupportedData<T>
const readCache = async <T extends Data>(
  { filePath }: CacheReadOptions<T>
): Promise<SupportedData<T> | undefined> => {
  try {
    // Fetch cache data using the file path
    const cacheResponse: CacheResponse<T> | undefined = await fetchCacheData(filePath);

    if (cacheResponse) {
      // Example: Extract relevant data from cacheResponse
      const data: SupportedData<T> = cacheResponse.data; // Assuming cacheResponse.data is of type SupportedData<T>
      return data;
    }
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
const fetchCacheData = async (filePath: string): Promise<CacheResponse> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate fetching data from a server by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fileType = determineFileType(filePath); // Assuming determineFileType takes filePath

    // Mock cache data object using the CacheResponse interface
    const mockCacheData: CacheData = {
      _id: "", // Example data for CacheData
      id: "",
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

    const cacheResponse: CacheResponse = {
      id: "exampleId",
      data: mockCacheData as SupportedData<T>
    };

    // Return a Promise that resolves to the mock cache data
    return Promise.resolve<CacheResponse>(
      {
        id: "exampleId",
        data: cacheResponse as SupportedData<T>
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
export {readCache}
export type { CustomStyle }