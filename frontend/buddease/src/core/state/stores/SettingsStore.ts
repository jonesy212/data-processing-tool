SettingsStore.ts
import { LanguageEnum } from '@/core/communications/LanguageEnum';
import { ThemeEnum } from '@/core/libraries/ui/theme/Theme';
import { NotificationChannels } from '@/core/notifications/NotificationChannels';
import { Settings } from '@/core/state/hybrid/SettingsManagerStore';
import { UserManagerState } from '@/core/state/redux/slices/UserSlice';
import NotificationStore from '@/core/state/stores/NotificationStore';
import { YourSettingsResponseType } from '@/core/typings/responseTypes';
import { makeAutoObservable, reaction } from "mobx";
import { v4 as uuid } from "uuid";

/**
 * Main SettingsStore for managing application settings
 * Handles orchestration and overall settings management
 */
export class SettingsStore {
  settings: Settings | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  notificationStore: NotificationStore;

  constructor(notificationStore?: NotificationStore) {
    this.notificationStore = notificationStore || new NotificationStore({
      email: { enabled: true },
      push: { enabled: true },
      inApp: { enabled: true },
      advanced: {
        chat: { enabled: true },
        videoCall: { enabled: false },
        screenShare: { enabled: false },
      },
      deliveryStrategy: "all",
      retryPolicy: { maxRetries: 3, retryInterval: 5000 },
      quietHours: { enabled: false, startTime: "22:00", endTime: "07:00", timeZone: "UTC", days: [] },
    });

    makeAutoObservable(this);

    // Reaction: log settings changes
    reaction(
      () => this.settings,
      (settings) => console.log('Settings updated:', settings)
    );

    // Reaction: log loading state changes
    reaction(
      () => this.isLoading,
      (loading) => console.log('Settings loading:', loading)
    );
  }

  // -------------------
  // Core Settings Methods
  // -------------------
  
