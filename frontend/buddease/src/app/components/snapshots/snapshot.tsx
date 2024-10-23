// snapshot
import { addTodo, completeAllTodos, completeAllTodosFailure, completeAllTodosSuccess, fetchTodosFailure, fetchTodosSuccess, removeTodo, toggleTodo, updateTodoTitle } from '@/app/api/ApiTodo';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Signature } from "ethers";
import { LanguageEnum } from "../communications/LanguageEnum";
import { CustomTransaction } from "../crypto/SmartContractInteraction";
import { createCustomTransaction } from "../hooks/dynamicHooks/createCustomTransaction";
import { CombinedEvents, SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { ThemeEnum } from '../libraries/ui/theme/Theme';
import { BaseData, Data, DataDetails } from "../models/data/Data";
import FileData from '../models/data/FileData';
import { ProjectPhaseTypeEnum, StatusType } from "../models/data/StatusType";
import { DataStore, EventRecord } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Settings } from "../state/stores/SettingsStore";
import { Subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";
import { updateFileMetadata } from '../utils/fileUtils';
import { createBaseSnapshot } from "./createBaseSnapshot";
import { getCurrentSnapshotStoreOptions, isSnapshot, isSnapshotsArray } from './createSnapshotStoreOptions';
import {
    CoreSnapshot,
    Payload,
    Snapshot,
    Snapshots,
    SnapshotsArray,
    SnapshotUnion,
    UpdateSnapshotPayload
} from "./LocalStorageSnapshotStore";
import { refreshUI, refreshUIForFile } from './refreshUI';
import { SnapshotConfigProps } from './SnapshotConfigProps';
import {
    defaultAddDataStatus,
    defaultAddDataSuccess,
    defaultRemoveData,
    defaultTransformDelegate,
    defaultUpdateData,
    defaultUpdateDataDescription,
    defaultUpdateDataStatus,
    defaultUpdateDataTitle,
} from "./snapshotDefaults";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from './SnapshotStoreConfig';
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";
 
import { BaseConfig } from '@/app/configs/BaseConfig';
import { action } from 'mobx';
import { IHydrateResult } from 'mobx-persist';
import { any } from 'prop-types';
import { SnapshotData } from '.';
import { SnapshotWithData } from '../calendar/CalendarApp';
import useDocumentManagement from '../documents/useDocumentManagement';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import exportTasksToCSV from '../hooks/dataHooks/exportTasksToCSV';
import { InitializedDataStore } from '../hooks/SnapshotStoreOptions';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { getTrackers } from '../models/tasks/GetTracker';
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { updateTaskAssignee, updateTaskDescription, updateTaskDueDate, updateTaskPriority, updateTaskTitle } from '../state/redux/slices/ContentSlice';
import { updateTaskStatus } from '../state/redux/slices/TaskSlice';
import { addTracker, removeTracker } from '../state/redux/slices/TrackerSlice';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationTypeEnum } from '../support/NotificationContext';
import { convertSnapshotToMap } from '../typings/YourSpecificSnapshotType';
import useSecureStoreId from '../utils/useSecureStoreId';
import { SnapshotActionType } from './SnapshotActionType';
import { SnapshotConfig } from './SnapshotConfig';
import { SnapshotContainer } from './SnapshotContainer';
import { SnapshotEvents } from './SnapshotEvents';
import { SnapshotItem } from './SnapshotList';
import { SnapshotWithCriteria } from './SnapshotWithCriteria';
import { Callback } from './subscribeToSnapshotsImplementation';
import { SnapshotStoreProps } from './useSnapshotStore';
import { Meta } from '../models/data/dataStoreMethods';

// A type guard to check if an object is of type CombinedEvents<T, Meta, K>
function isCombinedEvents<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(events: any): events is CombinedEvents<T, Meta, K> {
  return (
    typeof events === "object" &&
    'records' in events &&
    'event' in events &&
    'unsubscribeDetails' in events &&
    'callback' in events
  );
}

function isSnapshotStoreConfig<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  obj: any
): obj is SnapshotStoreConfig<T, Meta, K> {
  return (
    obj &&
    typeof obj === "object" &&
    'tempData' in obj &&
    'configProperty' in obj // You can add any necessary checks for properties here
  );
}


// Define T as a generic type parameter
function processSnapshot<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(snapshot: Snapshot<T, Meta, K>) {
  // Example usage of the Snapshot interface
  const newSnapshot: Snapshot<T, Meta, K> = {
    ...snapshot,
    transformDelegate: snapshot.transformDelegate || defaultTransformDelegate,
    initializedState: snapshot.initializedState || null,
    getAllKeys: snapshot.getAllKeys || (() => []),
    getAllItems: snapshot.getAllItems || (() => new Map<string, T>()),
    addDataStatus: (id, status) => defaultAddDataStatus(id, status, snapshot),
    
    removeData: (id) => defaultRemoveData(id, snapshot),
    updateData: (id, newData) => defaultUpdateData(id, newData, snapshot),
    updateDataTitle: (id, title) => defaultUpdateDataTitle(id, title, snapshot),
    updateDataDescription: (id, description) => defaultUpdateDataDescription(id, description, snapshot),
    updateDataStatus: (id, status) => defaultUpdateDataStatus(id, status, snapshot),
    addDataSuccess: (payload) => defaultAddDataSuccess(payload, snapshot),
    id: snapshot.id || "snapshot1",
    category: snapshot.category || "example category",
    timestamp: snapshot.timestamp || new Date(),
    createdBy: snapshot.createdBy || "creator1",
    description: snapshot.description || "Sample snapshot description",
    tags: snapshot.tags || ["sample", "snapshot"],
    metadata: snapshot.metadata || {},
    data: snapshot.data || new Map<string, Snapshot<T, Meta, K>>(),
    initialState: snapshot.initialState || null,
    events: snapshot.events && isCombinedEvents(snapshot.events) 
    ? snapshot.events 
    : undefined, // or use a default value that fits `CombinedEvents<T, Meta, K>`
    
    // Snapshot interface with type guard
    snapshotStoreConfig: isSnapshotStoreConfig<T, Meta, K>(snapshot.snapshotStoreConfig)
    ? snapshot.snapshotStoreConfig
    : (Array.isArray(snapshotStoreConfigInstance) && snapshotStoreConfigInstance.length > 0 && isSnapshotStoreConfig<T, Meta, K>(snapshotStoreConfigInstance[0])
        ? snapshotStoreConfigInstance[0]
        : null),
    getSnapshotItems: snapshot.getSnapshotItems || (() => []), // Replace with actual function
    defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots || (() => {}), // Replace with actual function
    transformSubscriber: snapshot.transformSubscriber || ((sub: Subscriber<T, Meta, K>) => {
      // Transform subscriber here

      return sub;
    }),
    // Add other properties as needed
  };

  // Usage example
  console.log(newSnapshot);
}



