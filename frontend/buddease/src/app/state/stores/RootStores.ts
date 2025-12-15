// RootStores.ts
import { ApiManagerStore, useApiManagerStore } from '@/app/api/ApiStore';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { EventStore } from '@/app/events/EventStore';
import useUIStore from '@/app/libraries/ui/useUIStore';
import { CalendarActionPayload, CalendarActionType } from '@/app/server/database/CalendarActionPayload';
import { AppStore } from '@/app/state/stores/AppStore';
import { AuthorizationStore, useAuthorizationStore } from '@/app/state/stores/AuthorizationStore';
import { AuthStore, useAuthStore } from '@/app/state/stores/AuthStore';
import BrowserCheckStore from '@/app/state/stores/BrowserCheckStore';
import { CalendarManagerStore, useCalendarManagerStore } from '@/app/state/stores/CalendarManagerStore';
import { CollaborationStore, useCollaborationStore } from '@/app/state/stores/CollaborationStore';
import { DataStore, useDataStore } from '@/app/state/stores/DataStore';
import useDocumentStore, { DocumentStore } from '@/app/state/stores/DocumentStore';
import useIconStore, { IconStore } from '@/app/state/stores/IconStore';
import NotificationStore from '@/app/state/stores/NotificationStore';
import { ProjectManagerStore, useProjectManagerStore } from '@/app/state/stores/ProjectStore';
import { globalCallbackRegistry } from './../../libraries/eventSystem/callbackRegistry';

import { SettingManagerStore } from '@/app/state/hybrid/SettingManagerStore';
import { SettingsStore } from '@/app/state/stores/SettingsStore';
import { TaskManagerStore, useTaskManagerStore } from '@/app/state/stores/TaskStore ';
import { TeamManagerStore, useTeamManagerStore } from '@/app/state/stores/TeamStore';
import useTodoManagerStore, { TodoManagerStore } from '@/app/state/stores/TodoStore';
import { ToolbarStore, useToolbarStore } from '@/app/state/stores/ToolbarStore';
import useTrackerStore, { TrackerStore } from '@/app/state/stores/TrackerStore';
import UIStore from '@/app/state/stores/UIStore';
import { UndoRedoStore } from '@/app/state/stores/UndoRedoStore';
import { UserStore, userManagerStore } from '@/app/state/stores/UserStore';
import useVideoStore, { VideoStore } from '@/app/state/stores/VideoStore';
import { action, makeAutoObservable } from 'mobx';
import { create } from 'mobx-persist';
 
export interface Dispatchable {
  dispatch(action: any): void;
}


export type RootState = MobXRootState;

export interface MobXRootState<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  appStore: AppStore
  taskManagerStore: TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  calendarStore: CalendarManagerStore;
  undoRedoStore: UndoRedoStore;
  browserCheckStore: BrowserCheckStore
  trackerStore: TrackerStore
  toolbarStore: ToolbarStore;
  uiStore: UIStore;
  authStore: AuthStore;
  iconStore: IconStore;
  authorizationStore: AuthorizationStore;
  projectStore: ProjectManagerStore;
  taskStore: TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  userStore: UserStore;
  teamStore: TeamManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  projectOwner: ProjectManagerStore;
  dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataAnalysisStore: DataAnalysisManagerStore;
  todoStore: TodoManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documentStore: DocumentStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  apiStore: ApiManagerStore;
  realtimeStore: RealtimeManagerStore;
  eventStore: EventStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  collaborationStore: CollaborationStore;
  entityStore: EntityManagerStore;
  notificationStore: NotificationStore;
  settingsStore: SettingsStore;
  videoStore: VideoStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  randomWalkStore: RandomWalkManagerStore;
  pagingStore: PagingManagerStore;
  blogStore: BlogManagerStore;
  drawingStore: DrawingManagerStore;
  versionStore: VersionStore;
}

export class RootStores<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {

  private callbackRegistry: CallbackRegistry;
  aquaStore: AquaStore;
  
  // Use definite assignment assertion
  browserCheckStore!: BrowserCheckStore;
  appStore!: AppStore;
  toolbarStore!: ToolbarStore;
  uiStore!: UIStore;
  authStore!: AuthStore;
  iconStore!: IconStore;
  authorizationStore!: AuthorizationStore;
  projectStore!: ProjectManagerStore;
  taskStore!: TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  trackerStore!: TrackerStore;
  userStore!: UserStore;
  settingsStore!: SettingsStore;
  taskManagerStore!: TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  calendarStore!: CalendarManagerStore;
  undoRedoStore!: UndoRedoStore;
  todoStore!: TodoManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  teamStore!: TeamManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  projectOwner!: ProjectManagerStore;
  dataStore!: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataAnalysisStore!: DataAnalysisManagerStore;
  documentStore!: DocumentStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  apiStore!: ApiManagerStore;
  realtimeStore!: RealtimeManagerStore;
  eventStore!: EventStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  collaborationStore!: CollaborationStore;
  entityStore!: EntityStore;
  notificationStore!: NotificationStore;
  settingsStore!: SettingManagerStore;
  videoStore!: VideoStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  randomWalkStore!: RandomWalkStore;
  pagingStore!: PagingManagerStore;
  blogStore!: BlogManagerStore;
  drawingStore!: DrawingManagerStore;
  versionStore!: VersionStore;

  constructor(props: any) {
    // Initialize callback registry first
    this.callbackRegistry = globalCallbackRegistry;
   
    this.projectStore = new ProjectStore(
      this.taskStore,
      this.milestoneStore,
      this.notificationStore,
      this.settingsStore  // Inject settings
    );
    this.aquaStore = new AquaStore();
    // Keep your current variable names
    this.appManager = useAppStore(props);
    this.browserCheckStore = useCheckBrowser();
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

  async initialize() {
    await this.settingsStore.fetchSettings(); // Load settings first
    await this.projectStore.fetchProjects(); // Then load projects with settings
  }

  @action
  public dispatch(action: any) {
    console.log(`RootStore dispatching: ${action.type}`, action);
    // Implement dispatch logic here
    this.browserCheckStore.dispatch(action);
    this.trackerStore.dispatch(action);
    this.todoStore.dispatch(action);
    this.taskManagerStore.dispatch(action);
    this.calendarStore.dispatch(action);
    this.iconStore.dispatch(action);
    this.authStore.dispatch(action);
        
    this.callbackRegistry.executeCallbacks(action.type, action)
      .catch(error => {
        console.error(`Error in global callbacks for action ${action.type}:`, error);
    });
  }

  @action
  public callback(action: any) {
    // Implement callback logic here
    this.browserCheckStore.callback(action);
    this.trackerStore.callback(action);
    this.todoStore.callback(action);
    this.taskManagerStore.callback(action);
    this.calendarStore.callback(action);
    this.iconStore.callback(action);
    this.authStore.callback(action);
  }

   // Method to register global callbacks
  public registerGlobalCallback<T>(
    eventType: string,
    handler: EventHandler<T>,
    options?: any
  ): string {
    return this.callbackRegistry.register(eventType, handler, options);
  }

  public dispose() {
    this.iconStore.dispose();
    this.authStore.dispose();
    // ... dispose other stores
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
