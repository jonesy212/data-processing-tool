// AppStore.ts
import { makeAutoObservable } from 'mobx';

// Define the interface for the app state
interface AppState {
  progress: number;
  // Add other state properties here
}

// Define the initial state
const initialState: AppState = {
  progress: 0,
  // Initialize other state properties as needed
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