  setSettings(settings: Settings | null) {
    this.settings = settings;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  reset() {
    this.settings = null;
    this.isLoading = false;
    this.error = null;
    
    this.notificationStore.addNotification({
      id: uuid(),
      message: "Settings reset successfully",
      type: "success",
      timestamp: new Date(),
      read: false
    });
  }

  // -------------------
  // Fetch Settings
  // -------------------
  async fetchSettings() {
    this.setLoading(true);
    this.setError(null);
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - replace with actual API response
      const mockSettings: Settings = {
        id: uuid(),
        appName: "Buddease",
        communicationMode: "real-time",
        defaultFileType: "json",
        theme: ThemeEnum.LIGHT,
        isNotificationsEnabled: true,
        notifications: [],
        language: LanguageEnum.English,
        collaborationMode: "real-time",
        dataSync: "automatic",
        defaultCurrency: "USD",
        apiAccessLevel: "read-write",
        projectVisibility: "public",
        filter: (key) => this.handleFilter(key),
        // Add other required properties from YourSettingsResponseType
        pageNumber: 0,
        data: {
          id: '',
          projectName: '',
          description: '',
          teamMembers: '',
          exchange: '',
          communication: '',
          collaborationOptions: '',
          metadata: '',
          exchangeData: '',
          averagePrice: '',
          calendarEvents: [],
          todos: [],
          tasks: [],
          snapshotStores: [],
          currentPhase: "",
          comment: "",
        },
        calendarEvents: [],
        todos: [],
        tasks: [],
        snapshotStores: [],
        currentPhase: "",
        comment: "",
        browserCheckStore: {
          browserKey: '',
          dispatch: () => {},
          init: () => {},
          testDispatch: () => {},
        },
        trackerStore: {
          trackers: {},
          addTracker: () => {},   
          getTracker: () => ({}), 
          getTrackers: () => [],  
          removeTracker: () => {},
          dispatch: () => {},     
        },
        todoStore: {
          dispatch: () => {},
          todos: {},
          todoList: [],
          toggleTodo: () => {},
          addTodo: () => {},
          loading: false,
          error: null,
          addTodos: () => {},
          removeTodo: () => {},
          assignTodoToUser: () => {},
          updateTodoTitle: () => {},
          fetchTodosSuccess: () => {},
          fetchTodosFailure: () => {},
          openTodoSettingsPage: () => {},
          getTodoId: () => '',
          getTeamId: () => '',
          fetchTodosRequest: () => {},
          completeAllTodosSuccess: () => {},
          completeAllTodos: () => {},
          completeAllTodosFailure: () => {},
          NOTIFICATION_MESSAGE: '',
          setDynamicNotificationMessage: () => {},
          subscribeToSnapshot: () => {},
          batchFetchTodoSnapshotsRequest: () => {},
        },
        taskManagerStore: {
          tasks: {},
          taskTitle: '',
          taskDescription: '',
          taskStatus: {},
          assignedTaskStore: {},
          updateTaskTitle: () => {},
          updateTaskDescription: () => {},
          updateTaskStatus: () => {},
          updateTaskDueDate: () => {},
          updateTaskPriority: () => {},
          filterTasksByStatus: () => [],
          getTaskCountByStatus: () => 0,
          clearAllTasks: () => {},
          archiveCompletedTasks: () => {},
          updateTaskAssignee: () => {},
          getTasksByAssignee: () => [],
          getTaskById: () => null,
          sortByDueDate: () => {},
          exportTasksToCSV: () => {},
          dispatch: () => {},
          addTaskSuccess: () => {},
          addTask: () => {},
          addTasks: () => {},
          assignTaskToUser: () => {},
          removeTask: () => {},
          removeTasks: () => {},
          fetchTasksByTaskId: async () => null,
          fetchTasksSuccess: () => {},
          fetchTasksFailure: () => {},
          fetchTasksRequest: () => {},
          completeAllTasksSuccess: () => {},
          completeAllTasks: () => {},
          completeAllTasksFailure: () => {},
          NOTIFICATION_MESSAGE: '',
          setDynamicNotificationMessage: () => {},
          takeTaskSnapshot: () => {},
          markTaskAsComplete: () => {},
          updateTaskPositionSuccess: () => {},
          batchFetchTaskSnapshotsRequest: () => {},
          batchFetchTaskSnapshotsSuccess: () => {},
          batchFetchUserSnapshotsRequest: () => {},
        },
        iconStore: { dispatch: () => {} },
        calendarStore: {
          openScheduleEventModal: () => {},
          openCalendarSettingsPage: () => {},
          getData: async () => [],
          updateDocumentReleaseStatus: () => {},
          getState: () => ({}),
          action: '',
          events: {},
          eventTitle: '',
          eventDescription: '',
          eventStatus: '',
          assignedEventStore: {},
          snapshotStore: {},
          NOTIFICATION_MESSAGE: '',
          NOTIFICATION_MESSAGES: {},
          updateEventTitle: () => {},
          updateEventDescription: () => {},
          updateEventStatus: () => {},
          updateEventDate: () => {},
          addEvent: () => {},
          addEvents: () => {},
          removeEvent: () => {},
          removeEvents: () => {},
          reassignEvent: () => {},
          addEventSuccess: () => {},
          fetchEventsSuccess: () => {},
          fetchEventsFailure: () => {},
          fetchEventsRequest: () => {},
          completeAllEventsSuccess: () => {},
          completeAllEvents: () => {},
          completeAllEventsFailure: () => {},
          setDynamicNotificationMessage: () => {},
          handleRealtimeUpdate: () => {},
          getSnapshotDataKey: () => '',
        },
        endpoints: {},
        highlights: [],
        results: [],
        totalCount: 0,
        searchData: { results: '', totalCount: '' },
      };
      
      this.setSettings(mockSettings);
      
      this.notificationStore.addNotification({
        id: uuid(),
        message: "Settings fetched successfully",
        type: "success",
        timestamp: new Date(),
        read: false
      });
      
    } catch (error: any) {
      this.setError(error.message);
      
      this.notificationStore.addNotification({
        id: uuid(),
        message: `Failed to fetch settings: ${error.message}`,
        type: "error",
        timestamp: new Date(),
        read: false
      });
    } finally {
      this.setLoading(false);
    }
  }