const plainDataObject: Record<string, Data> = {
  "1": {
    _id: "1",
    id: "data1",
    title: "Sample Data",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
    scheduled: true,
    status: "Pending",
    notificationsEnabled: true,
    isActive: true,
    tags: {
      "1": {
        id: "1",
        name: "Sample tag",
        color: "#000000",
        relatedTags: ["tag1", "tag2"],
      }
    },
    phase: {
      id: "phase1",
      name: "Sample Phase",
      description: "Sample description",
      type: "Ideation",
      status: "Pending",
      tags: {
        "1": {
          id: "1",
          name: "Sample tag",
          color: "#000000",
          relatedTags: ["Important"]
        }
      },

      startDate: new Date(),
      endDate: new Date(),
      subPhases: [],
      component: {} as React.FC<any>,
      duration: 0,
      hooks: {
        onInit: () => { },
        onMount: () => { },
        onUnmount: () => { },
        onPhaseChange: () => { },
        onPhaseCompletion: () => { },
        onPhaseCreation: () => { },
        onPhaseDeletion: () => { },
        onPhaseUpdate: () => { },
        onPhaseMove: () => { },
        onPhaseDueDateChange: () => { },
        onPhasePriorityChange: () => { },
        onPhaseAssigneeChange: () => { },

        resetIdleTimeout: async () => { },
        isActive: false,
        progress: {
          id: "",
          value: 0,
          label: "",
          current: 0,
          max: 0,
          min: 0,
          percentage: 0,
          color: "",
          name: "",
          description: "",
          done: false,
        },
        condition: async (idleTimeoutDuration: number) => {
          return true;
        },
      },
    },
    phaseType: ProjectPhaseTypeEnum.Ideation,
    dueDate: new Date(),
    priority: "High",
    assignee: {
      id: "assignee1",
      username: "Assignee Name",
    } as User,
    collaborators: ["collab1", "collab2"],
    comments: [],
    attachments: [],
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "creator1",
    updatedBy: "updater1",
    analysisResults: [],
    audioUrl: "sample-audio-url",
    videoUrl: "sample-video-url",
    videoThumbnail: "sample-thumbnail-url",
    videoDuration: 60,
    collaborationOptions: [],
    videoData: {
      id: "video1",
      campaignId: 123,
      resolution: "1080p",
      size: "100MB",
      aspectRatio: "16:9",
      language: "en",
      subtitles: [],
      duration: 60,
      createdBy: "John Doe",
      codec: "H.264",
      frameRate: 30,
      url: "",
      thumbnailUrl: "",
      uploadedBy: "",
      viewsCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      title: "",
      description: "",
      tags: {},
      createdAt: new Date(),
      uploadedAt: new Date(),
      updatedAt: new Date(),
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 60,
      uploadDate: new Date(),
      videoLikes: 20,
      videoViews: 0,
      videoComments: 0,
      videoThumbnail: "",
      videoUrl: "",
      videoTitle: "",
      thumbnail: "",
      videoDescription: "",
      videoTags: [],
      videoSubtitles: [],
      category: "",
      closedCaptions: [],
      license: "",
      isLive: false,
      isPrivate: false,
      isUnlisted: false,
      isProcessingCompleted: false,
      isProcessingFailed: false,
      isProcessingStarted: false,
      channel: "",
      channelId: "",
      isLicensedContent: false,
      isFamilyFriendly: false,
      isEmbeddable: false,
      isDownloadable: false,
      playlists: [],
      isDeleting: false,
      isCompleted: false,
      isUploading: false,
      isDownloading: false,
      isProcessing: false,
    },
    additionalData: {},
    ideas: [],
    members: [],
    leader: {
      id: "leader1",
      username: "Leader Name",
      email: "leader@example.com",
      fullName: "Leader Full Name",
      bio: "Leader Bio",
      userType: "Admin",
      hasQuota: true,
      tier: "0",
      token: "leader-token",
      uploadQuota: 100,
      usedQuota: 50,
      avatarUrl: "avatar-url",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isAdmin: false,
      isActive: true,
      profilePicture: null,
      processingTasks: [],
      role: UserRoles.TeamLeader,
      firstName: "",
      lastName: "",
      friends: [],
      blockedUsers: [],
      followers: [],
      preferences: {
        id: "",
        name: "",
        phases: [],
        trackFileChanges: (file: FileData): FileData => {
          // Example: Log the change and update a last modified timestamp
          console.log(`File ${file.name} has changed.`);
      
          // Update file metadata
          updateFileMetadata(String(file.id), {
            lastModified: new Date(),
          });
      
          // Trigger any other necessary updates, like refreshing the UI
          refreshUIForFile(Number(file.id));
      
          // Return the file to satisfy the FileData return type
          return file;
        },
      
        // Define initial values for stroke, strokeWidth, etc.
        stroke: {
          width: 1,
          color: "#000000"
        },
        strokeWidth: 1, // Default stroke width (1px)
        fillColor: "#FFFFFF", // Default fill color (white)
        flippedX: false, // Indicates if the element is flipped horizontally
        flippedY: false, // Indicates if the element is flipped vertically
        x: 0, // X position
        y: 0, // Y position
      
        // Logic for handling updates to these properties
        updateAppearance: function (updates: {
          stroke: {
            width: number;
            color: string;
          };
          strokeWidth?: number;
          fillColor?: string;
          flippedX?: boolean;
          flippedY?: boolean;
          x?: number;
          y?: number;
        }) {
          // Apply updates to each property if provided
          if (updates.stroke !== undefined) {
            this.stroke = updates.stroke;
          }
          if (updates.strokeWidth !== undefined) {
            this.strokeWidth = updates.strokeWidth;
          }
          if (updates.fillColor !== undefined) {
            this.fillColor = updates.fillColor;
          }
          if (updates.flippedX !== undefined) {
            this.flippedX = updates.flippedX;
          }
          if (updates.flippedY !== undefined) {
            this.flippedY = updates.flippedY;
          }
          if (updates.x !== undefined) {
            this.x = updates.x;
          }
          if (updates.y !== undefined) {
            this.y = updates.y;
          }
      
          // Trigger a UI refresh or further processing
          refreshUI(updates);
        },
      
        // A placeholder function to refresh UI or re-render the affected elements
        refreshUI: function () {
          console.log("UI refreshed with the following properties:");
          console.log(`Stroke: ${this.stroke}`);
          console.log(`Stroke width: ${this.strokeWidth}px`);
          console.log(`Fill color: ${this.fillColor}`);
          console.log(`FlippedX: ${this.flippedX}`);
          console.log(`FlippedY: ${this.flippedY}`);
          console.log(`Position (X, Y): (${this.x}, ${this.y})`);
        }
      },
      persona: new Persona(PersonaTypeEnum.Default),
      settings: {
        id: "",
        filter: (key: keyof Settings) => { },
        appName: "buddease",
        userId: 123,
        userSettings: setTimeout(() => { }, 1000), // Example timeout
        communicationMode: "email",
        enableRealTimeUpdates: true,
        defaultFileType: "pdf",
        allowedFileTypes: ["pdf", "docx", "txt"],
        enableGroupManagement: true,
        enableTeamManagement: true,
        idleTimeout: undefined,

        calendarEvents: [],
        todos: [],
        tasks: [],
        snapshotStores: [],
        
        currentPhase: "",
        comment: "",
        browserCheckStore: {
          browserKey:"",
          dispatch: (action: any) => {},
          init: (key: string) => {},
          testDispatch: (action: any) => {},
         
        },
        trackerStore: {
          trackers:"",
          addTracker:"",
          getTracker:"",
          getTrackers:"",
          
          removeTracker:"",
          dispatch:"",
          removeTodo:"",
          assignTodoToUser:"",
          updateTodoTitle:"",
          fetchTodosSuccess:"",
          
        },
        
        todoStore: {
          dispatch: "",
          todos: "",
          todoList: "",
          toggleTodo: "",
         
          addTodo: "",
          loading: "",
          error: "",
          addTodos: "",
         
          removeTodo: "",
          assignTodoToUser: "",
          updateTodoTitle: "",
          fetchTodosSuccess: "",
          
          fetchTodosFailure: "",
          openTodoSettingsPage: "",
          getTodoId: "",
          getTeamId: "",
         
          fetchTodosRequest: "",
          completeAllTodosSuccess: "",
          completeAllTodos: "",
          completeAllTodosFailure: "",
         

        },
        taskManagerStore: {
          tasks, taskTitle, taskDescription, taskStatus,
          assignedTaskStore, updateTaskTitle, updateTaskDescription, updateTaskStatus, 
          updateTaskDueDate, updateTaskPriority, filterTasksByStatus, getTaskCountByStatus,
          clearAllTasks, archiveCompletedTasks, updateTaskAssignee, getTasksByAssignee,
          getTaskById, sortByDueDate, exportTasksToCSV, dispatch, 
        },
        iconStore: {
          dispatch
        },
        calendarStore: {
          openScheduleEventModal, openCalendarSettingsPage, getData, updateDocumentReleaseStatus,
          getState, action, events, eventTitle, eventDescription, eventStatus, assignedEventStore, snapshotStore,
        },
        
        endpoints: {},
        highlights: [],
        results: [],
        totalCount: 0,
        searchData: {
          results, totalCount,
        },
       

        startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
          // Example implementation
          setTimeout(onTimeout, timeoutDuration);
        },
        idleTimeoutDuration: 60000, // 1 minute
        activePhase: "development",
        realTimeChatEnabled: true,
        todoManagementEnabled: true,
        notificationEmailEnabled: true,
        analyticsEnabled: true,
        twoFactorAuthenticationEnabled: true,
        projectManagementEnabled: true,
        documentationSystemEnabled: true,
        versionControlEnabled: true,
        userProfilesEnabled: true,
        accessControlEnabled: true,
        taskManagementEnabled: true,
        loggingAndNotificationsEnabled: true,
        securityFeaturesEnabled: true,
        collaborationPreference1: "Option 1",
        collaborationPreference2: "Option 2",
        theme: ThemeEnum.LIGHT,
        language: LanguageEnum.English, // Example language
        fontSize: 14,
        darkMode: false,
        enableEmojis: true,
        enableGIFs: true,
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: "ding.wav", // Example sound file
        timeZone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        defaultProjectView: "list",
        taskSortOrder: "priority",
        showCompletedTasks: true,
        projectColorScheme: "blue",
        showTeamCalendar: true,
        teamViewSettings: [],
        defaultTeamDashboard: "overview",
        passwordExpirationDays: 90,
        privacySettings: [], // Example privacy settings
        thirdPartyApiKeys: {
          google: "your-google-api-key",
          facebook: "your-facebook-api-key",
        },
        externalCalendarSync: true,
        dataExportPreferences: [],
        dashboardWidgets: [],
        customTaskLabels: [],
        customProjectCategories: [],
        customTags: [],
        additionalPreference1: "Option A",
        additionalPreference2: "Option B",
        formHandlingEnabled: true,
        paginationEnabled: true,
        modalManagementEnabled: true,
        sortingEnabled: true,
        notificationSoundEnabled: true,
        localStorageEnabled: true,
        clipboardInteractionEnabled: true,
        deviceDetectionEnabled: true,
        loadingSpinnerEnabled: true,
        errorHandlingEnabled: true,
        toastNotificationsEnabled: true,
        datePickerEnabled: true,
        themeSwitchingEnabled: true,
        imageUploadingEnabled: true,
        passwordStrengthEnabled: true,
        browserHistoryEnabled: true,
        geolocationEnabled: true,
        webSocketsEnabled: true,
        dragAndDropEnabled: true,
        idleTimeoutEnabled: true,
        enableAudioChat: true,
        enableVideoChat: true,
        enableFileSharing: true,
        enableBlockchainCommunication: true,
        enableDecentralizedStorage: true,
        selectDatabaseVersion: "latest",
        selectAppVersion: "2.0",
        enableDatabaseEncryption: true,
      },
      interests: [],
      privacySettings: {
        hidePersonalInfo: true,
        enablePrivacyMode: false,
        enableTwoFactorAuth: true,
        restrictVisibilityToContacts: false,
        restrictFriendRequests: false,
        hideOnlineStatus: false,
        showLastSeenTimestamp: true,
        allowTaggingInPosts: true,
        enableLocationPrivacy: true,
        hideVisitedProfiles: true,
        restrictContentSharing: true,
        enableIncognitoMode: false,
        restrictContentSharingToContacts: false,
        restrictContentSharingToGroups: false,
        isDataSharingEnabled: true,
        thirdPartyTracking: false,
        dataSharing: {
          sharingLevel: "", sharingScope: "", sharingOptions: [], allowSharing: true,
          allowSharingWith: [],
          allowSharingWithTeams: [], 
          allowSharingWithGroups: [],
          allowSharingWithPublic: false,
          allowSharingWithTeamsAndGroups: false,
          allowSharingWithPublicAndTeams: false,
          allowSharingWithPublicAndGroups: false,
          allowSharingWithPublicAndTeamsAndGroups: false,
          
          allowSharingWithPublicAndTeamsAndGroupsAndPublic: false,
          allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: false,
        


          isAllowingSharingWithPublic: [],
          isAllowingingSharingWithTeamsAndGroups: [],
          isAllowingSharingWithPublicAndTeamsAndGroups: [],
          isAllowingingSharingWithPublicAndTeams: [],
          isAllowingSharingWithPublicAndTeamsAndGroupsAndPublic: [],
          isAllowingSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: [],
          isAllowingSharingWithTeamsAndGroups: [],
          
          isAllowingSharingingWithPublicAndTeamsAndGroups: [],
          isAllowingSharingWithPublicAndTeams: [],
          
          enableDatabaseEncryption: true,
          sharingOptions?: [], // Define additional sharing options if needed
          sharingPreferences: {}, // Define additional sharing preferences
          allowSharingWithPublicAndTeams: , // Allows sharing with public and teams
          allowSharingWithPublicAndGroups: , // Allows sharing with public and groups
          allowSharingWithPublicAndTeamsAndGroups: , // Allows sharing with public, teams, and groups
          allowSharingWithPublicAndTeamsAndGroupsAndPublic: , // Or other sharing options if needed
          allowSharingWithPublicAndTeamsAndGroupsAndPublicAndTeamsAndGroups: , // Or other sharing options if needed

        },
      },
      notifications: {
        channels: {
          email: true,
          push: true,
          sms: true,
          
          chat: true,
          calendar: true,
          audioCall: false,
          videoCall: false,
          screenShare: false,
        
        },
        types: [],
        enabled: true,
        notificationType: "push",
      },
      activityLog: [
        {
          id: "",
          activity: "",
          action: "Logged in",
          timestamp: new Date(),
        },
        {
          id: "",
          activity: "",
          action: "Updated profile",
          timestamp: new Date(),
        },
      ],
      socialLinks: {
        facebook: "https://facebook.com/leader",
        twitter: "https://twitter.com/leader",
        website: "https://website.com/leader",
        linkedin: "https://linkedin.com/leader",
        instagram: "https://finstagram.com/leader",
      },
      relationshipStatus: "Single",
      hobbies: ["Reading", "Traveling"],
      skills: ["Project Management", "Software Development"],
      achievements: ["Completed 100 projects", "Employee of the Month"],
      profileVisibility: "Public",
      profileAccessControl: {
        friendsOnly: true,
        allowTagging: true,
        blockList: [],
        allowMessagesFromNonContacts: true,
        shareProfileWithSearchEngines: false,
        isPrivate: false,
        isPrivateOnly: false,
        isPrivateOnlyForContacts: false,
        isPrivateOnlyForGroups: false,
      },
      activityStatus: "Online",
      isAuthorized: true,
      notificationPreferences: {
        mobile: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: ""
        },
        desktop: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: ""
        },
        tablet: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: ""
        },
        desktopNotifications: false,
        emailNotifications: true,
        pushNotifications: true,
        enableNotifications: true,
        notificationSound: "birds",
        notificationVolume: 50,
        smsNotifications: false,
        customNotificationSettings: {
          email: false,
          sms: false,
          pushNotifications: false,
          desktopNotifications: false,
          emailFrequency: "",
          smsFrequency: ""
        },
        cryptoPreferences: {
          // List of preferred cryptocurrencies
          preferredCryptoAssets: [],
          tradeNotifications: {
            enabled: true, // Whether trade notifications are enabled
            notificationTypes: 'priceAlerts', // Use NotificationTypeString here
          },
          portfolioView: 'overview', // View mode for the crypto portfolio
          // transactionHistory: "",
          transactionHistoryRetention: '30days'
        }
      },
        securitySettings: {
          securityQuestions: ["What is your pet's name?"],
          twoFactorAuthentication: false,
          passwordPolicy: "StandardPolicy",
          passwordExpirationDays: 90,
          passwordStrength: "Strong",
          passwordComplexityRequirements: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireDigits: true,
            requireSpecialCharacters: false,
          },
          accountLockoutPolicy: {
            enabled: true,
            maxFailedAttempts: 5,
            lockoutDurationMinutes: 15,
          },
          accountLockoutThreshold: 50, //todo create way reset threshod
        },
        emailVerificationStatus: true,
        phoneVerificationStatus: true,
        walletAddress: "0x123456789abcdef",
        transactionHistory: [
          createCustomTransaction({
            id: "tx1",
            amount: 100,
            date: new Date(),
            description: "Sample transaction",
            type: null,
            typeName: null,
            to: null,
            nonce: 0,
            gasLimit: BigInt(0),
            gasPrice: null,
            maxPriorityFeePerGas: null,
            maxFeePerGas: null,
            data: "",
            value: BigInt(0),
            chainId: BigInt(0),
            signature: null,
            accessList: [],
            maxFeePerBlobGas: null,
            blobVersionedHashes: null,
            hash: null,
            unsignedHash: "",
            from: null,
            fromPublicKey: null,
            isSigned(): boolean {
              return !!(
                this.type &&
                this.typeName &&
                this.from &&
                this.signature
              );
            },
            serialized: "",
            unsignedSerialized: "",
            inferType(): number {
              if (this.type !== null && this.type !== undefined) {
                return this.type;
              }
              return 0;
            },
            inferTypes(): number[] {
              const types: number[] = [];
              if (this.type !== null && this.type !== undefined) {
                types.push(this.type);
              }
              if (this.maxFeePerGas !== null &&
                this.maxPriorityFeePerGas !== null) {
                types.push(2);
              }
              if (types.length === 0) {
                types.push(0);
              }
              return types;
            },
            isLegacy() {
              return this.type === 0 && this.gasPrice !== null;
            },
            isBerlin() {
              return (
                this.type === 1 &&
                this.gasPrice !== null &&
                this.accessList !== null
              );
            },
            isLondon() {
              return (
                this.type === 2 &&
                this.accessList !== null &&
                this.maxFeePerGas !== null &&
                this.maxPriorityFeePerGas !== null
              );
            },
            isCancun() {
              return (
                this.type === 3 &&
                this.to !== null &&
                this.accessList !== null &&
                this.maxFeePerGas !== null &&
                this.maxPriorityFeePerGas !== null &&
                this.maxFeePerBlobGas !== null &&
                this.blobVersionedHashes !== null
              );
            },
            clone(): CustomTransaction {
              const clonedData: CustomTransaction = {
                _id: this._id as string,
                id: this.id as string,
                amount: this.amount,
                date: this.date as Date,
                title: this.title as string,
                value: this.value as bigint,
                description: this.description || "",
                startDate: this.startDate ? new Date(this.startDate) : undefined,
                endDate: this.endDate ? new Date(this.endDate) : undefined,
                isSigned: typeof this.isSigned === "function"
                  ? this.isSigned.bind(this)
                  : this.isSigned,
                serialized: this.serialized,
                unsignedSerialized: this.unsignedSerialized,
                nonce: this.nonce as number,
                gasLimit: this.gasLimit as bigint,
                chainId: this.chainId,
                hash: this.hash,
                type: this.type as number,
                typeName: this.typeName || "",
                data: this.data || "",
                unsignedHash: this.unsignedHash || "",
                to: this.to,
                gasPrice: this.gasPrice as bigint,
                maxFeePerGas: this.maxFeePerGas as bigint,
                maxPriorityFeePerGas: this.maxPriorityFeePerGas as bigint,
                signature: this.signature as Signature,
                accessList: this.accessList,
                maxFeePerBlobGas: this.maxFeePerBlobGas as bigint,
                blobVersionedHashes: this.blobVersionedHashes as string,
                from: this.from as string,
                fromPublicKey: this.fromPublicKey,
                isLegacy: typeof this.isLegacy === "function"
                  ? this.isLegacy.bind(this)
                  : this.isLegacy,
                isBerlin: typeof this.isBerlin === "function"
                  ? this.isBerlin.bind(this)
                  : this.isBerlin,
                isLondon: typeof this.isLondon === "function"
                  ? this.isLondon.bind(this)
                  : this.isLondon,
                isCancun: typeof this.isCancun === "function"
                  ? this.isCancun.bind(this)
                  : this.isCancun,
                inferType: typeof this.inferType === "function"
                  ? this.inferType.bind(this)
                  : this.inferType,
                inferTypes: typeof this.inferTypes === "function"
                  ? this.inferTypes.bind(this)
                  : this.inferTypes,
                clone: typeof this.clone === "function" ? this.clone : this.clone,

                equals: function (
                  this: CustomTransaction,
                  data: CustomTransaction
                ): boolean {
                  return (
                    this.id === data.id &&
                    this._id === data._id &&
                    this.title === data.title &&
                    this.amount === data.amount &&
                    this.date?.getTime() === data.date?.getTime() &&
                    this.description === data.description &&
                    this.startDate?.getTime() === data.startDate?.getTime() &&
                    this.endDate?.getTime() === data.endDate?.getTime() &&
                    this.serialized === data.serialized &&
                    this.unsignedSerialized === data.unsignedSerialized &&
                    this.accessList === data.accessList &&
                    this.to === data.to &&
                    this.nonce === data.nonce &&
                    this.gasLimit === data.gasLimit &&
                    this.gasPrice === data.gasPrice &&
                    this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
                    this.maxFeePerGas === data.maxFeePerGas &&
                    this.type === data.type &&
                    this.data === data.data &&
                    this.value === data.value &&
                    this.chainId === data.chainId &&
                    this.signature === data.signature &&
                    this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
                    this.blobVersionedHashes === data.blobVersionedHashes &&
                    this.hash === data.hash &&
                    this.unsignedHash === data.unsignedHash &&
                    this.from === data.from &&
                    this.fromPublicKey === data.fromPublicKey
                    //if ther eare any new props ensure to add && above after the ast value
                    // Check other properties as needed
                    // Add checks for other properties here
                  );
                },
                getSubscriptionLevel: function (this: CustomTransaction) {
                  return "Pro";
                },
                getRecentActivity: function (this: CustomTransaction) {
                  return [
                    { action: "Created snapshot", timestamp: new Date() },
                    { action: "Edited snapshot", timestamp: new Date() },
                  ];
                },
                notificationsEnabled: true,
                recentActivity: [
                  { action: "Created snapshot", timestamp: new Date() },
                  { action: "Edited snapshot", timestamp: new Date() },
                ],
              };
              return clonedData;
            },
            equals(data: CustomTransaction) {
              const isSigned = typeof this.isSigned === "function"
                ? this.isSigned()
                : this.isSigned;
              const dataIsSigned = typeof data.isSigned === "function"
                ? data.isSigned()
                : data.isSigned;
              const isCancun = typeof this.isCancun === "function"
                ? this.isCancun()
                : this.isCancun;
              const dataIsCancun = typeof data.isCancun === "function"
                ? data.isCancun()
                : data.isCancun;
              const isLegacy = typeof this.isLegacy === "function"
                ? this.isLegacy()
                : this.isLegacy;
              const dataIsLegacy = typeof data.isLegacy === "function"
                ? data.isLegacy()
                : data.isLegacy;
              const isBerlin = typeof this.isBerlin === "function"
                ? this.isBerlin()
                : this.isBerlin;
              const dataIsBerlin = typeof data.isBerlin === "function"
                ? data.isBerlin()
                : data.isBerlin;
              const isLondon = typeof this.isLondon === "function"
                ? this.isLondon()
                : this.isLondon;
              const dataIsLondon = typeof data.isLondon === "function"
                ? data.isLondon()
                : data.isLondon;

              return (
                this.id === data.id &&
                this.amount === data.amount &&
                this.date?.getTime() === data.date?.getTime() &&
                this.description === data.description &&
                this.nonce === data.nonce &&
                this.gasLimit === data.gasLimit &&
                this.gasPrice === data.gasPrice &&
                this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
                this.maxFeePerGas === data.maxFeePerGas &&
                this.data === data.data &&
                this.value === data.value &&
                this.chainId === data.chainId &&
                this.from === data.from &&
                this.fromPublicKey === data.fromPublicKey &&
                this.to === data.to &&
                this.type === data.type &&
                this.typeName === data.typeName &&
                this.serialized === data.serialized &&
                this.unsignedSerialized === data.unsignedSerialized &&
                this.accessList?.length === data.accessList?.length &&
                this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
                this.blobVersiHashes === data.blobVersionedHashes &&
                (isSigned ?? false) === (dataIsSigned ?? false) &&
                (isCancun ?? false) === (dataIsCancun ?? false) &&
                (isLegacy ?? false) === (dataIsLegacy ?? false) &&
                (isBerlin ?? false) === (dataIsBerlin ?? false) &&
                (isLondon ?? false) === (dataIsLondon ?? false)
              );
            },
            recentActivity: [
              {
                action: "Logged in",
                timestamp: new Date(),
              },
              {
                action: "Updated profile",
                timestamp: new Date(),
              },
            ],
          }),
        ],
    },
  }
}


