// AppContext.tsx
app/state/context/AppContext.tsx
import { hydrateSnapshot, persistSnapshot } from '@/core/state/hydrateSnapshot'; // <- add your snapshot helpers
import type { RootState } from '@/core/state/redux/slices/RootSlice';
import { CryptoStore } from '@/core/state/stores/CryptoStore';
import { PhaseStore } from '@/core/state/stores/PhaseStore';
import { ProjectStore } from '@/core/state/stores/ProjectStore';
import { TaskManagerStore } from '@/core/state/stores/TaskStore';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';


type PersistenceStrategy = "localStorage" | "indexedDB" | "hybrid" | "remote";

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
  taskStore: TaskManagerStore;  // Fixed: Changed from TaskStore to TaskManagerStore
  phaseStore: PhaseStore;
  cryptoStore: CryptoStore;
}

// Define initial value for stores
const initialValue: AppStores = {
  projectStore: null as any,
  taskStore: null as any,
  phaseStore: null as any,
  cryptoStore: null as any
};

/**
 * Lazy-initialize stores so they are instantiated only once.
 * Using `useRef` prevents re-instantiation on React re-renders.
 */
const useInitializeStores = (): AppStores => {
  const storesRef = useRef<AppStores>(initialValue);

  // Initialize only once
  if (!storesRef.current.projectStore) {
    const taskStore = new TaskManagerStore();
    const phaseStore = new PhaseStore();
    const projectStore = new ProjectStore(taskStore, phaseStore);
    const cryptoStore = new CryptoStore();

    storesRef.current = { 
      projectStore, 
      taskStore, 
      phaseStore, 
      cryptoStore 
    };
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
        console.log('[AppStoresProvider] Hydrating stores from snapshots...');
        
        // Rehydrate state from snapshot system
        await hydrateSnapshot(stores.projectStore, "projectStore");
        await hydrateSnapshot(stores.cryptoStore, "cryptoStore");
        await hydrateSnapshot(stores.taskStore, "taskStore");
        await hydrateSnapshot(stores.phaseStore, "phaseStore");
        
        console.log('[AppStoresProvider] Stores hydrated successfully');
      } catch (error) {
        console.error("[AppStoresProvider] Snapshot hydration failed:", error);
      }
    };

    hydrateStores();

    // Persist snapshots on state changes or interval
    const persistInterval = setInterval(() => {
      try {
        persistSnapshot(stores.projectStore, "projectStore");
        persistSnapshot(stores.cryptoStore, "cryptoStore");
        persistSnapshot(stores.taskStore, "taskStore");
        persistSnapshot(stores.phaseStore, "phaseStore");
      } catch (error) {
        console.error('[AppStoresProvider] Error persisting snapshots:', error);
      }
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

/**
 * Individual store hooks for convenience
 */
export const useProjectStore = (): ProjectStore => {
  const stores = useStores();
  return stores.projectStore;
};

export const useTaskStore = (): TaskManagerStore => {
  const stores = useStores();
  return stores.taskStore;
};

export const usePhaseStore = (): PhaseStore => {
  const stores = useStores();
  return stores.phaseStore;
};

export const useCryptoStore = (): CryptoStore => {
  const stores = useStores();
  return stores.cryptoStore;
};