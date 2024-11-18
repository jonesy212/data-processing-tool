// // snapshot
import * as snapshotApi from '@/app/api/SnapshotApi';
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { Signature } from "ethers";
import { LanguageEnum } from "../communications/LanguageEnum";
import { CustomTransaction } from "../crypto/SmartContractInteraction";
import { createCustomTransaction } from "../hooks/dynamicHooks/createCustomTransaction";
import { CombinedEvents, createBaseData, SnapshotManager } from '../hooks/useSnapshotManager';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { ThemeEnum } from '../libraries/ui/theme/Theme';
import { BaseData, Data } from "../models/data/Data";
import FileData from '../models/data/FileData';
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { EventRecord } from '../projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Settings } from "../state/stores/SettingsStore";
import { Subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";
import { updateFileMetadata } from '../utils/fileUtils';
import { isSnapshotStoreConfig } from '../utils/snapshotUtils';
import { createBaseSnapshot } from "./createBaseSnapshot";
import {
  CoreSnapshot,
    Snapshot,
    SnapshotsArray
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
import { createSnapshotStoreConfig, snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";
 
import { action } from 'mobx';
import { SnapshotData } from '.';
import { CreateSnapshotStoresPayload } from '../database/Payload';
import useDocumentManagement from '../documents/useDocumentManagement';
import exportTasksToCSV from '../hooks/dataHooks/exportTasksToCSV';
import useErrorHandling from '../hooks/useErrorHandling';
import { K, Meta, T } from '../models/data/dataStoreMethods';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { updateTaskAssignee, updateTaskDescription, updateTaskDueDate, updateTaskPriority, updateTaskTitle } from '../state/redux/slices/ContentSlice';
import { updateTaskStatus } from '../state/redux/slices/TaskSlice';
import CalendarManagerStoreClass from '../state/stores/CalendarEvent';
import { Todo } from '../todos/Todo';
import { convertSnapshotToMap } from '../typings/YourSpecificSnapshotType';
import { ConfigureSnapshotStorePayload, SnapshotConfig } from './SnapshotConfig';
import { SnapshotEvents } from './SnapshotEvents';
import { SnapshotWithCriteria } from './SnapshotWithCriteria';
import { Callback } from './subscribeToSnapshotsImplementation';
import baseMeta from '../database/baseMeta';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import operation from 'antd/es/transfer/operation';
import { config } from 'process';
import { options } from 'sanitize-html';
import { CalendarEvent } from '../calendar/CalendarEvent';
import { storeProps } from './SnapshotStoreProps';

// A type guard to check if an object is of type CombinedEvents<T, K>
function isCombinedEvents<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(events: any): events is CombinedEvents<T, K> {
  return (
    typeof events === "object" &&
    'records' in events &&
    'event' in events &&
    'unsubscribeDetails' in events &&
    'callback' in events
  );
}


// Define T as a generic type parameter
function processSnapshot<
  T extends  BaseData<T>,
  K extends T = T>(snapshot: Snapshot<T, K>) {
  // Example usage of the Snapshot interface
  const newSnapshot: Snapshot<T, K> = {
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
    data: snapshot.data || new Map<string, Snapshot<T, K>>(),
    initialState: snapshot.initialState || null,
    events: snapshot.events && isCombinedEvents(snapshot.events) 
    ? snapshot.events 
    : undefined, // or use a default value that fits `CombinedEvents<T, K>`
    
    // Snapshot interface with type guard
    snapshotStoreConfig: isSnapshotStoreConfig<T, K>(snapshot.snapshotStoreConfig)
    ? snapshot.snapshotStoreConfig
    : (Array.isArray(snapshotStoreConfigInstance) && snapshotStoreConfigInstance.length > 0 && isSnapshotStoreConfig<T, K>(snapshotStoreConfigInstance[0])
        ? snapshotStoreConfigInstance[0]
        : null),
    getSnapshotItems: snapshot.getSnapshotItems || (() => []), // Replace with actual function
    defaultSubscribeToSnapshots: snapshot.defaultSubscribeToSnapshots || (() => {}), // Replace with actual function
    transformSubscriber: snapshot.transformSubscriber || ((sub: Subscriber<T, K>) => {
      // Transform subscriber here

      return sub;
    }),
    // Add other properties as needed
  };

  // Usage example
  console.log(newSnapshot);
}



const plainDataObject: Record<string, Data<T, K<T>>> = {
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
      video: [],
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
          dispatch: (action: any) => {},
          todos: {},
          todoList: [],
          toggleTodo: (id: string) => {},
          
         
          addTodo: (todo: Todo<T, K<T>>) => {},
          loading: {},
          error: null,
          addTodos: (
            newTodos: Todo<T, K<T>>[],
            data: SnapshotStore<Snapshot<any, any, any>>
          ) => {},
         
          removeTodo: (id: string) => {},
          assignTodoToUser: (todoId: string, userId: string) => {},
          updateTodoTitle: (payload: { id: string; newTitle: string }) => {},
          fetchTodosSuccess: (payload: { todos: Todo<T, K<T>>[] }) => {},
          
          fetchTodosFailure: (payload: { error: string }) => {},
          openTodoSettingsPage: (todoId: number, teamId: number) => {},
          getTodoId: (todo: Todo<T, K<T>>) => null,
          getTeamId: (todo: Todo<T, K<T>>) => null,


          fetchTodosRequest: () => {},
          completeAllTodosSuccess: () => {},
          completeAllTodos: () => {},
          completeAllTodosFailure: (payload: { error: string }) => {},
         

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
          results: [],
          totalCount: 0,
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
          sharingLevel: "",
          sharingScope: "",
          sharingOptions: [],
          allowSharing: true,
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
          sharingPreferences: {}, // Define additional sharing preferences
          
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


const documentManager = useDocumentManagement()

const { snapshotId,
  snapshotContainer,
  criteria,
  category,
  categoryProperties,
  delegate,
  snapshotData
} = storeProps 


const baseConfig = createSnapshotStoreConfig({
  snapshotId,
  snapshotContainer,
  criteria,
  category,
  categoryProperties,
  delegate,
  snapshotData,
});




const snapshotConfig: SnapshotConfig<BaseData, BaseData> = {
  ...baseConfig,
  data: {
    id: "data1",
    title: "Data Title",
    // Add other BaseData properties if needed
  },
  initialState: undefined,
  
  meta: new Map<string, Snapshot<BaseData, BaseData>>(),
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
    callback: (snapshot: Snapshot<BaseData, BaseData>) => { },
    eventRecords: {
      "created": [
        {
          action: "Created snapshot",
          timestamp: new Date(),
          record: new CalendarManagerStoreClass<BaseData, BaseData>(category, documentManager),
          callback: (snapshot: Snapshot<BaseData, BaseData>) => {
            console.log("Snapshot created:", snapshot);
          },
          // Add other BaseData properties if needed
        },
      ],
      "updated": [
        {
          action: "Updated snapshot",
          timestamp: new Date(),
          record: new CalendarManagerStoreClass<BaseData, BaseData>(category, documentManager),
          callback: (snapshot: Snapshot<BaseData, BaseData>) => {
            console.log("Snapshot updated:", snapshot);
          },
          // Add other BaseData properties if needed
        },
      ],
    },

    trigger: (
      event: string | CombinedEvents<BaseData, BaseData> | SnapshotEvents<BaseData, BaseData>,
      snapshot: Snapshot<BaseData, BaseData>,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, BaseData>,
      type: string,
      snapshotData: SnapshotData<BaseData, BaseData>
    ) => {
      // Implement your trigger logic here
    },
  
    on: (
      event: string | CombinedEvents<BaseData, BaseData> | SnapshotEvents<BaseData, BaseData>,
      // event: string,
      callback: (snapshot: Snapshot<BaseData, BaseData>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, BaseData>,
      type: string,
      snapshotData: SnapshotData<BaseData, BaseData>
    ) => {
      // Implement your on logic here
    },
    off: (
      // event: string | CombinedEvents<BaseData, BaseData> | SnapshotEvents<BaseData, BaseData>,
      event: string,
      callback: (snapshot: Snapshot<BaseData, BaseData>) => void,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, BaseData>,
      type: string,
      snapshotData: SnapshotData<BaseData, BaseData>,
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
      // event: string | CombinedEvents<BaseData, BaseData> | SnapshotEvents<BaseData, BaseData>,
      event: string,
      snapshot: Snapshot<BaseData, BaseData>,
      snapshotId: string,
      subscribers: SubscriberCollection<BaseData, BaseData>,
      type: string,
      snapshotStore: SnapshotStore<BaseData, BaseData>,
      dataItems: RealtimeDataItem[],
      criteria: SnapshotWithCriteria<BaseData, BaseData>,
      category: Category,
      snapshotData: SnapshotData<BaseData, BaseData>
    ) => {
      // Implement your emit logic here
    },
    
    initialConfig: {} as SnapshotConfig<BaseData, BaseData>,
    records: {} as Record<string, CalendarManagerStoreClass<BaseData, BaseData>[]>,
    onInitialize: () => { },
    subscribe: (
      event: string,
      callback: (snapshot: Snapshot<BaseData, BaseData>) => void
    ) => { },
    callbacks: {
      default: [(snapshot: Snapshot<BaseData, BaseData>) => {
        // Convert Snapshot<T, K> to a format that can be used with Snapshots<T>
        const snapshotsMap = convertSnapshotToMap(snapshot);
        
        // Assuming convertSnapshotToMap returns a Map or similar structure
        // If Snapshots<T> is a Map, this will be appropriate
        const snapshots: Map<string, any> = snapshotsMap;
    
        // Return the appropriate result or handle the snapshots as needed
        return snapshots;
      }]
    },
  },

  equals: function (data: Snapshot<BaseData, BaseData>) {

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
  
            return thisRecords.every((record: EventRecord<BaseData, BaseData>, index: number) => {
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
  baseMeta: Map<string, Snapshot<BaseData, BaseData>>
): Promise<Map<string, Snapshot<BaseData, BaseData>>> {
  // Create an array of promises for the snapshot creation
  const snapshotPromises = Object.entries(plainDataObject).map(
    async ([key, value]) => {
      const snapshot = await createBaseSnapshot(baseData, baseMeta);
      return [key, snapshot.data] as [string, Snapshot<BaseData, BaseData>];
    }
  );

  // Wait for all promises to resolve
  const resolvedEntries = await Promise.all(snapshotPromises);

  // Create a Map from the resolved entries
  return new Map<string, Snapshot<BaseData, BaseData>>(resolvedEntries);
}


const getCurrentSnapshot = <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string, // ID of the snapshot to retrieve
  storeId: number,
  additionalHeaders?: Record<string, string>,
  snapshotConfigProps?: SnapshotConfigProps<T, K>,
  category?: string | symbol | Category, // Optional category
  snapshotStore?: SnapshotStore<T, K> // Optional store to retrieve from
): Promise<Snapshot<T, K> | null> => {
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

      // Fallback to fetch by ID if no category match
      const snapshot = snapshotContainer.mappedSnapshotData.get(snapshotId);
      resolve(snapshot || null);

    } catch (error) {
      console.error(`Error fetching snapshot for ID: ${snapshotId}`, error);
      reject(error); // Reject with error if something goes wrong
    }
  });
};

// Usage example
const baseData: BaseData = createBaseData({ ...snapshotData });

createDataObject(plainDataObject, baseData, baseMeta).then((dataObject) => {
  console.log(dataObject);
});


const snapshot: Snapshot<BaseData, BaseData> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: {},
  metadata: {},
  data: {
    id: "data1",
    title: "Data Title",
    // Add other BaseData properties if needed
  },
  initialState: undefined,
  meta: new Map<string, Snapshot<BaseData, BaseData>>(),
  events: {
    eventRecords: [
     {
        action: "Created snapshot",
        timestamp: new Date(),
        id: "",
        title: "",
        content: "",
        topics: [],
        highlights: [],
        files: [],
        date: undefined,
        meta: undefined,
        rsvpStatus: "yes",
        participants: [],
        teamMemberId: "",
        getSnapshotStoreData: (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData, K>, SnapshotWithCriteria<BaseData, K>>[]> => {
          throw new Error("Function not implemented.");
        },
        getData: getData()
      },
      {
        action: "Edited snapshot",
        timestamp: new Date(),
        id: "",
        title: "",
        content: "",
        topics: [],
        highlights: [],
        files: [],
        date: undefined,
        meta: undefined,
        rsvpStatus: "yes",
        participants: [],
        teamMemberId: "",
        getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
          throw new Error("Function not implemented.");
        },
        getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
          throw new Error("Function not implemented.");
        }
      },
    ],
  },
  
  getSnapshotId: (key: string | SnapshotData<BaseData, BaseData>): unknown => {
    if (typeof key === "string") {
      return key;
    } else {
      return key._id;
    }
  },

  compareSnapshotState: function (snapshot: Snapshot<BaseData, BaseData> | null, state: any): boolean {
    if (!snapshot || !snapshot.timestamp || !snapshot.tags || !snapshot.data) {
      return false;
    }
    // Implement specific comparison logic based on the properties of snapshot and state
    return (
      snapshot.id === state.id &&
      snapshot.category === state.category &&
      snapshot.timestamp === new Date(state.timestamp).getTime() &&
      snapshot.createdBy === state.createdBy &&
      snapshot.description === state.description &&
      snapshot.tags.join(",") === state.tags.join(",") &&
      JSON.stringify(snapshot.metadata) === JSON.stringify(state.metadata) &&
      ('id' in snapshot.data && 'id' in state.data && snapshot.data.id === state.data.id) &&
      ('title' in snapshot.data && 'title' in state.data && snapshot.data.title === state.data.title)
      // Add other property comparisons as needed
    );
  },
  eventRecords: null,
  snapshotStore: null,
  getParentId: function (): string | null {
    return this.parentId || null;
  },
  getChildIds: function (): string[] {
    return this.metadata.childIds || [];
  },
  addChild: function (
    parentId: string, 
    childId: string, 
    childSnapshot: CoreSnapshot<BaseData<any, any, any>, BaseData<any, any, any>, never>
  ): void {
    if (!this.metadata.childIds) {
      this.metadata.childIds = [];
    }
    this.metadata.childIds.push(childSnapshot.id);
    // Ensure the child snapshot has the current snapshot as its parent
    childSnapshot.metadata.parentId = this.id;
  },
  removeChild: function (childSnapshot: Snapshot<BaseData, BaseData>): void {
    if (!this.metadata.childIds) {
      return;
    }
    this.metadata.childIds = this.metadata.childIds.filter((id: string) => id !== childSnapshot.id);
    // Remove the current snapshot as the parent of the child snapshot
    childSnapshot.metadata.parentId = null;
  },
  getChildren: function (): Snapshot<BaseData, BaseData>[] {
    // Ensure dataObject is available or create it if not present
    if (!this.dataObject) {
      createDataObject(plainDataObject, baseData, baseMeta).then((dataObject) => {
        this.dataObject = dataObject; // Store the dataObject after creation
      }).catch((error) => {
        console.error('Error creating dataObject:', error);
      });
    }
    
    // Return the children based on the childIds or an empty array
    return this.metadata.childIds
      ? this.metadata.childIds.map((id: string) => this.dataObject?.get(id)) // Use the stored dataObject
      : [];
  },
  hasChildren: function (): boolean {
    return this.metadata.childIds && this.metadata.childIds.length > 0;
  },
  isDescendantOf: function (parentSnapshot: Snapshot<BaseData, BaseData>,
    childSnapshot: Snapshot<BaseData, BaseData>

  ): boolean {
    const childIds = this.getChildIds(childSnapshot);
    if (Array.isArray(childIds)) {
      return childIds.includes(parentSnapshot.id);
    }
    return false;
  },
  dataItems: null,
  newData: null,
  stores: null,
  getStore: function (
    storeId: number,
    snapshotStore: SnapshotStore<BaseData, BaseData>,
    snapshotId: string,
    snapshot: Snapshot<BaseData, BaseData>,
    type: string,
    event: Event
  ): SnapshotStore<BaseData, BaseData> | null {
      return new SnapshotStore<BaseData, BaseData>(storeId, options, config, operation);
  },
  addStore: function (
    storeId: number,
    snapshotStore: SnapshotStore<BaseData, BaseData>,
    snapshotId: string,
    snapshot: Snapshot<BaseData, BaseData>,
    type: string,
    event: Event
  ): SnapshotStore<BaseData, BaseData> | null {
    if (!this.stores) {
      this.stores = [];
    }
    // verify if store is already added
    if (this.stores[storeId]) {
      return null;
    }
    this.stores[storeId] = snapshotStore;
    return snapshotStore;
  },

  mapSnapshot: function (
    storeId: number,
    snapshotStore: SnapshotStore<BaseData, BaseData>,
    snapshotId: string,
    snapshot: Snapshot<BaseData, BaseData>,
    type: string,
    event: Event,
    subscribers?: SubscriberCollection<BaseData, BaseData>,
  ): Snapshot<BaseData, BaseData> | null {
    if (!this.stores) {
      this.stores = [];
    }
  
    // Verify if store is already added
    if (!this.stores[storeId]) {
      this.stores[storeId] = snapshotStore;
    }
  
    const store = this.stores[storeId];
  
    // Verify if store is already removed
    if (!store) {
      console.warn(`Store with ID ${storeId} does not exist.`);
      return snapshot;
    }
  
    switch (type) {
      case 'add':
        store.addSnapshot(
          snapshot,
          snapshotId,
          subscribers
        );
        break;
      case 'remove':
        store.removeSnapshot(snapshotId);
        break;
      case 'update':
        store.updateSnapshot(snapshotId, snapshot);
        break;
      default:
        console.warn(`Unsupported type: ${type}`);
    }
  
    console.log(`Handled snapshot with ID: ${snapshotId} for store ID: ${storeId} with event type: ${type}`, event);
  
    return snapshot;
  },
  removeStore: function (
    storeId: number,
    store: SnapshotStore<BaseData, BaseData>,
    snapshotId: string,
    snapshot: Snapshot<BaseData, BaseData>,
    type: string,
    event: Event
  ): void {
    throw new Error("Function not implemented.");
  },
  unsubscribe: function (
    callback: Callback<Snapshot<BaseData, BaseData>>)
    : void {
    throw new Error("Function not implemented.");
  },
  addSnapshotFailure: function (
    snapshotManager: SnapshotManager<BaseData, BaseData>,
    snapshot: Snapshot<BaseData, BaseData>,
    payload: { error: Error; }): void {
    throw new Error("Function not implemented.");
  },
  configureSnapshotStore: function (
    snapshotStore: SnapshotStore<BaseData, BaseData>,
    snapshotId: string,
    data: Map<string, Snapshot<BaseData, BaseData>>,
    events: Record<string, CalendarEvent<BaseData, BaseData>[]>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<BaseData, BaseData>,
    payload: ConfigureSnapshotStorePayload<BaseData>,
    store: SnapshotStore<any, BaseData>,
    callback: (snapshotStore: SnapshotStore<BaseData, BaseData>

    ) => void): void | null {
    throw new Error("Function not implemented.");
  },
  updateSnapshotSuccess: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<BaseData, BaseData>,
    snapshot: Snapshot<BaseData, BaseData>,
    payload: { error: Error; }
  ): void | null {
    throw new Error("Function not implemented.");
  },
  createSnapshotFailure: function (
    snapshotId: string,
    snapshotManager: SnapshotManager<BaseData, BaseData>,
    snapshot: Snapshot<BaseData, BaseData>,
    payload: { error: Error; }
  ): Promise<void> {
    throw new Error("Function not implemented.");
  },
  createSnapshotStores: function (id: string, snapshotId: string,
    snapshot: Snapshot<BaseData, BaseData>,
    napshotStore: SnapshotStore<BaseData, BaseData>,
    snapshotManager: SnapshotManager<BaseData, BaseData>,
    payload: CreateSnapshotStoresPayload<BaseData, BaseData>,
    callback: (
      snapshotStore: SnapshotStore<BaseData, BaseData>[]
    ) => void | null,
    snapshotStoreData?: SnapshotStore<BaseData, BaseData>[] | undefined, category?: string | symbol | Category, snapshotDataConfig?: SnapshotStoreConfig<BaseData, BaseData>[] | undefined): SnapshotStore<BaseData, BaseData>[] | null {
    throw new Error("Function not implemented.");
  },
  handleSnapshot: function <T, Meta extends Record<string, unknown>>(
    id: string,
    snapshotId: string,
    snapshot: Data<T> | null,
    snapshotData: Data<T>,
    category: symbol | string | Category | undefined,
    callback: (snapshot: Data<T>) => void,
    snapshots: SnapshotsArray<Data<T>, Meta>,
    type: string,
    event: SnapshotEvents<Data<T>, Meta>,
    snapshotContainer?: Data<T>,
    snapshotStoreConfig?: SnapshotStoreConfig<Data<T>, Meta>,
  ): Promise<Snapshot<Data<T>, Meta> | null> {

    return new Promise((resolve, reject) => {
      // Check if the snapshot is null
      if (snapshot === null) {
        reject("Snapshot is null");
        return;
      }

      const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling
  
      // Determine if the snapshot exists in the snapshot array
      const existingSnapshot = snapshots.find(s => s.id === snapshotId);
    
      if (existingSnapshot) {
        // Update the existing snapshot
        existingSnapshot.data = snapshotData;
        existingSnapshot.category = category;
        existingSnapshot.timestamp = new Date(); // Update the timestamp to the current time
  
        // Trigger the callback function with the updated snapshot
        callback(existingSnapshot.data);
  
        // Handle event if necessary
        if (event) {
          event.emit('snapshotUpdated', existingSnapshot);
        }
  
        // If using snapshot store configuration, handle the snapshot store update
        if (snapshotStoreConfig) {
          // Example: Update the snapshot store based on the configuration
          // This is a placeholder; adjust according to your actual snapshot store logic
          const snapshotStore = snapshotStoreConfig.getSnapshotStore();
          if (snapshotStore) {
            snapshotStore.addSnapshot(existingSnapshot);
          }
        }
  
        resolve(existingSnapshot); // Return the updated snapshot
      } else {
        // Create a new snapshot if it does not exist
        const newSnapshot: Snapshot<Data<T>, Meta> = {
          id: snapshotId,
          data: snapshotData,
          category: category,
          timestamp: new Date(), // Set the timestamp to the current time
          // Include other necessary properties and metadata
        };
  
        // Add the new snapshot to the snapshots array
        snapshots.push(newSnapshot);
  
        // Trigger the callback function with the new snapshot data
        callback(newSnapshot.data);
  
        // Handle event if necessary
        if (event) {
          event.emit('snapshotCreated', newSnapshot);
        }
  
        // If using snapshot store configuration, handle the snapshot store update
        if (snapshotStoreConfig) {
          // Example: Add the new snapshot to the snapshot store
          // This is a placeholder; adjust according to your actual snapshot store logic
          const snapshotStore = snapshotStoreConfig.getSnapshotStore();
          if (snapshotStore) {
            snapshotStore.addSnapshot(newSnapshot);
          }
        }
  
        resolve(newSnapshot);
      }
    });
  }};

export { isCombinedEvents, processSnapshot, snapshot, snapshotConfig };

