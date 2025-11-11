import { DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { ClientSubscriber } from './../../subscriptions/ClientSubscriber';
import { getAppSubscriberIdAPI } from '@/app/api/subscriberApi';
import updateUI, { updateUIWithSearchResults } from "@/app/documents/editing/updateUI";
import { BaseData, Data } from '@/app/models/data/Data';
import { ExchangeData } from "@/app/models/data/ExchangeData";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { updateUIWithSnapshotStore } from "@/app/snapshots/updateUIWithSnapshotStore";
import {
  DEXEnum,
  ExchangeDataTypeEnum,
  ExchangeEnum
} from "@/app/typings/exchangeTypes";
import OrderBookUpdater from "../../components/crypto/OrderBookUpdater";
import TickerUpdater from "../../components/crypto/TickerUpdater";

import { Attachment } from "@/app/documents/attachment/Attachment";
import {
  OrderBookEntity,
  OrderBookSnapshot
} from '@/app/typings/ExchangeTypes';

// Client-side instances
const orderBookUpdater = new OrderBookUpdater();
const tickerUpdater = new TickerUpdater();

// Client-side state
const buyOrders: Record<number, { quantity: number; orderId: number }> = {};
const sellOrders: Record<number, { quantity: number; orderId: number }> = {};

// Client-side subscription management (no database dependencies)
// Exchange-specific subscribers
let orderBookSubscribers: ((data: OrderBookSnapshot) => void)[] = [];

// Or with ClientSubscriber instances:
let orderBookClientSubscribers: ClientSubscriber<
  OrderBookEntity,
  OrderBookEntity,
  DefaultMeta<OrderBookEntity, OrderBookEntity>,
  Attachment,
  DefaultExcludedFields<OrderBookEntity>,
  keyof OrderBookEntity
>[] = [];

// Main integration function
const integrateExchange = async (exchangeData: ExchangeData): Promise<void> => {
  try {
    switch (exchangeData.type) {
      case ExchangeDataTypeEnum.TRADES:
        await processTradesClient(exchangeData.data.getAll());
        break;
      case ExchangeDataTypeEnum.ORDER_BOOK:
        updateOrderBook(exchangeData.data.getAll());
        break;
      case ExchangeDataTypeEnum.TICKER:
        updateTicker(exchangeData.data.getAll());
        break;
      default:
        console.error("Unsupported exchange data type:", exchangeData.type);
        break;
    }
  } catch (error) {
    console.error("Error integrating exchange:", error);
  }
};

// Trade processing (client-side only)
const processTradesClient = async (trades: any[]): Promise<void> => {
  // Send to server for database storage
  try {
    await fetch('/api/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'TRADES',
        trades: trades
      })
    });
  } catch (error) {
    console.error('Failed to save trades to server:', error);
  }

  // Client-side processing
  trades.forEach((trade) => {
    const { price, quantity } = trade;
    updateTradeStatistics(price, quantity);
    updateUITrade(trade);
  });
  console.log("Trade data processing completed on client.");
};



// Now this will work with proper types
const createSubscriber = async (): Promise<{ subscriber: any; tempSubscriber: any }> => {
  const name = "ExampleName";
  
  // Use client-side API wrapper
  const tempSubscriber = createClientSubscriber("tempSubscriber", name);
  const subscriberId = await getAppSubscriberIdAPI(tempSubscriber);
  
  const subscriber = createClientSubscriber("1", name);
  
  return { subscriber, tempSubscriber };
};

const updateUITrade = (trade: any): void => {
  if (window.tradeUpdates) {
    updateUI(trade, "tradeFeed");
  }
};

const updateTradeStatistics = (price: number, quantity: number): void => {
  if (window.tradeStats) {
    window.tradeStats.updateStatistics(price, quantity);
  }
};

