// createSharedSnapshotContainer.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta, SharedConfig } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import type { SharedPhaseData, SharedRelationshipData } from '@/core/models/data/Data';
import SnapshotStore from '@/core/snapshots/Snapshot';
import { SnapshotContainer } from '@/core/snapshots/SnapshotContainer';
import { SharedProperties } from '@/core/snapshots/SnapshotEvents';
import { SharedContent } from '@/core/versions/VersionData';

interface Shared<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  config?: SharedConfig;
  content?: SharedContent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  properties?: SharedProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  audit?: SharedAuditInfo;
  versioning?: SharedVersioning;
  updateHistory?: SharedUpdateHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  relationshipData?: SharedRelationshipData<K>;
  phaseData?: SharedPhaseData;
}




export function createSharedSnapshotContainer<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & Shared<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  const snapshotManager = new SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

  const container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & Shared<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: UniqueIDGenerator.generateID('shared', 'snapshotContainer'),
    storeId: 0,
    snapshot: {} as any, // empty initially, can be set later
    store: {} as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    manager: snapshotManager,
    config: undefined,
    initialized: false,
    getSnapshot: () => container.snapshot,
    getConfig: () => container.config,
    updateSnapshot: (updatedData: Partial<T>) => {
      container.snapshot.data = { ...container.snapshot.data, ...updatedData };
      return container.snapshot;
    },
    // Shared fields
    config: undefined,
    content: undefined,
    properties: undefined,
    audit: undefined,
    versioning: undefined,
    updateHistory: undefined,
    relationshipData: undefined,
    phaseData: undefined,
  };

  return container;
}

export const snapshotContainerInstance = createSharedSnapshotContainer();
export type { Shared };
