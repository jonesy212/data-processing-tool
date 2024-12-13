import { PoolConfig } from 'pg';
import { configServiceInstance } from '../configs/ConfigurationService';
import axiosInstance from './axiosInstance';
import { SystemConfigs } from './systemConfigs';
import { UserConfigs } from './userConfigs';

interface ConfigsData {
  dbConfig: PoolConfig;
  systemApiResponse: any; // Replace 'any' with the actual type of systemApiResponse data
  userApiResponse: any; // Replace 'any' with the actual type of userApiResponse data
}



export const getConfigsData = async (): Promise<ConfigsData | undefined> => {
  try {
    const systemConfigs: typeof SystemConfigs =
      await configServiceInstance.getSystemConfigs();
    const userConfigs: typeof UserConfigs =
      await configServiceInstance.getUserConfigs();

    // Make API requests using the obtained configurations
    const systemApiResponse = await axiosInstance.get(
      systemConfigs.apiUrl ?? ""
    );
    const userApiResponse = await axiosInstance.get(userConfigs.apiUrl ?? "");

    // Process the API responses as needed

    const dbConfig: PoolConfig = {
      user: process.env.DB_USER || "default_user",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "default_database",
      password: process.env.DB_PASSWORD || "default_password",
      port: parseInt(process.env.DB_PORT ?? "") || 5432, // Default PostgreSQL port
    };

    return { dbConfig, systemApiResponse, userApiResponse };
  } catch (error) {
    console.error("Error fetching configs data:", error);
  }
};
