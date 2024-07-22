import { BaseData } from "../models/data/Data";
import SnapshotStore from "../snapshots/SnapshotStore";

export function mapToSnapshotStore<T extends BaseData, K extends BaseData>(
    map: Map<string, T>
  ): Partial<SnapshotStore<T, K>> {
    return {
      data: new Map(Array.from(map.entries()).map(([key, value]) => [key, value]))
    };
  }
  