// realTimePriceComparison.ts
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { RealtimeUpdateCallback } from '@/core/hooks/commHooks/useRealtimeData';
import useRealtimeDextData from '@/core/hooks/commHooks/useRealtimeDextData';
import useRealtimeExchangeData from '@/core/hooks/commHooks/useRealtimeExchangeData';
import { DEX } from '@/core/models/cypto/DEX';
import { Exchange } from '@/core/models/cypto/Exchange';
import DEXData from '@/core/models/data/DEXData';
import { ExchangeData } from '@/core/models/data/ExchangeData';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as snapshotApi from '@/core/api/SnapshotApi';
import { UpdateSnapshotPayload } from '@/core/interfaces/payload/payloadTypes';
import { DEXEnum, ExchangeEnum } from '@/core/models/cypto/exchangeIntegration';
import { BaseData } from '@/core/models/data/Data';
import { K, T } from '@/core/models/data/dataStoreMethods';
import { processExchangeData } from '@/core/models/data/fetchExchangeData';
import { StatusType } from "@/core/models/data/StatusType";
import createSnapshotOptions from '@/core/snapshots/createSnapshotOptions';
import { updateSnapshot } from '@/core/snapshots/snapshotHandlers';
import { AppEntity, AppK } from '@/core/typings/entities/AppEntity';
import { RealtimeDataAttachment, RealtimeDataEntity, RealtimeDataExcludedFields, RealtimeDataIncludedFields, RealtimeDataK, RealtimeDataMeta } from '@/core/typings/entities/RealtimeDataEntity';
import { RealtimeData, RealtimeDataItem } from '@/core/typings/realtimeTypes';
// Define the price comparison component or function
interface PriceComparisonProps {
  // Define your component props here
  key: string;
}

const RealTimePriceComparison: React.FC<PriceComparisonProps> = ({ key }) => {
  const dispatch = useDispatch();

  // Define an array of exchanges to fetch data from
  const exchanges: Exchange<AppEntity, AppK>[] = [
    // Define your list of exchanges here
  ];

  // Define an array of DEXs to fetch data from
  const dexs: DEX[] = [
    // Define your list of DEXs here
  ];

  // Define a custom update callback function to process fetched data
  const updateCallback: RealtimeUpdateCallback<RealtimeDataEntity, RealtimeDataK, RealtimeDataMeta, RealtimeDataAttachment, RealtimeDataExcludedFields, RealtimeDataIncludedFields> = async (
    id: string,
    data: SnapshotStore<RealtimeDataEntity, RealtimeDataK, RealtimeDataMeta, RealtimeDataAttachment, RealtimeDataExcludedFields, RealtimeDataIncludedFields>,
    events: Record<string, CalendarEvent<AppEntity, AppK>[]>,
    snapshotStore: SnapshotStore<RealtimeDataEntity, RealtimeDataK, RealtimeDataMeta, RealtimeDataAttachment, RealtimeDataExcludedFields, RealtimeDataIncludedFields>,
    dataItems: RealtimeData<RealtimeDataEntity, RealtimeDataK, RealtimeDataMeta, RealtimeDataAttachment, RealtimeDataExcludedFields, RealtimeDataIncludedFields>[]
  ) => {
    // Example: Log received data
    console.log("Received data:", data);

    // Example: Process events
    Object.keys(events).forEach((key) => {
      console.log(`Received events for ${key}:`, events[key]);
    });

    const snapshotId = snapshotStore.getSnapshotId(key);
    const storeId = snapshotApi.getSnaopshotStoreId(String(snapshotId));
    const snapshot = snapshotApi.getSnapshot(String(snapshotId), Number(storeId))
    const snapshotObj = await snapshotStore.getSnapshot(snapshot)
    if (snapshotObj === undefined){
      // No snapshot
      return "no snapshot object found"
    }

    if (snapshot === undefined) {
      return "no snapshot available"
    }

    


    // Wait for the snapshot to be available before accessing its data
    const createdSnapshot = (await createSnapshotOptions(snapshotObj, snapshot)).dataStoreMethods.data?.get(id.toString())

    const newData = createdSnapshot.data;

    // Example: Define payload as needed
    const payload: UpdateSnapshotPayload<BaseData> = {
      snapshotId: Promise.resolve(snapshotId),
      title: "Title",
      description: "Description",
      newData: newData as BaseData, // Provide the new data here
      createdAt: new Date(),
      updatedAt: new Date(),
      status: StatusType.Active,
      category: "Category",
      // Define payload properties here
    };

    // Example: Update snapshot store
    updateSnapshot(
      String(snapshotId), // Use the actual snapshotId instead of a string literal
      data,
      events,
      snapshotStore,
      dataItems as RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Assuming RealtimeData can be safely cast to RealtimeDataItem
      newData, // Ensure to provide newData here
      payload // Ensure to provide payload here
    );

    // Example: Process data items
    dataItems.forEach((item) => {
      console.log("Received data item:", item);
      // Additional processing logic for each data item
    });

    // Additional update logic as needed
  };
  const exchangeList: ExchangeEnum[] = [/* Populate with your exchange enums */];
  const dexList: DEXEnum[] =[/* Populate with your dex exchange enums */]
  // Fetch data from exchanges and DEXs using custom hooks
  useEffect(() => {
    // Fetch data from exchanges using the custom hook for exchange data
    const { fetchExchangeData } = useRealtimeExchangeData<ExchangeData<T, K>>(
      [], // Pass an empty initialData array
      updateCallback, // Pass the custom update callback
      processExchangeData,
      exchangeList
    );

    // Fetch data from DEXs using the custom hook for DEX data
    const { fetchDexData } = useRealtimeDextData<DEXData>(
      [], // Pass an empty initialData array
      updateCallback,
      processExchangeData,
      dexList
    );

    // Fetch data from exchanges and DEXs on component mount

    // Fetch data from exchanges and DEXs on component mount
    exchangeList.forEach((exchange) => fetchExchangeData(exchange, dispatch));
    dexList.forEach((exchange) => fetchDexData(exchange, dispatch));
  }, [dispatch, exchangeList, dexList]); // Ensure this useEffect hook depends on dispatch and exchangeList

  // Return null or any JSX elements if needed
  return null;
};

export default RealTimePriceComparison;
