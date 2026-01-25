// containerMethods.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import type { CriteriaType } from "@/core/pages/searches/CriteriaType";
import { SnapshotContainer, SnapshotData } from "@/core/snapshots/SnapshotData";
import SnapshotStore from "@/core/snapshots/SnapshotStore";

export const ContainerMethodsImplementation = {
  getSnapshotContainer: function<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    criteria?: CriteriaType,
    category?: Category,
    categoryProperties?: CategoryProperties,
    delegate?: any,
    snapshotData?: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.snapshotContainers?.get(snapshotId);
  },
  
  setSnapshotContainer: function<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string
  ): void {
    const containerId = snapshotId || container.id;
    if (!this.snapshotContainers) {
      this.snapshotContainers = new Map();
    }
    this.snapshotContainers.set(containerId, container);
  },
  
  // ... other container methods ...
};

// Then merge in your main implementation file
export const SnapshotMethodsImplementation = {
  ...ExistingSnapshotMethods,
  ...ContainerMethodsImplementation
};