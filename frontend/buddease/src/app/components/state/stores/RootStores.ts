import { initialState } from '@/app/components/state/redux/slices/FilteredEventsSlice';
// RootStores.ts
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
 
export interface Dispatchable {
  dispatch(action: any): void;
}


export interface MobXRootState {
  appManager: AppStore;
  toolbarManager: ToolbarStore;
  uiManager: UIStore;
  authManager: AuthStore;
  authorizationManager: AuthorizationStore;
  projectManager: ProjectManagerStore;
  taskManager: TaskManagerStore;
  trackerManager: TrackerManagerStore;
  userManager: UserManagerStore;
  teamManager: TeamManagerStore;
  projectOwner: ProjectOwnerStore;
  dataManager: DataManagerStore;
  dataAnalysisManager: DataAnalysisManagerStore;
  calendarManager: CalendarManagerStore;
  todoManager: TodoManagerStore;
  documentManager: DocumentManagerStore;
  apiManager: ApiManagerStore;
  realtimeManager: RealtimeManagerStore;
  eventManager: EventManagerStore;
  collaborationManager: CollaborationManagerStore;
  entityManager: EntityManagerStore;
  notificationManager: NotificationManagerStore;
  settingsManager: SettingsManagerStore;
  videoManager: VideoManagerStore;
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
  authorizationManager: AuthorizationStore;
  projectManager: ProjectManagerStore;
  taskManager: TaskManagerStore;
  trackerManager: TrackerManagerStore;
  userManager: UserManagerStore;
  teamManager: TeamManagerStore;
  projectOwner: ProjectOwnerStore;
  dataManager: DataManagerStore;
  dataAnalysisManager: DataAnalysisManagerStore;
  calendarManager: CalendarManagerStore;
  todoManager: TodoManagerStore;
  documentManager: DocumentManagerStore;
  apiManager: ApiManagerStore;
  realtimeManager: RealtimeManagerStore;
  eventManager: EventManagerStore;
  collaborationManager: CollaborationManagerStore;
  entityManager: EntityManagerStore;
  notificationManager: NotificationManagerStore;
  settingsManager: SettingsManagerStore;
  videoManager: VideoManagerStore;
  randomWalkManager: RandomWalkManagerStore;
  pagingManager: PagingManagerStore;
  blogManager: BlogManagerStore;
  drawingManager: DrawingManagerStore;
  versionManager: VersionManagerStore;

  constructor() {
    this.appManager = useAppStore();
    this.toolbarManager = useToolbarStore();
    this.uiManager = useUIManagerStore();
    this.authManager = useAuthStore();
    this.authorizationManager = useAuthorizationStore();
    this.projectManager = useProjectManagerStore();
    this.taskManager = useTaskManagerStore();
    this.trackerManager = useTrackerManagerStore();
    this.userManager = useUserManagerStore();
    this.teamManager = useTeamManagerStore();
    this.projectOwner = useProjectOwnerStore();
    this.dataManager = useDataManagerStore();
    this.dataAnalysisManager = useDataAnalysisManagerStore();
    this.calendarManager = useCalendarManagerStore();
    this.todoManager = useTodoManagerStore();
    this.documentManager = useDocumentManagerStore();
    this.apiManager = useApiManagerStore();
    this.realtimeManager = useRealtimeManagerStore();
    this.eventManager = useEventManagerStore();
    this.collaborationManager = useCollaborationManagerStore();
    this.entityManager = useEntityManagerStore();
    this.notificationManager = useNotificationManagerStore();
    this.settingsManager = useSettingsManagerStore();
    this.videoManager = useVideoManagerStore();
    this.randomWalkManager = useRandomWalkManagerStore();
    this.pagingManager = usePagingManagerStore();
    this.blogManager = useBlogManagerStore();
    this.drawingManager = useDrawingManagerStore();
    this.versionManager = useVersionManagerStore();
    
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

export const rootStores = new RootStores();

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
