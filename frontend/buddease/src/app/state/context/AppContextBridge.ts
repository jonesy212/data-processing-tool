// AppContextBridge.ts
// context/AppContextBridge.ts
import { appStores } from '@/app/pages/_app';

export const AppContextBridge = {
  get projectStore() {
    return appStores.projectStore;
  },
  get cryptoStore() {
    return appStores.cryptoStore;
  },
};
