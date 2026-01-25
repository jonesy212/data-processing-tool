// PostgresDatabaseService.tsx
// server/database/PostgresDatabaseService.tsx

import { Client } from "@/core/client/Client";
import type { DatabaseConfig } from "@/core/config/DatabaseConfig";
import { BaseDatabaseService } from '@/core/server/database/DatabaseService';

export class PostgresDatabaseService extends BaseDatabaseService {
  private client: Client;

  constructor(config: DatabaseConfig) {
    super(config); // This calls BaseDatabaseService constructor
    this.client = new Client(config);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async createDatabase(config: DatabaseConfig): Promise<void> {
    try {
      await this.connect();
      await this.client.query(`CREATE DATABASE ${config.database}`);
      console.log(`Database ${config.database} created successfully`);
    } catch (error) {
      console.error("Error creating PostgreSQL database:", error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    try {
      await this.connect();
      const result = await this.client.query(sql, params);
      return result.rows;
    } finally {
      await this.disconnect();
    }
  }

  // Implement other required methods from BaseDatabaseService
  async insert(tableName: string, data: Record<string, any>): Promise<any> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    return await this.query(sql, values);
  }

  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<any> {
    const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + Object.keys(data).length + 1}`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];
    
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    return await this.query(sql, values);
  }

  async delete(tableName: string, where: Record<string, any>): Promise<any> {
    const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const values = Object.values(where);
    
    const sql = `DELETE FROM ${tableName} WHERE ${whereClause} RETURNING *`;
    return await this.query(sql, values);
  }
}

// Utility function for one-off operations
export async function createPostgresDatabase(config: DatabaseConfig): Promise<void> {
  const service = new PostgresDatabaseService(config);
  await service.createDatabase(config);
}
