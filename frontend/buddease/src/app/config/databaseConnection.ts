// databaseConnection.ts (formerly config.ts)
import { PoolConfig } from 'pg';
import configData from "@/app/config/endpoints/configData";

const databaseConnection: PoolConfig = {  
  host: configData.database.host,
  port: configData.database.port,
  database: configData.database.database,
  user: configData.database.username,
  password: configData.database.password
};

export { databaseConnection };  