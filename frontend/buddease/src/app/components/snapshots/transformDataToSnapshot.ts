// transformDataToSnapshot.ts
import { BaseData } from "../models/data/Data";
import { CoreSnapshot, Snapshot } from "./LocalStorageSnapshotStore";


const transformDataToSnapshot = <T extends BaseData, K extends BaseData>(
  item: CoreSnapshot<T, K>
): Snapshot<T, K> => {
  const snapshotItem: Snapshot<T, K> = {
    id: item.id?.toString() ?? '', // Use nullish coalescing operator to provide default value
    data: new Map<string, T>().set(item.id?.toString() ?? '', item.data as T), // Ensure correct type
    initialState: item.initialState as Snapshot<T, K> | null, // Ensure correct type
    timestamp: item.timestamp ? new Date(item.timestamp) : new Date(), // Handle timestamp appropriately
    events: {
      eventRecords: item.events?.eventRecords ?? {},
      callbacks: item.events?.callbacks ?? ((snapshot: Snapshot<T, K>) => {
        // Your default callback logic here
      }),
    },
    meta: item.meta,
  };

  return snapshotItem;
};

export default transformDataToSnapshot;
