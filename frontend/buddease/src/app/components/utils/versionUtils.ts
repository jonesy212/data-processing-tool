import { Data } from "../models/data/Data";

// versionUtils.ts
interface DataWithVersion {
  version?: string;
  priority?: string
    // other properties...
}

interface DataWithTimestamp {
    timestamp?: Date;
    // other properties...
}

type SnapshotDataTypeVersion<T> = T & DataWithVersion;

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

const processSnapshotData = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
    snapshotData: SnapshotData<T, Meta, K>
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
    hasPriority, hasVersion, processSnapshotData
};

    export type { DataWithPriority, DataWithTimestamp, DataWithVersion, SnapshotDataTypeVersion };
