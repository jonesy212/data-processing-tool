// BrowserCheckStore.ts
import { makeAutoObservable } from "mobx";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { RootStores } from "./RootStores";
class BrowserCheckStore {
  rootStores?: RootStores;
  browserKey: string | null = null;
  constructor(rootStores: RootStores) {
    this.rootStores = rootStores;
    makeAutoObservable(this);
  }

  //For exmaple, set the browserKey property with the provided key
  // For example, set the browserKey property with the provided key
  init(key: string) {
    if (this.browserKey === null) {
      console.log(`Initializing BrowserCheckStore with key: ${key}`);
      this.browserKey = key;
    } else {
      console.error(
        `There was an issue initializing BrowserCheckStore with key: ${key}`
      );

      // Add notification for error
      const errorMessage = NOTIFICATION_MESSAGES.Error.DEFAULT(
        "Initialization Error"
      );
      // Use your notification mechanism to display the error message
      console.error(errorMessage);
    }
  }
  // Add other methods or properties as needed
}

export default BrowserCheckStore;
