// exchangeIntegrationServer.ts
import DatabaseClient from "@/core/api/DatabaseClient";
import { getConfigsData } from "@/core/api/getConfigsApi";
import { ConfigLogger } from '@/core/logging/Logger';

Server-only database operations
export const saveTradeToDatabase = async (tradeData: any): Promise<void> => {
  try {
    const configsData = await getConfigsData();

    if (configsData) {
      const dbConfig = configsData.dbConfig;
      const dbClient = new DatabaseClient(dbConfig);
      await dbClient.connect();
      await dbClient.insert("trades", tradeData);
      await dbClient.close();
      console.log("Trade data saved to the database:", tradeData);
    } else {
      console.error("Database configuration data is undefined.");
      ConfigLogger.logConfigUpdate(
        "databaseConfigError",
        "Database configuration data is undefined."
      );
    }
  } catch (error) {
    console.error("Error saving trade data to the database:", error);
    ConfigLogger.logConfigUpdate("saveTradeError", error);
    throw error;
  }
};

export const processTradesServerAPI = async (trades: any[]): Promise<void> => {
  for (const trade of trades) {
    const { price, quantity, timestamp, tradeId } = trade;
    await saveTradeToDatabase({ price, quantity, timestamp, tradeId });
  }
  console.log("Trade data processing completed on server.");
};

Server-side subscription management
export const manageSubscriptionsServer = async (subscriptionData: any) => {
  // Server-side subscription logic
  return { success: true };
};