// DatabaseMigrationService.ts
import { ProjectConfig, DatabaseConfig } from '@/app/config/ProjectConfig';
import { LifecycleManager } from '@/app/hooks/phases/LifecycleManager';
import { Phase } from "@/app/models/phases/Phase";
import { useButtonGeneratorProps } from '@/app/generators/GenerateButtons';
import { Schema, DatabaseSchema as BaseDatabaseSchema } from '@/app/typings/database';
import { IDatabaseService, DatabaseType } from '@/app/typings/database';
import { PhaseEntity,
PhaseK,
PhaseMeta,
PhaseAttachment,
PhaseExcludedFields,
PhaseIncludedFields } from '@/app/typings/entities/PhaseEntity'
// Extend the base interfaces with migration-specific types
export interface Database extends IDatabaseService {
  type: DatabaseType;
  config: DatabaseConfig;
  migrateSchema(schema: DatabaseSchema): Promise<void>;
}

export interface DatabaseSchema extends BaseDatabaseSchema {
  tables: TableSchema[];
  indexes: IndexSchema[];
  relationships: RelationshipSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  constraints: ConstraintSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: any;
}

export interface IndexSchema {
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
}

export interface RelationshipSchema {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'many-to-one';
}

export interface ConstraintSchema {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
  table: string;
  columns: string[];
  referenceTable?: string;
  referenceColumns?: string[];
  condition?: string;
}

export interface MigrationProgress {
  currentStep: string;
  progress: number;
  totalSteps: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  errors: string[];
}

type LMPhase = Phase<
  PhaseEntity,          // T
  PhaseK,          // K
  PhaseMeta,            // Meta
  PhaseAttachment,      // Attachment
  PhaseExcludedFields,  // Excluded
  PhaseIncludedFields   // Included
>;

class DatabaseMigrationService {
  private lifecycleManager: LifecycleManager;
  private progress: MigrationProgress;

  constructor(private projectConfig: ProjectConfig) {
    this.lifecycleManager = new LifecycleManager({
      phases: [
        {
          name: 'pre-migration',
          subPhases: ['backup', 'validation'],
          hooks: {
            canTransitionTo: (target: LMPhase) => target.name === 'schema-migration',
            condition: async () => false
          }
        },
        {
          name: 'schema-migration',
          subPhases: ['transform', 'create'],
          hooks: {
            handleTransitionTo: (target: LMPhase) => console.log(`Starting ${target.name}`),
            condition: async () => false
          }
        },
        {
          name: 'data-migration',
          subPhases: ['transfer', 'transform'],
          hooks: {
            canTransitionTo: (target: LMPhase) => target.name === 'post-migration',
            handleTransitionTo: (target: LMPhase) => console.log(`Data migration complete`),
            condition: async () => false
          }
        },
        {
          name: 'post-migration',
          subPhases: ['validation', 'cleanup'],
          hooks: {
            canTransitionTo: () => false,
            handleTransitionTo: () => console.log('Migration complete'),
            condition: async () => false
          }
        }
      ],
      initialPhase: 'pre-migration'
    });

    this.progress = {
      currentStep: 'Initializing',
      progress: 0,
      totalSteps: 0,
      status: 'pending',
      errors: []
    };
  }

