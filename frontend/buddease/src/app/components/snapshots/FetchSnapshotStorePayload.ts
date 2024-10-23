
import { Data } from '../models/data/Data';
import SnapshotStore from './SnapshotStore';

interface FetchedSnapshotStore<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
    snapshotStore: SnapshotStore<T, Meta, K>;
}

export type { FetchedSnapshotStore };
