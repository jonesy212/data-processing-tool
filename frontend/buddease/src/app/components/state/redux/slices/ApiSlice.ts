import { createVersionInfo } from "@/app/components/versions/createVersionInfo";
import { Draft, produce  } from "immer";
import CommunicationAPI from "@/app/api/CommunicationAPI";
import { CrossCulturalCommunication, Language, TimeZone } from "@/app/components/communications/Language";
import { DataAnalysisTool, Decision, VisualizationResult } from "@/app/components/interfaces/options/CollaborationOptions";
import { CloudStorageProvider } from "@/app/components/interfaces/provider/CloudStorageProvider";
import { BaseData, Data } from "@/app/components/models/data/Data";
import { PriorityTypeEnum } from "@/app/components/models/data/StatusType";
import { Phase } from "@/app/components/phases/Phase";
import { AnalyticsTool } from "@/app/components/projects/DataAnalysisPhase/AnalyticsTool";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { Payment, Revenue, SubscriptionPlan } from "@/app/components/subscriptions/SubscriptionPlan";
import { EncryptionSetting, Permission } from "@/app/components/users/Permission";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { DetailsItem } from "../../stores/DetailsListStore";
import { WritableDraft } from "../ReducerGenerator";
import { addTask } from "./TaskSlice";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Task } from "@/app/components/models/tasks/Task";
import { T, K } from "@/app/components/models/data/dataStoreMethods";
import { InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { fetchUserAreaDimensions, UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { useMetadata } from "@/app/configs/useMetadata";
import Version, { version } from "@/app/components/versions/Version";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { createLatestVersion } from "@/app/components/versions/createLatestVersion";

interface CommunityEvent {
  id: string;
  name: string;
  date: string;
  description: string;
}

interface Discussion {
  id: string;
  topic: string;
  messages: string[];
}

interface ParticipationIncentive {
  id: string;
  description: string;
  points: number;
}

interface ApiManagerState {
  apiConfigs: ApiConfig[];
  apiConfigName: string;
  apiConfigUrl: string;
  apiConfigTimeout: number;
  todos: string[];
  tasks: { id: string; title: string; isComplete: boolean }[];
  realTimeCollaboration: boolean;


  realTimeCollaborationEnabled: boolean;
  accessPermissions: Record<string, string[]>;
  collaborationToolsEnabled: boolean;

  phases: Phase[];
  progress: number;

  dataAnalysisTools: DataAnalysisTool[];
  visualizationResults: VisualizationResult[];
  decisions: Decision[];


  communityEvents: CommunityEvent[];
  discussions: Discussion[];
  participationIncentives: ParticipationIncentive[];

  subscriptionPlans: SubscriptionPlan[], // Initialize subscription plans array
  payments: Payment[], // Initialize payments array
  revenue: { totalRevenue: number, payments: Payment[], pendingRevenue: number, failedRevenue: number }, // Initialize revenue object
  languages: Language[], // Initialize languages array
  timeZones: TimeZone[], // Initialize time zones array
  crossCulturalCommunications: CrossCulturalCommunication[], // Initialize cross-cultural communications array

  rewards: Reward[], // Initialize rewards array
  rewardHistory: RewardHistory[], // Initialize reward history array
  rewardParameters: RewardParameters[], // Initialize reward parameters array

  permissions: Permission[] | undefined
  
  encryptionSettings: EncryptionSetting,
  privacyCompliance: { policyVersion: string, complianceDate: string },
  userFeedback: UserFeedback[], // Initialize user feedback array
  supportTickets: SupportTicket[], // Initialize support tickets array
  userInquiries: UserInquiry[], // Initialize user inquiries array
  communicationAPIs: CommunicationAPI[] | undefined
  authenticationProviders: AuthenticationProvider[] | undefined
  cloudStorageProviders: CloudStorageProvider[] | undefined
  analyticsTools: AnalyticsTool[] | undefined,
  
}

const initialState: ApiManagerState = {
  apiConfigs: [],
  apiConfigName: "",
  apiConfigUrl: "",
  apiConfigTimeout: 0,
  todos: [],
  tasks: [],
  realTimeCollaboration: false,

  realTimeCollaborationEnabled: true, // Set initial state for real-time collaboration
  accessPermissions: {}, // Initialize access permissions object
  collaborationToolsEnabled: true, // Set initial state for collaboration tools


  phases: [], // Initialize phases array
  progress: 0, // Set initial progress value

  dataAnalysisTools: [], // Initialize data analysis tools array
  visualizationResults: [], // Initialize visualization results array
  decisions: [], // Initialize decisions array


  communityEvents: [], // Initialize community events array
  discussions: [], // Initialize discussions array
  participationIncentives: [], // Initialize participation incentives array


  subscriptionPlans: [], // Initialize subscription plans array
  payments: [], // Initialize payments array
  revenue: { totalRevenue: 0, payments: [], pendingRevenue: 0, failedRevenue: 0 }, // Initialize revenue object
  languages: [] as Language[], // Initialize languages array

  timeZones: [], // Initialize time zones array
  crossCulturalCommunications: [],
  rewards: [],
  rewardHistory: [],
  rewardParameters: [],
  encryptionSettings: {
    enabled: false,
    algorithm: ""
  },
  privacyCompliance: {
    policyVersion: "",
    complianceDate: ""
  },
  userFeedback: [],
  supportTickets: [],
  userInquiries: [],
  permissions: undefined,
  communicationAPIs: undefined,
  authenticationProviders: undefined,
  cloudStorageProviders: undefined,
  analyticsTools: undefined
};



const dispatch = useDispatch();


const area = fetchUserAreaDimensions().toString()
const currentMetadata: UnifiedMetaDataOptions<T, K<T>> = useMetadata<T, K<T>>(area)

const initializedState: InitializedState<T, K<T>> = {
  metadata: currentMetadata,
  initialized: false,
  initializedState: initialState,
  initializedStateType: "ApiManagerState"
}

const mutableVersion = version as WritableDraft<Version>; // Cast to WritableDraft
  
export const useApiManagerSlice = createSlice({
  name: "apiManager",
  initialState,
  reducers: {
    updateApiConfigName: (state, action: PayloadAction<string>) => {
      state.apiConfigName = action.payload;
    },

    updateApiConfigUrl: (state, action: PayloadAction<string>) => {
      state.apiConfigUrl = action.payload;
    },

    markTaskPending: (
      state,
      action: PayloadAction<{
        id: string
      }>) => {
      const { id } = action.payload;
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === id);
      if (taskIndex >= 0) {
        state.tasks[taskIndex].isComplete = false;
      }
    },

    updateApiConfigTimeout: (state, action: PayloadAction<number>) => {
      state.apiConfigTimeout = action.payload;
    },

    addApiConfig: (state, action: PayloadAction<ApiConfig>) => {
      state.apiConfigs.push(action.payload);
      state.apiConfigName = "";
      state.apiConfigUrl = "";
      state.apiConfigTimeout = 0;
    },

    removeApiConfig: (state, action: PayloadAction<number>) => {
      state.apiConfigs = state.apiConfigs.filter(
        (config) => config.id !== action.payload
      );
    },


    enableRealTimeCollaboration: <
      T extends BaseData<any> = BaseData<any, any>, 
      K extends T = T
    >(
      state: Draft<ApiManagerState>,
      action: PayloadAction<void>
    ) => {
      // logic to enable real-time collaboration
      console.log("Real-time collaboration enabled");
      dispatch(addTask({
        id: Date.now().toString(),
        title: "Enable real-time collaboration",
        isComplete: false,
        description: "",
        assignedTo: null,
        assigneeId: undefined,
        dueDate: undefined,
        payload: undefined,
        priority: PriorityTypeEnum.Low,
        previouslyAssignedTo: [],
        done: false,
        data: undefined,
        source: "user",
        startDate: undefined,
        endDate: undefined,
        isActive: false,
        tags: {},
        version: mutableVersion,
        lastUpdated: {} as WritableDraft<VersionHistory>,
        config: {} as WritableDraft<Record<string, any>>,
        permissions: [],

        [Symbol.iterator]: function (): Iterator<any, any, undefined> {
          throw new Error("Function not implemented.");
        },
        getData: function (): Promise<Task<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>, StructuredMetadata<T, K>>> {
          throw new Error("Function not implemented.");
        },
        taskId: "",
        taskName: "",
        _id: "",
        createdBy: "",
        timestamp: undefined,
        metadataEntries: {},
        customFields: {},
        versionData: [],
        latestVersion: createLatestVersion(),
        apiEndpoint: "",
        apiKey: undefined,
        timeout: 0,
        retryAttempts: 0,
        name: "",
        category: "",
        metadata: {} as WritableDraft<UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>, StructuredMetadata<T, K>, never>>,
        initialState: initializedState,
        meta: undefined,
        mappedSnapshot: undefined,
        events: undefined,
        participants: [],
        uploadedAt: undefined,
        phase: undefined,
        currentMeta: undefined,
        currentMetadata: undefined,
        label: undefined
      }));
      state.realTimeCollaboration = true;
    },

    // New reducers
    disableRealTimeCollaboration: (state) => {
      // Disable real-time collaboration
      state.realTimeCollaborationEnabled = false;
    },
  
    updateAccessPermissions: (
      state,
      action: PayloadAction<{ userId: string; permissions: string[] }>
    ) => {
      const { userId, permissions } = action.payload;
      // Update access permissions for the specified user
      state.accessPermissions[userId] = permissions;
    },
  
    controlCollaborationTools: (
      state,
      action: PayloadAction<boolean>
    ) => {
      const enableTools = action.payload;
      // Control collaboration tools based on the enableTools parameter
      state.collaborationToolsEnabled = enableTools;
    },


    // New reducers
    markPhaseAsCompleted: (state, action: PayloadAction<string>) => {
      const phaseId = action.payload;
      // Find the phase by ID and mark it as completed
      const phase = state.phases.find(phase => phase._id === phaseId);
      if (phase) {
        phase.completed = true;
      }
    },

    updatePhaseDetails: (
      state,
      action: PayloadAction<{
        phaseId: string;
        details: WritableDraft<DetailsItem<Data>>;
      }>
    ) => {
      const { phaseId, details } = action.payload;
      const phaseIndex = state.phases.findIndex(
        (phase) => phase._id === phaseId
      );
      if (phaseIndex !== -1) {
        state.phases[phaseIndex].details = details;
      }
    },

    trackProgress: (state, action: PayloadAction<number>) => {
      const newProgress = action.payload;
      // Update the progress value
      state.progress = newProgress;
    },
  
    integrateDataAnalysisTools: (
      state,
      action: PayloadAction<DataAnalysisTool>
    ) => {
      const tool = action.payload;
      // Integrate data analysis tool
      state.dataAnalysisTools.push(tool);
    },

    visualizeDataResults: (
      state,
      action: PayloadAction<VisualizationResult>
    ) => {
      const result = action.payload;
      // Add visualization result
      state.visualizationResults.push(result);
    },

    makeDataDrivenDecisions: (
      state,
      action: PayloadAction<Decision>
    ) => {
      const decision = action.payload;
      // Record decision
      state.decisions.push(decision);
    },

    createCommunityEvent: (
      state,
      action: PayloadAction<CommunityEvent>
    ) => {
      const event = action.payload;
      // Add community event
      state.communityEvents.push(event);
    },

    manageCommunityDiscussions: (
      state,
      action: PayloadAction<Discussion>
    ) => {
      const discussion = action.payload;
      // Add or update community discussion
      const index = state.discussions.findIndex(d => d.id === discussion.id);
      if (index >= 0) {
        state.discussions[index] = discussion;
      } else {
        state.discussions.push(discussion);
      }
    },

    incentivizeParticipation: (
      state,
      action: PayloadAction<ParticipationIncentive>
    ) => {
      const incentive = action.payload;
      // Add participation incentive
      state.participationIncentives.push(incentive);
    },

    manageSubscriptionPlans: (
      state,
      action: PayloadAction<SubscriptionPlan>
    ) => {
      const plan = action.payload;
      const planIndex = state.subscriptionPlans.findIndex(p => p.id === plan.id);
      if (planIndex >= 0) {
        // Update existing subscription plan
        state.subscriptionPlans[planIndex] = plan;
      } else {
        // Add new subscription plan
        state.subscriptionPlans.push(plan);
      }
    },

    processPayments: (state, action: PayloadAction<Payment>) => {
      const payment = action.payload;

      const paymentIndex = state.payments.findIndex((p) => p.id === payment.id);
      if (paymentIndex >= 0) {
        state.payments[paymentIndex] = payment;
      } else {
        state.payments.push(payment);
      }

      switch (payment.status) {
        case "completed":
          state.revenue.totalRevenue += payment.amount;
          state.revenue.payments.push(payment);
          break;
        case "pending":
          state.revenue.pendingRevenue += payment.amount;
          break;
        case "failed":
          state.revenue.failedRevenue += payment.amount;
          break;
        default:
          break;
      }
    },
    

// Update the trackRevenue reducer

// Update the trackRevenue reducer
trackRevenue: (state, action: PayloadAction<Revenue>) => {
  // Calculate total revenue by summing up all completed payments
  const totalRevenue = state.payments
    .filter((payment) => payment.status === "completed")
    .reduce(
      (total: number, payment: WritableDraft<Payment>) =>
        total + payment.amount,
      0
    );

  // Update state with the calculated total revenue
  state.revenue.totalRevenue = totalRevenue;
},

    
    markTaskComplete: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const { id } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === id);
      if (taskIndex >= 0) {
        state.tasks[taskIndex].isComplete = true;
      }
    },

    supportMultipleLanguages: (
      state,
      action: PayloadAction<Language>
    ) => {
      const language = action.payload;
      // Add or update language support
      const index = state.languages.findIndex(l => l.code === language.code);
      if (index >= 0) {
        state.languages[index] = language;
      } else {
        state.languages.push(language);
      }
    },

    accommodateTimeZones: (
      state,
      action: PayloadAction<TimeZone>
    ) => {
      const timeZone = action.payload;
      // Add or update time zone
      const index = state.timeZones.findIndex(tz => tz.id === timeZone.id);
      if (index >= 0) {
        state.timeZones[index] = timeZone;
      } else {
        state.timeZones.push(timeZone);
      }
    },

    facilitateCrossCulturalCommunication: (
      state,
      action: PayloadAction<CrossCulturalCommunication>
    ) => {
      const communication = action.payload;
      // Add or update cross-cultural communication preferences for a user
      const index = state.crossCulturalCommunications.findIndex(c => c.userId === communication.userId);
      if (index >= 0) {
        state.crossCulturalCommunications[index] = communication;
      } else {
        state.crossCulturalCommunications.push(communication);
      }
    },

    distributeRewards: (
      state,
      action: PayloadAction<Reward>
    ) => {
      const reward = action.payload;
      state.rewards.push(reward);
    },

    trackRewardHistory: (
      state,
      action: PayloadAction<{
        userId: string;
        reward: Reward;
      }>
    ) => {
      const { userId, reward } = action.payload;
      const userHistory = state.rewardHistory.find(r => r.userId === userId);
      if (userHistory) {
        userHistory.rewards.push(reward);
      } else {
        state.rewardHistory.push({ userId, rewards: [reward] });
      }
    },

    adjustRewardParameters: (
      state,
      action: PayloadAction<RewardParameters[]>
    ) => {
      state.rewardParameters = action.payload;
    },

    managePermissions: (
      state,
      action: PayloadAction<Permission>
    ) => {
      const { userId, permissions, permissionType } = action.payload;
      const userIndex =
        state.permissions?.findIndex((p: Permission) => p.userId === userId) ?? -1;
    
      // Create a new state object to avoid mutating the original state
      const newState = { ...state };
    
      if (userIndex >= 0) {
        // Update existing user's permissions
        if (newState.permissions) {
          newState.permissions = [...newState.permissions];
          newState.permissions[userIndex] = { ...newState.permissions[userIndex], permissions };
        }
      } else {
        // Add new user's permissions
        if (!newState.permissions) {
          newState.permissions = [];
        }
        newState.permissions.push({ userId, permissions, permissionType });
      }
    
      return newState;
    },
    
    implementDataEncryption: (
      state,
      action: PayloadAction<EncryptionSetting>
    ) => {
      const encryptionSetting = action.payload;
      // Update encryption settings
      state.encryptionSettings = encryptionSetting;
    },

    ensurePrivacyCompliance: (
      state,
      action: PayloadAction<{ policyVersion: string; complianceDate: string }>
    ) => {
      const privacyCompliance = action.payload;
      // Update privacy compliance settings
      state.privacyCompliance = privacyCompliance;
    },


    collectUserFeedback: (
      state,
      action: PayloadAction<UserFeedback>
    ) => {
      const feedback = action.payload;
      // Add new user feedback to the state
      state.userFeedback.push(feedback);
    },

    provideCustomerSupport: (
      state,
      action: PayloadAction<SupportTicket>
    ) => {
      const ticket = action.payload;
      const ticketIndex = state.supportTickets.findIndex(t => t.id === ticket.id);
      if (ticketIndex >= 0) {
        // Update existing support ticket
        state.supportTickets[ticketIndex] = ticket;
      } else {
        // Add new support ticket
        state.supportTickets.push(ticket);
      }
    },

    integrateAuthenticationProviders: (
      state,
      action: PayloadAction<AuthenticationProvider>
    ) => {
      const provider = action.payload;
      state.authenticationProviders?.push(provider);
    },

    connectWithCloudStorage: (
      state,
      action: PayloadAction<CloudStorageProvider>
    ) => {
      const provider = action.payload;
      state.cloudStorageProviders?.push(provider);
    },

    utilizeAnalyticsTools: (
      state,
      action: PayloadAction<AnalyticsTool>
    ) => {
      const tool = action.payload;
      state.analyticsTools?.push(tool);
    },

    leverageCommunicationAPIs: (
      state,
      action: PayloadAction<CommunicationAPI[]>
    ) => {
      const api = action.payload;
      if(state.communicationAPIs !== undefined) {
        state.communicationAPIs = [...state.communicationAPIs, ...api];
        
}
    },

    addressUserInquiries: (
      state,
      action: PayloadAction<UserInquiry>
    ) => {
      const inquiry = action.payload;
      const inquiryIndex = state.userInquiries.findIndex(i => i.id === inquiry.id);
      if (inquiryIndex >= 0) {
        // Update existing user inquiry
        state.userInquiries[inquiryIndex] = inquiry;
      } else {
        // Add new user inquiry
        state.userInquiries.push(inquiry);
      }
    },
  },
});

