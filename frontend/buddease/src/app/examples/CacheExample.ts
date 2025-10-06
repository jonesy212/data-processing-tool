// CacheExample.ts
import { initializeAppData } from '@/app/api/service/ApiService';
import useFilePath from "@/app/hooks/useFilePath";
import { CacheReadOptions } from '@/app/libraries/cache/CacheResponse';
import { ThemeEnum } from "@/app/libraries/ui/theme/Theme";
import { LanguageEnum } from '@/app/communications/LanguageEnum';
import { CustomApp } from '@/app/utils/web3/dAppAdapter/DApp';
import { authToken } from '@/server/auth/authToken';
import { useState } from "react";
import { BorderStyle, DocumentSize } from "@/app/models/data/StatusType";
import { generateAllHeaders } from '@/app/api/headers/generateAllHeaders';
import { SupportedData } from '@/app/models/CommonData';
import { ContentState } from "draft-js";
import { ModifiedDate } from "@/app/documents/DocType";


// Usage
initializeAppData().then(appData => {
  console.log(appData);
});

// Generate headers with the authToken
async function runApp() {
  // Initialize appData
  const appData = await initializeAppData();
  const filePath = useFilePath();
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  console.log(appData);

  // Generate headers with the authToken
  const options: CacheReadOptions<CustomApp> = {
    apiKey: appData.apiKey, // Now appData is available
    token: authToken,
    filePath: filePath,
    currentEvent: currentEvent,
  };

  // Use options here, e.g., call a function that needs it
  // await fetchData(options);
}

// Call the async wrapper
runApp();
// Example usage when calling getSnapshot
const additionalHeaders: Record<string, string> = generateAllHeaders({ additionalHeaders: { 'Custom-Header': 'value' } }, authToken);


// Usage example:
const cacheData: Partial<SupportedData> = {

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
      headerOptions: '',
      footerOptions: ''
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
    tier: "",
    token: "",
    uploadQuota: "",
    bannerUrl: "",
   
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


const writePath = '@/path/to/cache/data'; // Replace with the actual file path

writeAndUpdateCache(writePath, cacheData)
  .then(() => {
    console.log("Cache write successful");
  })
  .catch((error) => {
    console.error("Failed to write cache:", error);
  });


// Update readCache to return SupportedData<T, K, Meta>
const readCache = async <T extends BaseData<any>>(
  { filePath, currentEvent }: CacheReadOptions<T> & { currentEvent: EventAttendance | null }
): Promise<SupportedData<T, K, Meta> | undefined> => {
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
    const cacheResponse: CacheResponse<T, K, Meta<T, K>> | undefined = await fetchCacheData(filePath, dynamicCategory, foundUserName);

    if (cacheResponse) {
      // Example: Extract relevant data from cacheResponse
      const data: SupportedData<T, K, Meta> = cacheResponse.data; // Assuming cacheResponse.data is of type SupportedData<T, K, Meta>
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
      dataVersions: dataVersions ?? { frontend: {}, backend: {} },
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
      data: {}, // Adjust based on your SupportedData<T, K, Meta> structure
    };

    // Correct usage of T and M based on constraints
    const cacheResponse: CacheResponse<T, K, Meta> = {
      id: "exampleId",
      data: mockCacheData as SupportedData<T, K, Meta>, // Ensure data matches SupportedData<T, K, Meta>
    };

    // Return a Promise that resolves to the mock cache data
    return Promise.resolve<CacheResponse<T, K, Meta>>({
      id: "exampleId",
      data: cacheResponse.data as SupportedData<T, K, Meta>, // Ensure type consistency
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