import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { Task } from "@/app/components/models/tasks/Task";
import { TodoManagerStore } from "@/app/components/state/stores/TodoStore";
import { Idea } from "@/app/components/users/Ideas";
import { AxiosResponse } from "axios";
import { object } from "prop-types";
import { NestedEndpoints } from "../api/ApiEndpoints";
import { CalendarEvent } from "../components/calendar/CalendarEvent";
import { CodingLanguageEnum } from "../components/communications/LanguageEnum";
import { Attachment } from "../components/documents/Attachment/attachment";
import HighlightEvent from "../components/documents/screenFunctionality/HighlightEvent";
import useIdleTimeout from "../components/hooks/idleTimeoutHooks";
import useAuthentication from "../components/hooks/useAuthentication";
import { CollaborationOptions } from "../components/interfaces/options/CollaborationOptions";
import { Category } from "../components/libraries/categories/generateCategoryProperties";
import { ThemeEnum } from "../components/libraries/ui/theme/Theme";
import { BaseData, coreData, Data } from "../components/models/data/Data";
import { Meta } from "../components/models/data/dataStoreMethods";
import { PriorityTypeEnum } from "../components/models/data/StatusType";
import { Team } from "../components/models/teams/Team";
import { Member } from "../components/models/teams/TeamMembers";
import { TrackerProps } from "../components/models/tracker/Tracker";
import { Phase } from "../components/phases/Phase";
import { DataAnalysisResult } from "../components/projects/DataAnalysisPhase/DataAnalysisResult";
import { InitializedState } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { PrivacySettings, selectedSettings } from "../components/settings/PrivacySettings";
import { SnapshotStoreConfig, SnapshotStoreUnion } from "../components/snapshots";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { ExtendedTodo } from "../components/state/AssignBaseStore";
import { resetState } from "../components/state/redux/slices/AppSlice";
import { CustomComment } from "../components/state/redux/slices/BlogSlice";
import { ReassignEventResponse } from "../components/state/stores/AssignEventStore";
import { AuthStore } from "../components/state/stores/AuthStore";
import BrowserCheckStore from "../components/state/stores/BrowserCheckStore";
import { CalendarManagerStore } from "../components/state/stores/CalendarEvent";
import { AllStatus, DetailsItem } from "../components/state/stores/DetailsListStore";
import { IconStore } from "../components/state/stores/IconStore";
import useSettingManagerStore, { Settings } from "../components/state/stores/SettingsStore";
import { TrackerStore } from "../components/state/stores/TrackerStore";
import { store } from "../components/state/stores/useAppDispatch";
import { NotificationData } from "../components/support/NofiticationsSlice";
import { NotificationSettings } from "../components/support/NotificationSettings";
import { taskService } from "../components/tasks/TaskService";
import TodoImpl, { Todo, UserAssignee } from "../components/todos/Todo";
import { User } from "../components/users/User";
import { VideoData } from "../components/video/Video";
import { CategoryProperties } from "../pages/personas/ScenarioBuilder";

const logoutUser = useAuthentication().logout;

const onTimeout = () => {
  // Handle timeout event
  console.log("User idle timeout occurred.");

  // Perform actions upon timeout
  logoutUser();
  showModal(
    "Session Timeout",
    "Your session has expired due to inactivity. Please log in again."
  );
  resetAppState();
};


// Show modal function
const showModal = (title: string, message: string) => {
  // Display a modal with provided title and message
  console.log(`Showing modal with title: ${title} and message: ${message}`);
  
  // Implement your modal display logic here
  // Example: Using a library like Bootstrap or a custom modal
  const modal = document.createElement('div');
  modal.className = 'modal'; // Add appropriate classes for styling
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <button id="closeModal">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Add close functionality
  document.getElementById('closeModal')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
};

// Reset application state function
// Assume this is determined elsewhere in your application
const isUsingRedux = true; // Set to false if using MobX