const category = "yourCategory"; // Define as necessary
const documentManager = useDocumentManagement()




const baseconfig: BaseConfig<BaseData, Meta, BaseData> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
  metadata: {},
   // Ensure these properties are correctly initialized based on your requirements
   apiEndpoint: "https://api.example.com", // Initialize with your actual API endpoint
   apiKey: "your_api_key", // Your API key
   timeout: 5000, // Timeout in milliseconds
   retryAttempts: 3, // Number of retry attempts
   name: "Base Snapshot", // Initialize name as needed
   initialState: undefined, // If there's no initial state, you can leave it as undefined
   meta: new Map<string, Snapshot<BaseData, Meta, BaseData>>(), // Initialize meta as a new Map
  events: {
     eventRecords: {},
  },
}


const snapshot: Snapshot<BaseData, Meta, BaseData> ={
  ...baseconfig,

}

const snapshotConfig: SnapshotConfig<BaseData, Meta, BaseData> = {
  ...baseconfig,
  data: {
    id: "data1",
    title: "Data Title",
    // Add other BaseData properties if needed
  },
  initialState: undefined,
  
  meta: new Map<string, Snapshot<BaseData, Meta, BaseData>>(),
  events: {
    event: "created event",
    unsubscribeDetails: {
      userId: "user1", // Sample user ID
      snapshotId: "snapshot1",
      unsubscribeType: "type1",
      unsubscribeDate: new Date(),
      unsubscribeReason: "reason",
      unsubscribeData: null,
    },
    subscribers: [],
    eventIds: [],
    callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => { },
    eventRecords: {
      "created": [
        {
          action: "Created snapshot",
          timestamp: new Date(),
          record: new CalendarManagerStoreClass<BaseData, Meta, BaseData>(category, documentManager),
          callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => {
            console.log("Snapshot created:", snapshot);
          },
          // Add other BaseData properties if needed
        },
      ],
      "updated": [
        {
          action: "Updated snapshot",
          timestamp: new Date(),
          record: new CalendarManagerStoreClass<BaseData, Meta, BaseData>(category, documentManager),
          callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => {
            console.log("Snapshot updated:", snapshot);
          },
          // Add other BaseData properties if needed
        },
      ],
    },

    trigger: (
      event: string | CombinedEvents<BaseData, Meta, BaseData> | SnapshotEvents<BaseData, Meta, BaseData>,
      snapshot: Snapshot<BaseData, Meta, BaseData>,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, Meta, BaseData>,
      type: string,
      snapshotData: SnapshotData<BaseData, Meta, BaseData>
    ) => {
      // Implement your trigger logic here
    },
  
    on: (
      event: string | CombinedEvents<BaseData, Meta, BaseData> | SnapshotEvents<BaseData, Meta, BaseData>,
      // event: string,
      callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, Meta, BaseData>,
      type: string,
      snapshotData: SnapshotData<BaseData, Meta, BaseData>
    ) => {
      // Implement your on logic here
    },
    off: (
      // event: string | CombinedEvents<BaseData, Meta, BaseData> | SnapshotEvents<BaseData, Meta, BaseData>,
      event: string,
      callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, Meta, BaseData>,
      type: string,
      snapshotData: SnapshotData<BaseData, Meta, BaseData>,
      unsubscribeDetails?: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      },
    ) => {
      // Implement your off logic here
    },
    emit: (
      //todo update to use 
      // event: string | CombinedEvents<BaseData, Meta, BaseData> | SnapshotEvents<BaseData, Meta, BaseData>,
      event: string,
      snapshot: Snapshot<BaseData, Meta, BaseData>,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, Meta, BaseData>,
      type: string,
      snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<BaseData, Meta, BaseData>,
      category: Category,
      snapshotData: SnapshotData<BaseData, Meta, BaseData>
    ) => {
      // Implement your emit logic here
    },
    
    initialConfig: {} as SnapshotConfig<BaseData, Meta, BaseData>,
    records: {} as Record<string, CalendarManagerStoreClass<BaseData, Meta, BaseData>[]>,
    onInitialize: () => { },
    subscribe: (
      event: string,
      callback: (snapshot: Snapshot<BaseData, Meta, BaseData>) => void
    ) => { },
    callbacks: {
      default: [(snapshot: Snapshot<BaseData, Meta, BaseData>) => {
        // Convert Snapshot<T, Meta, K> to a format that can be used with Snapshots<T, Meta>
        const snapshotsMap = convertSnapshotToMap(snapshot);
        
        // Assuming convertSnapshotToMap returns a Map or similar structure
        // If Snapshots<T, Meta> is a Map, this will be appropriate
        const snapshots: Map<string, any> = snapshotsMap;
    
        // Return the appropriate result or handle the snapshots as needed
        return snapshots;
      }]
    },
  },

  equals: function (data: Snapshot<BaseData, Meta, BaseData>) {

    if (this.tags === undefined || this.data === null || this.data === undefined) {
      throw new Error("Can't find tags or data");
    }

      return (
        this.id === data.id &&
        this.category === data.category &&
        (this.timestamp instanceof Date && data.timestamp instanceof Date
          ? this.timestamp.getTime() === data.timestamp.getTime()
          : this.timestamp === data.timestamp) &&
        this.createdBy === data.createdBy &&
        this.description === data.description &&
        this.tags.length === (data.tags?.length ?? 0) &&
        this.metadata === data.metadata &&
        ('id' in this.data && data.data && 'id' in data.data ? this.data.id === data.data.id : true) &&
        ('title' in this.data && data.data && 'title' in data.data ? this.data.title === data.data.title : true) &&
        this.initialState === data.initialState &&
        (this.meta instanceof Map && data.meta instanceof Map ? this.meta.size === data.meta.size : true) &&
        (
          this.events &&
          data.events &&
          this.events.eventRecords &&
          data.events.eventRecords &&
          typeof this.events.eventRecords === 'object' &&
          typeof data.events.eventRecords === 'object' &&
          Object.keys(this.events.eventRecords).length === Object.keys(data.events.eventRecords).length &&
          Object.keys(this.events.eventRecords).every((key: string) => {
            const thisRecords = this.events!.eventRecords![key]
            const dataRecords = data.events!.eventRecords![key]
  
            if (!dataRecords || thisRecords.length !== dataRecords.length) {
              return false;
            }
  
            return thisRecords.every((record: EventRecord<BaseData, Meta, BaseData>, index: number) => {
              const dataRecord = dataRecords[index];
              if (!dataRecord) return false;
  
              const isActionEqual = record.action === dataRecord.action;
              const isTimestampEqual = (record.timestamp instanceof Date && dataRecord.timestamp instanceof Date)
                ? record.timestamp.getTime() === dataRecord.timestamp.getTime()
                : record.timestamp === dataRecord.timestamp;
  
              return isActionEqual && isTimestampEqual;
            });
          })
        )
      );
    },
    recentActivity: [
      {
        action: "Logged in",
        timestamp: new Date(),
      },
      {
        action: "Updated profile",
        timestamp: new Date(),
      },
      {
        action: "Created snapshot",
        timestamp: new Date(),
      },
      {
        action: "Updated snapshot",
        timestamp: new Date(),
      },
      {
        action: "Logged out",
        timestamp: new Date(),
      }


    ] as { action: string; timestamp: Date }[],
  } as const


