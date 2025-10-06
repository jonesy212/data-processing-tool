import SnapshotStore from '@/SnapshotStore';

interface FetchedSnapshotStore<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>;
}

export type { FetchedSnapshotStore };
