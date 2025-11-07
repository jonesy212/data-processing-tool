// database.ts
import { DatabaseConfig } from '@/app/config/DatabaseConfig';

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  insert(tableName: string, data: Record<string, any>): Promise<any>;
  update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<any>;
  delete(tableName: string, where: Record<string, any>): Promise<any>;
  createDatabase(config: DatabaseConfig): Promise<void>;
}

// In your database types file, ensure it's defined like this:
export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  FLUENCE = 'fluence',
  // MONGODB = 'mongodb'
  // etc...
}