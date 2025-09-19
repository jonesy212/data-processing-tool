// SnapshotStoreReference.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { SnapshotStore } from './SnapshotStore';


// Define a more abstract interface to represent snapshot stores
interface SnapshotStoreReference<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotStore<T, K, Meta>{
  // Add the specific methods you need here for snapshot store references
}


export type { SnapshotStoreReference }