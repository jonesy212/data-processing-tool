// FilterMethods.ts

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { StatusType } from '@/app/models/data/StatusType';
import { Tag } from '@/app/models/tracker/Tag';
import { Snapshots, SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotItem } from '@/app/snapshots/SnapshotList';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';

export const FilterMethods = {
  getSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: string,
    data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    this.executeDelegateMethod?.('getSnapshots', category, data);
  },

  findSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.executeDelegateMethod?.('findSnapshot', predicate);
  },

  filterSnapshotsByStatus: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    status: StatusType
  ): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.executeDelegateMethod?.('filterSnapshotsByStatus', status) || [];
  },

  filterSnapshotsByCategory: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category
  ): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.executeDelegateMethod?.('filterSnapshotsByCategory', category) || [];
  },

  filterSnapshotsByTag: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    tag: Tag<T>
  ): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.executeDelegateMethod?.('filterSnapshotsByTag', tag) || [];
  },

  getSnapshotItems: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId?: string,
    category?: Category,
    callback?: (items: SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void
  ): (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>)[] | undefined {
    return this.executeDelegateMethod?.('getSnapshotItems', snapshots, snapshotId, category, callback);
  },

  getSnapshotListByCriteria: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return this.executeDelegateMethod?.('getSnapshotListByCriteria', criteria) || Promise.resolve([]);
  },

  getSnapshotCategory: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string
  ): Category | undefined {
    return this.executeDelegateMethod?.('getSnapshotCategory', id);
  }
};