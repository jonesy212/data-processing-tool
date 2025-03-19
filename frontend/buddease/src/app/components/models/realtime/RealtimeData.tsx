import { ExchangeActions } from "@/app/components/actions/ExchangeActions";
import useRealtimeData from "@/app/components/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import { fetchDEXData } from "@/app/components/models/data/fetchExchangeData";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { EventData } from "@/app/components/state/stores/AssignEventStore";
import { Attachment } from '@/app/components/documents/Attachment/attachment'
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { RealtimeUpdateCallback } from '@/app/components/hooks/commHooks/useRealtimeData';

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { SharedMetadata } from "@/app/configs/metadata/createMetadataState";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { AllTypes } from "../../typings/PropTypes";
import { BaseData } from "../data/Data";
import { T, K, Meta } from "@/app/components/models/data/dataStoreMethods";
import { ExcludedFields } from '@/app/components/routing/Fields';
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps"



interface BaseRealtimeData extends SharedIdentifiers {
  id: string | number | undefined; // Override id to ensure it's required
  name: string;
  value: string;
  type: string | AllTypes | undefined; // Align with BaseData's expectation
  date: Date; // Standardize to Date
  // Add other common properties shared by RealtimeDataItem and RealtimeData here
}

interface RealtimeDataItem extends BaseRealtimeData, EventData, SharedMetadata<K<T>> {
  title?: string;
  userId: string;
  dispatch: (action: any) => void;
  timestamp: Date; // Standardize to Date
  data?: InitializedData<RealtimeDataItem> | null,
  // Add other properties specific to RealtimeDataItem here
}

interface RealtimeData extends BaseRealtimeData {
  eventId: string;
  userId: string;
  dispatch: (action: any) => void;
  timestamp: Date; // Standardize to Date
  // Define other properties specific to RealtimeData here
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

