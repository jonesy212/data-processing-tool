// RootStores.ts
import { initialState } from '@/app/components/state/redux/slices/FilteredEventsSlice';


import { action, makeAutoObservable } from 'mobx';
import { create } from 'mobx-persist';
import { Todo } from '../../todos/Todo';
import { AuthStore, useAuthStore } from './AuthStore';
import { CalendarManagerStore, useCalendarManagerStore } from './CalendarEvent';
import useIconStore, { IconStore } from './IconStore';
import { TaskManagerStore, useTaskManagerStore } from './TaskStore ';
import { TeamManagerStore, useTeamManagerStore } from './TeamStore';
import useTodoManagerStore, { TodoManagerStore } from './TodoStore';
import useTrackerStore, { TrackerStore } from './TrackerStore';
import { UndoRedoStore, useUndoRedoStore } from './UndoRedoStore';
import { UserStore, userManagerStore } from './UserStore';
import { AppStore } from './AppStore';
import UIStore from './UIStore';
import { ApiManagerStore, useApiManagerStore } from './ApiStore';
import { AuthorizationStore, useAuthorizationStore } from './AuthorizationStore';
import { ProjectManagerStore, useProjectManagerStore } from './ProjectStore';
import { ToolbarStore, useToolbarStore } from './ToolbarStore';
import { SettingManagerStore } from './SettingsStore';
import NotificationStore from './NotificationStore';
import { DataStore, useDataStore } from '../../projects/DataAnalysisPhase/DataProcessing/DataStore';
import useDocumentStore, { DocumentStore } from './DocumentStore';
import { RealTimeDataStore, RealTimeDataStoreClass } from '../../models/realtime/RealTimeDataStore';
import { CollaborationStore, useCollaborationStore } from './CollaborationStore';
import useVideoStore, { VideoStore } from './VideoStore';
import useUIStore from '../../libraries/ui/useUIStore';
import useUserProfile from '../../hooks/useUserProfile';
import { CalendarActionPayload, CalendarActionType } from '../../database/CalendarActionPayload';
import { EventStore } from '../../event/EventStore';
 
export interface Dispatchable {
  dispatch(action: any): void;
}


export interface MobXRootState {
  appManager: AppStore;
  toolbarManager: ToolbarStore;
  uiManager: UIStore;
  authManager: AuthStore;
  iconStore: IconStore;
  authorizationManager: AuthorizationStore;
  projectManager: ProjectManagerStore;
  taskManager: TaskManagerStore;
  trackerManager: TrackerStore;
  userManager: UserStore;
  teamManager: TeamManagerStore;
  projectOwner: ProjectManagerStore;
  dataManager: DataStore<T, K>;
  dataAnalysisManager: DataAnal;
  calendarManager: CalendarManagerStore;
  todoManager: TodoManagerStore;
  documentManager: DocumentStore;
  
  apiManager: ApiManagerStore;
  realtimeManager: RealtimeManagerStore;
  eventManager: EventManagerStore;
  collaborationManager: CollaborationManagerStore;
  entityManager: EntityManagerStore;
  notificationManager: NotificationManagerStore;
  settingsManager: SettingsManagerStore;
  videoManager: VideoStore;
  randomWalkManager: RandomWalkManagerStore;
  pagingManager: PagingManagerStore;
  blogManager: BlogManagerStore;
  drawingManager: DrawingManagerStore;
  versionManager: VersionManagerStore;
}

export class RootStores {
  appManager: AppStore;
  toolbarManager: ToolbarStore;
  uiManager: UIStore;
  authManager: AuthStore;
  iconStore: IconStore;
  authorizationManager: AuthorizationStore;
  projectManager: ProjectManagerStore;
  taskManager: TaskManagerStore;
  trackerManager: TrackerStore;
  userManager: UserStore;
  teamManager: TeamManagerStore<T, K>;
  projectOwner: ProjectManagerStore;
  dataManager: DataStore<any, any>;
  dataAnalysisManager: DataAnalysisManagerStore;
  calendarManager: CalendarManagerStore;
  todoManager: TodoManagerStore;
  documentManager: DocumentStore;
  apiManager: ApiManagerStore;
  realtimeManager: RealTimeDataStore;
  eventManager: EventStore;
  collaborationManager: CollaborationStore;
  entityManager: EntityStore;
  notificationManager: NotificationStore;
  settingsManager: SettingManagerStore;
  videoManager: VideoStore;
  randomWalkManager: RandomWalkStore;
  pagingManager: PagingManagerStore;
  blogManager: BlogManagerStore;
  drawingManager: DrawingManagerStore;
  versionManager: VersionStore;



