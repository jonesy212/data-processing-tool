// defaultSubscribeToSnapshots.ts
import { DefaultMeta, DefaultExcludedFields } from './BaseConfig';
import { BaseDataEntity } from '@/app/configs/BaseConfig';
import * as snapshotApi from '../../api/SnapshotApi';
import { BaseData } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { Snapshot } from "./Snapshot";
import { createMockSnapshot } from './snapshotOperations';


export const defaultSubscribeToSnapshots = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotId: string,
  callback: (snapshots: Snapshot<T, K, Meta, ExcludedFields>[]) => Subscriber<BaseData, T> | null,
  snapshot: Snapshot<T, K, Meta, ExcludedFields> | null = null
) => {
  return new Promise(async (resolve, reject) => { 
    try {
      console.warn('Default subscription to snapshots is being used.');
      console.log(`Subscribed to snapshot with ID: ${snapshotId}`);

      const snapshotStoreData = await snapshotApi.fetchSnapshotStoreData(snapshotId);
      
      // Use createMockSnapshot instead of repeating mock code
      setTimeout(() => {
        const mockSnapshot = createMockSnapshot<T, K, Meta, ExcludedFields>();
        const subscriber = callback([mockSnapshot]);
        resolve(subscriber);
      }, 100);
    } catch (error) {
      console.error('Error in defaultSubscribeToSnapshots:', error);
      reject(error);
    }
  });
};
  