// AppContext.ts
// app/state/context/AppContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { ProjectStore } from '../stores/ProjectStore';
import { CryptoStore } from '../stores/CryptoStore';
import { TaskManagerStore } from '@/app/stores/TaskStore';
import { PhaseStore } from '../stores/PhaseStore';
import { useDispatch } from 'react-redux';
import { hydrateSnapshot, persistSnapshot } from '@/utils/snapshotUtils'; // <- add your snapshot helpers
import { RootState } from '@/app/state/redux/slices/RootSlice'
import { useSelector } from 'react-redux';

/**
 * --------------------------------------
 * 🧩 Store Initialization and Context
 * --------------------------------------
 * This file initializes MobX stores, connects them with Redux,
 * and enables optional snapshot persistence for offline or
 * cross-session synchronization.
 */

/** 
 * Typed interface for all application stores.
 * Each store can depend on others or be used independently.
 */
export interface AppStores {
  projectStore: ProjectStore;
  taskStore: TaskStore;
  phaseStore: PhaseStore;
  cryptoStore: CryptoStore;
}

/**
 * Lazy-initialize stores so they are instantiated only once.
 * Using `useRef` prevents re-instantiation on React re-renders.
 */
const useInitializeStores = (): AppStores => {
  const storesRef = useRef<AppStores>(initialValue);

  if (!storesRef.current) {
    const taskStore = new TaskStore();
    const phaseStore = new PhaseStore();
    const projectStore = new ProjectStore(taskStore, phaseStore);
    const cryptoStore = new CryptoStore();

    storesRef.current = { projectStore, taskStore, phaseStore, cryptoStore };
  }

  return storesRef.current;
};

/**
 * Create a React Context to provide all MobX store instances.
 */
const AppStoresContext = createContext<AppStores | null>(null);

/**
 * Context Provider that hydrates MobX + Snapshot data
 * and connects with Redux for side-effect orchestration.
 */
export const AppStoresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stores = useInitializeStores();
  const dispatch = useDispatch();
  const reduxState = useSelector((state: RootState) => state);

  // Optional snapshot hydration logic
  useEffect(() => {
    const hydrateStores = async () => {
      try {
        // Rehydrate state from snapshot system
        await hydrateSnapshot(stores.projectStore, "projectStore");
        await hydrateSnapshot(stores.cryptoStore, "cryptoStore");
      } catch (error) {
        console.error("[AppStoresProvider] Snapshot hydration failed:", error);
      }
    };

    hydrateStores();

    // Persist snapshots on state changes or interval
    const persistInterval = setInterval(() => {
      persistSnapshot(stores.projectStore, "projectStore");
      persistSnapshot(stores.cryptoStore, "cryptoStore");
    }, 10000); // every 10s

    return () => clearInterval(persistInterval);
  }, [stores, dispatch, reduxState]);

  return (
    <AppStoresContext.Provider value={stores}>
      {children}
    </AppStoresContext.Provider>
  );
};

/**
 * Custom hook for consuming app stores.
 * Throws a descriptive error if used outside the provider.
 */
export const useStores = (): AppStores => {
  const context = useContext(AppStoresContext);
  if (!context) {
    throw new Error("useStores must be used within an AppStoresProvider");
  }
  return context;
};



