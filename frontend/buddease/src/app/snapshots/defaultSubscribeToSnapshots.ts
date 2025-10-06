// defaultSubscribeToSnapshots.ts
import * as snapshotApi from '@/app/api/SnapshotApi';
import { BaseData } from '@/app/models/data/Data';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { createMockSnapshot } from '@/snapshotOperations';
import { Snapshot } from "./Snapshot";


export const defaultSubscribeToSnapshots = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
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
  