import { createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { VideoState } from "./VideoSlice";
import { AlignmentOptions, ToolbarState } from "./toolbarSlice";
import { UIState } from "../../stores/UISlice";
import ProjectState from "./ProjectSlice";
import { TaskState } from "./TaskSlice";
import { TrackerManagerState } from "./TrackerSlice";
import { UserManagerState } from "@/app/components/users/UserSlice";
import { ProjectOwnerState } from "@/app/components/users/ProjectOwnerSlice";
import { DataAnalysis } from "@/app/components/projects/DataAnalysisPhase/DataAnalysis";
import { DataAnalysisState } from "@/app/typings/dataAnalysisTypes";
import { DataSliceState } from "./DataSlice";
import { CalendarManagerState } from "@/app/components/calendar/CalendarSlice";
import { TodoManagerState } from "./TodoSlice";
import { DocumentSliceState } from "./DocumentSlice";
import { ApiManagerState } from "./ApiSlice";
import { RealtimeDataState } from "@/app/components/RealtimeDataSlice";
import { EventState } from "./EventSlice";
import { CollaborationSettingsState } from "@/app/pages/community/CollaborationSettings";
import { CollaborationState } from "./CollaborationSlice";
import { EntityId } from "./RootSlice";
import { NotificationState } from "./NotificationSlice";
import { SettingsState } from "./SettingsSlice";
import { string } from "prop-types";

interface AppState {
    currentPage: null,
    currentLayout: null,
    currentTheme: null,
    currentLanguage: null
    isSidebarOpen: false,
    selectedTheme: 'light',
    selectedLanguage: 'en'

    
    videoState: VideoState;
    toolbarManager: ToolbarState,
    selectedToolBar: AlignmentOptions | null,
  uiManager: UIState

  // Project Management
  projectManager: ProjectState,
  taskManager: TaskState,
  trackerManager: TrackerManagerState,
  userManager: UserManagerState
  teamManager: TrackerManagerState
  projectOwner: ProjectOwnerState

  // Data Management
  dataManager: DataSliceState,
  dataAnalysisManager: DataAnalysisState,
  calendarManager: CalendarManagerState
  todoManager:TodoManagerState,
  documentManager: DocumentSliceState,

  // API & Networking
  apiManager: ApiManagerState,
  realtimeManager: RealtimeDataState,

  // Event & Collaboration
  eventManager: EventState
  collaborationManager: CollaborationState

  // Entity & Notification
  entityManager: EntityState<any, EntityId>
  notificationManager: NotificationState

  // Settings & Utilities
  settingsManager: SettingsState

    
  // Add other state properties here if needed
}

const initialState: AppState = {

  toolbarManager: {
    isFeatureEnabled: false,
    isToolbarOpen: false,
    selectedTool: null,
    selectedToolBar: null,
    isDraggable: false,
    isFloating: false,
    order: 0,
    fontSize: 0,
    fontColor: '#000000',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    leftToolbar: {
        isVisible: true,
        alignment: AlignmentOptions.LEFT,
        selectedLeftToolbar: AlignmentOptions.LEFT
    },
    rightToolbar: {
        isVisible: true,
        alignment: AlignmentOptions.RIGHT,
        selectedRightToolbar: AlignmentOptions.RIGHT
    },
    videoRecordingEnabled: false,
    videoStreamingEnabled: false,
    qualitySettingsEnabled: false,
    screenSharingEnabled: false,
    participantManagementEnabled: false,
    selectedToolbar: null,
    toolbars: []
  },

  uiManager: {
      isSidebarOpen: false,
      selectedTheme: 'light',
      selectedLanguage: 'en',
      isLoading: false,
      error: null,
      showModal: false,
      notification: {
          message: "",
          type: null
      },
      currentPhase: null,
      previousPhase: null
  }

  // Project Management
  projectManager: /* Initial state for projectManager */,
  taskManager: /* Initial state for taskManager */,
  trackerManager: /* Initial state for trackerManager */,
  userManager: /* Initial state for userManager */,
  teamManager: /* Initial state for teamManager */,
  projectOwner: /* Initial state for projectOwner */,

  // Data Management
  dataManager: /* Initial state for dataManager */,
  dataAnalysisManager: /* Initial state for dataAnalysisManager */,
  calendarManager: /* Initial state for calendarManager */,
  todoManager: /* Initial state for todoManager */,
  documentManager: /* Initial state for documentManager */,
  userTodoManager: /* Initial state for userTodoManager */,

  // API & Networking
  apiManager: /* Initial state for apiManager */,
  realtimeManager: /* Initial state for realtimeManager */,

  // Event & Collaboration
  eventManager: /* Initial state for eventManager */,
  collaborationManager: /* Initial state for collaborationManager */,

  // Entity & Notification
  entityManager: /* Initial state for entityManager */,
  notificationManager: /* Initial state for notificationManager */,

  // Settings & Utilities
  settingsManager: /* Initial state for settingsManager */,

  // Miscellaneous
  videoManager: {
    videos: [],
    currentVideoId: null,
    comments: [],
    watchLater: [],
    watched: [],
    subscribedChannels: [],
    currentlyWatching: [],
    blockedUsers: [],
    skipped: [],
    content: null,
    pinned: [],
  },
  randomWalkManager: /* Initial state for randomWalkManager */,
  pagingManager: /* Initial state for pagingManager */,
  blogManager: /* Initial state for blogManager */,
  drawingManager: /* Initial state for drawingManager */,
  versionManager: /* Initial state for versionManager */,
};

export default initialState;

  videoState: {
    videos: [],
    currentVideoId: null,
    comments: [],
    watchLater: [],
    watched: [],
    subscribedChannels: [],
    currentlyWatching: [],
    blockedUsers: [],
    skipped: [],
    content: null,
    pinned: [],
  },
  // Initialize other state properties here if needed
};

export const useAppManagerSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Define reducers specific to the app state here, if any
    // You can also use reducers from the VideoSlice if needed
  },
  extraReducers: (builder) => {
    builder.addCase(
      // Add extra reducers here if needed
    );
  },
});

export const { /* Extract action creators if needed */ } = useAppManagerSlice.actions;

export default useAppManagerSlice.reducer;
export type {AppState}