  async execute(source: Database, target: Database): Promise<void> {
    try {
      this.progress.status = 'running';
      
      await this.lifecycleManager.transitionTo('pre-migration');
      await this.backupExistingData(source);
      
      await this.lifecycleManager.transitionTo('schema-migration');
      await this.transformUserSchema(source, target);
      
      await this.lifecycleManager.transitionTo('data-migration');
      await this.migrateUserRecords(source, target);
      
      await this.lifecycleManager.transitionTo('post-migration');
      await this.validateDataConsistency(source, target);
      await this.cleanupOldData(source);
      
      this.progress.status = 'completed';
      this.progress.progress = 100;
      
    } catch (error) {
      this.progress.status = 'error';
      this.progress.errors.push(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async backupExistingData(source: Database): Promise<void> {
    this.updateProgress('Creating backup', 10);
    
    // Implementation depends on database type
    switch (source.type) {
      case DatabaseType.MYSQL:
        await this.createMySQLBackup(source);
        break;
      case DatabaseType.POSTGRES:
        await this.createPostgreSQLBackup(source);
        break;
      case DatabaseType.FLUENCE:
        await this.createFluenceBackup(source);
        break;
      default:
        throw new Error(`Backup not supported for ${source.type}`);
    }
  }

  private async transformUserSchema(source: Database, target: Database): Promise<void> {
    this.updateProgress('Transforming schema', 30);
    
    const sourceSchema = await this.extractSchema(source);
    const targetSchema = this.convertSchema(sourceSchema, source.type, target.type);
    
    await target.migrateSchema(targetSchema);
  }

  private async migrateUserRecords(source: Database, target: Database): Promise<void> {
    this.updateProgress('Migrating user records', 60);
    
    const batchSize = this.projectConfig.databaseConfig?.batchSize || 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const users = await this.fetchUserBatch(source, offset, batchSize);
      if (users.length === 0) {
        hasMore = false;
        break;
      }

      const transformedUsers = this.transformUserData(users, source.type, target.type);
      await this.insertUserBatch(target, transformedUsers);
      
      offset += batchSize;
      this.updateProgress(`Migrated ${offset} users`, 60 + (30 * offset) / 10000);
    }
  }

  private async validateDataConsistency(source: Database, target: Database): Promise<void> {
    this.updateProgress('Validating data consistency', 90);
    
    // Sample validation - compare record counts
    const sourceCount = await this.getUserCount(source);
    const targetCount = await this.getUserCount(target);
    
    if (sourceCount !== targetCount) {
      throw new Error(`Data inconsistency: source has ${sourceCount} users, target has ${targetCount}`);
    }

    // Validate sample records
    await this.validateSampleRecords(source, target);
  }

  private async cleanupOldData(source: Database): Promise<void> {
    this.updateProgress('Cleaning up old data', 95);
    
    if (this.projectConfig.features.database && this.projectConfig.databaseConfig) {
      // Only cleanup if configured to do so
      await source.query('DROP TABLE IF EXISTS users_backup');
    }
  }

  private async extractMongoDBSchema(database: Database): Promise<DatabaseSchema> {
    try {
      // Get all collections
      const collections = await database.query('db.getCollectionNames()');
      
      const tables: TableSchema[] = [];
      const indexes: IndexSchema[] = [];
      const relationships: RelationshipSchema[] = [];

      for (const collectionName of collections) {
        // Skip system collections
        if (collectionName.startsWith('system.')) continue;

        // Sample documents to infer schema
        const sampleDocs = await database.query(`db.${collectionName}.find().limit(100)`);
        
        // Infer columns from sample documents
        const columns: ColumnSchema[] = this.inferMongoDBColumns(sampleDocs);
        
        // Get collection indexes
        const collectionIndexes = await database.query(`db.${collectionName}.getIndexes()`);
        
        // Convert MongoDB indexes to IndexSchema
        const tableIndexes = this.convertMongoDBIndexes(collectionName, collectionIndexes);
        indexes.push(...tableIndexes);

        // Create table schema
        const tableSchema: TableSchema = {
          name: collectionName,
          columns,
          constraints: this.inferMongoDBConstraints(columns)
        };

        tables.push(tableSchema);

        // Infer relationships from embedded documents and references
        const inferredRelationships = await this.inferMongoDBRelationships(database, collectionName, sampleDocs);
        relationships.push(...inferredRelationships);
      }

      return {
        tables,
        indexes,
        relationships
      };
    } catch (error) {
      console.error('Error extracting MongoDB schema:', error);
      throw new Error(`Failed to extract MongoDB schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private inferMongoDBColumns(documents: any[]): ColumnSchema[] {
    if (documents.length === 0) {
      return [
        {
          name: '_id',
          type: 'ObjectId',
          nullable: false,
          primaryKey: true
        }
      ];
    }

    const columnMap = new Map<string, ColumnSchema>();
    
    // Always include _id field
    columnMap.set('_id', {
      name: '_id',
      type: 'ObjectId',
      nullable: false,
      primaryKey: true
    });

    // Analyze all documents to find all fields and their types
    for (const doc of documents) {
      this.analyzeMongoDBDocument(doc, '', columnMap);
    }

    return Array.from(columnMap.values());
  }

  private analyzeMongoDBDocument(doc: any, prefix: string, columnMap: Map<string, ColumnSchema>): void {
    if (!doc || typeof doc !== 'object') return;

    for (const [key, value] of Object.entries(doc)) {
      if (key === '_id') continue; // Already handled

      const fullPath = prefix ? `${prefix}.${key}` : key;
      const type = this.getMongoDBType(value);
      
      // Check if this is an embedded document (needs relationship)
      if (type === 'embedded' && value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively analyze embedded document
        this.analyzeMongoDBDocument(value, fullPath, columnMap);
      } else if (type === 'array' && Array.isArray(value) && value.length > 0) {
        // Handle arrays - check if it's an array of embedded documents
        const firstElement = value[0];
        if (firstElement && typeof firstElement === 'object' && !Array.isArray(firstElement)) {
          // Array of embedded documents
          columnMap.set(fullPath, {
            name: fullPath,
            type: 'array[embedded]',
            nullable: true,
            primaryKey: false
          });
          // Analyze first element to understand structure
          this.analyzeMongoDBDocument(firstElement, `${fullPath}[0]`, columnMap);
        } else {
          // Regular array
          const elementType = this.getMongoDBType(firstElement);
          columnMap.set(fullPath, {
            name: fullPath,
            type: `array[${elementType}]`,
            nullable: true,
            primaryKey: false
          });
        }
      } else {
        // Regular field
        if (!columnMap.has(fullPath)) {
          columnMap.set(fullPath, {
            name: fullPath,
            type,
            nullable: true, // MongoDB fields are generally nullable
            primaryKey: false
          });
        } else {
          // Update type if we found a different type (handle polymorphism)
          const existing = columnMap.get(fullPath)!;
          if (existing.type !== type) {
            existing.type = 'mixed'; // Multiple types found
          }
        }
      }
    }
  }

  private getMongoDBType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    switch (type) {
      case 'string':
        // Check for common MongoDB types
        if (this.isObjectId(value)) return 'ObjectId';
        if (this.isDate(value)) return 'Date';
        if (this.isBinary(value)) return 'Binary';
        return 'string';
        
      case 'number':
        // Check if it's integer or double
        return Number.isInteger(value) ? 'int' : 'double';
        
      case 'boolean':
        return 'boolean';
        
      case 'object':
        if (Array.isArray(value)) return 'array';
        if (this.isDateObject(value)) return 'Date';
        if (this.isObjectIdObject(value)) return 'ObjectId';
        if (this.isBinaryObject(value)) return 'Binary';
        return 'embedded'; // Embedded document
        
      default:
        return 'unknown';
    }
  }

  private isObjectId(value: any): boolean {
    return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
  }

  private isDate(value: any): boolean {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  }

  private isBinary(value: any): boolean {
    return typeof value === 'string' && value.startsWith('BinData(');
  }

  private isDateObject(value: any): boolean {
    return value instanceof Date || (value && value.constructor.name === 'Date');
  }

  private isObjectIdObject(value: any): boolean {
    return value && value.constructor.name === 'ObjectId';
  }

  private isBinaryObject(value: any): boolean {
    return value && value.constructor.name === 'Binary';
  }

  private convertMongoDBIndexes(collectionName: string, mongoIndexes: any[]): IndexSchema[] {
    return mongoIndexes.map((index, idx) => {
      // Skip _id_ index as it's the primary key
      if (index.name === '_id_') return null;

      const indexColumns = Object.keys(index.key);
      
      return {
        name: index.name || `index_${collectionName}_${idx}`,
        table: collectionName,
        columns: indexColumns,
        unique: index.unique || false
      };
    }).filter(Boolean) as IndexSchema[];
  }

  private inferMongoDBConstraints(columns: ColumnSchema[]): ConstraintSchema[] {
    const constraints: ConstraintSchema[] = [];

    // Primary key constraint (always _id in MongoDB)
    const primaryKeyColumn = columns.find(col => col.primaryKey);
    if (primaryKeyColumn) {
      constraints.push({
        name: 'primary_key',
        type: 'primary_key',
        table: '', // Will be set by caller
        columns: [primaryKeyColumn.name]
      });
    }

    // Unique constraints would need to be inferred from indexes
    // This is handled in convertMongoDBIndexes

    return constraints;
  }

  private async inferMongoDBRelationships(
    database: Database, 
    collectionName: string, 
    sampleDocs: any[]
  ): Promise<RelationshipSchema[]> {
    const relationships: RelationshipSchema[] = [];

    for (const doc of sampleDocs) {
      if (!doc) continue;

      // Look for reference fields (fields that contain ObjectIds pointing to other collections)
      for (const [key, value] of Object.entries(doc)) {
        if (this.isReferenceField(value)) {
          // Try to determine the target collection
          const targetCollection = await this.guessTargetCollection(database, key, value);
          
          if (targetCollection) {
            relationships.push({
              name: `${collectionName}_${key}_${targetCollection}`,
              fromTable: collectionName,
              fromColumn: key,
              toTable: targetCollection,
              toColumn: '_id',
              type: 'many-to-one' // MongoDB references are typically many-to-one
            });
          }
        } else if (this.isEmbeddedDocument(value) && typeof value === 'object') {
          // Embedded document - create a one-to-one relationship
          relationships.push({
            name: `${collectionName}_${key}_embedded`,
            fromTable: collectionName,
            fromColumn: key,
            toTable: `${collectionName}_${key}`, // Virtual table for embedded doc
            toColumn: '_id',
            type: 'one-to-one'
          });
        }
      }
    }

    return relationships;
  }

  private isReferenceField(value: any): boolean {
    if (typeof value === 'string') {
      return this.isObjectId(value);
    }
    if (value && typeof value === 'object') {
      return this.isObjectIdObject(value);
    }
    return false;
  }

  private isEmbeddedDocument(value: any): boolean {
    return value && 
          typeof value === 'object' && 
          !Array.isArray(value) && 
          !this.isDateObject(value) && 
          !this.isObjectIdObject(value) && 
          !this.isBinaryObject(value);
  }

  private async guessTargetCollection(database: Database, fieldName: string, referenceValue: any): Promise<string | null> {
    // Common naming patterns for reference fields
    const commonPatterns = [
      fieldName.replace(/Id$/, ''), // userId -> user
      fieldName.replace(/Ref$/, ''), // userRef -> user
      fieldName.replace(/^_/, ''),   // _user -> user
    ];

    const collections = await database.query('db.getCollectionNames()');
    
    for (const pattern of commonPatterns) {
      if (collections.includes(pattern)) {
        return pattern;
      }
    }

    // If no pattern matches, try to find a collection that might contain this reference
    for (const collection of collections) {
      if (collection.startsWith('system.')) continue;
      
      // Check if this collection has documents with this _id
      try {
        const result = await database.query(`db.${collection}.findOne({_id: ${this.formatMongoValue(referenceValue)})`);
        if (result) {
          return collection;
        }
      } catch (error) {
        // Continue to next collection
        continue;
      }
    }

    return null;
  }

  private formatMongoValue(value: any): string {
    if (typeof value === 'string') {
      return `ObjectId("${value}")`;
    }
    if (value && typeof value === 'object' && this.isObjectIdObject(value)) {
      return `ObjectId("${value.toString()}")`;
    }
    return JSON.stringify(value);
  }

  // Helper methods
  private updateProgress(step: string, progress: number): void {
    this.progress.currentStep = step;
    this.progress.progress = progress;
    // Emit progress event or update UI
    console.log(`Migration Progress: ${step} - ${progress}%`);
  }

  private async extractSchema(database: Database): Promise<DatabaseSchema> {
    // Implementation varies by database type
    switch (database.type) {
      case DatabaseType.MYSQL:
        return this.extractMySQLSchema(database);
      case DatabaseType.POSTGRES:
        return this.extractPostgreSQLSchema(database);
      case DatabaseType.FLUENCE:
        return this.extractFluenceSchema(database);
      default:
        throw new Error(`Schema extraction not supported for ${database.type}`);
    }
  }

  private convertSchema(
    sourceSchema: DatabaseSchema, 
    sourceType: DatabaseType, 
    targetType: DatabaseType
  ): DatabaseSchema {
    // Convert schema from source to target database type
    // This would include type mapping, constraint conversion, etc.
    return {
      ...sourceSchema,
      tables: sourceSchema.tables.map(table => this.convertTableSchema(table, sourceType, targetType))
    };
  }

  private convertTableSchema(table: TableSchema, sourceType: DatabaseType, targetType: DatabaseType): TableSchema {
    // Convert column types and constraints between database systems
    return {
      ...table,
      columns: table.columns.map(column => this.convertColumn(column, sourceType, targetType))
    };
  }

  private convertColumn(column: ColumnSchema, sourceType: DatabaseType, targetType: DatabaseType): ColumnSchema {
    // Map data types between different database systems
    const typeMapping: Record<string, Record<string, string>> = {
      [DatabaseType.MYSQL]: {
        [DatabaseType.POSTGRES]: this.mysqlToPostgresType(column.type),
        [DatabaseType.FLUENCE]: 'string' // Fluence uses different type system
      },
      [DatabaseType.POSTGRES]: {
        [DatabaseType.MYSQL]: this.postgresToMySQLType(column.type)
      }
    };

    return {
      ...column,
      type: typeMapping[sourceType]?.[targetType] || column.type
    };
  }

  private mysqlToPostgresType(mysqlType: string): string {
    const mapping: Record<string, string> = {
      'int': 'integer',
      'varchar': 'text',
      'datetime': 'timestamp',
      'tinyint': 'boolean'
    };
    return mapping[mysqlType] || mysqlType;
  }

  private postgresToMySQLType(postgresType: string): string {
    const mapping: Record<string, string> = {
      'integer': 'int',
      'text': 'varchar(255)',
      'timestamp': 'datetime',
      'boolean': 'tinyint(1)'
    };
    return mapping[postgresType] || postgresType;
  }

  // Database-specific implementations
  private async createMySQLBackup(database: Database): Promise<void> {
    await database.query('CREATE TABLE users_backup AS SELECT * FROM users');
  }

  private async createPostgreSQLBackup(database: Database): Promise<void> {
    await database.query('CREATE TABLE users_backup AS SELECT * FROM users');
  }

  private async createFluenceBackup(database: Database): Promise<void> {
    // Fluence backup logic - would use Fluence-specific queries
    await database.query('BACKUP users TO users_backup');
  }

  private async extractMySQLSchema(database: Database): Promise<DatabaseSchema> {
    const tables = await database.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = DATABASE()
    `);
    
    // Transform to DatabaseSchema format
    return { 
      tables: [], 
      indexes: [], 
      relationships: [] 
    }; // Simplified - implement full schema extraction
  }

  private async extractPostgreSQLSchema(database: Database): Promise<DatabaseSchema> {
    const tables = await database.query(`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);
    
    return { 
      tables: [], 
      indexes: [], 
      relationships: [] 
    };
  }

  private async extractFluenceSchema(database: Database): Promise<DatabaseSchema> {
    // Fluence-specific schema extraction
    return { 
      tables: [], 
      indexes: [], 
      relationships: [] 
    };
  }

  private async fetchUserBatch(database: Database, offset: number, limit: number): Promise<any[]> {
    switch (database.type) {
      case DatabaseType.MYSQL:
      case DatabaseType.POSTGRES:
        return database.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, offset]);
      case DatabaseType.FLUENCE:
        return database.query('SELECT * FROM users SKIP ? LIMIT ?', [offset, limit]);
      default:
        return [];
    }
  }

  private transformUserData(users: any[], sourceType: DatabaseType, targetType: DatabaseType): any[] {
    return users.map(user => {
      // Transform user data based on source and target database types
      const transformed = { ...user };
      
      // Example transformations
      if (sourceType === DatabaseType.MYSQL && targetType === DatabaseType.POSTGRES) {
        // Convert MySQL specific formats to PostgreSQL
        if (transformed.created_at) {
          transformed.created_at = new Date(transformed.created_at).toISOString();
        }
      }
      
      return transformed;
    });
  }

  private async insertUserBatch(database: Database, users: any[]): Promise<void> {
    switch (database.type) {
      case DatabaseType.MYSQL:
      case DatabaseType.POSTGRES:
        // Batch insert for SQL databases
        const placeholders = users.map(() => '(?)').join(',');
        await database.query(`INSERT INTO users VALUES ${placeholders}`, users.flat());
        break;
      case DatabaseType.FLUENCE:
        // Fluence-specific batch insert
        for (const user of users) {
          await database.insert('users', user);
        }
        break;
    }
  }

  private async getUserCount(database: Database): Promise<number> {
    switch (database.type) {
      case DatabaseType.MYSQL:
      case DatabaseType.POSTGRES:
        const result = await database.query('SELECT COUNT(*) as count FROM users');
        return result[0].count;
      case DatabaseType.FLUENCE:
        const fluenceResult = await database.query('SELECT COUNT(*) FROM users');
        return fluenceResult[0].count;
      default:
        return 0;
    }
  }

  private async validateSampleRecords(source: Database, target: Database): Promise<void> {
    // Validate a sample of records to ensure data integrity
    const sampleUsers = await this.fetchUserBatch(source, 0, 10);
    
    for (const user of sampleUsers) {
      const targetUser = await this.findUserById(target, user.id);
      if (!this.areUsersEqual(user, targetUser)) {
        throw new Error(`User ${user.id} validation failed`);
      }
    }
  }

  private async findUserById(database: Database, id: string): Promise<any> {
    switch (database.type) {
      case DatabaseType.MYSQL:
      case DatabaseType.POSTGRES:
        const result = await database.query('SELECT * FROM users WHERE id = ?', [id]);
        return result[0];
      case DatabaseType.FLUENCE:
        const fluenceResult = await database.query('SELECT * FROM users WHERE id = ?', [id]);
        return fluenceResult[0];
      default:
        return null;
    }
  }

  private areUsersEqual(user1: any, user2: any): boolean {
    // Compare critical fields for equality
    return user1.id === user2.id && 
           user1.email === user2.email && 
           user1.username === user2.username;
  }

  getProgress(): MigrationProgress {
    return { ...this.progress };
  }
}

export default DatabaseMigrationService;