import { getConfigsData } from "@/app/api/getConfigsApi";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import { ModifiedDate } from "@/app/components/documents/DocType";
import updateUI, { updateUIWithSearchResults } from "../documents/editing/updateUI";
import { ConfigLogger } from "../logging/Logger";
import { BaseData, Data } from "../models/data/Data";
import { ExchangeData } from "../models/data/ExchangeData";
import { CustomSnapshotData, Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { updateUIWithSnapshotStore } from "../snapshots/updateUIWithSnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import { getSubscriptionLevel } from "../subscriptions/SubscriptionLevel";
import DatabaseClient from "../todos/tasks/DatabaseClient";
import { Subscriber } from "../users/Subscriber";
import * as subscriptionApi from "./../../api/subscriberApi";
import { OrderBookData } from "./OrderBookData";
import OrderBookUpdater from "./OrderBookUpdater";
import TickerUpdater from "./TickerUpdater";

// Define enum for exchange data types
enum ExchangeDataTypeEnum {
  TRADES = "trades",
  ORDER_BOOK = "order_book",
  TICKER = "ticker",
  SPOT = "spot",
}

export enum DEXEnum {
  UNISWAP = "Uniswap",
  SUSHISWAP = "SushiSwap",
  PANCAKESWAP = "PancakeSwap",
  // Add more DEXs as needed
}

export enum ExchangeEnum {
  COINBASE_PRO = "Coinbase Pro",
  KRAKEN = "Kraken",
  BITFINEX = "Bitfinex",
  BTC = "Bitcoin",
  ETH = "Ethereum",
  // Add more exchanges as needed
}

// Create an instance of OrderBookUpdater
const orderBookUpdater = new OrderBookUpdater();
// Create an instance of TickerUpdater
const tickerUpdater = new TickerUpdater();

// Create an object to store buy and sell orders separately
const buyOrders: Record<number, { quantity: number; orderId: number }> = {}; // Key: price, Value: { quantity, orderId }
const sellOrders: Record<number, { quantity: number; orderId: number }> = {}; // Key: price, Value: { quantity, orderId }

// Function to integrate new exchanges or data sources into the system

// Function to integrate new exchanges or data sources into the system
const integrateExchange = async (exchangeData: ExchangeData): Promise<void> => {
  try {
    // Fetch configuration data
    const config = await getConfigsData();

    // Check if config is defined
    if (config) {
      // Proceed with database operations using the retrieved config

      switch (exchangeData.type) {
        case ExchangeDataTypeEnum.TRADES:
          // Example: If the exchange data type is trades, process and store the trade data
          processTrades(exchangeData.data);
          break;
        case ExchangeDataTypeEnum.ORDER_BOOK:
          // If the exchange data type is order book, update the order book with new data
          orderBookUpdater.updateOrderBook(exchangeData.data); // Use orderBookUpdater here
          break;
        case ExchangeDataTypeEnum.TICKER:
          // Example: If the exchange data type is ticker, update the ticker information
          updateTicker(exchangeData.data);
          break;
        default:
          console.error("Unsupported exchange data type:", exchangeData.type);
          break;
      }
    } else {
      console.error("Failed to fetch configuration data.");
    }
  } catch (error) {
    console.error("Error integrating exchange:", error);
  }
};
// Function to process and store trade data
const processTrades = (trades: any[]): void => {
  // Assuming trades is an array of trade objects with properties like price, quantity, timestamp, etc.
  // Iterate through each trade object in the trades array
  trades.forEach((trade) => {
    // Extract relevant information from the trade object
    const { price, quantity, timestamp, tradeId } = trade;

    //todo
    // Perform validation or data transformation if necessary

    // Store the trade data in the database or any storage mechanism
    saveTradeToDatabase({ price, quantity, timestamp, tradeId });

    // Additional logic such as updating statistics, triggering alerts, etc.
    // Update trade statistics
    updateTradeStatistics(price, quantity);
  });

  // Log a message indicating that trade data processing is complete
  console.log("Trade data processing completed.");
};

// Function to save trade data to the database
const saveTradeToDatabase = async (tradeData: any): Promise<void> => {
  try {
    // Fetch configuration data
    const configsData = await getConfigsData();

    // Ensure configsData is defined before proceeding
    if (configsData) {
      // Extract dbConfig from configsData
      const dbConfig = configsData.dbConfig;

      // Initialize database client
      const dbClient = new DatabaseClient(dbConfig);

      // Connect to the database
      await dbClient.connect();

      // Insert the trade data into the trades collection/table
      await dbClient.insert("trades", tradeData);

      // Close the database connection
      await dbClient.close();

      console.log("Trade data saved to the database:", tradeData);
    } else {
      console.error("Database configuration data is undefined.");
      ConfigLogger.logConfigUpdate(
        "databaseConfigError",
        "Database configuration data is undefined."
      ); // Log the error using ConfigLogger
    }
  } catch (error) {
    console.error("Error saving trade data to the database:", error);
    ConfigLogger.logConfigUpdate("saveTradeError", error); // Log the error using ConfigLogger
    throw error; // Propagate the error to the caller
  }
};

// Example usage:
const tradeData = {
  // Example trade data properties
  timestamp: new Date(),
  price: 100.5,
  volume: 10,
  symbol: "BTCUSD",
  // Add more properties as needed
};

// Call saveTradeToDatabase with the trade data
saveTradeToDatabase(tradeData);

// Function to update trade statistics
const updateTradeStatistics = (price: number, quantity: number): void => {
  // Update trade statistics using the TradeStatistics instance
  tradeStats.updateStatistics(price, quantity);
};

// Function to update the order book
const updateInternalOrderBook = (orderBookData: any[]): void => {
  // Implement logic to update the internal representation of the order book
  // Here, you would typically update the order book based on the new data provided in the orderBookData array
  // This function should handle the specifics of how your system manages and updates the order book
  // For example, you might update existing orders, add new orders, or remove canceled orders
  // This is where the core business logic related to order book management resides

  // Iterate through the new order book data
  orderBookData.forEach((order: any) => {
    // Extract relevant information from the order object
    const { orderId, price, quantity, type } = order;

    // Check the type of order (buy or sell)
    if (type === "buy") {
      // Update existing buy orders or add new buy orders to the order book
      if (price in buyOrders) {
        // If the buy order already exists at this price, update the quantity
        buyOrders[price].quantity += quantity;
      } else {
        // If it doesn't exist, add the buy order to the order book
        buyOrders[price] = { quantity, orderId };
      }
    } else if (type === "sell") {
      // Update existing sell orders or add new sell orders to the order book
      if (price in sellOrders) {
        // If the sell order already exists at this price, update the quantity
        sellOrders[price].quantity += quantity;
      } else {
        // If it doesn't exist, add the sell order to the order book
        sellOrders[price] = { quantity, orderId };
      }
    } else {
      console.error("Invalid order type:", type);
      // Handle invalid order type if needed
    }
  });

  // Additional tasks after processing all new orders

  // - Removing canceled orders from the order book
  // This step is typically dependent on some external indicator that an order has been canceled.
  // For this example, let's assume there's an array of canceled order IDs that we can use to remove orders.
  const canceledOrderIds: number[] = [
    /* list of canceled order IDs */
  ];

  canceledOrderIds.forEach((orderId) => {
    // Assuming we can find orders by their ID and remove them from the respective buy/sell lists
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

  // - Updating existing orders in the order book
  // This would typically involve iterating over the current state of the order book and making changes as necessary.
  // For this example, assume we have a function `updateOrder` that processes an order and makes necessary updates.
  orderBookData.forEach((order) => {
    updateOrder(order);
  });

  // - Adding new orders to the order book
  // This is already handled in the main loop above, where new orders are added to the buyOrders and sellOrders objects.

  // - Reordering the order book based on price or other criteria
  const sortedBuyOrders = Object.entries(buyOrders).sort(
    (a, b) => Number(b[0]) - Number(a[0])
  );
  const sortedSellOrders = Object.entries(sellOrders).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  // - Updating any derived data or statistics related to the order book
  // This could involve recalculating market depth, spread, or other metrics.
  const marketDepth = calculateMarketDepth(buyOrders, sellOrders);

  // Example: Log the updated buy and sell orders
  console.log("Updated Buy Orders:", sortedBuyOrders);
  console.log("Updated Sell Orders:", sortedSellOrders);
  console.log("Market Depth:", marketDepth);
};

// Helper function to update an order in the order book
const updateOrder = (order: any): void => {
  // Extract relevant information from the order object
  const { orderId, price, quantity, type } = order;

  // Determine whether the order is a buy or sell order
  if (type === "buy") {
    // Implement logic to update a buy order
    // Example: Assume buyOrders is a global or accessible object where buy orders are stored
    if (buyOrders[price]) {
      // Update the quantity of the existing buy order
      buyOrders[price].quantity += quantity;
    } else {
      // Handle case where the order does not exist (optional, based on your system's requirements)
      console.error(`Buy order with ID ${orderId} not found.`);
    }
  } else if (type === "sell") {
    // Implement logic to update a sell order
    // Example: Assume sellOrders is a global or accessible object where sell orders are stored
    if (sellOrders[price]) {
      // Update the quantity of the existing sell order
      sellOrders[price].quantity += quantity;
    } else {
      // Handle case where the order does not exist (optional, based on your system's requirements)
      console.error(`Sell order with ID ${orderId} not found.`);
    }
  } else {
    // Handle invalid order type (optional, based on your system's requirements)
    console.error("Invalid order type:", type);
  }

  // Additional logic could include updating other attributes of the order like price, timestamp, etc.
};

// Helper function to calculate market depth

const calculateMarketDepth = (
  buyOrders: Record<number, { quantity: number; orderId: number }>,
  sellOrders: Record<number, { quantity: number; orderId: number }>
): any => {
  // Implement the logic to calculate market depth or other metrics based on the buy and sell orders
  let buyDepth = 0;
  let sellDepth = 0;

  // Calculate the total quantity for buy orders
  for (const price in buyOrders) {
    if (buyOrders.hasOwnProperty(price)) {
      buyDepth += buyOrders[price].quantity;
    }
  }

  // Calculate the total quantity for sell orders
  for (const price in sellOrders) {
    if (sellOrders.hasOwnProperty(price)) {
      sellDepth += sellOrders[price].quantity;
    }
  }

  // Return the calculated market depth or other relevant data
  return { buyDepth, sellDepth };
};

// Function to update the order book with new data
const updateOrderBook = (orderBookData: any[]): void => {
  try {
    // Validate the order book data before proceeding
    if (!isValidOrderBookData(orderBookData)) {
      console.error("Invalid order book data:", orderBookData);
      return; // Exit function if data is invalid
    }

    // Perform updates to the internal order book using the updateInternalOrderBook function
    updateInternalOrderBook(orderBookData);

    // Subscribe to order book updates
    subscribeToOrderBookUpdates(orderBookUpdateHandler);

    // Additional logic if needed
    console.log(
      "Order book updated successfully with new data:",
      orderBookData
    );
  } catch (error) {
    console.error("Error updating order book:", error);
    // Perform error handling or notify system administrators
  }
};

// Define the orderBookUpdateHandler function
const orderBookUpdateHandler = (snapshot: Snapshot<BaseData>): void => {
  if (snapshot.data) {
    console.log("Received order book update:");
    console.log("Timestamp:", snapshot.timestamp);
    console.log("Orders:", snapshot.orders);
    // You can access other properties of snapshot as needed
  } else {
    console.log("Received empty order book update");
  }
};


// Function to validate order book data
const isValidOrderBookData = (orderBookData: any[]): boolean => {
  // Implement validation logic here
  // Return true if orderBookData is valid, false otherwise
  return Array.isArray(orderBookData) && orderBookData.length > 0;
};

// Function to merge new order book data with existing order book
const mergeOrderBookData = (
  newOrderBookData: any[],
  existingOrderBook: any[]
): void => {
  // Implement merging logic here
  // This function would typically update the existing order book with the new data
  // based on the rules and requirements of your order book management system

  // Iterate through the new order book data
  newOrderBookData.forEach((order: any) => {
    // Extract relevant information from the order object
    const { orderId, price, quantity, type } = order;

    // Example: Check if the order exists in the existing order book
    const existingOrderIndex = existingOrderBook.findIndex(
      (existingOrder) => existingOrder.orderId === orderId
    );

    if (existingOrderIndex !== -1) {
      // If the order already exists, update its quantity or other properties
      existingOrderBook[existingOrderIndex].quantity = quantity;
      // Additional logic for updating other properties if needed
    } else {
      // If the order doesn't exist, add it to the existing order book
      existingOrderBook.push(order);
    }
  });

  // Example: Log the updated order book after merging
  console.log("Updated Order Book:", existingOrderBook);
};

// Example usage:
// Define or retrieve the existing order book data
const existingOrderBook: any[] = []; // Initialize with an empty array or retrieve from storage/database

const name = "Order Book";
// Call the mergeOrderBookData function with the new order book data and existing order book
const newOrderBookData: OrderBookData[] = []; // Replace with actual new order book data
mergeOrderBookData(newOrderBookData, existingOrderBook);

// Call the updateOrderBook function with the merged order book data
const initialData: CustomSnapshotData = {
  timestamp: new Date().toISOString(),
  value: 42,
  orders: [
    {
      orderId: 1,
      price: 100,
      quantity: 10,
      type: "buy",
    },
    {
      orderId: 2,
      price: 200,
      quantity: 20,
      type: "sell",
    },
  ],
  
  // Other properties specific to CustomSnapshotData
}

// Create an instance of the Subscriber class for order book updates
const subscription: Subscription<Data, Data> = {
  unsubscribe: () => {},
  portfolioUpdates: () => {},
  tradeExecutions: () => {},
  marketUpdates: () => {},
  communityEngagement: () => { },
  triggerIncentives: () => { },
  determineCategory: (data:any) => data,
  portfolioUpdatesLastUpdated: {} as ModifiedDate,
  subscribers: [],
  data: {},
  getSubscriptionLevel: getSubscriptionLevel
};




// Function to create a subscriber
const createSubscriber = (): { subscriber: Subscriber<Data, Data>; tempSubscriber: Subscriber<Data, Data> } => {
  const name = "ExampleName"; // Define the name
  const notifyEventSystem = () => {}; // Define the notifyEventSystem function
  const updateProjectState = () => {}; // Define the updateProjectState function
  const logActivity = () => {}; // Define the logActivity function
  const triggerIncentives = () => {}; // Define the triggerIncentives function
  const initialData: BaseData | undefined = undefined; // Define the initial data
  
  const tempSubscriber = new Subscriber<Data, Data>(
    "tempSubscriber",
    name,
    subscription,
    "",
    notifyEventSystem,
    updateProjectState,
    logActivity,
    triggerIncentives,
    initialData
  );

  // Now you can retrieve the subscriberId from tempSubscriber
  const subscriberId = subscriptionApi.getSubscriberId(tempSubscriber);

  const subscriber = Subscriber.createSubscriber<Data, CustomSnapshotData>(
    "1",
    name,
    subscription,
    subscriberId!,
    notifyEventSystem,
    updateProjectState,
    logActivity,
    triggerIncentives,
    initialData
  );

  // Return both the subscriber and tempSubscriber
  return { subscriber, tempSubscriber };
};




export { createSubscriber };



// Create the subscriber instance
const subscriber = createSubscriber();

// Create an instance of the Subscriber class for order book updates
export const initialSnapshot: Snapshot<BaseData> = {
  data: initialData, // Replace with actual initial data
  events: {
    eventRecords: null,
    callbacks: {}
  }, // Replace with actual initial events
  callbacksts: {}
  // Other properties as needed
};


// Create an instance of the Subscriber class for order book updates
const orderBookSubscriber = new Subscriber<Data, Data>(
  "orderBookSubscriber",
  "orderBookSubscriberName", // Assuming you have a name for this subscriber
  subscription,
  subscriptionApi.getSubscriberId(subscriber) ?? "",
  () => subscriber.getNotifyEventSystem?.(), // Wrap in an arrow function to ensure it's callable
  () => subscriber.getUpdateProjectState?.()!, // Use a function to handle potential undefined
  () => subscriber.getLogActivity?.()!, // Use a function to handle potential undefined
  () => subscriber.getTriggerIncentives?.()!, // Use a function to handle potential undefined
);

// Function to subscribe to order book updates
const subscribeToOrderBookUpdates = (
  subscriber: (data: Snapshot<BaseData>) => void
): void => {
  orderBookSubscriber.subscribe(subscriber);
};

// Function to unsubscribe from order book updates
const unsubscribeFromOrderBookUpdates = (
  subscriber: (data: Snapshot<BaseData>) => void
): void => {
  orderBookSubscriber.unsubscribe(subscriber);
};

// update the UI with order book snapshot updates
const handleOrderBookUpdateUI = async (snapshotStore: Snapshot<Data, Data>): Promise<void> => {
  updateUIWithSnapshotStore(snapshotStore); // Use the existing function to handle snapshot store updates

  // Example: Get the ID as a resolved value
  const id = await getSnapshotId(snapshotStore.id); // Await the Promise
  if(id === undefined){
    throw new Error("not able to get id");
  }
  const snapshot = snapshotStore.getSnapshotById(id.toString()); // Assuming you have a method to get a specific snapshot by ID
  if (!snapshot) {
    throw new Error("not able to get snapshot");
  }
  // Example: Update UI for specific components like search results
  if (window.searchResults) {
    updateUIWithSearchResults(snapshotStore.getData(id, snapshot));
  }

  // Optionally update other UI components based on store
  updateUI(snapshotStore.getData(id, snapshot), "editor"); // Update editor store
};


// Function to notify subscribers about order book updates
const notifyOrderBookUpdate = async (): Promise<void> => {
  // Create an empty snapshot to pass to subscribers
  const data: Snapshot<BaseData, BaseData> = {
    timestamp: new Date(),
    data: undefined,
    category: undefined,
    events: undefined,
    meta: {}
  };

  const subscribers = await subscriptionApi.getSubscribersAPI()

  const callback = (data: Snapshot<BaseData>) => {
    // Handle the data as needed
    console.log("Received data:", data);
    
    // Update the UI with the snapshot store
    handleOrderBookUpdateUI(data);

    // Notify subscribers about the update
    orderBookSubscriber.notify!(data, callback, subscribers);
  };
}



const updateTicker = (tickerData: any): void => {
  try {
    // Validate tickerData
    if (!isValidTickerData(tickerData)) {
      throw new Error("Invalid ticker data.");
    }
    // Update ticker information
    tickerUpdater.updateTicker(tickerData);

    // Update the UI with the updated ticker data
    updateUI(tickerData, "settings"); // Use "settings" store to update settings UI

    // Log the update
    console.log("Ticker information updated successfully.");
  } catch (error: any) {
    // Handle errors
    console.error("Error updating ticker information:", error.message);
  }
};

const isValidTickerData = (tickerData: any): boolean => {
  // Check if tickerData is an object
  if (typeof tickerData !== "object" || tickerData === null) {
    return false;
  }

  // Check if required properties exist
  if (
    !("symbol" in tickerData) ||
    !("price" in tickerData) ||
    !("volume" in tickerData)
  ) {
    return false;
  }

  // Check if symbol is a non-empty string
  if (
    typeof tickerData.symbol !== "string" ||
    tickerData.symbol.trim() === ""
  ) {
    return false;
  }

  // Check if price and volume are non-negative numbers
  if (
    typeof tickerData.price !== "number" ||
    typeof tickerData.volume !== "number" ||
    tickerData.price < 0 ||
    tickerData.volume < 0
  ) {
    return false;
  }

  // Advanced validation: Check price precision (e.g., up to 2 decimal places)
  if (!isPrecisionValid(tickerData.price, 2)) {
    return false;
  }

  // Advanced validation: Check volume precision (e.g., up to 6 decimal places)
  if (!isPrecisionValid(tickerData.volume, 6)) {
    return false;
  }

  // Advanced validation: Check against predefined price and volume ranges
  const priceRange = { min: 0.01, max: 1000000 }; // Example range
  const volumeRange = { min: 0.000001, max: 100000 }; // Example range

  if (
    !isWithinRange(tickerData.price, priceRange) ||
    !isWithinRange(tickerData.volume, volumeRange)
  ) {
    return false;
  }

  // Advanced validation: Ensure consistency with related data (e.g., symbol exists in a predefined list)
  const validSymbols = ["BTCUSD", "ETHUSD", "XRPUSD"]; // Example list
  if (!validSymbols.includes(tickerData.symbol)) {
    return false;
  }

  // If all checks pass, return true
  return true;
};

// Helper function to check precision
const isPrecisionValid = (value: number, precision: number): boolean => {
  const regex = new RegExp(`^-?\\d+(\\.\\d{0,${precision}})?$`);
  return regex.test(value.toString());
};

// Helper function to check if a value is within a predefined range
const isWithinRange = (
  value: number,
  range: { min: number; max: number }
): boolean => {
  return value >= range.min && value <= range.max;
};

// Example usage:
const tickerData = {
  symbol: "BTCUSD",
  price: 100.1234,
  volume: 0.123456,
};

console.log(isValidTickerData(tickerData));

export default integrateExchange;

export {
    ExchangeDataTypeEnum,
    subscribeToOrderBookUpdates,
    unsubscribeFromOrderBookUpdates
};


// Example usage of subscribe and unsubscribe functions
subscribeToOrderBookUpdates(handleOrderBookUpdateUI);
unsubscribeFromOrderBookUpdates(handleOrderBookUpdateUI);
