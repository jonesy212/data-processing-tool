// versionUtils.ts
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { hasPriority } from '@/app/api/processSnapshotData';
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotData } from '@/app/components/snapshots';


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



const processSnapshotData = <T extends  BaseData<T>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    snapshotData: SnapshotData<T, K>
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
    hasVersion, processSnapshotData
};


    export type { DataWithPriority, DataWithTimestamp, DataWithVersion, SnapshotDataTypeVersion };

