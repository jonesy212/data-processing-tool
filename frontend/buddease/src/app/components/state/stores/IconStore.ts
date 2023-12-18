// IconStore.ts

import { makeAutoObservable } from 'mobx';
import { RootStore, rootStore } from './RootStores';
import generateStoreKey from './StoreKeyGenerator';

export class IconStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  loadIcon(iconLoader: () => Promise<React.ReactNode>): void {
    // Implement your logic to load icons here
    iconLoader().then(() => {
      // Trigger any necessary updates after loading
    });
  }
}

// Example usage in cache management
const iconStore = new IconStore(rootStore);
const storeKey = generateStoreKey("iconStore");



