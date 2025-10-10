// RootStores.ts
import { TrackerStore } from '@/app/state/stores/TrackerStore';
import { ApiManagerStore, useApiManagerStore } from '@/api/ApiStore';
import { CalendarManagerStore, useCalendarManagerStore } from '@/app/state/CalendarManagerStore';
import { EventStore } from '@/app/components/event/EventStore';
import useUIStore from '@/app/libraries/ui/useUIStore';
import { RealTimeDataStore } from '@/app/models/realtime/RealTimeDataStore';
import { DataStore, useDataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { AppStore } from '@/app/state/stores/AppStore';
import { AuthorizationStore, useAuthorizationStore } from '@/app/state/stores/AuthorizationStore';
import BrowserCheckStore from '@/app/state/stores/BrowserCheckStore';
import { CollaborationStore, useCollaborationStore } from '@/app/state/stores/CollaborationStore';
import useDocumentStore, { DocumentStore } from '@/app/state/stores/DocumentStore';
import useIconStore, { IconStore } from '@/app/state/stores/IconStore';
import NotificationStore from '@/app/state/stores/NotificationStore';
import { ProjectManagerStore, useProjectManagerStore } from '@/app/state/stores/ProjectStore';
import { CalendarActionPayload, CalendarActionType } from '@/server/database/CalendarActionPayload';
import { SettingManagerStore } from '@/app/state/stores/SettingsStore';
import { AuthStore, useAuthStore } from '@/state/storesAuthStore';
import { TaskManagerStore, useTaskManagerStore } from '@/app/state/stores/TaskStore ';
import { TeamManagerStore, useTeamManagerStore } from '@/app/state/stores/TeamStore';
import useTodoManagerStore, { TodoManagerStore } from '@/app/state/stores/TodoStore';
import { ToolbarStore, useToolbarStore } from '@/app/state/stores/ToolbarStore';
import useTrackerStore, { TrackerStore } from '@/app/state/stores/TrackerStore';
import UIStore from '@/app/state/stores/UIStore';
import { UserStore, userManagerStore } from '@/app/state/stores/UserStore';
import useVideoStore, { VideoStore } from '@/app/state/stores/VideoStore';
import { action, makeAutoObservable } from 'mobx';
import { create } from 'mobx-persist';
 
export interface Dispatchable {
  dispatch(action: any): void;
}


export type RootState = MobXRootState;

export interface MobXRootState {
  appStore: AppStore;


   // Add missing stores here
  trackerStore: TrackerStore;
  taskManagerStore: TaskManagerStore;
  calendarStore: CalendarManagerStore;
  undoRedoStore: UndoRedoStore;
  todoStore: TodoManagerStore;
  teamStore: TeamManagerStore<T, K, Meta>;
  userStore: UserStore;

  browserCheckStore: BrowserCheckStore
  trackerStore: TrackerStore
  toolbarStore: ToolbarStore;
  uiStore: UIStore;
  authStore: AuthStore;
  iconStore: IconStore;
  authorizationStore: AuthorizationStore;
  projectStore: ProjectManagerStore;
  taskStore: TaskManagerStore;
  
  trackerStore: TrackerStore;
  userStore: UserStore;
  teamStore: TeamManagerStore<T, K, Meta>;
  projectOwner: ProjectManagerStore;
  dataStore: DataStore<T, K>;
  dataAnalysisStore: DataAna;
  calendarStore: CalendarManagerStore;
  todoStore: TodoManagerStore;
  documentStore: DocumentStore;
  
  apiStore: ApiManagerStore;
  realtimeStore: RealtimeManagerStore;
  eventStore: EventManagerStore;
  collaborationStore: CollaborationManagerStore;
  entityStore: EntityManagerStore;
  notificationStore: NotificationManagerStore;
  settingsStore: SettingsManagerStore;
  videoStore: VideoStore;
  randomWalkStore: RandomWalkManagerStore;
  pagingStore: PagingManagerStore;
  blogStore: BlogManagerStore;
  drawingStore: DrawingManagerStore;
  versionStore: VersionManagerStore;
}

export class RootStores {
  
  
  browserCheckStore: BrowserCheckStore;
  appStore: AppStore;
  toolbarStore: ToolbarStore;
  uiStore: UIStore;
  authStore: AuthStore;
  iconStore: IconStore;
  authorizationStore: AuthorizationStore;
  projectStore: ProjectManagerStore;
  taskStore: TaskManagerStore;
  trackerStore: TrackerStore;
  userStore: UserStore;

  trackerStore: TrackerStore;
  taskManagerStore: TaskManagerStore;
  calendarStore: CalendarManagerStore;
  undoRedoStore: UndoRedoStore;
  todoStore: TodoManagerStore;
  teamStore: TeamManagerStore<T, K, Meta>;
  userStore: UserStore;

  teamStore: TeamManagerStore<T, K>;
  projectOwner: ProjectManagerStore;
  dataStore: DataStore<any, any>;
  dataAnalysisStore: DataAnalysisManagerStore;
  calendarStore: CalendarManagerStore;
  todoStore: TodoManagerStore;
  documentStore: DocumentStore;
  apiStore: ApiManagerStore;
  realtimeStore: RealTimeDataStore;
  eventStore: EventStore;
  collaborationStore: CollaborationStore;
  entityStore: EntityStore;
  notificationStore: NotificationStore;
  settingsStore: SettingManagerStore;
  videoStore: VideoStore;
  randomWalkStore: RandomWalkStore;
  pagingStore: PagingManagerStore;
  blogStore: BlogManagerStore;
  drawingStore: DrawingManagerStore;
  versionStore: VersionStore;



  constructor(props: any) {
    this.appManager = useAppStore(props);
    this.browserCheckStore = useCheckBrowser()
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
    this.authStore.dispatch(action);
    
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
    this.authStore.callback(action);
  }

  @action
  public setDocumentReleaseStatus(id: number, eventId: number, status: string, isReleased: boolean) {
    this.documentStore.setDocumentReleaseStatus(id, eventId, status, isReleased);
  }

  @action
  public getSnapshotDataKey(documentId: string | number, eventId: number, userId: string) {
    return this.documentStore.getSnapshotDataKey(documentId, eventId, userId)
  }

  @action
  public getData(id: string) {
    return this.documentStore.getData(id);
  }

  @action
  public updateDocumentReleaseStatus(id: number, eventId: number, status: string, isReleased: boolean) {
    this.documentStore.updateDocumentReleaseStatus(id, eventId, status, isReleased);
  }

  @action
  public action(type: CalendarActionType, payload: CalendarActionPayload<T, K>) {
    this.calendarStore.action(type, payload);
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
      authStore: this.authManager,
    };
  }
}

export const rootStores = new RootStores(props);

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
