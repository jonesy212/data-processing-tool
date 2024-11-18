import SnapshotStore from './SnapshotStore';
import { BaseData } from '../data/Data';

interface FetchedSnapshotStore<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    snapshotStore: SnapshotStore<T, K>;
}

export type { FetchedSnapshotStore };
