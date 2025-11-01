// config.ts
import { PoolConfig } from 'pg';
import configData from "@/configData";

const databaseConfig: PoolConfig = {
  host: configData.database.host,
  port: configData.database.port,
  database: configData.database.database,
  user: configData.database.username,
  password: configData.database.password
}


export { databaseConfig }