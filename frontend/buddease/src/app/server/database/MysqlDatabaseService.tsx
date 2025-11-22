import { BaseDatabaseService } from "@/app/server/database/DatabaseService";
import mysql, { Pool } from "mysql";
import { DatabaseConfig } from "@/app/config/DatabaseConfig";

export class MysqlDatabaseService extends BaseDatabaseService {

 constructor(config: DatabaseConfig) {
    super(config);
    (this as any).pool = mysql.createPool({
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port,
    });
  }

  async createDatabase(config: DatabaseConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const tempPool = mysql.createPool({
        host: config.host,
        user: config.username,
        password: config.password
      });

      tempPool.getConnection((err, conn) => {
        if (err) return reject(err);

        conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``, (error) => {
          conn.release();
          tempPool.end();

          if (error) return reject(error);

          console.log(`✅ MySQL Database "${config.database}" ensured`);
          resolve();
        });
      });
    });
  }
    // Implement required abstract methods
  async insert(tableName: string, data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const query = `INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`;
    return new Promise((resolve, reject) => {
      (this as any).pool.query(query, values, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async update(tableName: string, data: Record<string, any>, where: Record<string, any>): Promise<any> {
    const setClause = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
    return new Promise((resolve, reject) => {
      (this as any).pool.query(query, values, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async delete(tableName: string, where: Record<string, any>): Promise<any> {
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(where);
    const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
    return new Promise((resolve, reject) => {
      (this as any).pool.query(query, values, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async findOne(params: { tableName: string; query: Record<string, any> }): Promise<any> {
    const { tableName, query } = params;
    const whereClause = Object.keys(query).map(k => `${k} = ?`).join(' AND ');
    const values = Object.values(query);
    const sql = `SELECT * FROM ${tableName} WHERE ${whereClause} LIMIT 1`;
    return new Promise((resolve, reject) => {
      (this as any).pool.query(sql, values, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result[0] || null);
      });
    });
  }

  async findAll(tableName?: string): Promise<any[]> {
    if (!tableName) throw new Error("tableName is required");
    return new Promise((resolve, reject) => {
      (this as any).pool.query(`SELECT * FROM ${tableName}`, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async query(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      (this as any).pool.query(sql, params, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}
