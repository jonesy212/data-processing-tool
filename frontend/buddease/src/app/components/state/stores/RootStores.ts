// RootStores.ts
import { makeAutoObservable } from 'mobx';
import { create } from 'mobx-persist';
import { IconStore } from './IconStore';
import { TaskManagerStore, useTaskManagerStore } from './TaskStore ';
import useTodoManagerStore, { TodoManagerStore } from './TodoStore';
import useTrackerStore, { TrackerStore } from './TrackerStore';

export class RootStores {
  browserCheckStore: BrowserCheckStore;
  trackerStore: TrackerStore;
  todoStore: TodoManagerStore;
  taskManagerStore: TaskManagerStore
  iconStore:  typeof IconStore;
  prototype: any  
  browsers: any
  constructor() {
    this.browserCheckStore = new BrowserCheckStore(this);
    this.todoStore = useTodoManagerStore()
    this.trackerStore = useTrackerStore(rootStores)
    this.taskManagerStore = useTaskManagerStore()
    this.iconStore =  IconStore
    makeAutoObservable(this);
  }
}

export const rootStores = new RootStores();

class BrowserCheckStore {
  rootStores?: RootStores;

  constructor(rootStores: RootStores) {
    this.rootStores = rootStores;
    makeAutoObservable(this);
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
