// ExchangeComponent.tsx
import useRealtimeExchangeData from '@/app/hooks/commHooks/useRealtimeExchangeData';
import { ExchangeData } from '@/app/models/data/ExchangeData';
import { processExchangeData } from '@/app/models/data/fetchExchangeData';
import { ExchangeDataTypeEnum, ExchangeEnum } from "@/app/models/cypto/exchangeIntegration";
import { Data } from '@/app/models/data/Data';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { CalendarEvent } from "@/app/calendar/CalendarEvent";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import { useEffect } from "react"; // Import useEffect here
import { useDispatch } from 'react-redux';

const ExchangeComponent = () => {
  const dispatch = useDispatch();

  const updateCallback = (
    data: SnapshotStore<Data, Snapshot<Data, Data>>,
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Data, Snapshot<Data, Data>>,
    dataItems: RealtimeDataItem[]
  ) => {
    // Implement your update logic here
  };

  const exchangeList: ExchangeEnum[] = [
    ExchangeEnum.BITFINEX,
    ExchangeEnum.BTC,
    ExchangeEnum.ETH,
    // Add more as needed
  ];

  // Pass dispatch to the hook
  const { fetchExchangeData } = useRealtimeExchangeData([], updateCallback, processExchangeData, exchangeList, dispatch);

  useEffect(() => {
    // Example exchange data
    const exchangeData: ExchangeData[] = [
      {
        id: '1',
        name: 'BTC/USD',
        pair: 'BTCUSD',
        price: 40000,
        volume: 100,
        type: ExchangeDataTypeEnum.SPOT,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        liquidity: 0,
        tokens: [],
      },
      // Add more data as needed
    ];

    // Fetch and process exchange data for each exchange in exchangeList
    exchangeList.forEach((exchange) => {
      fetchExchangeData(exchange, dispatch); // Fetch data for each exchange
    });
  }, [exchangeList, fetchExchangeData]); // Add exchangeList as a dependency

  return (
    <div>
      <h2>Exchange Data</h2>
      <ul>
        {exchangeData.map((data) => (
          <li key={data.id}>
            {data.name}: {data.price} (Volume: {data.volume})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExchangeComponent;
