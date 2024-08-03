import { Data } from "../models/data/Data";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";

// versionUtils.ts
interface DataWithVersion {
    version?: string;
    // other properties...
}

type SnapshotDataType<T> = T & DataWithVersion;

interface DataWithPriority {
    priority?: string;
    // other properties...
}

// Type guard to check if an object has the 'version' property
function hasVersion<T extends Partial<DataWithVersion>>(data: T): data is T & DataWithVersion {
    return (data as DataWithVersion).version !== undefined;
}

// Type guard to check if an object has the 'priority' property
function hasPriority<T extends Partial<DataWithPriority>>(data: T): data is T & DataWithPriority {
    return (data as DataWithPriority).priority !== undefined;
}

const processSnapshotData = <T extends Data, K extends Data>(
    snapshotData: Snapshot<T, K>
  ): void => {
    const dataWithPriority: Partial<DataWithPriority> = {
      priority: (snapshotData.data as T & { priority?: string })?.priority, // Use optional chaining and type assertion
    };
  
    if (hasPriority(dataWithPriority)) {
      // Proceed with your logic
      console.log('Data has priority:', dataWithPriority);
    } else {
      console.log('No priority data found.');
    }
  };
  
export {
    hasVersion,
    hasPriority,
    processSnapshotData
};

export type {SnapshotDataType, DataWithPriority, DataWithVersion}