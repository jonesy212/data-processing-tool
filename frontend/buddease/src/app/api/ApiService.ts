import { handleApiError } from "@/app/api/ApiLogs";
import { generateAllHeaders, snapshot } from '@/app/api/headers/generateAllHeaders';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { CustomApp } from "@/app/components/web3/dAppAdapter/DApp";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { AxiosError, AxiosRequestConfig } from "axios";
import { Style as DocxStyle } from 'docx';
import { ContentState } from 'draft-js';
import { getAuthToken } from '../components/auth/getAuthToken';
import { CodingLanguageEnum, LanguageEnum } from '../components/communications/LanguageEnum';
import { ModifiedDate } from "../components/documents/DocType";
import DocumentPermissions from '../components/documents/DocumentPermissions';
import { DocumentAnimationOptions } from '../components/documents/SharedDocumentProps';
import { useBrainstormingPhase, useMeetingsPhase, useProjectManagementPhase, useTeamBuildingPhase } from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import { authenticationPhaseHook, dataAnalysisPhaseHook, generalCommunicationFeaturesPhaseHook, ideationPhaseHook, jobSearchPhaseHook, productBrainstormingPhaseHook, productLaunchPhaseHook, recruiterDashboardPhaseHook, teamCreationPhaseHook } from "../components/hooks/phaseHooks/PhaseHooks";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from "../components/hooks/userInterface/UIPhaseHooks";
import { SupportedData } from "../components/models/CommonData";
import FileData from "../components/models/data/FileData";
import { BorderStyle, DocumentSize } from '../components/models/data/StatusType';
import { Meta } from "../components/models/data/dataStoreMethods";
import { DataSharingPreferences } from '../components/settings/PrivacySettings';
import { AlignmentOptions } from '../components/state/redux/slices/toolbarSlice';
import { Settings } from "../components/state/stores/SettingsStore";
import { useNotification } from '../components/support/NotificationContext';
import UserRoles from '../components/users/UserRoles';
import useSecureStoreId from '../components/utils/useSecureStoreId';
import { currentAppName } from "../components/versions/AppVersion";
import { VersionData, versionHistory } from "../components/versions/VersionData";
import { backendConfig } from "../configs/BackendConfig";
import {  ConfigurationService } from "../configs/ConfigurationService";
import { DataVersions, dataVersions } from '../configs/DataVersionsConfig';
import { determineFileType } from '../configs/DetermineFileType';
import { frontendConfig } from "../configs/FrontendConfig";
import { StructuredMetadata } from '../configs/StructuredMetadata';
import userSettings, { UserSettings } from "../configs/UserSettings";
import BackendStructure, { backendStructure } from "../configs/appStructure/BackendStructure";
import FrontendStructure, { frontendStructure } from "../configs/appStructure/FrontendStructure";
import { CacheData, realtimeData } from "../generators/GenerateCache";
import { getBackendStructureFilePath, STORE_KEYS, writeAndUpdateCache } from "../utils/CacheManager";
import { calendarEvent } from './../components/state/stores/CalendarManagerStore';
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
import { getSnapshotsAndCategory } from "./SnapshotApi";


// Define the API base URL
const API_BASE_URL = endpoints.data; // Assuming 'endpoints' has a property 'data' for the base URL
const { notify } = useNotification();


type CacheReadOptions<T extends  BaseData<T>> = {
  filePath: string;
  apiKey: string;
  token: string;
};

// Define the structure of the response data
interface CacheResponse<
  T extends  BaseData<T>,
  K extends T = T,
  M extends StructuredMetadata<T, K> = StructuredMetadata<T, K>, // Metadata type
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
const configServiceInstance = ConfigurationService.getInstance();


// Retrieve values
const apiKey = configServiceInstance.getApiKey();
const appId = configServiceInstance.getAppId();
const appDescription = configServiceInstance.getAppDescription();
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
const options: CacheReadOptions<CustomApp> = {
  apiKey: appData.apiKey, // Assuming `appData` has an apiKey property
  token: authToken,
  filePath: filePath,
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

    metadata: {
      key1: "value1",
      key2: "value2",
    },

    userSettings: {
      theme: "dark",
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

    previousMetadata: {} as StructuredMetadata<any, any>,
    currentMetadata: {} as StructuredMetadata<any, any>,
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

  // Provide actual data for SupportedData< BaseData<T>> type
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
  } catch (error: Error) {
    console.error("Error fetching user by username:", error);
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
const readCache = async <T extends  BaseData<T>>(
  { filePath }: CacheReadOptions<T>
): Promise<SupportedData<T> | undefined> => {
  try {

    // Resolve category dynamically using getSnapshotsAndCategory or another suitable method
    const dynamicCategory = await getSnapshotsAndCategory(filePath); // Assuming this method fetches the correct category
 
    const userName = 
    // Fetch user information dynamically by username
    const userData = await getUserByUsername(username); // Assuming this returns user data including userName
    const foundUserName = userData?.userName; // Access the userName property
    
    // Fetch cache data using the file path
    const cacheResponse: CacheResponse<T, Meta> | undefined = await fetchCacheData(filePath, dynamicCategory, userName);

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
const fetchCacheData = async <
  T extends BaseData<T>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
>(filePath: string, categoryName: string, userName: string): Promise<CacheResponse<T, M>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate fetching data from a server by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const fileType = determineFileType(filePath); // Assuming determineFileType takes filePath

    const generatedID = UniqueIDGenerator.generateIDForCache(categoryName, userName);

    // Mock cache data object using the CacheResponse interface
    const mockCacheData: CacheData = {
      _id: generatedID, // Example data for CacheData
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

