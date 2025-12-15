// hydrateSnapshot.ts

import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { StatusType } from "@/app/models/data/StatusType";
import { TagsRecord } from '@/app/models/tracker/Tag';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { AppMetadata } from '@/app/typings/metadataTypes';
import { Version } from "@/app/versions/Version";
import { ExtendedVersionData } from "@/app/versions/VersionData";
import { runInAction, toJS } from "mobx";


export interface SnapshotDataLocal<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Basic persistence metadata
  timestamp: number;
  state: Record<string, any>;

  // Version control
  version?: string | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versionInfo?: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  // Category and schema
  category?: Category;
  schema?: Record<string, SchemaField>;

  // Identifiers and ownership
  storeId?: string | number;
  snapshotId?: string | number | null;
  todoSnapshotId?: string;

  // Optional descriptive properties
  title?: string;
  description?: string;
  label?: string | Record<string, string> | null;

  // Lifecycle and enriched metadata
  status?: StatusType | undefined;
  enrichedProperties?: Record<string, any>;
  initialState?: Record<string, any>;

  // Timing and creation info
  createdBy?: string;
  lastUpdated?: Date | string | number;

  // Optional file/URL associations
  filePathOrUrl?: string;
  appPathWithVersion?: string;

  // App metadata (serializable parts only)
  appMetadata?: Partial<AppMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Tags and categories
  tags?: TagsRecord<T> | string[];
}


export interface HydratableStore {
  hydrate?: (state: Record<string, any>) => void;
  setState?: (state: Record<string, any>) => void;
  [key: string]: any;
}

const readSnapshotFromStorage = async (key: string): Promise<SnapshotData | null> => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`snapshot:${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`[hydrateSnapshot] Error reading snapshot for ${key}:`, error);
    return null;
  }
};

export const persistSnapshotLocal = async (store: any, key: string): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    const snapshot: SnapshotData = {
      timestamp: Date.now(),
      state: toJS(store),
      shared, operations, base, sharedMetadata,
      
    };
    localStorage.setItem(`snapshot:${key}`, JSON.stringify(snapshot));
  } catch (error) {
    console.error(`[persistSnapshotLocal] Failed to persist snapshot for ${key}:`, error);
  }
};

export const hydrateSnapshot = async <T extends HydratableStore>(
  store: T,
  key: string
): Promise<T> => {
  try {
    const snapshot = await readSnapshotFromStorage(key);
    if (!snapshot?.state) return store;

    runInAction(() => {
      if (typeof store.hydrate === "function") store.hydrate(snapshot.state);
      else if (typeof store.setState === "function") store.setState(snapshot.state);
      else Object.assign(store, snapshot.state);
    });

    console.log(`[hydrateSnapshot] Hydrated "${key}" (version: ${snapshot.version ?? "N/A"})`);
    return store;
  } catch (error) {
    console.error(`[hydrateSnapshot] Failed to hydrate "${key}":`, error);
    return store;
  }
};