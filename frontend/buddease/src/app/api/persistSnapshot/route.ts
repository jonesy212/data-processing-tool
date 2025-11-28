// route.ts
// app/state/snapshots/persistSnapshot.ts

import { runInAction, toJS } from 'mobx';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/BaseConfig';
import { SnapshotDataType } from '@/app/snapshots';

import { DatabaseConfig } from '@/app/config/DatabaseConfig';



/**
 * Generic interface for any store or object supporting MobX-like state hydration.
 */
export interface HydratableStore {
  hydrate?: (state: Record<string, any>) => void;
  setState?: (state: Record<string, any>) => void;
  [key: string]: any;
}

/**
 * Retrieve snapshot data from localStorage (or any persistence layer).
 */
export const readSnapshotFromStorage = async (key: string): Promise<SnapshotData | null> => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(`snapshot:${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`[hydrateSnapshot] Error reading snapshot for ${key}:`, error);
    return null;
  }
};

/**
 * Write updated snapshot data to localStorage.
 */
export const persistSnapshot = async (store: any, key: string): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    const snapshot: SnapshotData = {
      timestamp: Date.now(),
      state: toJS(store),
    };

    localStorage.setItem(`snapshot:${key}`, JSON.stringify(snapshot));
  } catch (error) {
    console.error(`[persistSnapshot] Failed to persist snapshot for ${key}:`, error);
  }
};

/**
 * Hydrate a MobX or plain JS store from snapshot storage.
 *
 * Supports:
 * - MobX stores with `.hydrate()` or `.setState()` methods.
 * - Plain objects with direct property assignment.
 * - Automatically skips if no snapshot or invalid structure.
 */
export const hydrateSnapshot = async <T extends HydratableStore>(
  store: T,
  key: string
): Promise<T> => {
  try {
    const snapshot = await readSnapshotFromStorage(key);
    if (!snapshot || !snapshot.state) {
      console.info(`[hydrateSnapshot] No snapshot found for ${key}`);
      return store;
    }

    runInAction(() => {
      if (typeof store.hydrate === "function") {
        store.hydrate(snapshot.state);
      } else if (typeof store.setState === "function") {
        store.setState(snapshot.state);
      } else {
        // fallback direct assignment
        Object.assign(store, snapshot.state);
      }
    });

    console.log(
      `[hydrateSnapshot] Successfully hydrated store "${key}" (version: ${
        snapshot.version ?? "N/A"
      })`
    );

    return store;
  } catch (error) {
    console.error(`[hydrateSnapshot] Failed to hydrate store "${key}":`, error);
    return store;
  }
};





// Unified persistSnapshot function to handle both types (Snapshot, SnapshotData) and database operations
async function persistSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: DatabaseConfig,
  snapshotId: string,
  operationType: "insert" | "upsert" = "upsert"
): Promise<void> {
  const dbClient = new DatabaseClient(config); // Initialize DatabaseClient with config

  // Step 1: Sanitize input
  const sanitizedData = sanitizeInput(snapshotData);

  try {
    // Step 2: Connect to the database
    await dbClient.connect();

    // Step 3: Choose operation based on operationType
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", sanitizedData); // Upsert data
    } else {
      await dbClient.insertData("snapshots", sanitizedData); // Insert data
    }

    // Step 4: Notify success
    notify("snapshotSaveSuccess", "Snapshot saved successfully", `Snapshot ID ${snapshotId} saved`, new Date(), "SUCCESS");
  } catch (error) {
    // Step 5: Handle errors and notify failure
    handleApiError(error, "persistSnapshot");
    notify("snapshotSaveError", "Error saving snapshot", `Failed to save Snapshot ID ${snapshotId}`, new Date(), "ERROR");
    throw error; // Re-throw to propagate error
  } finally {
    // Step 6: Close the database connection
    await dbClient.close();
  }
}


🧩 How It Works
1. Flexible Store Handling

Works seamlessly for:

MobX stores with hydrate() or setState()

Plain JS or Redux-compatible stores (via Object.assign)

2. Type Safety

HydratableStore interface enforces known methods.

Generic T ensures correct typing for returned hydrated store.

3. MobX-Safe Hydration

Uses runInAction() to batch updates within MobX’s reactive context, preventing redundant observer reactions.

4. Self-Contained Storage I/O

Reads and writes from localStorage by default.

You can later extend it to use IndexedDB or a hybrid cache (CacheManager) without modifying the hydration logic.

⚙️ Example Integration

In your AppStoresProvider:

import { hydrateSnapshot, persistSnapshot } from "@/app/state/snapshots/snapshotUtils";

useEffect(() => {
  const hydrate = async () => {
    await hydrateSnapshot(stores.projectStore, "projectStore");
    await hydrateSnapshot(stores.cryptoStore, "cryptoStore");
  };
  hydrate();

  const interval = setInterval(() => {
    persistSnapshot(stores.projectStore, "projectStore");
    persistSnapshot(stores.cryptoStore, "cryptoStore");
  }, 10000);

  return () => clearInterval(interval);
}, [stores]);

🧠 Optional Enhancements

Later, you can extend this to support:

type PersistenceStrategy = "localStorage" | "indexedDB" | "hybrid" | "remote";


and then dynamically route reads/writes depending on your CacheConfig.strategy.

Would you like me to show the IndexedDB + hybrid extension for this hydrateSnapshot (so it aligns with your CacheConfig.strategy: 'memory' | 'persistent' | 'hybrid')?