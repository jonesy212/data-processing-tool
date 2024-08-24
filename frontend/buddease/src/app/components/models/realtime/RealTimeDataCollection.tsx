import React, { useEffect, useState } from 'react';
import { Exchange } from "@/app/components/crypto/Exchange";
import { DEXEnum, ExchangeDataTypeEnum, ExchangeEnum } from "@/app/components/crypto/exchangeIntegration";
import useRealtimeDextData from "@/app/components/hooks/commHooks/useRealtimeDextData";
import useRealtimeExchangeData from "@/app/components/hooks/commHooks/useRealtimeExchangeData";
import { Data } from "@/app/components/models/data/Data";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { useDispatch } from "react-redux";
import { RealtimeUpdateCallback } from "../../hooks/commHooks/useUIRealtimeData";
import { RealtimeData, RealtimeDataItem } from "./RealtimeData";
import { DEX } from "../../crypto/DEX";
import { CalendarEvent } from '../../state/stores/CalendarEvent';
import SnapshotList, { SnapshotItem } from '@/app/components/snapshots/SnapshotList';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Snapshot } from '../../snapshots/LocalStorageSnapshotStore';

const RealTimeDataCollection: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const [dexList, setDexList] = useState<DEX[]>([]);
  const [exchangeList, setExchangeList] = useState<Exchange[]>([]);
  const [snapshotList] = useState<SnapshotList<Data, Data>>(new SnapshotList<Data, Data>());

  // Custom update callback function to process fetched data
  const updateCallback: RealtimeUpdateCallback<RealtimeData> = async (
    data: SnapshotStore<RealtimeData, K>,
    events: Record<string, CalendarEvent<>[]>,
    snapshotStore: SnapshotStore<RealtimeData>,
    dataItems: RealtimeData[]
  ): Promise<void> => {
    try {
      // Example conversion of RealtimeData to RealtimeDataItem
      const convertedDataItems: RealtimeDataItem[] = dataItems.map(
        (realtimeData: RealtimeData) => ({
          id: realtimeData.id,
          date: new Date(),
          userId: "user123",
          dispatch: (action: any) => {},
          value: realtimeData.value,
          name: realtimeData.name,
          eventId: realtimeData.eventId,
          timestamp: new Date(realtimeData.timestamp!),
          type: realtimeData.type,
        })
      );

      // Example processing of events
      Object.keys(events).forEach((eventId: string) => {
        const calendarEvents = events[eventId];
        calendarEvents.forEach((event: CalendarEvent) => {
          console.log(`Updated event with ID ${eventId}:`, event);
        });
      });

      // Process and add data items to snapshot list
      convertedDataItems.forEach((item) => {
        const snapshotItem: SnapshotItem<Data, Data> = {
          message: item,
          data: item.value,
          user: item.userId,
          id: UniqueIDGenerator.generateSnapshoItemID(item.id),
          value: snapshotStore.get(item.id),
          label: item.name,
          category: item.type,
          timestamp: item.timestamp,
          updatedAt: new Date()
        };
        snapshotList.addSnapshot(snapshotItem);
      });

      console.log("Update callback completed successfully.");
    } catch (error) {
      console.error("Error in updateCallback:", error);
      throw error;
    }
  };

  // Fetch data hooks
  useRealtimeDextData(initialData, updateCallback, (dexData: any[]) => {
    console.log("DEX Data processed:", dexData);
    return dexData;
  }, [DEXEnum.SUSHISWAP, DEXEnum.PANCAKESWAP, DEXEnum.UNISWAP]);

  useRealtimeExchangeData(initialData, updateCallback, (exchangeData: any[]) => {
    console.log("Exchange Data processed:", exchangeData);
    return exchangeData;
  }, [ExchangeEnum.COINBASE_PRO, ExchangeEnum.KRAKEN, ExchangeEnum.BITFINEX]);

  useEffect(() => {
    // Fetch DEX list
    const fetchedDexList: DEX[] = [
      { name: "Uniswap", apiUrl: "https://api.uniswap.org" },
      // Add other DEXs similarly
    ];
    setDexList(fetchedDexList);
    console.log("DEXs fetched:", fetchedDexList);

    // Fetch exchange list
    const fetchedExchangeList: Exchange[] = [
      {
        name: "Coinbase Pro",
        apiUrl: "https://api.pro.coinbase.com",
        id: "",
        pair: "",
        price: 0,
        volume: 0,
        type: ExchangeDataTypeEnum.TRADES,
        data: undefined,
        liquidity: 0,
        tokens: [],
        createdAt: undefined,
        updatedAt: undefined
      },
      // Add other exchanges similarly
    ];
    setExchangeList(fetchedExchangeList);
    console.log("Exchanges fetched:", fetchedExchangeList);
  }, []);

  // Example function to convert SnapshotStore to desired data type
  const convertSnapshotToDataType = <T extends unknown>(
    snapshotStore: SnapshotStore<RealtimeData> | null | undefined
  ): T[] => {
    // Implement conversion logic
    return [] as T[];
  };

  // Render the component
  return (
    <div>
      {/* Render your component JSX here */}
      <h2>DEX List</h2>
      <ul>
        {dexList.map((dex) => (
          <li key={dex.apiUrl}>{dex.name}</li>
        ))}
      </ul>
      <h2>Exchange List</h2>
      <ul>
        {exchangeList.map((exchange) => (
          <li key={exchange.apiUrl}>{exchange.name}</li>
        ))}
      </ul>
      <h2>Snapshot List</h2>
      <ul>
        {snapshotList.toArray().map((snapshot) => (
          <li key={snapshot.id}>{snapshot.label}</li>
        ))}
      </ul>
    </div>
  );
};

export default RealTimeDataCollection;
