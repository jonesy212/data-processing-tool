import { CalendarManagerState } from "@/app/components/calendar/CalendarSlice";
import { RealtimeDataState } from "@/app/components/state/redux/slices/RealtimeDataSlice";
import { ProjectOwnerState } from "@/app/components/users/ProjectOwnerSlice";
import { UserManagerState } from "@/app/components/users/UserSlice";
import { DataAnalysisState } from "@/app/typings/dataAnalysisTypes";
import { ActionReducerMapBuilder, createSlice, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { AppActions } from '../../../actions/AppActions';
import { UIState } from "../../stores/UISlice";
import { ApiManagerState } from "./ApiSlice";
import { BlogState } from "./BlogSlice";
import { CollaborationState } from "./CollaborationSlice";
import { DataSliceState } from "./DataSlice";
import { DocumentSliceState } from "./DocumentSlice";
import { DrawingState } from "./DrawingSlice";
import { EventState } from "./EventSlice";
import { NotificationState } from "./NotificationSlice";
import { PagingState } from "./pagingSlice";
import { ProjectState } from "./ProjectSlice";
import { RandomWalkState } from "./RandomWalkManagerSlice";
import { EntityId } from "./RootSlice";
import { SettingsState } from "./SettingsSlice";
import { TaskState } from "./TaskSlice";
import { TodoManagerState } from "./TodoSlice";
import { AlignmentOptions, ToolbarState } from "./toolbarSlice";
import { TrackerManagerState } from "./TrackerSlice";
import { VersionState } from "./VersionSlice";
import { VideoState } from "./VideoSlice";

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

    
  videoManager: VideoState

  randomWalkManager: RandomWalkState
  pagingManager: PagingState,
  blogManager: BlogState,
  drawingManager: DrawingState,
  versionManager: VersionState,
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
    collaborationState: null,
    notification: {
      message: "",
      type: null
    },
    currentPhase: null,
    previousPhase: null,
    pointerPosition: {
      x: 0,
      y: 0
    },
    isPointerDown: false
  },

  // Project Management
  projectManager: {} as ProjectState,
  taskManager: {} as TaskState,
  trackerManager: {} as TrackerManagerState,
  userManager: {} as UserManagerState,
  teamManager: {} as TrackerManagerState,
  projectOwner: {} as ProjectOwnerState,

  // Data Management
  dataManager: {} as DataSliceState,
  dataAnalysisManager: {} as DataAnalysisState,
  calendarManager: {} as CalendarManagerState,
  todoManager: {} as TodoManagerState,
  documentManager: {} as DocumentSliceState,

  // API & Networking
  apiManager: {} as ApiManagerState,
  realtimeManager: {} as RealtimeDataState,

  // Event & Collaboration
  eventManager: {} as EventState,
  collaborationManager: {} as CollaborationState,

  // Entity & Notification
  entityManager: {} as EntityState<any, EntityId>,
  notificationManager: {} as NotificationState,

  // Settings & Utilities
  settingsManager: {} as SettingsState,

  // Miscellaneous
  videoManager: {
    video: null,
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
    snapshots: {},
    playbackHistory: [],
    favorited: [],
    playbackSpeed: 0,
    playbackQuality: "",
    videoMetadata: {},
    videoTags: {}
  },
  randomWalkManager: {} as RandomWalkState,
  pagingManager: {} as PagingState,
  blogManager: {} as BlogState,
  drawingManager: {} as DrawingState,
  versionManager: {} as VersionState,
  currentPage: null,
  currentLayout: null,
  currentTheme: null,
  currentLanguage: null,
  isSidebarOpen: false,
  selectedTheme: "light",
  selectedLanguage: "en",
  videoState: {
    video: null,
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
    snapshots: {},
    playbackHistory: [],
    playbackQuality: "",
    videoMetadata: {},
    videoTags: {},
    favorited: [],
    playbackSpeed: 0,
  },
  selectedToolBar: null,
}
export const useAppManagerSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Define reducers specific to the app state here, if any
    // You can also use reducers from the VideoSlice if needed
  },
  extraReducers: (builder: ActionReducerMapBuilder<AppState>) => {
    // Add additional case reducers here
    builder.addCase(AppActions.createTask, (state, action: PayloadAction<string>) => {
      // In a real-world scenario, you would handle adding the new task to your state here
      console.log(`Creating task: ${action.payload}`);
    });
  }
});

export const { /* Extract action creators if needed */ } = useAppManagerSlice.actions;

export default useAppManagerSlice.reducer;
export type { AppState };
