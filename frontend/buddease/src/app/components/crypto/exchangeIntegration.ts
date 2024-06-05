import { getConfigsData } from "@/app/api/getConfigsApi";
import { ConfigLogger } from "../logging/Logger";
import { Data } from "../models/data/Data";
import { ExchangeData } from "../models/data/ExchangeData";
import { Snapshot } from "../snapshots/SnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import DatabaseClient from "../todos/tasks/DatabaseClient";
import { Subscriber } from "../users/Subscriber";
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from "../utils/applicationUtils";
import OrderBookUpdater from "./OrderBookUpdater";
import TickerUpdater from "./TickerUpdater";

// Define enum for exchange data types
enum ExchangeDataTypeEnum {
    TRADES = "trades",
    ORDER_BOOK = "order_book",
  TICKER = "ticker",
    SPOT =  'spot'
}


// Create an instance of OrderBookUpdater
const orderBookUpdater = new OrderBookUpdater();
// Create an instance of TickerUpdater
const tickerUpdater = new TickerUpdater();

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
          // If the exchange data type is trades, process and store the trade data
          processTrades(exchangeData.data);
          break;
        case ExchangeDataTypeEnum.ORDER_BOOK:
          // If the exchange data type is order book, update the order book with new data
          updateOrderBook(exchangeData.data);
          break;
        case ExchangeDataTypeEnum.TICKER:
          // If the exchange data type is ticker, update the ticker information
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
      ConfigLogger.logConfigUpdate("databaseConfigError", "Database configuration data is undefined."); // Log the error using ConfigLogger
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
    price: 100.50,
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

  


// Function to update the internal representation of the order book
const updateInternalOrderBook = (orderBookData: any[]): void => {
  // Implement logic to update the internal representation of the order book
  // Here, you would typically update the order book based on the new data provided in the orderBookData array
  // This function should handle the specifics of how your system manages and updates the order book
  // For example, you might update existing orders, add new orders, or remove canceled orders
  // This is where the core business logic related to order book management resides

  // Create an object to store buy and sell orders separately
  const buyOrders: Record<number, number> = {}; // Key: price, Value: quantity
  const sellOrders: Record<number, number> = {}; // Key: price, Value: quantity

  // Iterate through the new order book data
  orderBookData.forEach((order: any) => {
    // Extract relevant information from the order object
    const { orderId, price, quantity, type } = order;

    // Check the type of order (buy or sell)
    if (type === 'buy') {
      // Update existing buy orders or add new buy orders to the order book
      if (price in buyOrders) {
        // If the buy order already exists at this price, update the quantity
        buyOrders[price] += quantity;
      } else {
        // If it doesn't exist, add the buy order to the order book
        buyOrders[price] = quantity;
      }
    } else if (type === 'sell') {
      // Update existing sell orders or add new sell orders to the order book
      if (price in sellOrders) {
        // If the sell order already exists at this price, update the quantity
        sellOrders[price] += quantity;
      } else {
        // If it doesn't exist, add the sell order to the order book
        sellOrders[price] = quantity;
      }
    } else {
      console.error('Invalid order type:', type);
      // Handle invalid order type if needed
    }
  });

  // After processing all new orders, you might perform additional tasks such as:
  // - Removing canceled orders from the order book
  const canceledOrders: Record<number, number> = {}; // Key: price, Value: quantity

  // - Updating existing orders in the order book
  
  // - Adding new orders to the order book
  // - Reordering the order book based on price or other criteria
  // - Updating any derived data or statistics related to the order book

  // Example: Log the updated buy and sell orders
  console.log('Updated Buy Orders:', buyOrders);
  console.log('Updated Sell Orders:', sellOrders);
};


// Function to update the order book with new data
// Function to update the order book with new data
const updateOrderBook = (orderBookData: any[]): void => {
  try {
    // Validate the order book data before proceeding
    if (!isValidOrderBookData(orderBookData)) {
      console.error('Invalid order book data:', orderBookData);
      return; // Exit function if data is invalid
    }

    // Perform updates to the internal order book using the updateInternalOrderBook function
    updateInternalOrderBook(orderBookData);

    // Subscribe to order book updates
    subscribeToOrderBookUpdates(orderBookUpdateHandler);

    // Additional logic if needed
    console.log('Order book updated successfully with new data:', orderBookData);
  } catch (error) {
    console.error('Error updating order book:', error);
    // Perform error handling or notify system administrators
  }
};

