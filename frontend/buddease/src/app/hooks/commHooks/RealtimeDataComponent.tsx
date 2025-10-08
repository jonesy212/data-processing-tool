// RealtimeDataComponent.tsx
import { ExchangeActions } from "@/app/actions/ExchangeActions";
import { BaseData } from '@/app/models/data/Data';
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import useRealtimeData, { RealtimeUpdateCallback } from "@/app/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { fetchDEXData } from "@/app/models/data/fetchExchangeData";
import { RealtimeData, RealtimeDataItem } from "@/app/models/realtime/RealtimeData"; // Adjust path as needed
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import React, { useEffect } from "react";

interface RealtimeDataProps extends RealtimeDataItem  {
  userId: string;
  dispatch: (action: any) => void;
  value: string;
}

const processSnapshotStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    const typedSnapshotId = snapshotId as keyof SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(`Processing snapshot with ID ${String(typedSnapshotId)}:`, snapshotData);
  });
};

const RealtimeDataComponent: React.FC<RealtimeDataProps> = ({ userId, dispatch, value }) => {
  const initialData: RealtimeDataItem[] = [];
  const { error, handleError, clearError } = useErrorHandling();

  const updateCallback: RealtimeUpdateCallback<RealtimeData, K> = (
    data,
    events,
    snapshotStore,
    dataItems
  ) => {
    try {
      const exchangeData: ExchangeData[] = []; // Your logic to convert or fetch exchange data
      const dexData: any[] = []; // Your logic to convert or fetch DEX data

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

    Object.keys(events).forEach((eventId) => {
      const calendarEvents = events[eventId];
      calendarEvents.forEach((event) => {
        console.log(`Updated event with ID ${eventId}:`, event);
      });
    });
  };

  const { realtimeData, fetchData } = useRealtimeData(initialData, updateCallback);

  useEffect(() => {
    fetchData(userId, value);
  }, [userId, value, fetchData]);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      {realtimeData.map((dataItem: RealtimeDataItem, index: any) => (
        <div key={index}>
          <p>{dataItem.value}</p>
        </div>
      ))}
    </div>
  );
};

export default RealtimeDataComponent;
export type { processSnapshotStore, RealtimeDataProps };