async function createDataObject(
  plainDataObject: Record<string, BaseData>,
  baseData: BaseData,
  baseMeta: Map<string, Snapshot<BaseData, Meta, BaseData>>
): Promise<Map<string, Snapshot<BaseData, Meta, BaseData>>> {
  // Create an array of promises for the snapshot creation
  const snapshotPromises = Object.entries(plainDataObject).map(
    async ([key, value]) => {
      const snapshot = await createBaseSnapshot(baseData, baseMeta);
      return [key, snapshot.data] as [string, Snapshot<BaseData, Meta, BaseData>];
    }
  );

  // Wait for all promises to resolve
  const resolvedEntries = await Promise.all(snapshotPromises);

  // Create a Map from the resolved entries
  return new Map<string, Snapshot<BaseData, Meta, BaseData>>(resolvedEntries);
}


const getCurrentSnapshot = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string, // ID of the snapshot to retrieve
  storeId: number,
  additionalHeaders?: Record<string, string>,
  snapshotConfigProps?: SnapshotConfigProps<T, Meta, K>,
  category?: string | symbol | Category, // Optional category
  snapshotStore?: SnapshotStore<T, Meta, K> // Optional store to retrieve from
): Promise<Snapshot<T, Meta, K> | null> => {
  return new Promise((resolve, reject) => {
    try {
      // Fetch the SnapshotContainer if not provided
      const snapshotContainer = snapshotStore 
        ? snapshotStore.getSnapshotContainer(snapshotId)
        : snapshotApi.getSnapshotContainer(snapshotId, storeId, additionalHeaders);

      // If category is provided, look for the current snapshot by category
      if (category) {
        const snapshotByCategory = snapshotContainer.getSnapshotCategory(snapshotId);
        if (snapshotByCategory) {
          resolve(snapshotByCategory); // Resolve with the found snapshot
          return;
        }
      }

      // If no category or no snapshot in category, try to fetch directly by ID
      const snapshot = snapshotContainer.mappedSnapshotData.get(snapshotId);
      if (snapshot) {
        resolve(snapshot); // Resolve with the found snapshot
        return;
      }

      // If no snapshot is found, resolve with null
      resolve(null);
    } catch (error) {
      console.error(`Error fetching snapshot for ID: ${snapshotId}`, error);
      reject(error); // Reject with error if something goes wrong
    }
  });
};

// // Usage example


