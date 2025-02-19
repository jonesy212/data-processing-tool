// OrderBookData.ts
import { Data } from "../models/data/Data";



interface OrderBookData extends Data {
  bids: Array<{ price: number; volume: number }>;
  asks: Array<{ price: number; volume: number }>;
}

const initialOrderBookData: OrderBookData = {
  category: "orderBook",
  bids: [
    { price: 100, volume: 10 },
    { price: 99, volume: 15 },
  ],
  asks: [
    { price: 101, volume: 12 },
    { price: 102, volume: 8 },
  ],
};

export default initialOrderBookData;
export type { OrderBookData };
