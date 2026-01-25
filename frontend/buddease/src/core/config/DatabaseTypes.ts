// DatabaseTypes.ts
// Frontend-safe types and interfaces only - NO pg imports!
import type { DatabaseConfig } from '@/core/config/DatabaseConfig';

interface DatabaseQuery {
  query: string;
  params?: any[];
}

interface ClientDatabaseService {
  createDatabase(config: DatabaseConfig, databaseQuery: string): Promise<any>;
  insertData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  updateData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  deleteData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  queryData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  findOne(params: { tableName: string; query: Record<string, any> }): Promise<any>;
  update(tableName: string, whereClause: any, data: any): Promise<any>;
  create(data: any): Promise<any>;
  insert(data: any, modelData: any): Promise<any>;
  disconnect(): void;
  confirmDisconnect(message: string): Promise<boolean>;
  findAll(tableName: string): Promise<any[]>;
  count(): Promise<number>;
  bulkCreate(data: any[]): Promise<any[]>;
  findAllByAttribute(table: string, column: string, value: any): Promise<any[]>;
  findByAttribute(table: string, column: string, value: any): Promise<any>;
  aggregate(aggregation: any): Promise<any>;
  upsert(data: any): Promise<any>;
  transaction(operations: any[]): Promise<any>;
  batchInsert(data: any[]): Promise<any[]>;
}


export type { ClientDatabaseService, DatabaseQuery };
