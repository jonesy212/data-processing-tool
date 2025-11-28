// RealTimeDataCollection.tsx
import {
    BaseDataEntity
} from "@/app/a_analysis/frontend/buddease/src/app/configs/BaseConfig";
import { CalendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { DEX } from "@/app/crypto/DEX";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import useRealtimeDextData from "@/app/hooks/commHooks/useRealtimeDextData";
import useRealtimeExchangeData from "@/app/hooks/commHooks/useRealtimeExchangeData";
import { RealtimeUpdateCallback } from "@/app/hooks/commHooks/useUIRealtimeData";
import { Exchange } from "@/app/models/cypto/Exchange";
import { DEXEnum, ExchangeDataTypeEnum, ExchangeEnum } from "@/app/models/cypto/exchangeIntegration";
import { Data } from '@/app/models/data/Data';
import SnapshotList, { SnapshotItem } from '@/app/snapshots/SnapshotList';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import React, { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import { RealtimeData, RealtimeDataItem } from "./RealtimeData";



// --- Type aliases to keep things readable
type AnyData = Data<BaseDataEntity, BaseDataEntity>;
type AnyRealtime = RealtimeData<BaseDataEntity, BaseDataEntity>;
type AnyRealtimeItem = RealtimeDataItem<BaseDataEntity, BaseDataEntity>;
type AnyCalendarEvent = CalendarEvent<BaseDataEntity, BaseDataEntity>;


const RealTimeDataCollection: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const [dexList, setDexList] = useState<DEX[]>([]);
  const [exchangeList, setExchangeList] = useState<Exchange[]>([]);
  // SnapshotList typed to hold AnyData
  const [snapshotList] = useState<
    SnapshotList<AnyData, AnyData>
  >(new SnapshotList<AnyData, AnyData>());


  // --- updateCallback now matches the RealtimeUpdateCallback signature:
  // (id, events, snapshotStore, dataItems, data?)
  const updateCallback: RealtimeUpdateCallback<AnyRealtime> = async (
    id: string,
    events: Record<string, AnyCalendarEvent[]>,
    snapshotStore: SnapshotStore<AnyRealtime, AnyRealtime>,
    dataItems: AnyRealtimeItem[],
    data?: Data<T>  // optional InitializedData<...> if your type includes it
  ): Promise<void> => {
    try {
      // Convert RealtimeData (or RealtimeDataItem -> label/value) into UI items
      const convertedDataItems: AnyRealtimeItem[] = dataItems.map((realtimeData) => ({
        id: realtimeData.id,
        date: realtimeData.date ?? new Date(),
        userId: (realtimeData as any).userId ?? "user123",
        dispatch: (action: any) => {},
        value: realtimeData.value,
        name: realtimeData.name,
        eventId: (realtimeData as any).eventId ?? "",
        timestamp: realtimeData.timestamp ? new Date(realtimeData.timestamp) : new Date(),
        type: realtimeData.type as any,
        blockNumber: realtimeData.blockNumber,
        transactionHash: realtimeData.transactionHash,
        event: realtimeData.event,
        signature: realtimeData.signature,
       
      }));

      // Process events (calendar)
      Object.keys(events).forEach((eventId: string) => {
        const calendarEvents = events[eventId];
        calendarEvents.forEach((event: AnyCalendarEvent) => {
          console.log(`Updated event with ID ${eventId}:`, event);
        });
      });

      // Add converted items to snapshotList
      convertedDataItems.forEach((item) => {
        const snapshotItem: SnapshotItem<AnyData, AnyData> = {
          message: (type, content, additionalData, userId, sender, channel) => ({
            id: UniqueIDGenerator.generateID("msg", "system", NotificationTypeEnum.MESSAGE_ID),
            sender,
            senderId: sender?.id,
            channel,
            channelId: channel?.id,
            content,
            additionalData,
            tags: [],
            userId,
            timestamp: new Date(),
            text: content,
            isUserMessage: true,
            receiver: undefined,
            isOnline: false,
            lastSeen: new Date(),
            description: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            imageUrl: "",
            bio: null,
            website: "",
            location: "",
            coverImageUrl: "",
            following: [],
            followers: [],
            chatRooms: [],
            blockedUsers: [],
            blockedBy: [],
            username: "system",
            email: "system@example.com",
            tier: "basic",
            uploadQuota: 0,
          }),
          data: item.value as any,
          user: item.useer,
          id: UniqueIDGenerator.generateSnapshoItemID(String(item.id)),
          value: snapshotStore.getFindSnapshotStoreById(item.id as any),
          label: item.label,
          category: item.type as any,
          timestamp: item.timestamp,
          updatedAt: new Date(),
        };
        snapshotList.addSnapshot(snapshotItem);
      });

      console.log("Update callback completed successfully.");
    } catch (error) {
      console.error("Error in updateCallback:", error);
      throw error;
    }
  };

  // --- Hook integrations (use your existing hooks)
  useRealtimeDextData(
    /* initialData */ [],
    updateCallback,
    (dexData: any[]) => {
      console.log("DEX Data processed:", dexData);
      return dexData;
    },
    [DEXEnum.SUSHISWAP, DEXEnum.PANCAKESWAP, DEXEnum.UNISWAP]
  );

  useRealtimeExchangeData(
    /* initialData */ [],
    updateCallback,
    (exchangeData: any[]) => {
      console.log("Exchange Data processed:", exchangeData);
      return exchangeData;
    },
    [ExchangeEnum.COINBASE_PRO, ExchangeEnum.KRAKEN, ExchangeEnum.BITFINEX],
    dispatch
  );

  useEffect(() => {
    // Fetch DEX list (example)
    const fetchedDexList: DEX[] = [{ name: "Uniswap", apiUrl: "https://api.uniswap.org" }];
    setDexList(fetchedDexList);

    // Fetch exchange list (example)
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
        updatedAt: undefined,
      },
    ];
    setExchangeList(fetchedExchangeList);
  }, []);

  return (
    <div>
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
