// versionUtils.ts
import { hasPriority } from '@/app/api/processSnapshotData';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot, SnapshotData } from '@/app/snapshots/SnapshotData';
import { useDataStore } from '@/app/state/stores/DataStore';

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



const processSnapshotData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T

>(
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  versionedData?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> // Optional versioned data
): void => {
  const dataWithPriority: Partial<DataWithPriority> = {
    priority: (snapshotData.data as T & { priority?: string })?.priority, // Use optional chaining and type assertion
  };

  if (hasPriority(dataWithPriority)) {
    // Proceed with your logic for the snapshot data
    console.log('Data has priority:', dataWithPriority);
  } else {
    console.log('No priority data found.');
  }

  if (versionedData) {
    // You can process the versioned data here as well
    console.log('Processing versioned data:', useDataStore().convertSnapshotToData(versionedData));
  }
};


export { hasVersion, processSnapshotData };


    export type { DataWithPriority, DataWithTimestamp, DataWithVersion, SnapshotDataTypeVersion };

