// databaseConnection.ts (formerly config.ts)
import configData from "@/core/config/endpoints/configData";
import { PoolConfig } from 'pg';

const databaseConnection: PoolConfig = {  
  host: configData.database.host,
  port: configData.database.port,
  database: configData.database.database,
  user: configData.database.username,
  password: configData.database.password
};

export { databaseConnection };
