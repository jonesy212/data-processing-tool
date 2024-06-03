// RootStores.ts
import { action, makeAutoObservable } from 'mobx';
import { create } from 'mobx-persist';
import { CalendarManagerStore, useCalendarManagerStore } from './CalendarEvent';
import useIconStore, { IconStore } from './IconStore';
import { TaskManagerStore, useTaskManagerStore } from './TaskStore ';
import { TeamManagerStore, useTeamManagerStore } from './TeamStore';
import useTodoManagerStore, { TodoManagerStore } from './TodoStore';
import useTrackerStore, { TrackerStore } from './TrackerStore';
import { UndoRedoStore } from './UndoRedoStore';
import { UserStore, userManagerStore } from './UserStore';
import { Todo } from '../../todos/Todo';


export interface Dispatchable {
  dispatch(action: any): void;
}

export class RootStores {
  browserCheckStore: BrowserCheckStore;
  trackerStore: TrackerStore;
  todoStore: TodoManagerStore<Todo>;
  taskManagerStore: TaskManagerStore
  iconStore:  IconStore;
  calendarStore: CalendarManagerStore;
  undoRedoStore: UndoRedoStore;
  teamStore: Promise<TeamManagerStore>
  userStore: UserStore;
  prototype: any  
  browsers: any

  constructor() {
    this.browserCheckStore = new BrowserCheckStore(this);
    this.todoStore = useTodoManagerStore()
    this.trackerStore = useTrackerStore(rootStores)
    this.taskManagerStore = useTaskManagerStore()
    this.calendarStore = useCalendarManagerStore()
    this.undoRedoStore = new UndoRedoStore();
    this.userStore =  userManagerStore();
    this.iconStore = useIconStore(rootStores)
    this.teamStore = useTeamManagerStore()
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
