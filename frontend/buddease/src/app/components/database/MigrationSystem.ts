// DatabaseMigrationDefinition.ts

import { 
  MigrationDefinition, 
  MigrationContext, 
  MigrationType, 
  MigrationStatus,
  RelationshipDefinition,
  Constraint,
  SchemaEvolutionManager
} from './SchemaEvolutionManager';
import { MigrationEvent } from '@/app/components/database/SchemaEvolutionManager'
import { DatabaseType } from '@/app/typings/database';

// Add Database-specific migration types
export interface DatabaseMigrationDefinition<T, K, Meta> extends MigrationDefinition<T, K, Meta> {
  sourceType: DatabaseType;
  targetType: DatabaseType;
  
  // Database-specific properties
  batchSize?: number;
  skipValidation?: boolean;
  preserveSource?: boolean;
  
  // Schema transformation
  typeMappings?: Record<string, string>;
  columnTransformations?: Record<string, (value: any) => any>;
  
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
  sourceDatabase: IDatabaseService;
  targetDatabase: IDatabaseService;
  
  // Database-specific operations
  createBackup(database: IDatabaseService, tableName: string): Promise<string>;
  restoreBackup(database: IDatabaseService, backupId: string): Promise<void>;
  
  // Schema operations
  extractSchema(database: IDatabaseService): Promise<DatabaseSchema>;
  transformSchema(
    schema: DatabaseSchema, 
    sourceType: DatabaseType, 
    targetType: DatabaseType
  ): Promise<DatabaseSchema>;
  applySchema(database: IDatabaseService, schema: DatabaseSchema): Promise<void>;
  
  // Data operations
  fetchDataBatch(
    database: IDatabaseService, 
    tableName: string, 
    offset: number, 
    limit: number
  ): Promise<T[]>;
  
  insertDataBatch(
    database: IDatabaseService, 
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