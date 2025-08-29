// AppStore.ts
import { makeAutoObservable } from 'mobx';
import { AppState } from '../redux/slices/AppSlice'
import { UserProfile } from '@/app/api/ApiUser';
import { VideoState } from '../redux/slices/VideoSlice';
import { ToolbarState } from './ToolbarStore';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { PagingState } from '@/app/pages/Paging';
import { DataAnalysisState } from '@/app/typings/dataAnalysisTypes';
import { EntityState, EntityId } from '@reduxjs/toolkit';
import { CalendarManagerState } from '../../calendar/CalendarSlice';
import { DocumentData } from '../../documents/DocumentBuilder';
import { T, K, Meta } from '../../models/data/dataStoreMethods';
import { ProjectData } from '../../projects/Project';
import { ProjectOwnerState } from '../../users/ProjectOwnerSlice';
import { UserData } from '../../users/User';
import { UserManagerState } from '../../users/UserSlice';
import { ApiManagerState } from '../redux/slices/ApiSlice';
import { BlogState } from '../redux/slices/BlogSlice';
import { CollaborationState } from '../redux/slices/CollaborationSlice';
import { DataSliceState } from '../redux/slices/DataSlice';
import { DocumentSliceState } from '../redux/slices/DocumentSlice';
import { DrawingState } from '../redux/slices/DrawingSlice';
import { EventState } from '../redux/slices/EventSlice';
import { NotificationState } from '../redux/slices/NotificationSlice';
import { ProjectState } from '../redux/slices/ProjectSlice';
import { RandomWalkState } from '../redux/slices/RandomWalkManagerSlice';
import { RealtimeDataState } from '../redux/slices/RealtimeDataSlice';
import { SettingsState } from '../redux/slices/SettingsSlice';
import { TaskState } from '../redux/slices/TaskSlice';
import { TodoManagerState } from '../redux/slices/TodoSlice';
import { TrackerManagerState } from '../redux/slices/TrackerSlice';
import { VersionState } from '../redux/slices/VersionSlice';
import { UIState } from './UISlice';
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
  documentManager: {} as DocumentSliceState<T, K, StructuredMetadata<T, K>>,
  apiManager: {} as ApiManagerState,
  realtimeManager: {} as RealtimeDataState,
  eventManager: {} as EventState,
  collaborationManager: {} as CollaborationState<UserProfile, ProjectData, StructuredMetadata<T, K>>,
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
export { AppStore}