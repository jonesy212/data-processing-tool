// transformDataToSnapshot.ts
import { BaseData } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";


const transformDataToSnapshot = <T extends BaseData>(item: T): Snapshot<T> => {
  const snapshotItem: Snapshot<T> = {
    id: item.id ?? '', // Use nullish coalescing operator to provide default value
    data: new Map<string, T>().set(item.id?.toString() ?? '', item), // Use optional chaining and nullish coalescing
    initialState: null,
    timestamp: new Date(),
  };

  return snapshotItem;
};

export default transformDataToSnapshot;
