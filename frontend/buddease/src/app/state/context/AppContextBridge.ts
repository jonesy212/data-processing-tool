// AppContextBridge.ts
// context/AppContextBridge.ts
import { appStores } from './AppStoresContext';

export const AppContextBridge = {
  get projectStore() {
    return appStores.projectStore;
  },
  get cryptoStore() {
    return appStores.cryptoStore;
  },
};