  // -------------------
  // Update Settings
  // -------------------
  async updateSettings(updatedSettings: YourSettingsResponseType) {
    this.setLoading(true);
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.setSettings(updatedSettings as Settings);
      
      this.notificationStore.addNotification({
        id: uuid(),
        message: "Settings updated successfully",
        type: "success",
        timestamp: new Date(),
        read: false
      });
      
    } catch (error: any) {
      this.setError(error.message);
      
      this.notificationStore.addNotification({
        id: uuid(),
        message: `Failed to update settings: ${error.message}`,
        type: "error",
        timestamp: new Date(),
        read: false
      });
    } finally {
      this.setLoading(false);
    }
  }

  // -------------------
  // Delete Settings
  // -------------------
  async deleteSettings(settingsId: string) {
    this.setLoading(true);
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (this.settings && this.settings.id === settingsId) {
        this.setSettings(null);
      }
      
      this.notificationStore.addNotification({
        id: uuid(),
        message: "Settings deleted successfully",
        type: "success",
        timestamp: new Date(),
        read: false
      });
      
    } catch (error: any) {
      this.setError(error.message);
      
      this.notificationStore.addNotification({
        id: uuid(),
        message: `Failed to delete settings: ${error.message}`,
        type: "error",
        timestamp: new Date(),
        read: false
      });
    } finally {
      this.setLoading(false);
    }
  }

  // -------------------
  // User Data Management
  // -------------------
  setUserData(userData: UserManagerState) {
    if (!this.settings) {
      // Create default settings if none exist
      const defaultSettings: Settings = {
        id: uuid(),
        appName: "Buddease",
        communicationMode: "real-time",
        defaultFileType: "json",
        theme: ThemeEnum.LIGHT,
        isNotificationsEnabled: true,
        notifications: [],
        language: LanguageEnum.English,
        collaborationMode: "real-time",
        dataSync: "automatic",
        defaultCurrency: "USD",
        apiAccessLevel: "read-write",
        projectVisibility: "public",
        filter: (key) => this.handleFilter(key),
        pageNumber: 0,
        data: {
          id: '',
          projectName: '',
          description: '',
          teamMembers: '',
          exchange: '',
          communication: '',
          collaborationOptions: '',
          metadata: '',
          exchangeData: '',
          averagePrice: '',
          calendarEvents: [],
          todos: [],
          tasks: [],
          snapshotStores: [],
          currentPhase: "",
          comment: "",
        },
        calendarEvents: [],
        todos: [],
        tasks: [],
        snapshotStores: [],
        currentPhase: "",
        comment: "",
        browserCheckStore: {
          browserKey: '',
          dispatch: () => {},          
          init: () => {},              
          testDispatch: () => {},      
        },
        trackerStore: {
          trackers: {},
          addTracker: () => {},
          getTracker: () => ({}),
          getTrackers: () => [],
          removeTracker: () => {},
          dispatch: () => {},
        },
        todoStore: {
          dispatch: () => {},
          todos: {},
          todoList: [],
          toggleTodo: () => {},
          addTodo: () => {},
          loading: false,
          error: null,
          addTodos: () => {},
          removeTodo: () => {},
          assignTodoToUser: () => {},
          updateTodoTitle: () => {},
          fetchTodosSuccess: () => {},
          fetchTodosFailure: () => {},
          openTodoSettingsPage: () => {},
          getTodoId: () => '',
          getTeamId: () => '',
          fetchTodosRequest: () => {},
          completeAllTodosSuccess: () => {},
          completeAllTodos: () => {},
          completeAllTodosFailure: () => {},
          NOTIFICATION_MESSAGE: '',
          setDynamicNotificationMessage: () => {},
          subscribeToSnapshot: () => {},
          batchFetchTodoSnapshotsRequest: () => {},
        },
        taskManagerStore: {
          tasks: {},
          taskTitle: '',
          taskDescription: '',
          taskStatus: {},
          assignedTaskStore: {},
          updateTaskTitle: () => {},
          updateTaskDescription: () => {},
          updateTaskStatus: () => {},
          updateTaskDueDate: () => {},
          updateTaskPriority: () => {},
          filterTasksByStatus: () => [],
          getTaskCountByStatus: () => 0,
          clearAllTasks: () => {},
          archiveCompletedTasks: () => {},
          updateTaskAssignee: () => {},
          getTasksByAssignee: () => [],
          getTaskById: () => null,
          sortByDueDate: () => {},
          exportTasksToCSV: () => {},
          dispatch: () => {},
          addTaskSuccess: () => {},
          addTask: () => {},
          addTasks: () => {},
          assignTaskToUser: () => {},
          removeTask: () => {},
          removeTasks: () => {},
          fetchTasksByTaskId: async () => null,
          fetchTasksSuccess: () => {},
          fetchTasksFailure: () => {},
          fetchTasksRequest: () => {},
          completeAllTasksSuccess: () => {},
          completeAllTasks: () => {},
          completeAllTasksFailure: () => {},
          NOTIFICATION_MESSAGE: '',
          setDynamicNotificationMessage: () => {},
          takeTaskSnapshot: () => {},
          markTaskAsComplete: () => {},
          updateTaskPositionSuccess: () => {},
          batchFetchTaskSnapshotsRequest: () => {},
          batchFetchTaskSnapshotsSuccess: () => {},
          batchFetchUserSnapshotsRequest: () => {},
        },
        iconStore: { dispatch: () => {} },
        calendarStore: {
          openScheduleEventModal: () => {},
          openCalendarSettingsPage: () => {},
          getData: async () => [],
          updateDocumentReleaseStatus: () => {},
          getState: () => ({}),
          action: '',
          events: {},
          eventTitle: '',
          eventDescription: '',
          eventStatus: '',
          assignedEventStore: {},
          snapshotStore: {},
          NOTIFICATION_MESSAGE: '',
          NOTIFICATION_MESSAGES: {},
          updateEventTitle: () => {},
          updateEventDescription: () => {},
          updateEventStatus: () => {},
          updateEventDate: () => {},
          addEvent: () => {},
          addEvents: () => {},
          removeEvent: () => {},
          removeEvents: () => {},
          reassignEvent: () => {},
          addEventSuccess: () => {},
          fetchEventsSuccess: () => {},
          fetchEventsFailure: () => {},
          fetchEventsRequest: () => {},
          completeAllEventsSuccess: () => {},
          completeAllEvents: () => {},
          completeAllEventsFailure: () => {},
          setDynamicNotificationMessage: () => {},
          handleRealtimeUpdate: () => {},
          getSnapshotDataKey: () => '',
        },
        endpoints: {},
        highlights: [],
        results: [],
        totalCount: 0,
        searchData: { results: '', totalCount: '' },
      };
      
      this.setSettings(defaultSettings);
    }

    // Update settings with user data
    const updatedSettings = {
      ...this.settings!,
      ...userData
    };

    this.setSettings(updatedSettings);
    
    this.notificationStore.addNotification({
      id: uuid(),
      message: "User data updated successfully",
      type: "success",
      timestamp: new Date(),
      read: false
    });
  }

  // -------------------
  // Filter Handler
  // -------------------
  private handleFilter(key: keyof Settings | "communicationMode" | "defaultFileType" | "theme" | "notifications" | "language" | "collaborationMode" | "dataSync" | "defaultCurrency" | "apiAccessLevel" | "projectVisibility") {
    if (!this.settings) return;

    const updatedSettings = { ...this.settings };

    switch (key) {
      case "communicationMode":
        updatedSettings.communicationMode = updatedSettings.communicationMode === "real-time" ? "asynchronous" : "real-time";
        break;
      case "defaultFileType":
        updatedSettings.defaultFileType = updatedSettings.defaultFileType === "json" ? "csv" : "json";
        break;
      case "theme":
        updatedSettings.theme = updatedSettings.theme === ThemeEnum.LIGHT ? ThemeEnum.DARK : ThemeEnum.LIGHT;
        break;
      case "notifications":
        updatedSettings.isNotificationsEnabled = !updatedSettings.isNotificationsEnabled;
        break;
      case "language":
        updatedSettings.language = updatedSettings.language === LanguageEnum.English ? LanguageEnum.Spanish : LanguageEnum.English;
        break;
      case "collaborationMode":
        updatedSettings.collaborationMode = updatedSettings.collaborationMode === "real-time" ? "asynchronous" : "real-time";
        break;
      case "dataSync":
        updatedSettings.dataSync = updatedSettings.dataSync === "automatic" ? "manual" : "automatic";
        break;
      case "defaultCurrency":
        updatedSettings.defaultCurrency = updatedSettings.defaultCurrency === "USD" ? "EUR" : "USD";
        break;
      case "apiAccessLevel":
        updatedSettings.apiAccessLevel = updatedSettings.apiAccessLevel === "read-only" ? "read-write" : "read-only";
        break;
      case "projectVisibility":
        updatedSettings.projectVisibility = updatedSettings.projectVisibility === "public" ? "private" : "public";
        break;
    }

    this.setSettings(updatedSettings);
  }
}

// -------------------
// RootStores Integration
// -------------------
// at the bottom of the file, **after** the channels literal
const channels: NotificationChannels = {
  email: { enabled: true },
  push: { enabled: true },
  inApp: { enabled: true },
  advanced: {
    chat: { enabled: true },
    videoCall: { enabled: false },
    screenShare: { enabled: false },
  },
  deliveryStrategy: "all",
  retryPolicy: { maxRetries: 3, retryInterval: 5000 },
  quietHours: { enabled: false, startTime: "22:00", endTime: "07:00", timeZone: "UTC", days: [] },
};

export const notificationStore = new NotificationStore(channels);
export const settingsStore = new SettingsStore(notificationStore);