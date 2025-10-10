import SnapshotStore from '@/app/snapshots/SnapshotStore';

interface FetchedSnapshotStore<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export type { FetchedSnapshotStore };
