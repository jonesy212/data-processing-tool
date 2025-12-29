// AppSlice.ts
import { AppActions } from '@/core/actions/AppActions';
import { UserProfile, userService } from '@/core/api/ApiUser';
import { BaseDataRoot } from '@/core/config/BaseConfig';
import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import { useSecureUserId } from '@/core/hooks/useSecureUserId';
import { ThemeEnum } from '@/core/libraries/ui/theme/Theme';
import { ProjectData } from '@/core/models/projects/Project';
import { ApiManagerState } from '@/core/state/redux/slices/ApiSlice';
import { BlogState } from '@/core/state/redux/slices/BlogSlice';
import { CalendarManagerState } from '@/core/state/redux/slices/CalendarSlice';
import { CollaborationState } from '@/core/state/redux/slices/CollaborationSlice';
import { DataSliceState } from '@/core/state/redux/slices/DataSlice';
import { DocumentSliceState } from '@/core/state/redux/slices/DocumentSlice';
import { DrawingState } from '@/core/state/redux/slices/DrawingSlice';
import { ActionReducerMapBuilder, createSlice, EntityState, PayloadAction } from '@/core/state/redux/slices/EntitySlice';
import { EventState } from '@/core/state/redux/slices/EventSlice';
import { NotificationState } from '@/core/state/redux/slices/NotificationSlice';
import { PagingState } from '@/core/state/redux/slices/pagingSlice';
import { ProjectOwnerState } from '@/core/state/redux/slices/ProjectOwnerSlice';
import { ProjectState } from '@/core/state/redux/slices/ProjectSlice';
import { RandomWalkState } from '@/core/state/redux/slices/RandomWalkManagerSlice';
import { RealtimeDataState } from '@/core/state/redux/slices/RealtimeDataSlice';
import { SettingsState } from '@/core/state/redux/slices/SettingsSlice';
import { TaskState } from '@/core/state/redux/slices/TaskSlice';
import { TodoManagerState } from '@/core/state/redux/slices/TodoSlice';
import { AlignmentOptions, ToolbarState } from '@/core/state/redux/slices/toolbarSlice';
import { TrackerManagerState } from '@/core/state/redux/slices/TrackerSlice';
import { UserManagerState } from '@/core/state/redux/slices/UserSlice';
import { VersionState } from '@/core/state/redux/slices/VersionSlice';
import { VideoState } from '@/core/state/redux/slices/VideoSlice';
import { UIState } from '@/core/state/stores/UISlice';
import { AppEntity } from '@/core/typings/entities/AppEntity';
import { DataAnalysisState } from '@/core/typings/phases/dataAnalysisTypes';
import { UserData } from '@/core/users/User';
import { EntityId } from '@reduxjs/toolkit';

interface AppState<BaseDataRoot> {
    user: UserProfile<BaseDataRoot>,
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
  documentManager: DocumentSliceState<BaseDataRoot>,

  // API & Networking
  apiManager: ApiManagerState,
  realtimeManager: RealtimeDataState,

  // Event & Collaboration
  eventManager: EventState
  collaborationManager: CollaborationState<UserProfile<BaseDataRoot>, ProjectData>;

  // Entity & Notification
  entityManager: EntityState<any, EntityId>
  notificationManager: NotificationState

  // Settings & Utilities
  settingsManager: SettingsState

    
  videoManager: VideoState

  randomWalkManager: RandomWalkState
  pagingManager: PagingState,
  blogManager: BlogState,
  drawingManager: DrawingState<DocumentData, UserData<BaseDataRoot>>;
  versionManager: VersionState,
  progress: number
  // Add other state properties here if needed
}

const userId = useSecureUserId()
const user = await userService.fetchUserProfile(String(userId))

const initialState: AppState<BaseDataRoot> = {
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
  collaborationManager: {} as CollaborationState<UserData, ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,

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

const useAppManagerSlice = createSlice({
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
