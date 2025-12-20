// DatabaseMigrationDefinition.ts

import { MigrationEvent } from '@/app/components/database/SchemaEvolutionManager';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { DatabaseType } from '@/app/server/database/DatabaseServiceFactory'
import {
    MigrationContext,
    MigrationDefinition
} from './SchemaEvolutionManager';
import { DatabaseSchema, ServiceSchema } from '@/app/typings/database';
import { ValidationResult } from '@/app/components/database/SchemaEvolutionManager'
import { BackendDatabaseService } from '@/app/typings/database';
import { SharedRelationshipData } from '@/app/models/data/Data'

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