const createSnapshotInstance =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotId: string | null,
  data: T,
  category: symbol | string | Category | undefined,
  snapshotStore: SnapshotStore<T, Meta, K> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K> | null
): Snapshot<T, Meta, K> => {
  const subscribed: boolean = false; // Replace with actual logic
  
  return {
    id: snapshotId,
    data: data,
    category: category,
    timestamp: new Date(),
    snapshotStore: snapshotStore,
    initialState: null,  
    isCore: false,       
    initialConfig: {},   
    onInitialize: () => {},  
    onError: "",
    taskIdToAssign: "",
    schema: {},
    currentCategory: "",
   
    mappedSnapshotData: new Map<string, Snapshot<T, Meta, K>>(), // Properly initializing as Map
    storeId: 0,
    versionInfo: {
      name: "",
      url: "",
      versionNumber: "0",
      documentId: "",
      draft: false,
      userId: "",
      content: "",
      metadata: {
        author: "",
        timestamp: "",
      },
     
      releaseDate: "",
      major: 0,
      minor: 0,
      patch: 0,
      checksum: "",
     
     
      // snapshotId,
      // snapshotContainer: "",
      // mappedSnapshotData: new Map<string, Snapshot<T, Meta, K>>(),
      // storeId: 0,
    },
    initializedState: "",
   
    criteria: "",
    snapshot: (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, Meta, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
      dataStore: DataStore<T, Meta, K>,
      dataStoreMethods: DataStoreMethods<T, Meta, K>,
      metadata: UnifiedMetaDataOptions,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number,// Add endpointCategory here
      storeProps: SnapshotStoreProps<T, Meta, K>,
      snapshotConfigData: SnapshotConfig<T, Meta, K>,
      subscription: Subscription<T, Meta, K>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
      snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
    ): Snapshot<T, Meta, K> | Promise<{ snapshot: Snapshot<T, Meta, K>; }> => {
       // Example implementation logic
        if (!snapshotId) {
          throw new Error("Snapshot ID cannot be null.");
        }

        // Logic for creating a snapshot based on input parameters
        const newSnapshot: Snapshot<T, Meta, K> = {
          id: snapshotId,
          data, // Assigning the provided data
          category,
          initialState, isCore, initialConfig, onInitialize,

          // Add any other relevant fields needed for the snapshot
        };

        // Optionally invoke the callback if provided
        if (callback) {
          callback(snapshotStore as SnapshotStore<T, Meta, K>);
        }

        // Handle async logic if necessary (this part is optional)
        return Promise.resolve({ snapshot: newSnapshot }); // Always return a value
      },
    setCategory: (category: Category) => {},
    applyStoreConfig: (
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | undefined
    ) => { },
    generateId: (
      prefix: string,
      name: string,
      type: NotificationTypeEnum,
      id?: string,
      title?: string,
      chatThreadName?: string,
      chatMessageId?: string,
      chatThreadId?: string,
      dataDetails?: DataDetails,
      generatorType?: string
    ) => "",
    snapshotData: async (
      id: string | number | undefined,
      snapshotId: string |number,
      data: Snapshot<T, Meta, K>,
      mappedSnapshotData: Map<string, Snapshot<T, Meta, K>> | null | undefined,
      snapshotData: SnapshotData<T, Meta, K>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStoreMethods<T, Meta, K>,
      storeProps: SnapshotStoreProps<T, Meta, K>
      ): Promise<SnapshotStore<T, Meta, K>> => {
       // Your logic to handle snapshot data and return a SnapshotStore
      const result: SnapshotStore<T, Meta, K> = await dataStoreMethods.addData(
        id,
        data,
        snapshotId,
        snapshotData,
        snapshotStore,
        category,
        categoryProperties,
        dataStoreMethods,
      );
    
      return result;
    },

    snapshotContainer: {} as SnapshotContainer<T, Meta, K>,
    getSnapshotItems: (): (SnapshotStoreConfig<T, Meta, K> | SnapshotItem<T, Meta, K> | undefined)[] => {
      // Initialize an array to hold the snapshot items
      const snapshotItems: (SnapshotStoreConfig<T, Meta, K> | SnapshotItem<T, Meta, K> | undefined)[] = [];
    
      // If a snapshotStoreConfig is provided, retrieve the items from it
      if (snapshotStoreConfig) {
        // Assuming snapshotStoreConfig has a method or property that allows you to get items
        const storeItems = snapshotStoreConfig.content.items; // Replace with actual method to retrieve items
    
        // Process each item in the storeItems and add them to snapshotItems
        if (Array.isArray(storeItems)) {
          for (const item of storeItems) {
            if (isSnapshot(item)) {
              // If it's a valid snapshot, add it to the array
              snapshotItems.push(item);
            } else if (isSnapshotsArray(item)) {
              // If it's an array of snapshots, you might want to flatten or handle accordingly
              snapshotItems.push(...item);
            } else {
              // Optionally handle undefined or incompatible items
              snapshotItems.push(undefined);
            }
          }
        }
      }
    
      // Optionally, you could also return any other snapshot-related items from other sources if needed
      // For instance, if you maintain a list of snapshots somewhere
      const additionalSnapshots = getCurrentSnapshotStoreOptions(snapshotStoreOptions); // Example function call
      snapshotItems.push(...additionalSnapshots);
    
      // Return the constructed array of snapshot items
      return snapshotItems;
    },       
    defaultSubscribeToSnapshots: (
      snapshotId: string, 
      callback: (snapshots: Snapshots<T, Meta>) => Subscriber<T, Meta, K> | null, 
    snapshot: Snapshot<T, Meta, K> | null
    ) =>{},
    getAllSnapshots: (
      storeId: number,
      snapshotId: string,
      snapshotData: T,
      timestamp: string,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, Meta, K>,
      data: T,
      dataCallback?: (
        subscribers: Subscriber<T, Meta, K>[],
        snapshots: Snapshots<T, Meta>
      ) => Promise<SnapshotUnion<T, Meta>[]>
    ): Promise<Snapshot<T, Meta, K>[]> =>{},
    getSubscribers: (
      subscribers: Subscriber<T, Meta, K>[], 
        snapshots: Snapshots<T, Meta>
      ): Promise<{
        subscribers: Subscriber<T, Meta, K>[]; 
        snapshots: Snapshots<T, Meta>;
      }> => {},
    transformDelegate: (): Promise<SnapshotStoreConfig<T, Meta, K>[]>=> {},
   
    getAllKeys: (
      storeId: number,
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K> | null,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<SnapshotUnion<BaseData, Meta>, K>,
      data: T
    ): Promise<string[] | undefined> | undefined => {},
    getAllValues: (): SnapshotsArray<T, Meta> => {},
    getAllItems: (): Promise<Snapshot<T, Meta, K>[] | undefined> => { },
    getSnapshotEntries: (snapshotId: string): Map<string, T> | undefined => {},
   
    getAllSnapshotEntries: (): Map<string, T>[] => {},
    addDataStatus: (id: number, status: StatusType | undefined) => { },
    removeData: (id: number) => { },
    updateData: (id: number, newData: Snapshot<T, Meta, K>) => {},
   
    updateDataTitle: (id: number, title: string) => "",
    updateDataDescription: (id: number, description: string) => {},
    updateDataStatus: (id: number, status: StatusType | undefined) => {},
    addDataSuccess: (payload: { data: Snapshot<T, Meta, K>[]; }) => {},
   
    getDataVersions: (id: number): Promise<Snapshot<T, Meta, K>[] | undefined> => {},
    updateDataVersions: (id: number, versions: Snapshot<T, Meta, K>[]) => {},
    getBackendVersion: (): IHydrateResult<number> | Promise<string> | undefined => {},
    getFrontendVersion:  (): IHydrateResult<number> | Promise<string> | undefined => {},
   
    fetchStoreData: (id: number): Promise<SnapshotStore<T, Meta, K>[]> => {},
    fetchData: (endpoint: string, id: number): Promise<SnapshotStore<T, Meta, K>> => {},
    defaultSubscribeToSnapshot: (snapshotId: string, callback: Callback<Snapshot<T, Meta, K>>, snapshot: Snapshot<T, Meta, K>) => "",
    handleSubscribeToSnapshot: (snapshotId: string, callback: Callback<Snapshot<T, Meta, K>>, snapshot: Snapshot<T, Meta, K>) => {},
    
    removeItem:  (key: string | number): Promise<void> => {},
    getSnapshot: (
      snapshot: (id: string | number) => Promise<{
        snapshotId: number;
        snapshotData: SnapshotData<T, Meta, K>
        category: Category | undefined;
        categoryProperties: CategoryProperties;
        dataStoreMethods: DataStore<T, Meta, K>
        timestamp: string | number | Date | undefined;
        id: string | number | undefined;
        snapshot: Snapshot<T, Meta, K>;
        snapshotStore: SnapshotStore<T, Meta, K>;
        data: T;
      }> | undefined
    ): Promise<Snapshot<T, Meta, K> | undefined> => {},
    getSnapshotSuccess: (
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K>,
      subscribers: Subscriber<T, Meta, K>[]
    ): Promise<SnapshotStore<T, Meta, K>> => {},
    setItem: (key: T, value: T): Promise<void> => { },
    
    getItem: (key: T): Promise<Snapshot<T, Meta, K> | undefined> => {},
    getDataStore: (): Promise<InitializedDataStore> => {},
    getDataStoreMap: (): Promise<Map<string, DataStore<T, Meta, K>>> => {},
    addSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>, subscribers: Subscriber<T, Meta, K>[]) => { },
   
    deepCompare: (objA: any, objB: any): boolean => { return objA.id === objB.id; },
    shallowCompare: (objA: any, objB: any): boolean => { return objA.id === objB.id; },
    getDataStoreMethods: (): DataStoreMethods<T, Meta, K> => {},
    getDelegate: (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
    }): Promise<DataStore<T, Meta, K>[]> => {},
   
    determineCategory: (snapshot: Snapshot<T, Meta, K> | null | undefined) => "",
    determinePrefix: (snapshot: T | null | undefined, category: string) =>  "",
    removeSnapshot: (snapshotToRemove: Snapshot<T, Meta, K>) => { },
    addSnapshotItem: (item: SnapshotStoreConfig<T, Meta, K> | Snapshot<T, Meta, K>) => { },
    
    addNestedStore: (store: SnapshotStore<T, Meta, K>, item: SnapshotStoreConfig<T, Meta, K> | Snapshot<T, Meta, K>) => { },
    clearSnapshots: () => { },
    addSnapshot: ( snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      subscribers: SubscriberCollection<T, Meta, K>
    ): Promise<Snapshot<T, Meta, K> | undefined> => {},
    emit: (
      event: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string, 
      subscribers: SubscriberCollection<T, Meta, K>,
      type: string,
      snapshotStore: SnapshotStore<T, Meta, K>, 
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<T, Meta, K>,
      category: Category,
      snapshotData: SnapshotData<BaseData, Meta, BaseData>
    ) => {},
    
    createSnapshot: (
      id: string,
      snapshotData: SnapshotData<T, Meta, K>,
      category?: string | symbol | Category,
      callback?: (snapshot: Snapshot<Data, Meta, K>) => void,
      SnapshotData?: SnapshotStore<T, Meta, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<Data, Meta, K>
    ): Snapshot<T, Meta, K> | null => {},
    createInitSnapshot: (
      id: string,
      initialData: T, 
      snapshotData: SnapshotData<any, Meta, K>,
      snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<any>, K>,
      category: symbol | string | Category | undefined,
    ): Promise<SnapshotWithCriteria<T, Meta, K>> => {},
    addStoreConfig: (config: SnapshotStoreConfig<T, Meta, K>) => { },
    handleSnapshotConfig: (config: SnapshotStoreConfig<T, Meta, K>) => void,
    
    getSnapshotConfig:  (
      snapshotId: string | null, 
      snapshotContainer: SnapshotContainer<T, Meta, K>,
      criteria: CriteriaType,
      category: Category,
      categoryProperties: CategoryProperties | undefined,
      delegate: any, snapshotData: SnapshotData<T, Meta, K>,
      snapshot: (id: string, snapshotId: string | null, 
        snapshotData: SnapshotData<T, Meta, K>, 
        category: Category,
        ) => void
    ): SnapshotStoreConfig<T, Meta, K>[] | undefined => {},
    getSnapshotListByCriteria: (
      criteria: SnapshotStoreConfig<T, Meta, K>
    ): Promise<Snapshot<T, Meta, K>[]> => { };

    setSnapshotSuccess: (
      snapshotData: SnapshotData<T, Meta, K>,
      subscribers: SubscriberCollection<T, Meta, K>
    ): void => {};
    setSnapshotFailure: (error: Error) => {},
   
    updateSnapshots: () => {},
    updateSnapshotsSuccess: (
      snapshotData: (
        subscribers: Subscriber<T, Meta, K>[], 
        snapshot: Snapshots<T, Meta>
      ) => void
    ) => {},
    updateSnapshotsFailure: (error: Payload) => {},
    initSnapshot: (
      snapshot: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null,
      snapshotId: number,
      snapshotData: SnapshotData<T, Meta, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void,
      snapshotStoreConfig: SnapshotStoreConfig<
        SnapshotWithCriteria<any, Meta, K>,
        K
      >,
    ) => { },
   
    takeSnapshot: (
      snapshot: Snapshot<T, Meta, K>, 
      subscribers: Subscriber<T, Meta, K>[]
    ): Promise<{ snapshot: Snapshot<T, Meta, K>; }> => {},
    takeSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => {},
    takeSnapshotsSuccess: (snapshots: T[]) => { },
    flatMap: <T extends Iterable<any>>(
      callback: (
        value: SnapshotStoreConfig<T, Meta, K>, 
        index: number, 
        array: SnapshotStoreConfig<T, Meta, K>[]
      ) => T
    ) => T extends (infer I)[] ? I[] : T[],
   
    getState: () => any;
    setState: (state: any) => {},

    validateSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>
    ): boolean => { },
    handleActions: (action: (selectedText: string) => void) => {},
   
    setSnapshot: (snapshot: Snapshot<T, Meta, K>) => {},
    transformSnapshotConfig: <T extends BaseData>(
      config: SnapshotConfig<T, T>
    ): SnapshotConfig<T, T> => {},
    setSnapshots: (snapshots: SnapshotStore<T, Meta, K>[]) => { },
    clearSnapshot: () => {},
   
    mergeSnapshots: (
      snapshots: Snapshots<T, Meta>, 
      category: string
    ) => {},
    reduceSnapshots: <T extends BaseData>(
      callback: (
        acc: T,
        snapshot: Snapshot<T, T>) => T,
      initialValue: T
    ): T | undefined => { },
    sortSnapshots: () => {},
    filterSnapshots: () => {},

    findSnapshot: (
      predicate: (snapshot: Snapshot<T, Meta, K>) => boolean
    ): Snapshot<T, Meta, K> | undefined => {},

    mapSnapshots: <U, V>(
      storeIds: number[],
      snapshotId: string,
      category: symbol | string | Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, Meta, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      data: K,
      callback: (
        storeIds: number[],
        snapshotId: string,
        category: symbol | string | Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        snapshot: Snapshot<T, Meta, K>,
        timestamp: string | number | Date | undefined,
        type: string,
        event: Event,
        id: number,
        snapshotStore: SnapshotStore<T, Meta, K>,
        data: V, // Use V for the callback data type
        index: number
      ) => U  // Return type of the callback
    ) => U[],
    takeLatestSnapshot: (): Snapshot<T, Meta, K> | undefined => { },
    updateSnapshot: (
      snapshotId: string,
      data: Map<string, Snapshot<T, Meta, K>>,
      events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
      snapshotStore: SnapshotStore<T, Meta, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, Meta, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, Meta, K>
    ) => {};

    getSnapshotConfigItems: (): SnapshotStoreConfig<T, Meta, K>[] => {},
    subscribeToSnapshots: (
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      snapshotData: SnapshotData<T, Meta, K>,
      category: Category | undefined,
      snapshotConfig: SnapshotStoreConfig<T, Meta, K>,
      callback: (snapshotStore: SnapshotStore<any, any>) => Subscriber<T, Meta, K> | null,
      snapshots: SnapshotsArray<T, Meta>,
      unsubscribe?: UnsubscribeDetails, 
    ): [] | SnapshotsArray<T, Meta> => {},
    executeSnapshotAction: (
      actionType: SnapshotActionType,
      actionData: any
    ): Promise<void> => { };

    subscribeToSnapshot: (
      snapshotId: string,
      callback: Callback<Snapshot<T, Meta, K>>,
      snapshot: Snapshot<T, Meta, K>
    ): Snapshot<T, Meta, K> => {},
   
    unsubscribeFromSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ): void => {},

    subscribeToSnapshotsSuccess: (
      callback: (snapshots: Snapshots<T, Meta>) => void
    ): string => {},

    unsubscribeFromSnapshots: (
      callback: (snapshots: Snapshots<T, Meta>) => void
    ): void => {},

    getSnapshotId: (key: string | T, snapshot: Snapshot<T, Meta, K>): unknown => {},
    getSnapshotItemsSuccess: (): SnapshotItem<Data, any>[] | undefined => {},
    getSnapshotItemSuccess: (): SnapshotItem<Data, any> | undefined => {},

    getSnapshotKeys: (): string[] | undefined => {},
    getSnapshotIdSuccess: (): string | undefined => {},

    getSnapshotValuesSuccess: (): SnapshotItem<Data, any>[] | undefined => {},
    
    getSnapshotWithCriteria: (
      criteria: SnapshotStoreConfig<T, Meta, K>
    ): SnapshotStoreConfig<T, Meta, K> => {},

    reduceSnapshotItems: (
      callback: (acc: any, snapshot: Snapshot<T, Meta, K>) => any, 
      initialValue: any
    ): any => {},

    subscribeToSnapshotList: (
      snapshotId: string, 
      callback: (snapshots: Snapshot<T, Meta, K>) => void
    ): void => {},
    config: {} as Promise<SnapshotStoreConfig<T, Meta, K> | null>,
    events: {} as CombinedEvents<T, Meta, K>,
   
    label: {
      // "1": {}
      text, color, localeCompare
    },
    restoreSnapshot: (
      id: string,
      snapshot: Snapshot<T, Meta, K>,
      snapshotId: string,
      snapshotData: SnapshotData<T, Meta, K>,
      savedData: SnapshotStore<T, K, UnifiedMetaDataOptions>,
      category: Category | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, Meta>,
      type: string,
      event: string | SnapshotEvents<T, Meta, K>,
      subscribers: SubscriberCollection<T, Meta, K>,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | undefined,
    ) => {
      // Implement logic to restore snapshot
    },
    
    handleSnapshot: (
      id: string,
      snapshotId: string | number |null,
      snapshot: Snapshot<T, Meta, K> | null, 
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, Meta>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null,
      storeConfigs?: SnapshotStoreConfig<T, Meta, K>[]
    ): Promise<Snapshot<T, Meta, K> | null> => {
      
      // Step 1: Validate required inputs
      if (!snapshotId || !snapshotData || !category) {
        console.error("Missing required parameters.");
        return Promise.resolve(null);
      }
    
      // Step 2: Initialize or retrieve the snapshot
      const currentSnapshot: Snapshot<T, Meta, K> | null = snapshot || null;  // Ensuring currentSnapshot is either a Snapshot or null
    
      // Step 3: Handle different event types
      if(snapshotId ===null){
        throw new Error("no snapshotId")
      }
      switch (type) {
        case 'create': {
          // Handle snapshot creation logic
          const newSnapshot: SnapshotUnion<T, Meta> = {
            id: snapshotId,
            data: snapshotData,
            category: category,
            timestamp: new Date(),
            ...snapshotStoreConfig,
          };
          snapshots.push(newSnapshot);  // Add to the snapshots array
          return Promise.resolve(newSnapshot);
        }
        case 'update': {
          // Handle snapshot update logic
          if (currentSnapshot) {
            currentSnapshot.data = snapshotData;
            currentSnapshot.timestamp = new Date(); // Update timestamp
          } else {
            console.error("Snapshot not found for update.");
            return Promise.resolve(null);
          }
          break;
        }
        case 'delete': {
          // Handle snapshot deletion logic
          const index = snapshots.findIndex(s => s.id === snapshotId);
          if (index !== -1) {
            snapshots.splice(index, 1); // Remove snapshot from array
          } else {
            console.error("Snapshot not found for deletion.");
            return Promise.resolve(null);
          }
          break;
        }
        default: {
          console.error(`Unhandled event type: ${type}`);
          return Promise.resolve(null);
        }
      }
    
      // Step 4: Update snapshotContainer if provided
      if (snapshotContainer) {
        snapshotContainer = currentSnapshot ? currentSnapshot.data : null;
      }
    
      // Step 5: Execute the callback function
      if (currentSnapshot) {
        callback(currentSnapshot.data);
      }
    
      // Step 6: Return the updated or processed snapshot
      return currentSnapshot;
    },
    
    subscribe: (
      snapshotId: string | number,
      unsubscribe: UnsubscribeDetails,
      subscriber: Subscriber<T, Meta, K> | null,
      data: T,
      event: Event,
      callback: Callback<Snapshot<T, Meta, K>>,
      value: T,
    ): [] | SnapshotsArray<T, Meta> => {},
    meta: {},
    snapshotMethods: {
      snapshot: this.createSnapshotInstance()
    },
    getSnapshotsBySubscriber: (subscriber: string): Promise<T[]> => {},
   
    isExpired: (): boolean | undefined => {
    // Logic to determine if the snapshot is expired
    // Ensure this logic returns only `boolean` or `undefined`
    const expirationTimestamp = /* logic to calculate expiration timestamp */;
    if (!expirationTimestamp) {
      return undefined; // No expiration timestamp, so return undefined
      }
      const currentTime = Date.now(); // Get the current timestamp
      return currentTime > expirationTimestamp; // Return true if expired, false if not
    },
    subscribers: [],
    setSnapshotCategory: (id: string, newCategory: Category): void => {},
    getSnapshotCategory: (id: string) => Category,
    getSnapshotData: (
      id: string | number | undefined,
      snapshotId: number,
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStore<T, Meta, K>
    ): Map<string, Snapshot<T, Meta, K>> | null | undefined => {},
    deleteSnapshot: (id: string): string => {},
    items: [],
    snapConfig: {} as SnapshotConfig<T, Meta, K>,
    
    getSnapshots: (category: string, data: Snapshots<T, Meta>): void => {},
    
    // Correct implementation for compareSnapshots
    compareSnapshots: (
      snap1: Snapshot<T, Meta, K>, 
      snap2: Snapshot<T, Meta, K>
    ) => {
      // Compare logic
      const differences: Record<string, { snapshot1: any; snapshot2: any }> = {};

      for (const key in snap1.data) {
        if (snap1.data[key] !== snap2.data[key]) {
          differences[key] = {
            snapshot1: snap1.data[key],
            snapshot2: snap2.data[key],
          };
        }
      }

      return {
        snapshot1: snap1,
        snapshot2: snap2,
        differences,
        versionHistory: {
          snapshot1Version: snap1.version,
          snapshot2Version: snap2.version,
        },
      };
    },

    compareSnapshotItems: (
      snap1: Snapshot<T, Meta, K>,
      snap2: Snapshot<T, Meta, K>,
      keys: (keyof Snapshot<T, Meta, K>)[]
    ) => {
      const itemDifferences: Record<string, {
        snapshot1: any;
        snapshot2: any;
        differences: {
          [key: string]: { value1: any; value2: any };
        };
      }> = {};

      keys.forEach((key) => {
        const value1 = snap1[key];
        const value2 = snap2[key];
        if (value1 !== value2) {
          itemDifferences[String(key)] = {
            snapshot1: value1,
            snapshot2: value2,
            differences: {
              [String(key)]: { value1, value2 }
            }
          };
        }
      });

      return Object.keys(itemDifferences).length > 0 ? { itemDifferences } : null;
    },

    // batchTakeSnapshot takes a batch of snapshots and returns them as a promise
    batchTakeSnapshot: async (
      id: number,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshots: Snapshots<T, Meta>
    ): Promise<{ snapshots: Snapshots<T, Meta> }> => {
      // Logic to process batch taking snapshot
      const newSnapshot: Snapshot<T, Meta, K> = {
        id: snapshotId,
        data,
        category: category as Category,
        timestamp: new Date(),
        ...snapshotStoreConfig
      };

      // Add the new snapshot to the snapshots array
      snapshots.push(newSnapshot);

      return { snapshots };
    },

    // batchFetchSnapshots fetches snapshots based on criteria and returns a promise with the data
    batchFetchSnapshots: async (
      criteria: CriteriaType,
      snapshotData: (
        snapshotIds: string[],
        subscribers: SubscriberCollection<T, Meta, K>,
        snapshots: Snapshots<T, Meta>
      ) => Promise<{
        subscribers: SubscriberCollection<T, Meta, K>;
        snapshots: Snapshots<T, Meta>;
      }>
    ): Promise<Snapshot<T, Meta, K>[]> => {
      // Logic to fetch and return snapshots based on criteria
      const snapshotIds: string[] = []; // Placeholder for actual logic to get snapshot IDs
      const subscribers: SubscriberCollection<T, Meta, K> = {}; // Placeholder for actual subscribers

      const { snapshots } = await snapshotData(snapshotIds, subscribers, []);

      return snapshots;
    },

   // Implementing batchTakeSnapshotsRequest with proper parameter and return type
    batchTakeSnapshotsRequest: async (
      criteria: CriteriaType,
      snapshotData: (
        snapshotIds: string[],
        snapshots: Snapshots<T, Meta>,
        subscribers: Subscriber<T, Meta, K>[]
      ) => Promise<{ subscribers: Subscriber<T, Meta, K>[] }>
    ): Promise<void> => {
      // Your logic for taking snapshots
    },

    // Implementing batchUpdateSnapshotsRequest
    batchUpdateSnapshotsRequest: async (
      snapshotData: (
        subscribers: SubscriberCollection<T, Meta, K>
      ) => Promise<{ subscribers: SubscriberCollection<T, Meta, K>; snapshots: Snapshots<T, Meta> }>,
      snapshotManager: SnapshotManager<T, Meta, K>
    ): Promise<void> => {
      // Your logic for updating snapshots
    },

    // Implementing filterSnapshotsByStatus
    filterSnapshotsByStatus: (status: string): Snapshots<T, Meta> => {
      // Your logic for filtering by status
      return []; // Placeholder, return appropriate Snapshots<T, Meta>
    },

    // Implementing filterSnapshotsByCategory
    filterSnapshotsByCategory: (category: string): Snapshots<T, Meta> => {
      // Your logic for filtering by category
      return []; // Placeholder
    },

    // Implementing filterSnapshotsByTag
    filterSnapshotsByTag: (tag: string): Snapshots<T, Meta> => {
      // Your logic for filtering by tag
      return []; // Placeholder
    },

    // Implementing batchFetchSnapshotsSuccess
    batchFetchSnapshotsSuccess: (
      subscribers: SubscriberCollection<T, Meta, K>[],
      snapshots: Snapshots<T, Meta>
    ): void => {
      // Your logic for handling success
    },

    // Implementing batchFetchSnapshotsFailure
    batchFetchSnapshotsFailure: (
      date: Date,
      snapshotManager: SnapshotManager<T, Meta, K>,
      snapshot: Snapshot<T, Meta, K>,
      payload: { error: Error }
    ): void => {
      // Your logic for handling failure
    },

    // Implementing batchUpdateSnapshotsSuccess
    batchUpdateSnapshotsSuccess: (
      subscribers: SubscriberCollection<T, Meta, K>,
      snapshots: Snapshots<T, Meta>
    ): void => {
      // Your logic for handling update success
    },

    // Implementing batchUpdateSnapshotsFailure
    batchUpdateSnapshotsFailure: (
      date: Date,
      snapshotId: string,
      snapshotManager: SnapshotManager<T, Meta, K>,
      snapshot: Snapshot<T, Meta, K>,
      payload: { error: Error }
    ): void => {
      // Your logic for handling update failure
    },
    handleSnapshotSuccess: (message: string, snapshot: Snapshot<T, Meta, K> | null, snapshotId: string) => {
      // Implement this function
    },
    handleSnapshotFailure: (error: Error, snapshotId: string) => {
      // Implement this function
    },
   
    compareSnapshotState: (snapshot1: Snapshot<T, Meta, K>, snapshot2: Snapshot<T, Meta, K>) => {
      // Implement logic
      return true;
    },
    
    compareSnapshotState: (snapshot1: Snapshot<T, Meta, K>, snapshot2: Snapshot<T, Meta, K>) => {
      // Implement logic
      return true;
    },
    payload: undefined,
    dataItems: null,    
    newData: null,
    getInitialState: () => null,
    getConfigOption: (optionKey: string) => {
      // Logic for getting config option
    },
    getTimestamp: () => undefined,
   
    getStores: (
      storeId: number,
      snapshotId: string,
      snapshotStores: SnapshotStore<T, Meta, K>[],
      snapshotStoreConfigs: SnapshotStoreConfig<T, Meta, K>[]
    ) => {
      return [];
    },
    getData: (id: number | string, snapshotStore: SnapshotStore<T, Meta, K>) => {
      return null;
    },
    setData: (id: string, data: Map<string, Snapshot<T, Meta, K>>) => {
      // Logic to set data
    },
    addData: (id: string, data: Partial<Snapshot<T, Meta, K>>) => {
      // Logic to add data
    },
    stores: null, // Initially, stores is null, can be updated later

    getStore: (
      storeId: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string | null,
      snapshot: Snapshot<T, Meta, K>,
      snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>,
      type: string,
      event: Event
    ): SnapshotStore<T, Meta, K> | null => {
      // Logic to get store based on parameters
      return null; // Placeholder logic
    },

    addStore: (
      storeId: number,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event
    ): SnapshotStore<T, Meta, K> | null => {
      // Logic to add store
      return null; // Placeholder logic
    },

    mapSnapshot: (
      id: number,
      storeId: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotContainer: SnapshotContainer<T, Meta, K>,
      snapshotId: string,
      criteria: CriteriaType,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, Meta, K>) => void,
      mapFn: (item: T) => T
    ): Snapshot<T, Meta, K> | null => {
      // Logic to map snapshot
      return null; // Placeholder logic
    },

    mapSnapshotWithDetails: (
      storeId: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ): SnapshotWithData<T, Meta, K> | null => {
      // Logic to map snapshot with details
      return null; // Placeholder logic
    },

    removeStore: (
      storeId: number,
      store: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event
    ) => {
      // Logic to remove store
    },

    unsubscribe: (
      unsubscribeDetails: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      },
      callback: Callback<Snapshot<T, Meta, K>> | null
    ) => {
      // Logic to unsubscribe
      if (callback) callback(null as unknown as Snapshot<T, Meta, K>); // Placeholder logic for the callback
    },

 setData: (id: string, data: Map<string, Snapshot<T, Meta, K>>) => {
      // Logic to set data
    },
    addData: (id: string, data: Partial<Snapshot<T, Meta, K>>) => {
      // Logic to add data
    },
    stores: null, // Initially, stores is null, can be updated later

    getStore: (
      storeId: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string | null,
      snapshot: Snapshot<T, Meta, K>,
      snapshotStoreConfig: SnapshotStoreConfig<T, Meta, K>,
      type: string,
      event: Event
    ): SnapshotStore<T, Meta, K> | null => {
      // Logic to get store based on parameters
      return null; // Placeholder logic
    },

    addStore: (
      storeId: number,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event
    ): SnapshotStore<T, Meta, K> | null => {
      // Logic to add store
      return null; // Placeholder logic
    },

    mapSnapshot: (
      id: number,
      storeId: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotContainer: SnapshotContainer<T, Meta, K>,
      snapshotId: string,
      criteria: CriteriaType,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, Meta, K>) => void,
      mapFn: (item: T) => T
    ): Snapshot<T, Meta, K> | null => {
      // Logic to map snapshot
      return null; // Placeholder logic
    },

    mapSnapshotWithDetails: (
      storeId: number,
      snapshotStore: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, Meta, K>) => void
    ): SnapshotWithData<T, Meta, K> | null => {
      // Logic to map snapshot with details
      return null; // Placeholder logic
    },

    removeStore: (
      storeId: number,
      store: SnapshotStore<T, Meta, K>,
      snapshotId: string,
      snapshot: Snapshot<T, Meta, K>,
      type: string,
      event: Event
    ) => {
      // Logic to remove store
    },

    unsubscribe: (
      unsubscribeDetails: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      },
      callback: Callback<Snapshot<T, Meta, K>> | null
    ) => {
      // Logic to unsubscribe
      if (callback) callback(null as unknown as Snapshot<T, Meta, K>); // Placeholder logic for the callback
    },
       
    fetchSnapshot: async (callback) => {
      // Placeholder: Implement your logic for fetchSnapshot
      return {
        id: snapshotId || '',
        category: category,
        categoryProperties: {} as CategoryProperties,
        timestamp: new Date(),
        snapshot: {} as Snapshot<T, Meta, K>,
        data: data,
        delegate: [],
      };
    },

    fetchSnapshotSuccess: (id, snapshotId, snapshotStore, payload, snapshot, data, delegate, snapshotData) => {
      // Placeholder: Implement your logic for fetchSnapshotSuccess
      return [];
    },

    updateSnapshotFailure: (snapshotId, snapshotManager, snapshot, date, payload) => {
      // Placeholder: Implement your logic for updateSnapshotFailure
    },

    fetchSnapshotFailure: (snapshotId, snapshotManager, snapshot, date, payload) => {
      // Placeholder: Implement your logic for fetchSnapshotFailure
    },

    addSnapshotFailure: (date, snapshotManager, snapshot, payload) => {
      // Placeholder: Implement your logic for addSnapshotFailure
    },

    configureSnapshotStore: (
      snapshotStore, storeId, data, events, dataItems, newData, payload, store, callback, config
    ) => {
      // Placeholder: Implement your logic for configureSnapshotStore
    },

    updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {
      // Placeholder: Implement your logic for updateSnapshotSuccess
    },

    createSnapshotFailure: (date, snapshotId, snapshotManager, snapshot, payload) => {
      // Placeholder: Implement your logic for createSnapshotFailure
    },

    createSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {
      // Placeholder: Implement your logic for createSnapshotSuccess
    },

    createSnapshots: (
      id, snapshotId, snapshots, snapshotManager, payload, callback, snapshotDataConfig, category, categoryProperties
    ) => {
      // Placeholder: Implement your logic for createSnapshots
      return snapshots;
    },

    onSnapshot: (snapshotId, snapshot, type, event, callback) => {
      // Placeholder: Implement your logic for onSnapshot
    },

    onSnapshots: (snapshotId, snapshots, type, event, callback) => {
      // Placeholder: Implement your logic for onSnapshots
    },
    childIds: null, // Initially null or can be an empty array based on your logic

    getParentId: (id: string, snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, T>) => {
      // Logic to return parent ID
      return snapshot.parentId || null;
    },

    getChildIds: (id: string, childSnapshot: Snapshot<T, Meta, K>) => {
      // Logic to return child IDs
      return childSnapshot.childIds || [];
    },

    snapshotCategory: undefined, // Define the category or fetch it dynamically as needed

    snapshotSubscriberId: undefined,
   
    
  addChild(parentId: string, childId: string, child: CoreSnapshot<T, Meta, K>): void {
    const parent = this.get(parentId);
    if (parent) {
      parent.children.push(child);
    }
  },

  removeChild: (childId: string, parentId: string, parentSnapshot: CoreSnapshot<T, Meta, K>, childSnapshot: CoreSnapshot<T, Meta, K>) => {
    // Logic to remove a child from the parent snapshot
    if (parentSnapshot.children) {
      parentSnapshot.children = parentSnapshot.children.filter(child => child.id !== childId);
    }
  },

    getChildren: (id: string, childSnapshot: CoreSnapshot<T, Meta, K>) => {
      return (childSnapshot.children || []) as CoreSnapshot<T, Meta, K>[];
    },


    hasChildren: (id: string) => {
      return !!snapshotStore?.get(id)?.children?.length;
    },

    
    isDescendantOf: (childId: string, parentId: string, parentSnapshot: Snapshot<T, Meta, K>, childSnapshot: Snapshot<T, Meta, K>) => {
      // Logic to check if a child is a descendant of the parent
      return !!(parentSnapshot.children && parentSnapshot.children.some(child => child.id === childId));
    },

    getSnapshotById: (id: string) => {
      // Logic to fetch snapshot by ID, for example, from the snapshotStore
      return snapshotStore?.get(id) || null;
    },

    // Other properties and methods from Snapshot<T, Meta, K> can follow similar structure
    initializeWithData: (data: SnapshotUnion<T, Meta>[]): void | undefined => {
      // Logic to initialize the snapshot with data
    },

    hasSnapshots: async (): Promise<boolean> => {
      if (!snapshotStore) return false; // No store, no snapshots
      // Provide the necessary arguments to getAllSnapshots
      const allSnapshots = await snapshotStore.getAllSnapshots(
        0, // Provide an appropriate storeId
        snapshotId || "", // Provide snapshotId
        data, // Provide snapshotData
        new Date().toISOString(), // Provide timestamp
        "defaultType", // Provide type as per your logic
        new Event("defaultEvent"), // Provide an Event object as needed
        0, // Provide an appropriate id
        snapshotStore, // Pass the snapshotStore
        category, // Pass the category
        undefined, // or appropriate CategoryProperties
        undefined, // or appropriate dataStoreMethods
        data // Pass the data again if needed
      );
      return allSnapshots.length > 0; // Assuming it returns an array of snapshots
    },

    
   
    isSubscribed: subscribed,

    notifySubscribers: async (): Promise<Subscriber<T, Meta, K>[]> => {
      if (!snapshotStore) return []; // No store, nothing to notify
      // Await the subscribers since getSubscribers returns a Promise
      const currentStoreId = useSecureStoreId()

      if(!currentStoreId){
        throw new Error(`no storeId provided for snapshot ${snapshotStore.snapshot.name}`)
      }
      const snapshots = await snapshotStore.getAllSnapshots(
        currentStoreId, // Provide an appropriate storeId
        snapshotId || "", // Provide snapshotId
        data, // Provide snapshotData
        new Date().toISOString(), // Provide timestamp
        "defaultType", // Provide type as per your logic
        new Event("defaultEvent"), // Provide an Event object as needed
        0, // Provide an appropriate id
        snapshotStore, // Pass the snapshotStore
        category, // Pass the category
        undefined, // or appropriate CategoryProperties
        {} as DataStore<T, Meta, K>, // or appropriate dataStoreMethods
        data // Pass the data again if needed
      )
       // Convert the array of Snapshot<T, Meta, K> to Snapshots<T, Meta>
      const snapshotsArray: SnapshotsArray<T, Meta> = snapshots.map(snapshot => snapshot as SnapshotUnion<T, Meta>);

      // Call getSubscribers with the converted snapshots
      const { subscribers } = await snapshotStore.getSubscribers(undefined, snapshotsArray);

      subscribers.forEach(subscriber => {
            subscriber.notify(this); // Assuming the subscriber has a notify method that takes the current snapshot instance
          });
      return subscribers; // Return the list of notified subscribers
    },

    notify: () => {
      // General notification logic
    },

    clearSnapshotSuccess: () => {
      // Logic to clear the success state of the snapshot
    },
   
    addToSnapshotList: (snapshot: Snapshot<T, Meta, K>) => {
      // Logic to add this snapshot to a list (e.g., inside a snapshot store)
    },

    removeSubscriber: (subscriberId: string) => {
      // Logic to remove a subscriber from this snapshot
    },

    addSnapshotSubscriber: (subscriberId: string) => {
      // Logic to add a subscriber to this snapshot
    },

    removeSnapshotSubscriber: (subscriberId: string) => {
      // Logic to remove a subscriber from this snapshot
    },

    transformSubscriber: (subscriberId: string, sub: Subscriber<T, Meta, K>): Subscriber<T, Meta, K> => {
      const existingSubscriber = this.getSubscriberById(subscriberId); // Method to retrieve the subscriber by ID
      if (!existingSubscriber) {
        throw new Error(`Subscriber with ID ${subscriberId} not found.`);
      }
      // Transform the subscriber based on the snapshot's data or context
      existingSubscriber.transformedData = { /* transformation logic */ };
      return existingSubscriber; // Return the transformed subscriber
    },

    getSnapshotsBySubscriberSuccess: (snapshots: Snapshots<T, Meta>) => {

    },

    find: (id: string): SnapshotStore<T, Meta, K> | undefined => {
      if (!snapshotStore) return undefined; // No store to search in
      return snapshotStore.findSnapshotById(id); // Assuming this method is available on the snapshotStore
    },  
    equals: (data: Snapshot<T, Meta, K>): boolean | null | undefined => {
      if (!data || !this.id) return null; // Cannot compare if either is undefined
      const isEqual = this.id === data.id && JSON.stringify(this.data) === JSON.stringify(data.data);
      return isEqual; // Return true or false based on the comparison
    },
  } as Snapshot<T, Meta, K>;

};