// Order Book Management (all client-side)
const updateInternalOrderBook = (orderBookData: any[]): void => {
  orderBookData.forEach((order: any) => {
    const { orderId, price, quantity, type } = order;
    if (type === "buy") {
      if (price in buyOrders) {
        buyOrders[price].quantity += quantity;
      } else {
        buyOrders[price] = { quantity, orderId };
      }
    } else if (type === "sell") {
      if (price in sellOrders) {
        sellOrders[price].quantity += quantity;
      } else {
        sellOrders[price] = { quantity, orderId };
      }
    }
  });

  // Remove canceled orders
  const canceledOrderIds: number[] = [];
  canceledOrderIds.forEach((orderId) => {
    for (let price in buyOrders) {
      if (buyOrders[price].orderId === orderId) {
        delete buyOrders[price];
        break;
      }
    }
    for (let price in sellOrders) {
      if (sellOrders[price].orderId === orderId) {
        delete sellOrders[price];
        break;
      }
    }
  });

  // Update orders
  orderBookData.forEach((order) => {
    updateOrder(order);
  });

  // Sort and log
  const sortedBuyOrders = Object.entries(buyOrders).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  );
  const sortedSellOrders = Object.entries(sellOrders).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  const marketDepth = calculateMarketDepth(buyOrders, sellOrders);
  console.log("Updated Buy Orders:", sortedBuyOrders);
  console.log("Updated Sell Orders:", sortedSellOrders);
  console.log("Market Depth:", marketDepth);
};

const updateOrder = (order: any): void => {
  const { orderId, price, quantity, type } = order;
  if (type === "buy") {
    if (buyOrders[price]) {
      buyOrders[price].quantity += quantity;
    } else {
      console.error(`Buy order with ID ${orderId} not found.`);
    }
  } else if (type === "sell") {
    if (sellOrders[price]) {
      sellOrders[price].quantity += quantity;
    } else {
      console.error(`Sell order with ID ${orderId} not found.`);
    }
  } else {
    console.error("Invalid order type:", type);
  }
};

const calculateMarketDepth = (
  buyOrders: Record<number, { quantity: number; orderId: number }>,
  sellOrders: Record<number, { quantity: number; orderId: number }>
): any => {
  let buyDepth = 0;
  let sellDepth = 0;

  for (const price in buyOrders) {
    if (buyOrders.hasOwnProperty(price)) {
      buyDepth += buyOrders[price].quantity;
    }
  }

  for (const price in sellOrders) {
    if (sellOrders.hasOwnProperty(price)) {
      sellDepth += sellOrders[price].quantity;
    }
  }

  return { buyDepth, sellDepth };
};

const isValidOrderBookData = (orderBookData: any[]): boolean => {
  return Array.isArray(orderBookData) && orderBookData.length > 0;
};



const mergeOrderBookData = (
  newOrderBookData: any[],
  existingOrderBook: any[]
): void => {
  newOrderBookData.forEach((order: any) => {
    const { orderId, price, quantity, type } = order;
    const existingOrderIndex = existingOrderBook.findIndex(
      (existingOrder) => existingOrder.orderId === orderId
    );

    if (existingOrderIndex !== -1) {
      existingOrderBook[existingOrderIndex].quantity = quantity;
    } else {
      existingOrderBook.push(order);
    }
  });

  console.log("Updated Order Book:", existingOrderBook);
};

// Ticker Management
const updateTicker = (tickerData: any): void => {
  try {
    if (!isValidTickerData(tickerData)) {
      throw new Error("Invalid ticker data.");
    }
    tickerUpdater.updateTicker(tickerData);
    updateUI(tickerData, "settings");
    console.log("Ticker information updated successfully.");
  } catch (error: any) {
    console.error("Error updating ticker information:", error.message);
  }
};

const isValidTickerData = (tickerData: any): boolean => {
  if (typeof tickerData !== "object" || tickerData === null) return false;
  if (!("symbol" in tickerData) || !("price" in tickerData) || !("volume" in tickerData)) return false;
  if (typeof tickerData.symbol !== "string" || tickerData.symbol.trim() === "") return false;
  if (typeof tickerData.price !== "number" || typeof tickerData.volume !== "number" || tickerData.price < 0 || tickerData.volume < 0) return false;
  
  if (!isPrecisionValid(tickerData.price, 2)) return false;
  if (!isPrecisionValid(tickerData.volume, 6)) return false;
  
  const priceRange = { min: 0.01, max: 1000000 };
  const volumeRange = { min: 0.000001, max: 100000 };
  if (!isWithinRange(tickerData.price, priceRange) || !isWithinRange(tickerData.volume, volumeRange)) return false;

  const validSymbols = ["BTCUSD", "ETHUSD", "XRPUSD"];
  if (!validSymbols.includes(tickerData.symbol)) return false;

  return true;
};