// Export actions
export const {
  updateApiConfigName,
  updateApiConfigUrl,
  updateApiConfigTimeout,
  addApiConfig,
  removeApiConfig,

  // Real-Time Collaboration Features
  enableRealTimeCollaboration,
  disableRealTimeCollaboration,
  updateAccessPermissions,
  controlCollaborationTools,

  // Project Management Enhancements
  markPhaseAsCompleted,
  updatePhaseDetails,
  trackProgress,

  // Data Analysis Tools
  integrateDataAnalysisTools,
  visualizeDataResults,
  makeDataDrivenDecisions,

  // Community Engagement
  createCommunityEvent,
  manageCommunityDiscussions,
  incentivizeParticipation,

  // Monetization Features
  manageSubscriptionPlans,
  processPayments,
  trackRevenue,

  // Global Collaboration Enhancements
  supportMultipleLanguages,
  accommodateTimeZones,
  facilitateCrossCulturalCommunication,

  // User Rewards System
  distributeRewards,
  trackRewardHistory,
  adjustRewardParameters,

  
  // Security and Privacy Settings
  managePermissions,
  implementDataEncryption,
  ensurePrivacyCompliance,

  // Feedback and Support Features
  collectUserFeedback,
  provideCustomerSupport,
  addressUserInquiries,

  // Integration with Third-Party Services
  integrateAuthenticationProviders,
  connectWithCloudStorage,
  utilizeAnalyticsTools,
  leverageCommunicationAPIs,
} = useApiManagerSlice.actions;

