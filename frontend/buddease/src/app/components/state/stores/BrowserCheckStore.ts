import { makeAutoObservable } from "mobx";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { RootStores } from "./RootStores";

class BrowserCheckStore {
  rootStores?: RootStores;
  browserKey: string | null = null;
  dispatch: (action: any) => void = () => {};
  constructor(rootStores: RootStores, dispatch: any) {
    this.rootStores = rootStores;
    this.dispatch = dispatch;
    makeAutoObservable(this);
  }

  init(key: string) {
    if (this.browserKey === null) {
      console.log(`Initializing BrowserCheckStore with key: ${key}`);
      this.browserKey = key;
    } else {
      console.error(
        `There was an issue initializing BrowserCheckStore with key: ${key}`
      );

      // Correctly access the error message function
      const errorMessage = NOTIFICATION_MESSAGES.Error.DEFAULT;

      // Use your notification mechanism to display the error message
      console.error(errorMessage);
    }
  }
  testDispatch(action: any) {
    console.log('Dispatching action:', action);
    this.dispatch(action);
  }
  // Add other methods or properties as needed
}

export default BrowserCheckStore;
