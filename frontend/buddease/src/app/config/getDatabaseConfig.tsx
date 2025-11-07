// DatabaseConfig.tsx
import { DatabaseConfig } from '@/app/config/DatabaseConfig'
import { DatabaseType } from '@/app/typings/database'

export interface EnhancedDatabaseConfig extends DatabaseConfig {
  type: DatabaseType;
}

export const getDatabaseConfig = (dbType: DatabaseType = DatabaseType.POSTGRES): EnhancedDatabaseConfig => {
  // Common configuration
  const baseConfig = {
    url: process.env.DATABASE_URL || "",
    host: process.env.DB_HOST || "",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    authToken: process.env.AUTH_TOKEN || undefined,
    port: parseInt(process.env.DB_PORT || "5432"),
    type: dbType
  };

  // Database-specific overrides
  switch (dbType) {
    case DatabaseType.MYSQL:
      return {
        ...baseConfig,
        url: process.env.MYSQL_URL || process.env.DATABASE_URL || "",
        host: process.env.MYSQL_HOST || process.env.DB_HOST || "",
        database: process.env.MYSQL_DB || process.env.DB_NAME || "",
        username: process.env.MYSQL_USER || process.env.DB_USERNAME || "",
        password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
        port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || "3306"), // MySQL default port
      };
    
    case DatabaseType.POSTGRES:
    default:
      return {
        ...baseConfig,
        url: process.env.POSTGRES_URL || process.env.DATABASE_URL || "",
        host: process.env.POSTGRES_HOST || process.env.DB_HOST || "",
        database: process.env.POSTGRES_DB || process.env.DB_NAME || "",
        username: process.env.POSTGRES_USER || process.env.DB_USERNAME || "",
        password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "",
        port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || "5432"), // PostgreSQL default port
      };
  }
};

// Convenience functions
export const getPostgresConfig = (): EnhancedDatabaseConfig => 
  getDatabaseConfig(DatabaseType.POSTGRES);

export const getMysqlConfig = (): EnhancedDatabaseConfig => 
  getDatabaseConfig(DatabaseType.MYSQL);

// For frontend components that need to know about database config
export const useDatabaseConfig = () => {
  return getDatabaseConfig();
};