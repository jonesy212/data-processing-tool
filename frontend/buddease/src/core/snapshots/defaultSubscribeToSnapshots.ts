// defaultSubscribeToSnapshots.ts
import * as snapshotApi from '@/core/api/SnapshotApi';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { BaseData } from '@/core/models/data/Data';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { createMockSnapshot } from '@/core/snapshots/snapshotOperations';
import { Subscriber } from "@/core/subscribers/Subscriber";


export const defaultSubscribeToSnapshots = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Subscriber<BaseData, T> | null,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null
) => {
  return new Promise(async (resolve, reject) => { 
    try {
      console.warn('Default subscription to snapshots is being used.');
      console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

      const snapshotStoreData = await snapshotApi.fetchSnapshotStoreData(snapshotId);
      
      // Use createMockSnapshot instead of repeating mock code
      setTimeout(() => {
        const mockSnapshot = createMockSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
        const subscriber = callback([mockSnapshot]);
        resolve(subscriber);
      }, 100);
    } catch (error) {
      console.error('Error in defaultSubscribeToSnapshots:', error);
      reject(error);
    }
  });
};
  