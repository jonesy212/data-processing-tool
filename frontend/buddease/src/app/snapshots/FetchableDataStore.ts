// FetchableDataStore.ts
import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { Snapshot } from "@/app/snapshots";
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { SubscriberCollection } from '@/app/users/SubscriberCollection';
import { BaseDataEntity } from "@/config/BaseConfig";


interface FetchableDataStore<
  T extends BaseDataEntity, 
  K extends T = T
> {
  getData(): Promise<DataStore<T, K, Meta, ExcludedFields>[]>;
}

const initializeData = ():  BaseDataEntity => {
  return {
    id: "initial-id",
    name: "Initial Name",
    value: "Initial Value",
    timestamp: new Date(),
    category: "Initial Category",
  };
};




// Ensure you're checking the correct type and calling the `trigger` method
function handleSnapshotEvent<T extends BaseDataEntity, K extends T = T>(
  coreSnapshot: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  eventDate: Date,
  snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
  subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
  snapshotId?: string | number | null,
): void {
  if (!coreSnapshot.events) {
    console.warn("No events configured");
    return;
  }

  const { events } = coreSnapshot;
  
  if (typeof events.trigger === "function") {
    events.trigger(
      events.event, // Use the event string from the events object
      snapshot,
      new Date(),
      String(snapshotId),
      subscribers,
      type,
      snapshotData
    );
  } else {
    console.warn("Trigger function not found on events");
  }
}


