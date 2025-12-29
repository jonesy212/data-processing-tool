// AppStore.ts
import { UserProfile } from '@/core/api/ApiUser';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { ProjectData } from '@/core/models/projects/Project';
import { PagingState } from '@/core/pages/Paging';
import { ApiManagerState } from '@/core/state/redux/slices/ApiSlice';
import { AppState } from '@/core/state/redux/slices/AppSlice';
import { BlogState } from '@/core/state/redux/slices/BlogSlice';
import { CalendarManagerState } from '@/core/state/redux/slices/CalendarSlice';
import { CollaborationState } from '@/core/state/redux/slices/CollaborationSlice';
import { DataSliceState } from '@/core/state/redux/slices/DataSlice';
import { DocumentSliceState } from '@/core/state/redux/slices/DocumentSlice';
import { DrawingState } from '@/core/state/redux/slices/DrawingSlice';
import { EntityId, EntityState } from '@/core/state/redux/slices/EntitySlice';
import { EventState } from '@/core/state/redux/slices/EventSlice';
import { NotificationState } from '@/core/state/redux/slices/NotificationSlice';
import { ProjectOwnerState } from '@/core/state/redux/slices/ProjectOwnerSlice';
import { ProjectState } from '@/core/state/redux/slices/ProjectSlice';
import { RandomWalkState } from '@/core/state/redux/slices/RandomWalkManagerSlice';
import { RealtimeDataState } from '@/core/state/redux/slices/RealtimeDataSlice';
import { SettingsState } from '@/core/state/redux/slices/SettingsSlice';
import { TaskState } from '@/core/state/redux/slices/TaskSlice';
import { TodoManagerState } from '@/core/state/redux/slices/TodoSlice';
import { TrackerManagerState } from '@/core/state/redux/slices/TrackerSlice';
import { UserManagerState } from '@/core/state/redux/slices/UserSlice';
import { VersionState } from '@/core/state/redux/slices/VersionSlice';
import { VideoState } from '@/core/state/redux/slices/VideoSlice';
import { ToolbarState } from '@/core/state/stores/ToolbarStore';
import { UIState } from '@/core/state/stores/UISlice';
import { DataAnalysisState } from '@/core/typings/phases/dataAnalysisTypes';
import { makeAutoObservable } from 'mobx';

// Define the initial state
const initialState: AppState = {
  progress: 0,
  user: {} as UserProfile,
  currentPage: null,
  currentLayout: null,
  currentTheme: null,
  currentLanguage: null,
  isSidebarOpen: false,
  selectedTheme: 'light',
  selectedLanguage: 'en',
  videoState: {} as VideoState,
  toolbarManager: {} as ToolbarState,
  selectedToolBar: null,
  uiManager: {} as UIState,
  projectManager: {} as ProjectState,
  taskManager: {} as TaskState,
  trackerManager: {} as TrackerManagerState,
  userManager: {} as UserManagerState,
  teamManager: {} as TrackerManagerState,
  projectOwner: {} as ProjectOwnerState,
  dataManager: {} as DataSliceState,
  dataAnalysisManager: {} as DataAnalysisState,
  calendarManager: {} as CalendarManagerState,
  todoManager: {} as TodoManagerState,
  documentManager: {} as DocumentSliceState<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  apiManager: {} as ApiManagerState,
  realtimeManager: {} as RealtimeDataState,
  eventManager: {} as EventState,
  collaborationManager: {} as CollaborationState<UserProfile, ProjectData, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  entityManager: {} as EntityState<any, EntityId>,
  notificationManager: {} as NotificationState,
  settingsManager: {} as SettingsState,
  videoManager: {} as VideoState,
  randomWalkManager: {} as RandomWalkState,
  pagingManager: {} as PagingState,
  blogManager: {} as BlogState,
  drawingManager: {} as DrawingState<T, K>,
  versionManager: {} as VersionState
};

// Create a MobX store for the app state
class AppStore {
  // Define observable state properties
  progress: number;

  constructor(initialState: AppState) {
    // Make state properties observable
    makeAutoObservable(this);

    // Initialize state properties
    this.progress = initialState.progress;
    // Initialize other state properties as needed
  }

  // Define actions to update state
  updateProgress(newProgress: number) {
    this.progress = newProgress;
  }

  // Add other actions to update state as needed
}

// Create an instance of the AppStore with the initial state
const appStore = new AppStore(initialState);

export default appStore;
export { AppStore };