// Handler function for order book updates
const orderBookUpdateHandler = (snapshot: Snapshot<Data | undefined>): void => {
  // Perform actions in response to order book updates, if needed
  console.log('Received order book update:', snapshot);
};



// Function to validate order book data
const isValidOrderBookData = (orderBookData: any[]): boolean => {
  // Implement validation logic here
  // Return true if orderBookData is valid, false otherwise

  // Placeholder implementation (add actual validation logic)
  return Array.isArray(orderBookData) && orderBookData.length > 0;
};



// Function to merge new order book data with existing order book
const mergeOrderBookData = (newOrderBookData: any[], existingOrderBook: any[]): void => {
  // Implement merging logic here
  // This function would typically update the existing order book with the new data
  // based on the rules and requirements of your order book management system

  // Iterate through the new order book data
  newOrderBookData.forEach((order: any) => {
    // Extract relevant information from the order object
    const { orderId, price, quantity, type } = order;

    // Example: Check if the order exists in the existing order book
    const existingOrderIndex = existingOrderBook.findIndex((existingOrder) => existingOrder.orderId === orderId);

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
  console.log('Updated Order Book:', existingOrderBook);
};

// Example usage:
// Define or retrieve the existing order book data
const existingOrderBook: any[] = []; // Initialize with an empty array or retrieve from storage/database

// Call the mergeOrderBookData function with the new order book data and existing order book
const newOrderBookData: any[] = []; // Replace with actual new order book data
mergeOrderBookData(newOrderBookData, existingOrderBook);




// Create an instance of the Subscriber class for order book updates
const subscription: Subscription = {
  unsubscribe: () => {}, // Placeholder function
  portfolioUpdates: () => {}, // Placeholder function
  tradeExecutions: () => {}, // Placeholder function
  marketUpdates: () => {}, // Placeholder function
  communityEngagement: () => {}, // Placeholder function
};

// Create an instance of the Subscriber class for order book updates
const orderBookSubscriber = new Subscriber<Data | undefined>(
  "orderBookSubscriber",
  subscription, 
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives
);


// Function to subscribe to order book updates
const subscribeToOrderBookUpdates = (subscriber: (data: Snapshot<Data | undefined>) => void): void => {
  orderBookSubscriber.subscribe(subscriber);
};

// Function to unsubscribe from order book updates
const unsubscribeFromOrderBookUpdates = (subscriber: (data: Snapshot<Data | undefined>) => void): void => {
  orderBookSubscriber.unsubscribe(subscriber);
};



// Function to notify subscribers about order book updates
const notifyOrderBookUpdate = (): void => {
  // Create an empty snapshot to pass to subscribers
  const data: Snapshot<Data | undefined> = {
    timestamp: new Date(),
    data: undefined,
    category: undefined
  };

  // Notify subscribers about the update
  orderBookSubscriber.notify(data);
};


const updateTicker = (tickerData: any): void => {
  try {
    // Validate tickerData
    if (!isValidTickerData(tickerData)) {
      throw new Error('Invalid ticker data.');
    }

    // Update ticker information
    tickerUpdater.updateTicker(tickerData);

    // Log the update
    console.log('Ticker information updated successfully.');
  } catch (error: any) {
    // Handle errors
    console.error('Error updating ticker information:', error.message);
  }
};

const isValidTickerData = (tickerData: any): boolean => {
  // Check if tickerData is an object
  if (typeof tickerData !== 'object' || tickerData === null) {
    return false;
  }

  // Check if required properties exist
  if (!('symbol' in tickerData) || !('price' in tickerData) || !('volume' in tickerData)) {
    return false;
  }

  // Check if symbol is a non-empty string
  if (typeof tickerData.symbol !== 'string' || tickerData.symbol.trim() === '') {
    return false;
  }

  // Check if price and volume are non-negative numbers
  if (typeof tickerData.price !== 'number' || typeof tickerData.volume !== 'number' ||
      tickerData.price < 0 || tickerData.volume < 0) {
    return false;
  }

  // Optionally, perform more advanced validation such as checking price and volume precision,
  // ensuring consistency with other related data, or validating against predefined ranges.

  // If all checks pass, return true
  return true;
};


export default integrateExchange;
export { ExchangeDataTypeEnum, subscribeToOrderBookUpdates, unsubscribeFromOrderBookUpdates };
