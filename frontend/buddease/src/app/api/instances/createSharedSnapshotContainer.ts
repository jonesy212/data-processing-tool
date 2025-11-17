// createSharedSnapshotContainer.ts

import  UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import SnapshotStore from '@/app/snapshots/Snapshot';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { VersionData } from '@/app/versions/Version';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedProperties } from '@/app/snapshots/SnapshotEvents';
import { BaseDataRoot, SharedConfig } from '@/app/config/BaseConfig';
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SharedAuditInfo, SharedVersioning, SharedUpdateHistory } from '@/app/versions/VersionData'
import { SharedRelationshipData, SharedPhaseData } from '@/app/models/data/Data'
import {SharedContent } from '@/app/versions/Version'

interface Shared<
  T extends BaseDataEntity = BaseDataRoot,
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
  T extends BaseDataEntity = BaseDataRoot,
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
export type { Shared }