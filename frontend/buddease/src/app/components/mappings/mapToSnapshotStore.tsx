import { BaseData } from "../models/data/Data";
import SnapshotStore from "../snapshots/SnapshotStore";
import { Snapshot } from "./../snapshots/LocalStorageSnapshotStore";

export function mapToSnapshotStore<T extends BaseData, K extends BaseData>(
    map: Map<string, Snapshot<any, any>>
  ): Partial<SnapshotStore<T, K>> {
    return {
      data: new Map(Array.from(map.entries()).map(([key, value]) => [key, value]))
    };
  }
  