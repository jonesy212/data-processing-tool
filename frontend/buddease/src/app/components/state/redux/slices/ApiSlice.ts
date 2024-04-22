import { ApiConfig } from "@/app/configs/ConfigurationService";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addTask } from "./TaskSlice";
import { useDispatch } from "react-redux";

interface ApiManagerState {
  apiConfigs: ApiConfig[];
  apiConfigName: string;
  apiConfigUrl: string;
  apiConfigTimeout: number;
  todos: string[];
  tasks: { id: string; title: string; isComplete: boolean }[];
  realTimeCollaboration: boolean;
}

const initialState: ApiManagerState = {
  apiConfigs: [],
  apiConfigName: "",
  apiConfigUrl: "",
  apiConfigTimeout: 0,
  todos: [],
  tasks: [],
};

const dispatch = useDispatch();
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

    enableRealTimeCollaboration: (
      state,
      action: PayloadAction<void>
    ) => { 
      // logic to enable real-time collaboration
      console.log("Real-time collaboration enabled");
      dispatch(addTask({
        id: Date.now().toString(),
        title: "Enable real-time collaboration",
        isComplete: false
      }));
      state.realTimeCollaboration = true;
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
export const markTaskAsComplete = (taskId: string) => async (dispatch: any) => {
  dispatch(addTask({ id: taskId, title: "task" }));
};

// Extend the method to mark todos as complete
export const markTodoAsComplete = (todoId: string) => async (dispatch: any) => {
  dispatch(addTask({ id: todoId, title: "todo" }));
};

// Export selector for accessing the API configurations from the state
export const selectApiConfigs = (state: { apiManager: ApiManagerState }) =>
  state.apiManager.apiConfigs;

// Export reducer for the API manager slice
export default useApiManagerSlice.reducer;

export type { ApiManagerState };
