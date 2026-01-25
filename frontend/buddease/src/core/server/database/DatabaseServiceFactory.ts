// DatabaseServiceFactory.ts
import type { DatabaseConfig } from '@/core/config/DatabaseConfig';
import { BaseDatabaseService } from '@/core/server/database/DatabaseService';
import { DatabaseType } from '@/core/server/database/DatabaseServiceFactory';
import { MysqlDatabaseService } from '@/core/server/database/MysqlDatabaseService';
import { PostgresDatabaseService } from '@/core/server/database/PostgresDatabaseService';

export class DatabaseServiceFactory {
  static createDatabaseService(config: DatabaseConfig, type: DatabaseType): BaseDatabaseService {
    switch (type) {
      case DatabaseType.POSTGRES:
        return new PostgresDatabaseService(config);
      case DatabaseType.MYSQL:
        return new MysqlDatabaseService(config);
      case DatabaseType.FLUENCE:
        // Add Fluence service when ready
        throw new Error('Fluence database service not yet implemented');
      case DatabaseType.OTHER:
        throw new Error('Please specify a concrete database type');
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  // Auto-detect from config
  static createFromConfig(config: DatabaseConfig): BaseDatabaseService {
    const detectedType = this.detectTypeFromConfig(config);
    return this.createDatabaseService(config, detectedType);
  }

  // Detection logic using your enum
  private static detectTypeFromConfig(config: DatabaseConfig): DatabaseType {
    if (config.url.includes('postgres')) return DatabaseType.POSTGRES;
    if (config.url.includes('mysql')) return DatabaseType.MYSQL;
    if (config.url.includes('fluence')) return DatabaseType.FLUENCE;
    return DatabaseType.OTHER;
  }
}