const resetAppState = () => {
  // Logic to reset the application state
  console.log("Resetting application state...");
  
  if (isUsingRedux) {
    // Reset Redux store
    store.dispatch(resetState()); // Use the appropriate reset action for Redux
  } else {
    // Reset MobX store
    useSettingManagerStore().reset(); // Reset settings using the SettingManager store
  }

  // Clear any user-related data
  localStorage.clear(); // Or clear specific keys
  
  // Additional state reset logic can go here
};


// Example of using the onTimeout function
setTimeout(onTimeout, 300000); // Simulate user idle timeout after 5 minutes


type IdleTimeoutType = {
  intervalId: number | undefined;
  isActive: boolean;
  animateIn: (selector: string) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout: () => Promise<void>;
  idleTimeoutId: NodeJS.Timeout | null;
  startIdleTimeout: (
    timeoutDuration: number,
    onTimeout: () => void | undefined,
  ) => void | undefined;
  toggleActivation: () => Promise<boolean>;
  idleTimeoutDuration: number; // Add this property
};

export interface UserSettings extends Settings {
  [x: string]:
    | string
    | number
    | NodeJS.Timeout
    | boolean
    | Date
    | string[]
    | IdleTimeoutType
    | PrivacySettings
    | NotificationData[]
    | BrowserCheckStore
    | VideoData<BaseData, BaseData>
    | UserAssignee
    | DataAnalysisResult<BaseData>[]
    | Category
    | CategoryProperties
    | Attachment[]
    | CollaborationOptions[]
    | NestedEndpoints
    | (Comment | CustomComment)[]
    | DetailsItem<Data>
    | TrackerStore
    | IconStore
    | Phase<BaseData> 
    | HighlightEvent[]
    | Idea[]
    | SnapshotStore<SnapshotStoreUnion<Data>, Data>[]
    | InitializedState<BaseData, BaseData>
    | Member[]
    | NotificationSettings
    | Task[]
    | Todo<any, any, any>[] // Assuming you want flexibility here
    | TodoManagerStore<Todo<any, any, any>, any, any> // Ensure BaseData is appropriately defined
    | TodoImpl<Todo<any, any, any>, any, any>[] // Use `any` or specify the types as needed
    | CalendarEvent<BaseData, BaseData>[]
    | CalendarManagerStore<BaseData, Meta>
    | SnapshotStoreConfig<Data, Data>[]
    | Record<string, string>
    | undefined
    | NodeJS.Timeout
    | null
    | ((key: keyof Settings) => void)
    | ((timeoutDuration: number, onTimeout: () => void) => void)
    | undefined;

  userId: number;
  sessionTimeout?: number;
  communicationMode: string;
  enableRealTimeUpdates: boolean;
  defaultFileType: string;
  allowedFileTypes: string[];
  enableGroupManagement: boolean;
  enableTeamManagement: boolean;
  idleTimeout: IdleTimeoutType | undefined;
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
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
  theme: ThemeEnum | undefined;
  language: LanguageEnum | CodingLanguageEnum;
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
  // privacySettings: PrivacySettings
  thirdPartyApiKeys: Record<string, string> | undefined;
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
  selectDatabaseVersion: string;
  selectAppVersion: string;
  enableDatabaseEncryption: boolean;
  notificationsEnabled: boolean;
}

