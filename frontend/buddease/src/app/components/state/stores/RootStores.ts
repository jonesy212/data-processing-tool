// rootStore.ts

import { makeAutoObservable } from 'mobx';
import { create } from 'mobx-persist';
import { IconStore } from './IconStore';

export class RootStore {
  browserCompatibilityStore: BrowserCompatibilityStore;
  iconStore: IconStore
  // userStore: UserStore
  // todoStore: TodoStore
  constructor() {
    this.browserCompatibilityStore = new BrowserCompatibilityStore(this);
    // this.userStore = new this.userStore(this)
    // this.todoStore = new this.todoStore(this)
    this.iconStore = new IconStore(this);
      // Add more stores as needed
      
      makeAutoObservable(this);
  }
}

export const rootStore = new RootStore();

// BrowserCompatibilityStore.ts (generated)

class BrowserCompatibilityStore {
  // Add your store properties and methods here
  rootStore: RootStore
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}

// Initialize mobx-persist

// Initialize mobx-persist
const hydrate = create();
hydrate('rootStore', rootStore)
  .then(() => {
    // After hydration is complete, you can perform any additional setup here
    // #todo create stores for
    // rootStore.loadUserPreferences();
    // rootStore.initializeWeb3Services();
    // rootStore.fetchProjectData();
    // rootStore.setupAnalytics();
    // rootStore.initiateP2PCommunication();
    // rootStore.checkForUpdates();
    // rootStore.notifyUser();

  })
  .catch((error) => {
    console.error('Error hydrating store:', error);
  });

// Export the hydrated root store
export const hydratedRootStore = rootStore;

export default BrowserCompatibilityStore;
