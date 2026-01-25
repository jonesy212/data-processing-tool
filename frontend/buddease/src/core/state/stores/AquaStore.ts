// AquaStore.ts
// components/state/stores/AquaStore.ts
import type { AquaSession } from '@/core/state/AquaState';
import type { AquaConfig } from '@/utils/web3/webConfigs/aqua/AquaConfig';
import { action, makeAutoObservable } from 'mobx';

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