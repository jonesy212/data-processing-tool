// config/DatabaseConfig.ts
import { PoolConfig } from 'pg';
import configData from "@/app/config/endpoints/configData";

export interface DatabaseConfig {
  url: string;
  host: string;
  database: string;
  username: string;
  password: string;
  port: number;
  authToken?: string;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
  url: process.env.DB_URL!,
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  port: parseInt(process.env.DB_PORT!, 10),
  authToken: process.env.AUTH_TOKEN,
});

export const getPoolConfig = (): PoolConfig => ({
  host: configData.database.host,
  port: configData.database.port,
  database: configData.database.database,
  user: configData.database.username,
  password: configData.database.password
});