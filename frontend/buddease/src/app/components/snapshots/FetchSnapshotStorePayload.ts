import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from '../data/Data';
import SnapshotStore from './SnapshotStore';

interface FetchedSnapshotStore<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    snapshotStore: SnapshotStore<T, K>;
}

export type { FetchedSnapshotStore };
