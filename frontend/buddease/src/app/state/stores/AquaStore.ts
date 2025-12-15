// components/state/stores/AquaStore.ts
import { makeAutoObservable, action } from 'mobx';
import { AquaConfig } from '@/utils/web3/webConfigs/aqua/AquaConfig'
import { AquaSession } from '@/app/state/AquaState'

export class AquaStore {
  config: AquaConfig | null = null;
  session: AquaSession | null = null;
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAquaConfig = action((config: AquaConfig) => {
    this.config = config;
    this.isInitialized = true;
  });

  setUserSession = action((session: AquaSession) => {
    this.session = session;
  });

  clearSession = action(() => {
    this.session = null;
  });

  updateLastActivity = action(() => {
    if (this.session) {
      this.session = {
        ...this.session,
          lastActivity: new Date()
      };
    }
  });
}

// Create a singleton instance
export const aquaStore = new AquaStore();