// createDataObject(plainDataObject, baseData, baseMeta).then((dataObject) => {
//   console.log(dataObject);
// });


// const snapshot: Snapshot<BaseData, Meta, BaseData> = {
//   id: "snapshot1",
//   category: "example category",
//   timestamp: new Date(),
//   createdBy: "creator1",
//   description: "Sample snapshot description",
//   tags: {},
//   metadata: {},
//   data: {
//     id: "data1",
//     title: "Data Title",
//     // Add other BaseData properties if needed
//   },
//   initialState: undefined,
//   meta: new Map<string, Snapshot<BaseData, Meta, BaseData>>(),
//   events: {
//     eventRecords: [
//      {
//         action: "Created snapshot",
//         timestamp: new Date(),
//         id: "",
//         title: "",
//         content: "",
//         topics: [],
//         highlights: [],
//         files: [],
//         date: undefined,
//         meta: undefined,
//         rsvpStatus: "yes",
//         participants: [],
//         teamMemberId: "",
//         getSnapshotStoreData: (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData, Meta, K>, SnapshotWithCriteria<BaseData, Meta, K>>[]> => {
//           throw new Error("Function not implemented.");
//         },
//         getData: getData()
//       },
//       {
//         action: "Edited snapshot",
//         timestamp: new Date(),
//         id: "",
//         title: "",
//         content: "",
//         topics: [],
//         highlights: [],
//         files: [],
//         date: undefined,
//         meta: undefined,
//         rsvpStatus: "yes",
//         participants: [],
//         teamMemberId: "",
//         getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
//           throw new Error("Function not implemented.");
//         },
//         getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
//           throw new Error("Function not implemented.");
//         }
//       },
//     ],
//   },
//   getSnapshotId: (key: string | SnapshotData<BaseData, Meta, BaseData>): unknown => {
//     if (typeof key === "string") {
//       return key;
//     } else {
//       return key._id;
//     }
//   },

