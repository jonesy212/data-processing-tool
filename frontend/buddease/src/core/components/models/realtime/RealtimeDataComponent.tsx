// RealtimeDataComponent.tsx
import { ExchangeActions } from "@/core/actions/ExchangeActions";
import { CalendarEvent } from "@/core/calendar/CalendarEvent";
import { BaseDataEntity, DefaultMeta } from "@/core/config/BaseConfig";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { processSnapshotStore } from "@/core/hooks/commHooks/processSnapshotStore";
import useRealtimeData from "@/core/hooks/commHooks/useRealtimeData";
import { useErrorHandling } from "@/core/hooks/useErrorHandling";
import { Data } from "@/core/models/data/Data";
import { ExchangeData } from "@/core/models/data/ExchangeData";
import { fetchDEXData } from "@/core/models/data/fetchExchangeData";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

/** Safely render any value */
const renderValue = (v: unknown): React.ReactNode => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
};

interface RealtimeDataProps {
  id: string;
  name: string;
  date?: Date;
  userId: string;
  value?: string | number;
}

/** Define the exact generic type for the realtime hook */
type ConcreteRealtimeItem = RealtimeDataItem<
  BaseDataEntity,
  BaseDataEntity,
  DefaultMeta<BaseDataEntity, BaseDataEntity>,
  Attachment,
  never,
  keyof BaseDataEntity
>;

const RealtimeDataComponent: React.FC<RealtimeDataProps> = ({ id, name, date, userId, value }) => {
  const { error, handleError, clearError } = useErrorHandling();
  const dispatch = useDispatch();

  /** Initial empty array with correct type */
  const initialData: ConcreteRealtimeItem[] = [];

  /** Callback for realtime updates */
  const updateCallback = (
    _id: string,
    events: Record<string, CalendarEvent<any, any, any, any, any, any>[]>,
    snapshotStore: SnapshotStore<any, any, any, any, any, any>,
    dataItems: ConcreteRealtimeItem[],
    data?: Data<any, any, any, any, any, any> | null
  ) => {
    try {
      const exchangeData: ExchangeData[] = [];
      const dexData: any[] = [];
      dispatch(ExchangeActions.fetchExchangeData(exchangeData));
      dispatch(fetchDEXData(dexData, dispatch));

      dataItems.forEach((item) => console.log(`Realtime update: ID=${item.id}`, item));
      processSnapshotStore(snapshotStore);

      Object.entries(events).forEach(([eventId, calendarEvents]) =>
        calendarEvents.forEach((event) => console.log(`Calendar Event ID=${eventId}:`, event))
      );

      clearError();
    } catch (err: any) {
      handleError(err.message || "Unknown error in updateCallback");
    }
  };

  /** Use the custom hook */
  const { realtimeData, fetchData } = useRealtimeData<ConcreteRealtimeItem, ConcreteRealtimeItem>(
    initialData,
    updateCallback
  );

  /** Fetch initial data and set interval */
  useEffect(() => {
    fetchData(userId, dispatch as any);
    const intervalId = setInterval(() => fetchData(userId, dispatch as any), 5000);
    return () => clearInterval(intervalId);
  }, [userId, dispatch, fetchData]);

  return (
    <div>
      <h3>{name}</h3>
      <p>ID: {id}</p>
      <p>User ID: {userId}</p>
      <p>Date: {date?.toLocaleString() ?? "-"}</p>
      <p>Value: {renderValue(value)}</p>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {realtimeData.map((dataItem, index) => (
        <div
          key={index}
          style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}
        >
          <p>Data ID: {dataItem.id}</p>
          <p>Realtime Value: {renderValue(dataItem.value)}</p>
        </div>
      ))}
    </div>
  );
};

export default RealtimeDataComponent;