// Extend the method to mark tasks as complete
function convertToWritableMetadata<
  T extends BaseData<any>,
  K extends T
>(
  metadata: UnifiedMetaDataOptions<T, K, StructuredMetadata<T, K>, never>
): WritableDraft<UnifiedMetaDataOptions<BaseData<any>, BaseData<any>, StructuredMetadata<any>, never>> {
  const mutableMetadata: WritableDraft<UnifiedMetaDataOptions<BaseData<any>, BaseData<any>, StructuredMetadata<any>, never>> = {
    ...metadata,
    childIds: metadata.childIds?.map((child) => ({ ...child } as WritableDraft<BaseData<any>>)),
  };

  return mutableMetadata;
}

export const markTaskAsComplete = (taskId: string, title: string) => async (dispatch: any) => {
   // Assuming `version` is the current immutable version object
  const mutableMetadata = convertToWritableMetadata(currentMetadata);


  dispatch(addTask({
    id: taskId,
    title: title,
    description: "",
    assignedTo: null,
    assigneeId: undefined,
    dueDate: undefined,
    payload: undefined,
    priority: PriorityTypeEnum.Low,
    previouslyAssignedTo: [],
    done: false,
    data: undefined,
    source: "user",
    startDate: undefined,
    endDate: undefined,
    isActive: false,
    tags: {},
    _id: "",
    timestamp: new Date(),
    initialState: "",
    createdBy: "",
   
    category: "",
    name: "",
    metadata: mutableMetadata,
    version: mutableVersion,
 
    })
  );
};