  constructor(props: any) {
    this.appManager = useAppStore(props);
    this.toolbarManager = useToolbarStore();
    this.uiManager = useUIStore();
    this.authManager = useAuthStore();
    this.iconStore = useIconStore(props);
    this.authorizationManager = useAuthorizationStore();
    this.projectManager = useProjectManagerStore();
    this.taskManager = useTaskManagerStore();
    this.trackerManager = useTrackerStore(props);
    this.userManager = userManagerStore();
    this.teamManager = useTeamManagerStore(storeId);
    this.projectOwner = useProjectManagerStore();
    this.dataManager = useDataStore(props);
    this.dataAnalysisManager = useDataAnalysisManagerStore(props);
    this.calendarManager = useCalendarManagerStore();
    this.todoManager = useTodoManagerStore(props);
    this.documentManager = useDocumentStore();
    
    this.apiManager = useApiManagerStore();
    this.realtimeManager = useRealtimeManagerStore(props);
    this.eventManager = useEventManagerStore(props);
    this.collaborationManager = useCollaborationStore(props);
    this.entityManager = useEntityManagerStore(props);
    this.notificationManager = useNotificationStore();
    this.settingsManager = useSettingsManagerStore(props);
    this.videoManager = useVideoStore(props);
    this.randomWalkManager = useRandomWalkManagerStore(props);
    this.pagingManager = usePagingManagerStore(props);
    this.blogManager = useBlogManagerStore(props);
    this.drawingManager = useDrawingManagerStore(props);
    this.versionManager = useVersionManagerStore(props);
    
    makeAutoObservable(this);
  }

  @action
  public dispatch(action: any) {
    // Implement dispatch logic here
    // For example:
    this.browserCheckStore.dispatch(action);
    this.trackerStore.dispatch(action);
    this.todoStore.dispatch(action);
    this.taskManagerStore.dispatch(action);
    this.calendarStore.dispatch(action);
    this.iconStore.dispatch(action);
    this.authManager.dispatch(action);
    
  }

  @action
  public callback(action: any) {
    // Implement callback logic here
    // For example:
    this.browserCheckStore.callback(action);
    this.trackerStore.callback(action);
    this.todoStore.callback(action);
    this.taskManagerStore.callback(action);
    this.calendarStore.callback(action);
    this.iconStore.callback(action);
    this.authManager.callback(action);
  }

  @action
  public setDocumentReleaseStatus(id: number, eventId: number, status: string, isReleased: boolean) {
    this.documentManager.setDocumentReleaseStatus(id, eventId, status, isReleased);
  }

  @action
  public getSnapshotDataKey(documentId: string | number, eventId: number, userId: string) {
    return this.documentManager.getSnapshotDataKey(documentId, eventId, userId)
  }

  @action
  public getData(id: string) {
    return this.documentManager.getData(id);
  }

  @action
  public updateDocumentReleaseStatus(id: number, eventId: number, status: string, isReleased: boolean) {
    this.documentManager.updateDocumentReleaseStatus(id, eventId, status, isReleased);
  }

  @action
  public action(type: CalendarActionType, payload: CalendarActionPayload<T, K>) {
    this.calendarManager.action(type, payload);
  }

  public getState(): MobXRootState {
    return {
      browserCheckStore: this.browserCheckStore,
      trackerStore: this.trackerStore,
      taskManagerStore: this.taskManagerStore,
      iconStore: this.iconStore,
      calendarStore: this.calendarStore,
      undoRedoStore: this.undoRedoStore,
      todoStore: this.todoStore,
      teamStore: this.teamStore,
      userStore: this.userStore,
      authManager: this.authManager,
    };
  }
}

export const rootStores = new RootStores(props);

class BrowserCheckStore {
  rootStores?: RootStores;

  constructor(rootStores: RootStores) {
    this.rootStores = rootStores;
    makeAutoObservable(this);
  }

  dispatch(action: any): void {
    switch (action.type) {
      case 'BROWSER_CHECK_ACTION':
        // Handle browser check action
        console.log('Performing browser check action');
        break;
      case 'THEME_CHANGE':
        console.log('Theme changed:', action.payload);
        break;
      // Add more cases as needed for different actions
      default:
        // Handle unknown action types or default behavior
        console.warn('Unhandled action type:', action.type);
    }
  }
}

// Initialize mobx-persist
const hydrate = create();
hydrate('rootStores', rootStores)
  .then(() => {
    // After hydration is complete, you can perform any additional setup here
    // #todo create stores for
    // rootStores.loadUserPreferences();
    // rootStores.initializeWeb3Services();
    // rootStores.fetchProjectData();
    // rootStores.setupAnalytics();
    // rootStores.initiateP2PCommunication();
    // rootStores.checkForUpdates();
    // rootStores.notifyUser();
  })
  .catch((error) => {
    console.error('Error hydrating store:', error);
  });
