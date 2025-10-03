// DatabaseTypes.ts
// Frontend-safe types and interfaces only - NO pg imports!

export interface DatabaseQuery {
  query: string;
  params?: any[];
}

export interface DatabaseConfig {
  url: string;
  host: string;
  username: string;
  password: string;
  database?: string;
  authToken: string | undefined;
  port: number;
  saveUserProfiles?(userProfiles: any[]): Promise<void>;
}

export interface DatabaseService {
  createDatabase(config: DatabaseConfig, databaseQuery: string): Promise<any>;
  insertData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  updateData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  deleteData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  queryData(config: DatabaseConfig, operation: string, databaseQuery: string): Promise<any>;
  findOne(params: { tableName: string; query: { id: string } }): Promise<any>;
  update(data: any, whereClause: any): Promise<any>;
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


export { DatabaseConfig, DatabaseQuery, DatabaseService };