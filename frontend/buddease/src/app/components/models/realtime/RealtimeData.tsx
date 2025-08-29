import { ExchangeActions } from "@/app/components/actions/ExchangeActions";
import useRealtimeData, { RealtimeUpdateCallback } from "@/app/components/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import { fetchDEXData } from "@/app/components/models/data/fetchExchangeData";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { EventData } from "@/app/components/state/stores/AssignEventStore";

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { K, Meta, T } from "@/app/components/models/data/dataStoreMethods";
import { Snapshot } from "@/app/components/snapshots";
import { SharedMetadata } from "@/app/configs/metadata/createMetadataState";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AllTypes } from "../../typings/PropTypes";
import { BaseData } from "../data/Data";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/configs/BaseConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";


interface BaseRealtimeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedIdentifiers<T, K, Meta, ExcludedFields> {
  id: string | number; // Override id to ensure it's required (remove undefined)
  name: string;
  value?: string | number | Snapshot<T, K, Meta, ExcludedFields> | null;
  type: string | AllTypes; // Remove null to align with BaseData's expectation
  date: Date; // Standardize to Date
  // Add other common properties shared by RealtimeDataItem and RealtimeData here
}

interface RealtimeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseRealtimeData<T, K, Meta, ExcludedFields> {
  eventId: string;
  userId: string;
  dispatch: (action: any) => void;
  // Define other properties specific to RealtimeData here
}

interface RealtimeDataItem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends 
  BaseRealtimeData<T, K, Meta, ExcludedFields>, 
  EventData, 
  SharedMetadata<T, K, ExcludedFields>
{
  title?: string;
  userId: string;
  dispatch: (action: any) => void;
  timestamp: Date;
  data?: InitializedData<RealtimeDataItem<T, K, Meta, ExcludedFields>> | null;
}

const processSnapshotStore = <T extends BaseData<any, any>, K extends T = T>(
  snapshotStore: SnapshotStore<T, K>
) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    // Perform actions based on each snapshotId
    // For example, you can access the snapshot data using snapshotStore[snapshotId]
    const typedSnapshotId = snapshotId as keyof SnapshotStore<T, K>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(
      `Processing snapshot with ID ${String(typedSnapshotId)}:`,
      snapshotData
    );

    // Add your custom logic here
  });
};


const RealtimeDataComponent: React.FC<RealtimeDataItem> = ({
  userId,
  date,
  dispatch,
  value,
  name,
  timestamp,
  title,
}: RealtimeDataItem) => {
  const initialData: RealtimeDataItem[] = [];
  const { error, handleError, clearError } = useErrorHandling();

  const updateCallback: RealtimeUpdateCallback<RealtimeDataItem, RealtimeDataItem> = (
    id: string,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<RealtimeDataItem, RealtimeDataItem>,
    dataItems: RealtimeDataItem[],
    data?: InitializedData<RealtimeDataItem> | null,
  ) => {
    const exchangeData: ExchangeData[] = [];
    const dexData: any[] = [];

    try {
      dispatch(ExchangeActions.fetchExchangeData(exchangeData));
      dispatch(fetchDEXData(dexData, dispatch));
      console.log("Snapshot store data:", data);

      dataItems.forEach((dataItem: RealtimeDataItem) => {
        console.log(`Updated data item with ID ${dataItem.id}:`, dataItem);
      });
      clearError();
    } catch (error: any) {
      handleError(error.message);
    }
    processSnapshotStore(snapshotStore);

    Object.keys(events).forEach((eventId: string) => {
      const calendarEvents = events[eventId];
      calendarEvents.forEach((event: CalendarEvent) => {
        console.log(`Updated event with ID ${eventId}:`, event);
      });
    });
  };

  const { realtimeData, fetchData } = useRealtimeData<RealtimeDataItem, RealtimeDataItem>(
    initialData,
    updateCallback
  );

  const reduxDispatch = useDispatch();

  useEffect(() => {
    fetchData(userId, reduxDispatch as any);
  }, [userId, value, fetchData]);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      {realtimeData.map((dataItem: RealtimeDataItem, index: number) => (
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