const userSettings: UserSettings = {
  
  notificationsEnabled: true,
  endpoints: {} as NestedEndpoints,
  highlights: [],
  results: [],
  totalCount: 0,
  searchData: {
    results: [],
    totalCount: 0
  },
  iconStore: {},
  calendarStore: {},
 

  userId: 1,
  userSettings: new NodeJS.Timeout(),
  communicationMode: "text",
  enableRealTimeUpdates: true,
  id: "",

  appName: "",
  selectDatabaseVersion: "",
  selectAppVersion: "",
  defaultFileType: "document",
  allowedFileTypes: ["document"],
  enableGroupManagement: true,
  enableTeamManagement: true,

  idleTimeout: useIdleTimeout("idleTimeout", {
    intervalId: 0,
    isActive: false,
    animateIn: (selector: string) => {},
    startAnimation: () => {},
    stopAnimation: () => {},
    resetIdleTimeout: async () => {},
    idleTimeoutId: null,
    startIdleTimeout: (
      timeoutDuration: number,
      onTimeout: () => void,
    ) => {},
    toggleActivation: () => Promise.resolve(false),
    idleTimeoutDuration: 0,
  }),
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
    if (
      typeof userSettings.idleTimeout === "object" &&
      userSettings.idleTimeout !== null
    ) {
      (
        userSettings.idleTimeout as { idleTimeoutId?: NodeJS.Timeout }
      ).idleTimeoutId = setTimeout(() => {
        onTimeout();
      }, timeoutDuration);
    }
  },

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
  theme: ThemeEnum.LIGHT,
  language: LanguageEnum.English,
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
  privacySettings: selectedSettings,
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
  enableDatabaseEncryption: false,
  idleTimeoutId: null,


  calendarEvents: [],
  todos: [],
  tasks: [],
  snapshotStores: [],
  
  currentPhase: "",
  comment: "",
  browserCheckStore: {} as BrowserCheckStore,
    trackerStore: {
      trackers: {},
      addTracker: (newTracker: TrackerProps) => {},
      getTracker: (id: string): TrackerProps => {
        // Ensure you return a valid TrackerProps object
        const tracker = coreData.settings.trackerStore.trackers[id];
        if (!tracker) {
          throw new Error(`Tracker with id ${id} not found.`);
        }
        return tracker; // Return the tracker found
      },
      getTrackers: (filter?: { id?: string | undefined; name?: string | undefined; } | undefined) => [],
      
      removeTracker:(trackerToRemove: TrackerProps) => {},
      dispatch: (action: any) => {},
      
    },
    
    todoStore: {
      dispatch: (action: any) => {},
      todos: {},
      todoList: [],
      toggleTodo: (id: string) => {},
      
      assignedTaskStore: "",
      updateTaskTitle: "",
      updateTaskDescription: "",
      updateTaskStatus: "",
      

    },
    taskManagerStore: {
      tasks: {},
      taskTitle: "",
      taskDescription: "",
      taskStatus: {},
      

      fetchTasksSuccess: (payload: { tasks: Task[]; }) => {},
      fetchTasksFailure: (payload: { error: string; }) => {},
      fetchTasksRequest: () => {},
      completeAllTasksSuccess: (success: string) => {},
      
      completeAllTasks: (payload: { task: Task[]; }) => {},
      completeAllTasksFailure: (payload: { error: string; }) => {},
      NOTIFICATION_MESSAGE: "",
      NOTIFICATION_MESSAGES: {},
      
       setDynamicNotificationMessage: (message: Message, type: NotificationType) => {},
      takeTaskSnapshot: (taskId: string) => {},
      markTaskAsComplete: (taskId: string) => {},
      updateTaskPositionSuccess: (payload: { task: Task; }) => {},
      
      batchFetchTaskSnapshotsRequest: (snapshotData: Record<string, Task[]>)  => {},
      batchFetchTaskSnapshotsSuccess: (taskId: Record<string, Task[]>) => {},
      batchFetchUserSnapshotsRequest: (snapshotData: Record<string, User[]>) => {},
      
      assignedTaskStore: {
        snapshotStore: undefined,
        assignedUsers: {},
        assignedItems: {},
        assignedTodos: {},
        assignedTasks: {},
        assignedTeams: {},
        events: {},
        assignItem: {},
        assignUser: {},
        assignTeam: {},
        unassignUser: {},
        reassignUser: {},
        assignUsersToItems: {},
        unassignUsersFromItems: {},
        assignNote: {},
        reassignUsersToItems: {},
        assignTeamsToTodos: {},
        unassignTeamsFromTodos: {},
        assignNoteToTeam: {},
        assignFileToTeam: {},
        assignContactToTeam: {},
        assignEventToTeam: {},
        assignGoalToTeam: {},
        assignBookmarkToTeam: {},
        assignCalendarEventToTeam: {},
        assignBoardItemToTeam: {},
        assignBoardColumnToTeam: {},
        assignBoardListToTeam: {},
        assignBoardCardToTeam: {},
        assignBoardViewToTeam: {},
        assignBoardCommentToTeam: {},
        assignBoardActivityToTeam: {},
        assignBoardLabelToTeam: {},
        assignBoardMemberToTeam: {},
        assignBoardSettingToTeam: {},
        assignBoardPermissionToTeam: {},
        assignBoardNotificationToTeam: {},
        assignBoardIntegrationToTeam: {},
        assignBoardAutomationToTeam: {},
        assignBoardCustomFieldToTeam: {},

        assignTask: (task) => {
          // Logic to assign a task
        },
        assignUsersToTasks: (taskId, userIds) => {
          // Logic to assign users
        },
        unassignUsersFromTasks: (taskId, userIds) => {
          // Logic to unassign users
        },
        setDynamicNotificationMessage: (message) => {
          // Logic to set notification message
        },
        
        reassignUsersToTasks: function (taskIds: string[], oldUserId: string, newUserId: string): void {
          throw new Error("Function not implemented.");
        },
        assignUserToTodo: function (todoId: string, userId: string): void {
          throw new Error("Function not implemented.");
        },
        unassignUserFromTodo: function (todoId: string, userId: string): void {
          throw new Error("Function not implemented.");
        },
        reassignUserInTodo: function (todoId: string, oldUserId: string, newUserId: string): void {
          throw new Error("Function not implemented.");
        },
        assignUsersToTodos: function (todoIds: string[], userId: string): void {
          throw new Error("Function not implemented.");
        },
        unassignUsersFromTodos: function (todoIds: string[], userId: string): void {
          throw new Error("Function not implemented.");
        },
        reassignUsersInTodos: function (todoIds: string[], oldUserId: string, newUserId: string): void {
          throw new Error("Function not implemented.");
        },
        assignUserSuccess: function (message: string): void {
          throw new Error("Function not implemented.");
        },
        assignUserFailure: function (error: string): void {
          throw new Error("Function not implemented.");
        },
        
        assignMeetingToTeam: function (meetingId: string, teamId: string): Promise<AxiosResponse> {
          throw new Error("Function not implemented.");
        },
        assignProjectToTeam: function (projectId: string, teamId: string): Promise<AxiosResponse> {
          throw new Error("Function not implemented.");
        },
        connectResponsesToTodos: function (todoIds: string[], assignees: string[], todos: ExtendedTodo[], eventId: string, responses: ReassignEventResponse[]): void {
          throw new Error("Function not implemented.");
        },
        reassignTeamsInTodos: function (todoIds: string[], oldTeamId: string, newTeamId: string): Promise<AxiosResponse> {
          throw new Error("Function not implemented.");
        },

        assignTaskToTeam: function (taskId: string, userId: string): Promise<void> {
          throw new Error("Function not implemented.");
        },
        assignTodoToTeam: function (todoId: string, teamId: string): Promise<void> {
          throw new Error("Function not implemented.");
        },
        assignTodosToUsersOrTeams: function (todoIds: string[], assignees: string[]): Promise<void> {
          throw new Error("Function not implemented.");
        },
        assignTeamMemberToTeam: function (teamId: string, userId: string): void {
          throw new Error("Function not implemented.");
        },
        unassignTeamMemberFromItem: function (itemId: string, userId: string): void {
          throw new Error("Function not implemented.");
        },
        getAuthStore: function (): AuthStore {
          throw new Error("Function not implemented.");
        },
        assignTeamToTodo: function (todoId: string, teamId: string): void {
          throw new Error("Function not implemented.");
        },
        unassignTeamToTodo: function (todoId: string, teamId: string): void {
          throw new Error("Function not implemented.");
        },
        reassignTeamToTodo: function (todoId: string, oldTeamId: string, newTeamId: string): void {
          throw new Error("Function not implemented.");
        },
        assignTeamToTodos: function (todoIds: Team[], teamId: string): void {
          throw new Error("Function not implemented.");
        },
        unassignTeamFromTodos: function (todoIds: string[], teamId: string): void {
          throw new Error("Function not implemented.");
        },
        reassignTeamToTodos: function (teamIds: string[], teamId: string, newTeamId: string): void {
          throw new Error("Function not implemented.");
        },
        unassignNoteFromTeam: function (noteId: string, teamId: string): Promise<void> {
          throw new Error("Function not implemented.");
        },
        setAssignedTaskStore: function (store: SnapshotStore<Snapshot<Data, Data>>): void {
          throw new Error("Function not implemented.");
        }
      },
      updateTaskTitle: (title: string, taskId: string) => {},
      updateTaskDescription: (description: string, taskId: string) => {},
      updateTaskStatus: (description: string, taskId: string) => {},
      
      updateTaskDueDate: (taskId: string, dueDate: Date) => {},
      updateTaskPriority: (taskId: string, priority: PriorityTypeEnum) => {},
      filterTasksByStatus: (status: AllStatus): Task[] => {
        // Implement logic to filter tasks by their status
        return coreData.tasks.filter((task: Task) => task.status === status);
      },

      getTaskCountByStatus: (status: AllStatus): number => {
        // Implement logic to count tasks by status
        return coreData.tasks.filter((task: Task) => task.status === status).length;
      },
            
      clearAllTasks: () => {},
      archiveCompletedTasks: () => {},
      updateTaskAssignee: (taskId: string, assignee: User) => async (dispatch: any): Promise<void> => {
        // Implement logic to update the assignee of a task
        const taskIndex = coreData.tasks.findIndex((task: Task) => task._id === taskId);
        if (taskIndex !== -1) {
          coreData.tasks[taskIndex].assignee = assignee;
          // Dispatch an action to update the state (assuming Redux or similar)
          dispatch({ type: 'UPDATE_TASK_ASSIGNEE', payload: { taskId, assignee } });
        }
      },
      
      getTasksByAssignee: async (tasks: Task[], assignee: User): Promise<Task[]> => {
        // Implement logic to get tasks assigned to a specific user
        return tasks.filter(task => task.assignee?._id === assignee._id);
      },
      
      
      getTaskById: (taskId: string): Task | null => {
        // Implement logic to find a task by its ID
        return coreData.tasks.find((task: Task) => task._id === taskId) || null;
      },
      
      
      sortByDueDate: () => { },
      exportTasksToCSV:  () => {},
      dispatch: (action: any) => {},
      addTaskSuccess: (payload: { task: Task; }) => {},
      addTask: (task: Task) => {},
      addTasks:(tasks: Task[]) => {},
      assignTaskToUser: (taskId: string, userId: string) => {},
      
      removeTask: (taskId: string) => {},
      removeTasks: (taskIds: string[]) => {},
      fetchTasksByTaskId: async (taskId: string): Promise<string> => {
        // Implement logic to fetch task details by ID, potentially making an API call
        try {
          const response = taskService.getTaskById(taskId);
          if (response && response.data) {
            // Handle the response data here
            return response.data; // Assuming the response contains task data in `data`
          }
          throw new Error("No task data found");
        } catch (error) {
          console.error("Failed to fetch task", error);
          throw new Error("Failed to fetch task");
        }
      }
    },
       
  filter: function (key: keyof Settings): void {
    // filter settings
    object;
  },

};

export default userSettings;

export type { IdleTimeoutType };
