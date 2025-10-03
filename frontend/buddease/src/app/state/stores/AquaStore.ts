// AquaStore.ts
// components/state/stores/AquaStore.ts
import { create } from 'zustand';
import { AquaConfig, AquaSession } from '@/app/components/aqua/types';

interface AquaStore {
  config: AquaConfig | null;
  session: AquaSession | null;
  isInitialized: boolean;
  setAquaConfig: (config: AquaConfig) => void;
  setUserSession: (session: AquaSession) => void;
  clearSession: () => void;
  updateLastActivity: () => void;
}

export const useAquaStore = create<AquaStore>((set) => ({
  config: null,
  session: null,
  isInitialized: false,
  setAquaConfig: (config) => set({ config, isInitialized: true }),
  setUserSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
  updateLastActivity: () => set((state) => ({
    session: state.session ? {
      ...state.session,
      lastActive: new Date()
    } : null
  }))
}));