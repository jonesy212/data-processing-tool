
import { Data } from '../models/data/Data';
import { Snapshot, SnapshotsArray } from './LocalStorageSnapshotStore';
import { SnapshotConfig } from './SnapshotConfig';
import SnapshotStore from './SnapshotStore';

interface FetchedSnapshotStore<T extends Data, K extends Data> {
    snapshotStore: SnapshotStore<T, K>;
}

export type {FetchedSnapshotStore}