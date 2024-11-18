import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import SnapshotStore from "../snapshots/SnapshotStore";
import { Snapshot } from "./../snapshots/LocalStorageSnapshotStore";
import { BaseData } from '../data/Data';


export function mapToSnapshotStore <T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  map: Map<string, Snapshot<T, K> | null>
): Partial<SnapshotStore<T, K>> {
  // Filter out undefined values and map entries to a new Map
  if (map === null) {
    return {
      data: null
    };
  }

  // Check if `map` is a Map
  if (map instanceof Map) {
    // Filter out undefined values and map entries to a new Map
    const filteredEntries: [string, Snapshot<T, K>][] = Array.from(map.entries())
      .filter((entry): entry is [string, Snapshot<T, K>] => entry[1] !== null);

    return {
      data: new Map(filteredEntries)
    };
  } 

  // If `map` is not a Map, assume it's of type `T`
  return {
    data: map
  };
}