//   compareSnapshotState: function (snapshot: Snapshot<BaseData, Meta, BaseData> | null, state: any): boolean {
//     if (!snapshot || !snapshot.timestamp || !snapshot.tags || !snapshot.data) {
//       return false;
//     }
//     // Implement specific comparison logic based on the properties of snapshot and state
//     return (
//       snapshot.id === state.id &&
//       snapshot.category === state.category &&
//       snapshot.timestamp === new Date(state.timestamp).getTime() &&
//       snapshot.createdBy === state.createdBy &&
//       snapshot.description === state.description &&
//       snapshot.tags.join(",") === state.tags.join(",") &&
//       JSON.stringify(snapshot.metadata) === JSON.stringify(state.metadata) &&
//       ('id' in snapshot.data && 'id' in state.data && snapshot.data.id === state.data.id) &&
//       ('title' in snapshot.data && 'title' in state.data && snapshot.data.title === state.data.title)
//       // Add other property comparisons as needed
//     );
//   },
//   eventRecords: null,
//   snapshotStore: null,
//   getParentId: function (): string | null {
//     return this.parentId || null;
//   },
//   getChildIds: function (): string[] {
//     return this.metadata.childIds || [];
//   },
//   addChild: function (childSnapshot: Snapshot<BaseData, Meta, BaseData>): void {
//     if (!this.metadata.childIds) {
//       this.metadata.childIds = [];
//     }
//     this.metadata.childIds.push(childSnapshot.id);
//     // Ensure the child snapshot has the current snapshot as its parent
//     childSnapshot.metadata.parentId = this.id;
//   },
//   removeChild: function (childSnapshot: Snapshot<BaseData, Meta, BaseData>): void {
//     if (!this.metadata.childIds) {
//       return;
//     }
//     this.metadata.childIds = this.metadata.childIds.filter((id: string) => id !== childSnapshot.id);
//     // Remove the current snapshot as the parent of the child snapshot
//     childSnapshot.metadata.parentId = null;
//   },
//   getChildren: function (): Snapshot<BaseData, Meta, BaseData>[] {
//     return this.metadata.childIds
//       ? this.metadata.childIds.map((id: string) => dataObject.get(id))
//       : [];
//   },
//   hasChildren: function (): boolean {
//     return this.metadata.childIds && this.metadata.childIds.length > 0;
//   },
//   isDescendantOf: function (parentSnapshot: Snapshot<BaseData, Meta, BaseData>,
//     childSnapshot: Snapshot<BaseData, Meta, BaseData>

//   ): boolean {
//     const childIds = this.getChildIds(childSnapshot);
//     if (Array.isArray(childIds)) {
//       return childIds.includes(parentSnapshot.id);
//     }
//     return false;
//   },
//   dataItems: null,
//   newData: null,
//   stores: null,
//   getStore: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     type: string,
//     event: Event
//   ): SnapshotStore<BaseData, Meta, BaseData> | null {
//       return new SnapshotStore<BaseData, Meta, BaseData>(storeId, options, config, operation);
//   },
//   addStore: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     type: string,
//     event: Event
//   ): SnapshotStore<BaseData, Meta, BaseData> | null {
//     if (!this.stores) {
//       this.stores = [];
//     }
//     // verify if store is already added
//     if (this.stores[storeId]) {
//       return null;
//     }
//     this.stores[storeId] = snapshotStore;
//     return snapshotStore;
//   },

//   mapSnapshot: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     type: string,
//     event: Event,
//     subscribers?: SubscriberCollection<BaseData, Meta, BaseData>,
//   ): Snapshot<BaseData, Meta, BaseData> | null {
//     if (!this.stores) {
//       this.stores = [];
//     }
  
//     // Verify if store is already added
//     if (!this.stores[storeId]) {
//       this.stores[storeId] = snapshotStore;
//     }
  
//     const store = this.stores[storeId];
  
//     // Verify if store is already removed
//     if (!store) {
//       console.warn(`Store with ID ${storeId} does not exist.`);
//       return snapshot;
//     }
  
//     switch (type) {
//       case 'add':
//         store.addSnapshot(
//           snapshot,
//           snapshotId,
//           subscribers
//         );
//         break;
//       case 'remove':
//         store.removeSnapshot(snapshotId);
//         break;
//       case 'update':
//         store.updateSnapshot(snapshotId, snapshot);
//         break;
//       default:
//         console.warn(`Unsupported type: ${type}`);
//     }
  
//     console.log(`Handled snapshot with ID: ${snapshotId} for store ID: ${storeId} with event type: ${type}`, event);
  
//     return snapshot;
//   },
//   removeStore: function (
//     storeId: number,
//     store: SnapshotStore<BaseData, Meta, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     type: string,
//     event: Event
//   ): void {
//     throw new Error("Function not implemented.");
//   },
//   unsubscribe: function (
//     callback: Callback<Snapshot<BaseData, Meta, BaseData>>)
//     : void {
//     throw new Error("Function not implemented.");
//   },
//   addSnapshotFailure: function (
//     snapshotManager: SnapshotManager<BaseData, Meta, BaseData>,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     payload: { error: Error; }): void {
//     throw new Error("Function not implemented.");
//   },
//   configureSnapshotStore: function (
//     snapshotStore: SnapshotStore<BaseData, Meta, BaseData>,
//     snapshotId: string,
//     data: Map<string, Snapshot<BaseData, Meta, BaseData>>,
//     events: Record<string, CalendarEvent<BaseData, Meta, BaseData>[]>,
//     dataItems: RealtimeDataItem[],
//     newData: Snapshot<BaseData, Meta, BaseData>,
//     payload: ConfigureSnapshotStorePayload<BaseData>,
//     store: SnapshotStore<any, Meta, BaseData>,
//     callback: (snapshotStore: SnapshotStore<BaseData, Meta, BaseData>

