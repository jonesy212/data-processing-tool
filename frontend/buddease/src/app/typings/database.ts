// database.ts
export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  insert(tableName: string, data: Record<string, any>): Promise<any>;
  update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<any>;
  delete(tableName: string, where: Record<string, any>): Promise<any>;
  createDatabase(config: DatabaseConfig): Promise<void>;
}

export type DatabaseType = 'postgres' | 'mysql';