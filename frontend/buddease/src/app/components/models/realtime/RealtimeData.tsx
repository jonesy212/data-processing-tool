import { ExchangeActions } from "@/app/components/actions/ExchangeActions";
import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import { fetchDEXData } from "@/app/components/models/data/fetchExchangeData";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { EventData } from "@/app/components/state/stores/AssignEventStore";

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { Snapshot } from "@/app/components/snapshots";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/configs/BaseConfig";
import { SharedMetadata } from "@/app/configs/metadata/createMetadataState";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AllTypes } from "../../typings/PropTypes";


interface BaseRealtimeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields> {
  id: string | number; // Override id to ensure it's required (remove undefined)
  name: string;
  value?: string | number | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  type: string | AllTypes; // Remove null to align with BaseData's expectation
  date: Date; // Standardize to Date
  // Add other common properties shared by RealtimeDataItem and RealtimeData here
}

interface RealtimeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseRealtimeData<T, K, Meta, AttachmentType, ExcludedFields> {
  eventId: string;
  userId: string;
  dispatch: (action: any) => void;
  // Define other properties specific to RealtimeData here
}

interface RealtimeDataItem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends 
  BaseRealtimeData<T, K, Meta, AttachmentType, ExcludedFields>, 
  EventData, 
  SharedMetadata<T, K, Meta, AttachmentType> {
 
  title?: string;
  userId: string;
  dispatch: (action: any) => void;
  timestamp: Date;
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields> | null;
}

const processSnapshotStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    const typedSnapshotId = snapshotId as keyof SnapshotStore<T, K, Meta, AttachmentType>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(`Processing snapshot with ID ${String(typedSnapshotId)}:`, snapshotData);
  });
};


type ConcreteRealtimeDataItem = RealtimeDataItem<BaseDataEntity>;


const RealtimeDataComponent: React.FC<ConcreteRealtimeDataItem> = ({
  userId,
  date,
  dispatch,
  value,
  name,
  timestamp,
  title,
}) => {
  const initialData: ConcreteRealtimeDataItem[] = [];
  const { error, handleError, clearError } = useErrorHandling();

const updateCallback = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  id: string,
  events: Record<string, CalendarEvent<T, K, Meta, ExcludedFields>[]>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
  data?: InitializedData<T, K, Meta, ExcludedFields> | null,
): void => {
  const exchangeData: ExchangeData[] = [];
  const dexData: any[] = [];

  try {
    dispatch(ExchangeActions.fetchExchangeData(exchangeData));
    dispatch(fetchDEXData(dexData, dispatch));
    console.log("Snapshot store data:", data);

    dataItems.forEach((dataItem) => {
      console.log(`Updated data item with ID ${dataItem.id}:`, dataItem);
    });
    clearError();
  } catch (error: any) {
    handleError(error.message);
  }

  processSnapshotStore(snapshotStore);

  Object.keys(events).forEach((eventId: string) => {
    const calendarEvents = events[eventId];
    calendarEvents.forEach((event) => {
      console.log(`Updated event with ID ${eventId}:`, event);
    });
  });
};


  const { realtimeData, fetchData } = useRealtimeData<
    ConcreteRealtimeDataItem,
    ConcreteRealtimeDataItem
  >(initialData, updateCallback);

  const reduxDispatch = useDispatch();

  useEffect(() => {
    fetchData(userId, reduxDispatch as any);
  }, [userId, value, fetchData]);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      {realtimeData.map((dataItem, index) => (
        <div key={index}>
          <h3>{name}</h3>
          <p>User ID: {userId}</p>
          <p>Value: {value}</p>
          <p>Date: {date.toString()}</p>
          <p>Timestamp: {timestamp.toString()}</p>
          {title && <p>Title: {title}</p>}
          <p>{dataItem.id}</p>
          <p>{dataItem.value}</p>
        </div>
      ))}
    </div>
  );
};


export { RealtimeDataComponent };
export type { RealtimeData, RealtimeDataItem };

