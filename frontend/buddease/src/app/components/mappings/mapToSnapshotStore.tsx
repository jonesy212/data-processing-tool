import { BaseData } from "../models/data/Data";
import SnapshotStore from "../snapshots/SnapshotStore";
import { Snapshot } from "./../snapshots/LocalStorageSnapshotStore";


export function mapToSnapshotStore<T extends BaseData, K extends BaseData>(
  map: Map<string, Snapshot<any, any> | undefined>
): Partial<SnapshotStore<T, K>> {
  // Filter out undefined values and map entries to a new Map
  const filteredEntries: [string, Snapshot<any, any>][] = Array.from(map.entries())
    .filter((entry): entry is [string, Snapshot<any, any>] => entry[1] !== undefined);
  return {
    data: new Map(filteredEntries)
  };
}