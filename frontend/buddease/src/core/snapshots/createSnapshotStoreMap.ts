// createSnapshotStoreMap.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { createBaseDataEntity } from '@/core/config/createBaseDataEntity';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotStoreMap } from '@/core/snapshots/SnapshotMap';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import type { createSnapshotStoreConfig } from '@/core/snapshots/snapshotStoreConfigInstance';
import SnapshotStore from './SnapshotStore';

export function createSnapshotStoreMap<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotStoreMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const storeMap: SnapshotStoreMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = new Map();
  
  // You can pre-populate with default stores if needed
  const defaultEntity = createBaseDataEntity<T>();
  const defaultStore = createSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  
  storeMap.set(defaultEntity, [defaultEntity as K, defaultStore]);
  
  return storeMap;
}

// Helper function to create a SnapshotStore
export function createSnapshotStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    id: `store-${Date.now()}`,
    name: "Default Snapshot Store",
    description: "Automatically created snapshot store",
    createdAt: new Date(),
    updatedAt: new Date(),
    version: "1.0.0",
    config: createSnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
    snapshots: createSnapshotMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
    metadata: {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    
    // SnapshotStore methods
    addSnapshot: function(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      this.snapshots.set(snapshot.id, snapshot);
      this.updatedAt = new Date();
    },
    
    getSnapshot: function(id: string): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
      return this.snapshots.get(id);
    },
    
    removeSnapshot: function(id: string): boolean {
      const existed = this.snapshots.delete(id);
      if (existed) {
        this.updatedAt = new Date();
      }
      return existed;
    },
    
    getAllSnapshots: function(): Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      return new Map(this.snapshots);
    },
    
    clearSnapshots: function(): void {
      this.snapshots.clear();
      this.updatedAt = new Date();
    },
    
    getSnapshotCount: function(): number {
      return this.snapshots.size;
    },
    
    hasSnapshot: function(id: string): boolean {
      return this.snapshots.has(id);
    },
    
    updateConfig: function(newConfig: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
      this.config = { ...this.config, ...newConfig };
      this.updatedAt = new Date();
    },
    
    // Batch operations
    addSnapshots: function(snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void {
      snapshots.forEach(snapshot => {
        this.snapshots.set(snapshot.id, snapshot);
      });
      this.updatedAt = new Date();
    },
    
    // Search and filter
    findSnapshotsByCategory: function(category: string): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
      const results: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      for (const snapshot of this.snapshots.values()) {
        if (snapshot.category === category) {
          results.push(snapshot);
        }
      }
      return results;
    },
    
    // Metadata operations
    updateMetadata: function(newMetadata: Partial<Meta>): void {
      this.metadata = { ...this.metadata, ...newMetadata };
      this.updatedAt = new Date();
    }
  };
}