// Extend the method to mark todos as complete
export const markTodoAsComplete = (todoId: string, title: string) => async (dispatch: any) => {
  dispatch(addTask({
    id: todoId,
    title: title,
    description: "",
    assignedTo: null,
    assigneeId: undefined,
    dueDate: undefined,
    payload: undefined,
    priority: PriorityTypeEnum.Low,
    previouslyAssignedTo: [],
    done: false,
    data: undefined,
    source: "user",
    startDate: undefined,
    endDate: undefined,
    isActive: false,
    tags: {},
    getData: function (): Promise<Task<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>>, BaseData<any, any, StructuredMetadata<any, any>>>>> {
      throw new Error("Function not implemented.");
    },
    _id: "",
    timestamp: undefined,
    category: "",
    createdBy: "",
    name: "",
    metadata: undefined,
    initialState: undefined,
    meta: undefined,
    permissions: [],
    taskId: "",
    taskName: "",
    metadataEntries: undefined,
    version: undefined,
    lastUpdated: undefined,
    config: undefined,
    customFields: undefined,
    versionData: [],
    latestVersion: undefined,
    apiEndpoint: "",
    apiKey: undefined,
    timeout: 0,
    retryAttempts: 0,
    mappedSnapshot: undefined,
    events: undefined,
    participants: [],
    uploadedAt: undefined,
    phase: undefined,
    currentMeta: undefined,
    currentMetadata: undefined,
    label: undefined
  }));
};

// Export selector for accessing the API configurations from the state
export const selectApiConfigs = (state: { apiManager: ApiManagerState }) =>
  state.apiManager.apiConfigs;

// Export reducer for the API manager slice
export default useApiManagerSlice.reducer;

export type { ApiManagerState };
