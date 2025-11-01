import { ExchangeActions } from "@/app/actions/ExchangeActions";
import useRealtimeData from "@/app/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { ExchangeData } from "@/app/models/data/ExchangeData";
import { fetchDEXData } from "@/app/models/data/fetchExchangeData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';

import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";


const processSnapshotStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = DefaultIncludedFields<T>
>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    const typedSnapshotId = snapshotId as keyof SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
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


export default RealtimeDataComponent 