const isPrecisionValid = (value: number, precision: number): boolean => {
  const regex = new RegExp(`^-?\\d+(\\.\\d{0,${precision}})?$`);
  return regex.test(value.toString());
};

const isWithinRange = (
  value: number,
  range: { min: number; max: number }
): boolean => {
  return value >= range.min && value <= range.max;
};

// UI Updates
const handleOrderBookUpdateUI = async (snapshotStore: Snapshot<Data, Data>): Promise<void> => {
  updateUIWithSnapshotStore(snapshotStore);

  if (window.searchResults) {
    updateUIWithSearchResults(snapshotStore.data);
  }

  updateUI(snapshotStore.data, "editor");
};

// Subscription functions

// Exchange-specific subscriber creation
export const createExchangeSubscriber = (name: string = "ExchangeSubscriber") => {
  const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return ClientSubscriber.createSubscriber<
    OrderBookEntity,
    OrderBookEntity,
    DefaultMeta<OrderBookEntity, OrderBookEntity>,
    Attachment,
    DefaultExcludedFields<OrderBookEntity>,
    keyof OrderBookEntity
  >(subscriberId, name);
};

// Order book functions with proper types
const subscribeToOrderBookUpdates = (
  subscriber: (data: OrderBookSnapshot) => void
): void => {
  if (!orderBookSubscribers.includes(subscriber)) {
    orderBookSubscribers.push(subscriber);
    console.log('Subscriber added to order book updates');
  }
};

const updateOrderBook = (orderBookData: any[]): void => {
  try {
    if (!isValidOrderBookData(orderBookData)) {
      console.error("Invalid order book data:", orderBookData);
      return;
    }
    
    updateInternalOrderBook(orderBookData);
    
    // Create order book snapshot with proper type
    const snapshot: OrderBookSnapshot = {
      timestamp: new Date(),
      data: {
        bids: orderBookData.filter(order => order.type === 'buy'),
        asks: orderBookData.filter(order => order.type === 'sell'),
        symbol: 'BTCUSD',
        timestamp: new Date(),
        exchange: 'Coinbase Pro',
        spread: calculateSpread(orderBookData)
      },
      events: { eventRecords: null, callbacks: {} },
      callbacksts: {},
      meta: {},
      id: `orderbook_${Date.now()}`,
      category: 'order_book'
    };
    
    notifyOrderBookSubscribers(snapshot);
    
    console.log("Order book updated successfully");
  } catch (error) {
    console.error("Error updating order book:", error);
  }
};

const orderBookUpdateHandler = (snapshot: OrderBookSnapshot): void => {
  if (snapshot.data) {
    console.log("Order book update:", {
      symbol: snapshot.data.symbol,
      bidCount: snapshot.data.bids.length,
      askCount: snapshot.data.asks.length,
      spread: snapshot.data.spread
    });
  }
};

const unsubscribeFromOrderBookUpdates = (
  subscriber: (data: Snapshot<BaseData>) => void
): void => {
  orderBookSubscribers = orderBookSubscribers.filter(sub => sub !== subscriber);
  console.log('Subscriber removed from order book updates');
};

const notifyOrderBookSubscribers = (snapshot: Snapshot<BaseData>): void => {
  orderBookSubscribers.forEach(subscriber => {
    try {
      subscriber(snapshot);
    } catch (error) {
      console.error('Error notifying order book subscriber:', error);
    }
  });
};

// Example usage
const exampleUsage = () => {
  const mySubscriber = createSubscriber("MyComponent");
  
  const handleOrderBookUpdate = (snapshot: Snapshot<BaseData>) => {
    console.log("Order book updated:", snapshot);
    handleOrderBookUpdateUI(snapshot as any);
  };
  
  mySubscriber.subscribe(handleOrderBookUpdate);
};

// Export everything
export default integrateExchange;
export {
  DEXEnum, ExchangeDataTypeEnum, ExchangeEnum, handleOrderBookUpdateUI,
  subscribeToOrderBookUpdates,
  unsubscribeFromOrderBookUpdates, updateOrderBook,
  updateTicker
};
