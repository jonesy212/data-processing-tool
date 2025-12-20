// database.ts
import { DatabaseConfig } from '@/app/config/DatabaseConfig';

export interface BackendDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  insert(tableName: string, data: Record<string, any>): Promise<any>;
  update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<any>;
  delete(tableName: string, where: Record<string, any>): Promise<any>;
  createDatabase(config: DatabaseConfig): Promise<void>;
}

export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  FLUENCE = 'fluence',
}

interface StructuredBackend {
  structureHash: string | undefined;
  getStructureHash(): Promise<string | undefined>;
  setStructureHash(hash: string): Promise<void>;
}

interface Schema {
  [key: string]: any;
}

interface DatabaseSchema extends Schema {}
interface ServiceSchema extends Schema {}
interface StructureSchema extends Schema {}

export type { Schema, DatabaseSchema, ServiceSchema, StructureSchema, StructuredBackend }