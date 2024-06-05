import { RealtimeUpdateCallback } from './../../src/app/components/hooks/commHooks/useUIRealtimeData';
// RealTimeDataCollection.ts
import { DEX } from "@/app/components/crypto/DEX";
import { Exchange } from "@/app/components/crypto/Exchange";
import useRealtimeDextData from "@/app/components/hooks/commHooks/useRealtimeDextData";
import useRealtimeExchangeData from "@/app/components/hooks/commHooks/useRealtimeExchangeData";
import DEXData from "@/app/components/models/data/DEXData";
import { Data } from "@/app/components/models/data/Data";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import SnapshotStore, {
  Snapshot,
} from "@/app/components/snapshots/SnapshotStore";
import { CalendarEvent } from "@/app/components/state/stores/CalendarEvent";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import  { RealtimeData, RealtimeDataItem } from "./RealtimeData";
import { ExchangeDataTypeEnum } from "@/app/components/crypto/exchangeIntegration";
import { processExchangeData } from '@/app/components/models/data/fetchExchangeData';

const RealTimeDataCollection: React.FC = () => {
  const dispatch = useDispatch();

  // Define an array of exchanges to fetch data from
  const exchanges: Exchange[] = [
    {
      name: "Coinbase Pro", apiUrl: "https://api.pro.coinbase.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Kraken", apiUrl: "https://api.kraken.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Bitfinex", apiUrl: "https://api.bitfinex.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Bittrex", apiUrl: "https://api.bittrex.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Huobi Global", apiUrl: "https://api.huobi.pro",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "OKEx", apiUrl: "https://www.okex.com/api",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Bitstamp", apiUrl: "https://www.bitstamp.net/api",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Gemini", apiUrl: "https://api.gemini.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "BitMEX", apiUrl: "https://www.bitmex.com/api",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "eToro", apiUrl: "https://api.etoro.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Deribit", apiUrl: "https://www.deribit.com/api",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Poloniex", apiUrl: "https://poloniex.com/public",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "BitFlyer", apiUrl: "https://api.bitflyer.com/v1",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Liquid", apiUrl: "https://api.liquid.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Bybit", apiUrl: "https://api.bybit.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "HitBTC", apiUrl: "https://api.hitbtc.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Gate.io", apiUrl: "https://api.gate.io",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "Upbit", apiUrl: "https://api.upbit.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "CoinEx", apiUrl: "https://api.coinex.com/v1",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    {
      name: "CoinDCX", apiUrl: "https://public.coindcx.com",
      id: "",
      pair: "",
      price: 0,
      volume: 0,
      type: ExchangeDataTypeEnum.TRADES,
      data: undefined
    },
    // Add more exchanges as needed
  ];

  // Define an array of DEXs to fetch data from
  const dexs: DEX[] = [
    { name: "Uniswap", apiUrl: "https://api.uniswap.org" },
    { name: "SushiSwap", apiUrl: "https://api.sushiswap.fi" },
    { name: "PancakeSwap", apiUrl: "https://api.pancakeswap.com" },
    { name: "Curve Finance", apiUrl: "https://api.curve.fi" },
    { name: "1inch Exchange", apiUrl: "https://api.1inch.exchange" },
    { name: "Balancer", apiUrl: "https://api.balancer.fi" },
    { name: "Bancor", apiUrl: "https://api.bancor.network" },
    { name: "Kyber Network", apiUrl: "https://api.kyber.network" },
    { name: "AirSwap", apiUrl: "https://api.airswap.io" },
    { name: "Serum DEX", apiUrl: "https://api.projectserum.com" },
    { name: "DODO Exchange", apiUrl: "https://api.dodoex.io" },
    { name: "QuickSwap", apiUrl: "https://api.quickswap.exchange" },
    { name: "BakerySwap", apiUrl: "https://api.bakeryswap.org" },
    { name: "Honeyswap", apiUrl: "https://api.honeyswap.org" },
    { name: "Loopring", apiUrl: "https://api.loopring.io" },
    { name: "OasisDEX", apiUrl: "https://api.oasisdex.com" },
    // Add more DEXs as needed
  ];


    
  // Define a conversion function to convert SnapshotStore<Snapshot<Data>> to the expected data type T
  const convertSnapshotToDataType = <T>(
    snapshotStore: SnapshotStore<Snapshot<Data>>
  ): T[] => {
    return snapshotStore
      .getData()
      .flatMap((snapshot) => (snapshot.data ? [snapshot.data] : []))
      .filter((data): data is T => data !== null);
  };

  // Custom update callback function to process fetched data
  const updateCallback: RealtimeUpdateCallback<RealtimeData> = (
    data: SnapshotStore<Snapshot<Data>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<Data>>,
    dataItems: RealtimeDataItem[]
  ) => {
    // Your update logic here

    // Perform any additional logic based on the updated events data
    // For example, you can directly use the updated events data
    Object.keys(events).forEach((eventId: string) => {
      const calendarEvents = events[eventId];
      // Perform actions based on each calendar event
      calendarEvents.forEach((event: CalendarEvent) => {
        // Example: Update UI or trigger notifications based on the event
        console.log(`Updated event with ID ${eventId}:`, event);
      });
    });

    // Call the provided updateCallback with the updated data, events, snapshotStore, and dataItems
    updateCallback(data, events, snapshotStore, dataItems);
  };

  // Fetch data from exchanges and DEXs using the custom hook
  useEffect(() => {
    // Fetch data from exchanges using the custom hook for exchange data
    const { fetchExchangeData } = useRealtimeExchangeData<ExchangeData>(
      [], // Pass an empty initialData array
      updateCallback, // Pass the custom update callback
      processExchangeData
    );

    // Fetch data from DEXs using the custom hook for DEX data
    const { fetchDexData } = useRealtimeDextData<DEXData>(
      [], // Pass an empty initialData array
      updateCallback ,// Pass the custom update callback
      processExchangeData
    );

    // Fetch data from exchanges and DEXs on component mount
    fetchExchangeData(exchanges, dispatch);
    fetchDexData(dexs, dispatch);
  }, []); // Ensure this useEffect hook only runs once on component mount

  // Return null or any JSX elements if needed
  return null;
};

// Export the RealTimeDataCollection component
export default RealTimeDataCollection;
