// snapshotCreation.ts
// In snapshotOperations/snapshotCreation.ts
import { 
  createBasicSnapshot, 
  enhanceSnapshotWithMethods, 
  createCompleteSnapshot 
} from './createSnapshot';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Content } from '@/app/components/models/content/AddContent';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { UniqueIDGenerator } from '@/app/generators/GenerateUniqueIds';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';

import SnapshotStore from "@/app/snapshots/SnapshotStore";

import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/snaphots/Snapshot";
import { SnapshotStoreConfig } from "@/app/snapshotstoreConfig";

export const takeSnapshot = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  date: Date,
  projectType: ProjectType,
  projectId: string,
  projectState: ProjectStateEnum,
  projectMembers: Member[],
  // Optional: Pass through existing system dependencies
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  
  // Use your robust existing system
  return await createCompleteSnapshot(
    content.data, // baseData
    new Map([['projectInfo', { projectType, projectId, projectState, projectMembers }]]), // baseMeta with project context
    UniqueIDGenerator.generateSnapshotID(), // snapshotId
    projectType as Category, // category
    snapshotStore || null, // leverage existing store if provided
    snapshotManager || null, // leverage existing manager if provided
    null, // config
    false, // isSubscribed
    {
      storeId: projectId,
      name: `Project Snapshot - ${projectId}`,
      category: projectType as Category,
      initialState: content.data,
      // ... map other parameters as needed
    }
  );
};