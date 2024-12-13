import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { makeAutoObservable } from "mobx";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { isBrowser } from "../../utils/isBrowser"; // Import the isBrowser utility
import BrowserBehaviorManager, { BrowserBehaviorConfig } from "../BrowserBehaviorManager";
import { RootStores } from "./RootStores";
import { SubscriberCollection } from '../../users/SubscriberCollection';
import { Subscriber } from '../../users/Subscriber';

class BrowserCheckStore {
  rootStores?: RootStores;
  browserKey: string | null = null;
  state: Record<string, any> = {}; // State object to hold dynamic data
  browserBehaviorManager: BrowserBehaviorManager;
  private snapshotId: string;      // Private property for snapshotId
  private subscribers: SubscriberCollection<any, any>; // Private property for subscribers (using a Set to avoid duplicates)

  constructor(
    snapshotId: string, 
    rootStores: RootStores, 
    dispatch: any,
    browserConfig: BrowserBehaviorConfig,
    subscribers: Subscriber<any, any>[] | Record<string, Subscriber<any, any>[]> = [], // Default empty array if no subscribers are passed  
    private snapshotStore?: SnapshotStore<any, any>

  ) {
    this.rootStores = rootStores;
    this.snapshotStore = snapshotStore;
    this.browserBehaviorManager = new BrowserBehaviorManager(browserConfig); // Initialize BrowserBehaviorManager
    this.snapshotId = snapshotId;
    
    // Initialize subscribers based on the provided value (array or record)
    if (Array.isArray(subscribers)) {
      this.subscribers = [...subscribers]; // If it's an array, spread to create a new array
    } else if (typeof subscribers === 'object') {
      this.subscribers = { ...subscribers }; // If it's a record, clone it
    } else {
      this.subscribers = []; // Default to an empty array if neither
    }

    this.dispatch = dispatch;
    makeAutoObservable(this);
  }


  /**
   * Initializes the BrowserCheckStore with the provided key.
   * Only runs in the browser environment.
   * @param key - The key to initialize the store.
   */init(key: string) {
    if (isBrowser()) {
      if (this.browserKey === null) {
        console.log(`Initializing BrowserCheckStore with key: ${key}`);
        this.browserKey = key;

        // Example: Use the browser behavior manager
        if (this.browserBehaviorManager.getConfig().isAutoDismiss) {
          console.log("Auto-dismiss is enabled.");
        }
      } else {
        console.error(
          `There was an issue initializing BrowserCheckStore with key: ${key}`
        );
        const errorMessage = NOTIFICATION_MESSAGES.Error.DEFAULT;
        console.error(errorMessage);
      }
    } else {
      console.log("Not in a browser environment, skipping BrowserCheckStore initialization.");
    }
  }

    /**
   * Updates the state of the store.
   * Merges the current state with new properties.
   * @param newState - Partial state to merge into the existing state.
   */
    setState(newState: Record<string, any>) {
      this.state = { ...this.state, ...newState };
    }

  /**
   * Dispatches actions based on their type.
   * Handles different action types, including browser checks and theme changes.
   * @param action - The action to be dispatched.
   */
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

  /**
   * Dispatches a test action to the store.
   * Logs the action being dispatched.
   * @param action - The action to dispatch.
   */
  testDispatch(action: any) {
    console.log('Dispatching action:', action);
    this.dispatch(action);
  }

  /**
 * Saves a browser-specific snapshot using the SnapshotStore.
 * @param data - The data to save.
 */
  saveBrowserSnapshot(data: any) {
    if (this.snapshotStore) {
      const snapshotData = {
        id: `browser-${this.browserKey}`,
        data,
        category: 'browser',
        isMobile: this.browserBehaviorManager.isMobile(),
        browserType: this.browserBehaviorManager.getBrowserType(),
      };

      this.snapshotStore.addSnapshot(snapshotData, this.snapshotId, this.subscribers);
    }
  }
  // Add other methods or properties as needed
}

export default BrowserCheckStore;
