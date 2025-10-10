// AppStore.ts
import { UserProfile } from '@/app/api/ApiUser';
import { CalendarManagerState } from '@/app/components/calendar/CalendarSlice';
import { ProjectData } from '@/app/models/projects/Project';
import { PagingState } from '@/app/pages/Paging';
import { ApiManagerState } from '@/app/state/redux/slices/ApiSlice';
import { AppState } from '@/app/state/redux/slices/AppSlice';
import { BlogState } from '@/app/state/redux/slices/BlogSlice';
import { CollaborationState } from '@/app/state/redux/slices/CollaborationSlice';
import { DataSliceState } from '@/app/state/redux/slices/DataSlice';
import { DocumentSliceState } from '@/app/state/redux/slices/DocumentSlice';
import { DrawingState } from '@/app/state/redux/slices/DrawingSlice';
import { EventState } from '@/app/state/redux/slices/EventSlice';
import { NotificationState } from '@/app/state/redux/slices/NotificationSlice';
import { ProjectOwnerState } from '@/app/state/redux/slices/ProjectOwnerSlice';
import { ProjectState } from '@/app/state/redux/slices/ProjectSlice';
import { RandomWalkState } from '@/app/state/redux/slices/RandomWalkManagerSlice';
import { RealtimeDataState } from '@/app/state/redux/slices/RealtimeDataSlice';
import { SettingsState } from '@/app/state/redux/slices/SettingsSlice';
import { TaskState } from '@/app/state/redux/slices/TaskSlice';
import { TodoManagerState } from '@/app/state/redux/slices/TodoSlice';
import { TrackerManagerState } from '@/app/state/redux/slices/TrackerSlice';
import { UserManagerState } from '@/app/state/redux/slices/UserSlice';
import { VersionState } from '@/app/state/redux/slices/VersionSlice';
import { VideoState } from '@/app/state/redux/slices/VideoSlice';
import { ToolbarState } from '@/app/state/stores/ToolbarStore';
import { UIState } from '@/app/state/stores/UISlice';
import { DataAnalysisState } from '@/app/typings/phases/dataAnalysisTypes';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { EntityId, EntityState } from '@reduxjs/toolkit';
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
