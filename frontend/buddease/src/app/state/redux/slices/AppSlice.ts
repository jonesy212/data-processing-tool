// AppSlice.ts
import { UserData } from '@/app/users/User';
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { ProjectData } from '@/app/models/projects/Project';
import { AppEntity } from '@/app/typings/entities/AppEntity';
import { AppActions } from '@/app/actions/AppActions';
import { UserProfile, userService } from '@/app/api/ApiUser';
import { CalendarManagerState } from '@/app/state/redux/slices/CalendarSlice';
import { ThemeEnum } from '@/app/libraries/ui/theme/Theme';
import { ProjectOwnerState } from '@/app/state/redux/slices/ProjectOwnerSlice
import { UserManagerState } from '@/app/state/redux/slices/UserSlice';
import { useSecureUserId } from '@/app/hooks/useSecureUserId';
import { RealtimeDataState } from '@/app/state/redux/slices/RealtimeDataSlice';
import { UIState } from '@/app/state/stores/UISlice';
import { DataAnalysisState } from '@/app/typings/phases/dataAnalysisTypes';
import { ActionReducerMapBuilder, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { ApiManagerState } from '@/app/state/redux/slices/ApiSlice';
import { BlogState } from '@/app/state/redux/slices/BlogSlice';
import { CollaborationState } from '@/app/state/redux/slices/CollaborationSlice';
import { DataSliceState } from '@/app/state/redux/slices/DataSlice';
import { DocumentSliceState } from '@/app/state/redux/slices/DocumentSlice';
import { DrawingState } from '@/app/state/redux/slices/DrawingSlice';
import { EventState } from '@/app/state/redux/slices/EventSlice';
import { NotificationState } from '@/app/state/redux/slices/NotificationSlice';
import { PagingState } from '@/app/state/redux/slices/pagingSlice';
import { ProjectState } from '@/app/state/redux/slices/ProjectSlice';
import { RandomWalkState } from '@/app/state/redux/slices/RandomWalkManagerSlice';
import { SettingsState } from '@/app/state/redux/slices/SettingsSlice';
import { TaskState } from '@/app/state/redux/slices/TaskSlice';
import { TodoManagerState } from '@/app/state/redux/slices/TodoSlice';
import { AlignmentOptions, ToolbarState } from '@/app/state/redux/slices/toolbarSlice';
import { TrackerManagerState } from '@/app/state/redux/slices/TrackerSlice';
import { VersionState } from '@/app/state/redux/slices/VersionSlice';
import { VideoState } from '@/app/state/redux/slices/VideoSlice';
import { EntityId } from '@reduxjs/toolkit';

interface AppState<AppEntity> {
    user: UserProfile<AppEntity>,
    currentPage: null,
    currentLayout: null,
    currentTheme: null,
    currentLanguage: null
    isSidebarOpen: false,
    selectedTheme: 'light',
    selectedLanguage: 'en',
    
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
  documentManager: DocumentSliceState<AppState>,

  // API & Networking
  apiManager: ApiManagerState,
  realtimeManager: RealtimeDataState,

  // Event & Collaboration
  eventManager: EventState
  collaborationManager: CollaborationState<UserProfile<AppState>, ProjectData>;

  // Entity & Notification
  entityManager: EntityState<any, EntityId>
  notificationManager: NotificationState

  // Settings & Utilities
  settingsManager: SettingsState

    
  videoManager: VideoState

  randomWalkManager: RandomWalkState
  pagingManager: PagingState,
  blogManager: BlogState,
  drawingManager: DrawingState<DocumentData, UserData>;
  versionManager: VersionState,
  progress: number
  // Add other state properties here if needed
}

const userId = useSecureUserId()
const user = await userService.fetchUserProfile(String(userId))
const initialState: AppState = {
  user: user,
  progress: 0,
  toolbarManager: {
    themeType: ThemeEnum.LIGHT,
    x:0,
    y: 0,
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
  documentManager: {} as DocumentSliceState<AppEntity>,

  // API & Networking
  apiManager: {} as ApiManagerState,
  realtimeManager: {} as RealtimeDataState,

  // Event & Collaboration
  eventManager: {} as EventState,
  // Event & Collaboration
  collaborationManager: {} as CollaborationState<UserData, ProjectData>,

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
  drawingManager: {} as DrawingState<DocumentData, UserProfile>,
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
    resetState: (state) => {
      // Resetting state to initial state
      return initialState;
    },
    // Define reducers specific to the app state here, if any
    // You can also use reducers from the VideoSlice if needed
  },
  extraReducers: (builder: ActionReducerMapBuilder<AppEntity>) => {
    // Add additional case reducers here
    builder.addCase(AppActions.createTask, (state, action: PayloadAction<string>) => {
      // In a real-world scenario, you would handle adding the new task to your state here
      console.log(`Creating task: ${action.payload}`);
    });
  }
});

export const {resetState } = useAppManagerSlice.actions;

export default useAppManagerSlice.reducer;
export { AppState };
