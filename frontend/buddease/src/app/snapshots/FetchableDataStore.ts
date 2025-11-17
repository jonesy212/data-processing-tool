import { Attachment } from '@/app/documents/attachment/Attachment';
import { DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
// FetchableDataStore.ts
import { BaseDataEntity } from '@/app/config/BaseConfig';
import { CoreSnapshot } from "@/app/snapshots/CoreSnapshot";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { DataStore } from '@/app/state/stores/DataStore';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';


interface FetchableDataStore<
  T extends BaseDataEntity, 
  K extends T = T
> {
  getData(): Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
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
export function handleSnapshotEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  coreSnapshot: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  eventDate: Date,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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


