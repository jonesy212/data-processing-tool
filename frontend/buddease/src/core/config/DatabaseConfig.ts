DatabaseConfig.ts
config/DatabaseConfig.ts
import configData from "@/core/config/endpoints/configData";
import { PoolConfig } from 'pg';


export interface DatabaseConfig extends PoolConfig {
  url: string;
  username: string; // Alias for 'user' for consistency
  authToken?: string;
  batchSize?: number;
  maxConnections?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
}

Helper function to convert DatabaseConfig to PoolConfig
export const toPoolConfig = (config: DatabaseConfig): PoolConfig => ({
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.username, // Map username to user for pg
  password: config.password,
  ssl: config.ssl,
  max: config.maxConnections || config.max,
  connectionTimeoutMillis: config.connectionTimeoutMillis,
  idleTimeoutMillis: config.idleTimeoutMillis
});

Primary config getter - uses environment variables
export const getDatabaseConfig = (): DatabaseConfig => ({
  url: process.env.DB_URL!,
  host: process.env.DB_HOST! || 'localhost',
  database: process.env.DB_NAME! || 'your_database',
  username: process.env.DB_USER! || 'your_username',
  password: process.env.DB_PASSWORD! || 'your_password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  authToken: process.env.AUTH_TOKEN,
  batchSize: parseInt(process.env.DB_BATCH_SIZE || '100', 10),
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false
});

Alternative config getter - uses configData file
export const getPoolConfig = (): PoolConfig => ({
  host: configData.database.host,
  port: configData.database.port,
  database: configData.database.database,
  user: configData.database.username,
  password: configData.database.password,
  max: configData.database.maxConnections || 20,
  connectionTimeoutMillis: configData.database.connectionTimeoutMillis || 10000,
  idleTimeoutMillis: configData.database.idleTimeoutMillis || 30000,
  ssl: configData.database.ssl || (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false)
});

Default configuration for fallback
export const defaultDatabaseConfig: DatabaseConfig = {
  url: 'postgresql://localhost:5432/your_database',
  host: 'localhost',
  database: 'your_database',
  username: 'your_username',
  password: 'your_password',
  port: 5432,
  batchSize: 100,
  maxConnections: 20,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

Database types for different environments
export enum DatabaseEnvironment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRODUCTION = 'production'
}

Get environment-specific config
export const getEnvironmentConfig = (env: DatabaseEnvironment = DatabaseEnvironment.DEVELOPMENT): DatabaseConfig => {
  const baseConfig = getDatabaseConfig();
  
  switch (env) {
    case DatabaseEnvironment.PRODUCTION:
      return {
        ...baseConfig,
        maxConnections: 50,
        connectionTimeoutMillis: 30000,
        ssl: { rejectUnauthorized: true }
      };
    case DatabaseEnvironment.TESTING:
      return {
        ...baseConfig,
        database: `${baseConfig.database}_test`,
        maxConnections: 5,
        connectionTimeoutMillis: 5000
      };
    case DatabaseEnvironment.DEVELOPMENT:
    default:
      return {
        ...baseConfig,
        maxConnections: 10,
        connectionTimeoutMillis: 15000
      };
  }
};

Validate configuration
export const validateDatabaseConfig = (config: DatabaseConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.host) errors.push('Database host is required');
  if (!config.database) errors.push('Database name is required');
  if (!config.username) errors.push('Database username is required');
  if (!config.password) errors.push('Database password is required');
  if (!config.port || config.port <= 0) errors.push('Valid database port is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
};