//     ) => void): void | null {
//     throw new Error("Function not implemented.");
//   },
//   updateSnapshotSuccess: function (
//     snapshotId: string,
//     snapshotManager: SnapshotManager<BaseData, Meta, BaseData>,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     payload: { error: Error; }
//   ): void | null {
//     throw new Error("Function not implemented.");
//   },
//   createSnapshotFailure: function (
//     snapshotId: string,
//     snapshotManager: SnapshotManager<BaseData, Meta, BaseData>,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     payload: { error: Error; }
//   ): Promise<void> {
//     throw new Error("Function not implemented.");
//   },
//   createSnapshotStores: function (id: string, snapshotId: string,
//     snapshot: Snapshot<BaseData, Meta, BaseData>,
//     napshotStore: SnapshotStore<BaseData, Meta, BaseData>,
//     snapshotManager: SnapshotManager<BaseData, Meta, BaseData>,
//     payload: CreateSnapshotStoresPayload<BaseData, Meta, BaseData>,
//     callback: (
//       snapshotStore: SnapshotStore<BaseData, Meta, BaseData>[]
//     ) => void | null,
//     snapshotStoreData?: SnapshotStore<BaseData, Meta, BaseData>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<BaseData, Meta, BaseData>[] | undefined): SnapshotStore<BaseData, Meta, BaseData>[] | null {
//     throw new Error("Function not implemented.");
//   },
//   handleSnapshot: function (
//     id: string,
//     snapshotId: string,
//     snapshot: Data | null,
//     snapshotData: Data,
//     category: symbol | string | Category | undefined,
//     callback: (snapshot: Data) => void,
//     snapshots: SnapshotsArray<Data, Meta>,
//     type: string,
//     event: Event,
//     snapshotContainer?: Data,
//     snapshotStoreConfig?: SnapshotStoreConfig<Data, Meta, K>,
//   ): Promise<Snapshot<Data, Meta, K> | null> {

//     return new Promise((resolve, reject) => {
//       // Check if the snapshot is null
//       if (snapshot === null) {
//         reject("Snapshot is null");
//       }

//       const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling
  
//       // Check if the snapshot is null
//       if (snapshot === null) {
//         handleError("Snapshot is null");
//         return null; // Return null if snapshot is not available
//       }
  
//       // Determine if the snapshot exists in the snapshot array
//       const existingSnapshot = snapshots.find(s => s.id === snapshotId);
    
//       if (existingSnapshot) {
//         // Update the existing snapshot
//         existingSnapshot.data = snapshotData;
//         existingSnapshot.category = category;
//         existingSnapshot.timestamp = new Date(); // Update the timestamp to the current time
  
//         // Trigger the callback function with the updated snapshot
//         callback(existingSnapshot.data);
  
//         // Handle event if necessary
//         if (event) {
//           event.emit('snapshotUpdated', existingSnapshot);
//         }
  
//         // If using snapshot store configuration, handle the snapshot store update
//         if (snapshotStoreConfig) {
//           // Example: Update the snapshot store based on the configuration
//           // This is a placeholder; adjust according to your actual snapshot store logic
//           const snapshotStore = snapshotStoreConfig.getSnapshotStore();
//           if (snapshotStore) {
//             snapshotStore.addSnapshot(existingSnapshot);
//           }
//         }
  
//         resolve(existingSnapshot); // Return the updated snapshot
//       } else {
//         // Create a new snapshot if it does not exist
//         const newSnapshot: Snapshot<Data, Meta, K> = {
//           id: snapshotId,
//           data: snapshotData,
//           category: category,
//           timestamp: new Date(), // Set the timestamp to the current time
//           // Include other necessary properties and metadata
//         };
  
//         // Add the new snapshot to the snapshots array
//         snapshots.push(newSnapshot);
  
//         // Trigger the callback function with the new snapshot data
//         callback(newSnapshot.data);
  
//         // Handle event if necessary
//         if (event) {
//           event.emit('snapshotCreated', newSnapshot);
//         }
  
//         // If using snapshot store configuration, handle the snapshot store update
//         if (snapshotStoreConfig) {
//           // Example: Add the new snapshot to the snapshot store
//           // This is a placeholder; adjust according to your actual snapshot store logic
//           const snapshotStore = snapshotStoreConfig.getSnapshotStore();
//           if (snapshotStore) {
//             snapshotStore.addSnapshot(newSnapshot);
//           }
//         }
  
//         // Return the newly created snapshot
//         return newSnapshot;
//       }
//     })
//   }
// };



// // const sampleSnapshot: Snapshot<BaseData, any> = {
// //   timestamp: new Date().toISOString() ?? "",
// //   value: "42",
// //   category: "sample snapshot",
// //   snapshotStoreConfig: {} as SnapshotStoreConfig<BaseData, any>,
// //   getSnapshotItems: function (): (SnapshotStoreConfig<BaseData, any> | SnapshotItem<BaseData, any>)[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, any> | null, snapshot?: Snapshot<BaseData, any> | null | undefined): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   versionInfo: null,
// //   transformSubscriber: function (sub: Subscriber<BaseData, any>): Subscriber<BaseData, any> {
// //     throw new Error("Function not implemented.");
// //   },
// //   transformDelegate: function (): SnapshotStoreConfig<BaseData, any>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   initializedState: undefined,
// //   getAllKeys: function (): Promise<string[]> | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   getAllItems: function (): Promise<Snapshot<BaseData, any>[]> | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   addDataStatus: function (id: number, status: "completed" | "pending" | "inProgress"): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeData: function (id: number): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateData: function (id: number, newData: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataTitle: function (id: number, title: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataDescription: function (id: number, description: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataStatus: function (id: number, status: "completed" | "pending" | "inProgress"): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addDataSuccess: function (payload: { data: Snapshot<BaseData, any>[]; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDataVersions: function (id: number): Promise<Snapshot<BaseData, any>[] | undefined> {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataVersions: function (id: number, versions: Snapshot<BaseData, any>[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getBackendVersion: function (): Promise<string | undefined> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
// //     throw new Error("Function not implemented.");
// //   },
// //   fetchData: function (id: number): Promise<SnapshotStore<BaseData, any>[]> {
// //     throw new Error("Function not implemented.");
// //   },
// //   defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, any>>, snapshot: Snapshot<BaseData, any>): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, any>>, snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeItem: function (key: string): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<BaseData, any>; snapshotStore: SnapshotStore<BaseData, any>; data: BaseData; }> | undefined): Promise<Snapshot<BaseData, any>> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshotSuccess: function (snapshot: Snapshot<BaseData, any>): Promise<SnapshotStore<BaseData, any>> {
// //     throw new Error("Function not implemented.");
// //   },
// //   setItem: function (key: string, value: BaseData): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDataStore: {},
// //   addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<BaseData, any>[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   deepCompare: function (objA: any, objB: any): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   shallowCompare: function (objA: any, objB: any): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDataStoreMethods: function (): DataStoreMethods<BaseData, any> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDelegate: function (snapshotStoreConfig: SnapshotStoreConfig<BaseData, any>[]): SnapshotStoreConfig<BaseData, any>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   determineCategory: function (snapshot: Snapshot<BaseData, any> | null | undefined): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addNestedStore: function (store: SnapshotStore<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   clearSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addSnapshot: function (snapshot: Snapshot<BaseData, any>, snapshotId: string, subscribers: Subscriber<BaseData, any>[] & Record<string, Subscriber<BaseData, any>>): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshot: undefined,
// //   createInitSnapshot: function (id: string, snapshotData: SnapshotData<any, BaseData>, category: string): Snapshot<Data, Meta, Data> {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshotSuccess: function (snapshotData: SnapshotData<BaseData, any>, subscribers: ((data: Subscriber<BaseData, any>) => void)[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshotFailure: function (error: Error): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, any>[], snapshot: Snapshots<BaseData>) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshotsFailure: function (error: Payload): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   initSnapshot: function (snapshotConfig: SnapshotStoreConfig<BaseData, any>, snapshotData: SnapshotData<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   takeSnapshot: function (snapshot: Snapshot<BaseData, any>, subscribers: Subscriber<BaseData, any>[]): Promise<{ snapshot: Snapshot<BaseData, any>; }> {
// //     throw new Error("Function not implemented.");
// //   },
// //   takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, any>, index: number, array: SnapshotStoreConfig<BaseData, any>[]) => U): U extends (infer I)[] ? I[] : U[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   getState: function () {
// //     throw new Error("Function not implemented.");
// //   },
// //   setState: function (state: any): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   validateSnapshot: function (snapshot: Snapshot<BaseData, any>): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   handleActions: function (action: (selectedText: string) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshot: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshots: function (snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   clearSnapshot: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   mergeSnapshots: function (snapshots: Snapshots<BaseData>, category: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseData, any>) => U, initialValue: U): U | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   sortSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   filterSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   findSnapshot: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSubscribers: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<BaseData, any>[]; snapshots: Snapshots<BaseData>; }> {
// //     throw new Error("Function not implemented.");
// //   },
// //   notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   notifySubscribers: function (subscribers: Subscriber<BaseData, any>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, any>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   generateId: function (): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchFetchSnapshots: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchTakeSnapshotsRequest: function (snapshotData: any): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, any>[]) => Promise<{ subscribers: Subscriber<BaseData, any>[]; snapshots: Snapshots<BaseData>; }>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   filterSnapshotsByStatus: undefined,
// //   filterSnapshotsByCategory: undefined,
// //   filterSnapshotsByTag: undefined,
// //   batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchTakeSnapshot: function (snapshotStore: SnapshotStore<BaseData, any>, snapshots: Snapshots<BaseData>): Promise<{ snapshots: Snapshots<BaseData>; }> {
// //     throw new Error("Function not implemented.");
// //   },
// //   handleSnapshotSuccess: function (snapshot: Snapshot<Data, Meta, Data> | null, snapshotId: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshotId: function (key: string | SnapshotData<BaseData, any>): unknown {
// //     throw new Error("Function not implemented.");
// //   },
// //   compareSnapshotState: function (arg0: Snapshot<BaseData, any> | null, state: any): unknown {
// //     throw new Error("Function not implemented.");
// //   },
// //   eventRecords: null,
// //   snapshotStore: null,
// //   getParentId: function (snapshot: Snapshot<BaseData, any>): string | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   getChildIds: function (childSnapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addChild: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeChild: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getChildren: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   hasChildren: function (): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   isDescendantOf: function (snapshot: Snapshot<BaseData, any>, childSnapshot: Snapshot<BaseData, any>): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   dataItems: null,
// //   newData: null,
// //   data: undefined,
// //   getInitialState: function (): Snapshot<BaseData, any> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   getConfigOption: function (): SnapshotStoreConfig<BaseData, any> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   getTimestamp: function (): Date | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   getStores: function (): Map<number, SnapshotStore<Data, any>>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   getData: function (): BaseData | Map<string, Snapshot<BaseData, any>> | null | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   setData: function (data: Map<string, Snapshot<BaseData, any>>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addData: function (data: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   stores: null,
// //   getStore: function (storeId: number, snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): SnapshotStore<BaseData, any> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   addStore: function (storeId: number, snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): Promise<string | undefined> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeStore: function (storeId: number, store: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   unsubscribe: function (callback: Callback<Snapshot<BaseData, any>>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   fetchSnapshot: function (callback: (snapshotId: string, payload: FetchSnapshotPayload<any>, snapshotStore: SnapshotStore<BaseData, any>, payloadData: BaseData | Data, category: symbol | string | Category | undefined, timestamp: Date, data: BaseData, delegate: SnapshotWithCriteria<BaseData, any>[]) => Snapshot<BaseData, any>): Snapshot<BaseData, any> {
// //     throw new Error("Function not implemented.");
// //   },
// //   addSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   configureSnapshotStore: function (snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, data: Map<string, Snapshot<BaseData, any>>, events: Record<string, CalendarEvent<BaseData, any>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<BaseData, any>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<BaseData, any>) => void): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<BaseData, any>, snapshotManager: SnapshotManager<BaseData, any>, payload: CreateSnapshotsPayload<BaseData, any>, callback: (snapshots: Snapshot<BaseData, any>[]) => void | null, snapshotDataConfig?: SnapshotConfig<BaseData, any>[] | undefined, category?: string | symbol | Category): Snapshot<BaseData, any>[] | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   onSnapshot: function (snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event, callback: (snapshot: Snapshot<BaseData, any>) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   onSnapshots: function (snapshotId: string, snapshots: Snapshots<BaseData>, type: string, event: Event, callback: (snapshots: Snapshots<BaseData>) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   label: undefined,
// //   events: undefined,
// //   handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: Event, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<BaseData, any> | undefined): Promise<Snapshot<BaseData, any> | null> {
// //     throw new Error("Function not implemented.");
// //   },
// //   meta: undefined
// // };

// // subscriber.receiveSnapshot({
// //   ...sampleSnapshot,
// //   timestamp: new Date().toISOString(),
// //   value: typeof sampleSnapshot.value === 'string' ? sampleSnapshot.value : 0,
// //   tags: sampleSnapshot.tags ? Object.fromEntries(sampleSnapshot.tags.map(tag => [tag.name, tag.value])) : undefined
// // });
// export {
//     // sampleSnapshot, 
//     snapshot
// };


export { createSnapshotInstance, processSnapshot };
