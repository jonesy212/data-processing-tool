// MigrationSystem.ts

import type { BackendDatabaseService } from '@/core/typings/database'
import type { MigrationEvent } from '@/core/components/database/SchemaEvolutionManager';
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { DatabaseType } from '@/core/server/database/DatabaseServiceFactory';
import type { DatabaseSchema } from '@/core/typings/database';
import type {
    MigrationContext,
    MigrationDefinition
} from './SchemaEvolutionManager';

// Add Database-specific migration types
export interface DatabaseMigrationDefinition<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends MigrationDefinition<T, K, Meta> {
  sourceType: DatabaseType;
  targetType: DatabaseType;

  // Database-specific properties
  batchSize?: number;
  skipValidation?: boolean;
  preserveSource?: boolean;
  
  // Schema transformation
  fieldTypeMappings?: Record<string, string>;
  columnTransformations?: Record<string, (value: any, context: MigrationContext<T, K, Meta>) => any>
  
  // Data migration strategy
  migrationStrategy: 'copy' | 'transform' | 'merge' | 'incremental';
  conflictResolution: 'overwrite' | 'skip' | 'merge' | 'error';
}

// Enhanced Migration Context with database operations
export interface DatabaseMigrationContext<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> extends MigrationContext<T, K, Meta> {
  
  // Database connections
  sourceDatabase: BackendDatabaseService;
  targetDatabase: BackendDatabaseService;
  
  // Database-specific operations
  createBackup(database: BackendDatabaseService, tableName: string): Promise<string>;
  restoreBackup(database: BackendDatabaseService, backupId: string): Promise<void>;
  
  // Schema operations
  extractSchema(database: BackendDatabaseService): Promise<DatabaseSchema>;
  transformSchema(
    schema: DatabaseSchema, 
    sourceType: DatabaseType, 
    targetType: DatabaseType
  ): Promise<DatabaseSchema>;
  applySchema(database: BackendDatabaseService, schema: DatabaseSchema): Promise<void>;
  
  // Data operations
  fetchDataBatch(
    database: BackendDatabaseService, 
    tableName: string, 
    offset: number, 
    limit: number
  ): Promise<T[]>;
  
  insertDataBatch(
    database: BackendDatabaseService, 
    tableName: string, 
    data: T[]
  ): Promise<void>;
  
  validateDataConsistency(
    sourceData: T[], 
    targetData: T[]
  ): Promise<ValidationResult[]>;
  
  // Progress tracking
  updateProgress(step: string, percentage: number): void;
  logMigrationEvent(event: MigrationEvent): void;
}