DatabaseClient.ts
import type { BaseDataEntity } from '@/core/config/BaseConfig';
import { AxiosResponse } from "axios";

import internalApiService from '@/core/api/ApiClient';
import { endpoints } from "@/core/api/endpointConfigurations";
import { DatabaseConfig, defaultDatabaseConfig } from '@/core/config/DatabaseConfig';
import { DatasetModel } from "@/core/todos/tasks/DataSetModel";
import { buildUrl } from '@/utils/urlBuilder';
import { NextRequest, NextResponse } from 'next/server';
import {
    Pool,
    PoolConfig,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow
} from "pg";


const pg = require('pg');
pg.defaults.ssl = { rejectUnauthorized: false };
pg.native = null; // ← This disables pg-native

class DatabaseClient {
  private pool: Pool;
  private config: PoolConfig;

  // Option A: Make config optional with default
  constructor(config?: PoolConfig) {
    this.config = config || this.getDefaultConfig();
    this.pool = new Pool({
      ...this.config,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  private getDefaultConfig(): PoolConfig {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'your_database',
      user: process.env.DB_USER || 'your_username',
      password: process.env.DB_PASSWORD || 'your_password',
    };
  }

  private async apiRequestHandler(
    request: () => Promise<AxiosResponse>,
    successMessage: string,
    errorMessage: string
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();
      console.log(successMessage, response.data);
      return response;
    } catch (error: any) {
      console.error(errorMessage, error);
      throw error;
    }
  }



  async createDataset(datasetData: any): Promise<any> {
    try {
      // First, create the datasets table if it doesn't exist
      await this.createDatasetsTableIfNotExists();

      const sql = `
        INSERT INTO datasets (
          id, name, description, file_name, file_size, file_type, 
          file_path, storage_path, user_id, tags, upload_date, 
          last_modified, status, row_count, column_count, 
          column_names, sample_data, statistics, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *
      `;

      const values = [
        datasetData.id,
        datasetData.name,
        datasetData.description,
        datasetData.fileName,
        datasetData.fileSize,
        datasetData.fileType,
        datasetData.filePath,
        datasetData.storagePath,
        datasetData.userId,
        JSON.stringify(datasetData.tags), // Store tags as JSON array
        datasetData.uploadDate,
        datasetData.lastModified,
        datasetData.status,
        datasetData.rowCount,
        datasetData.columnCount,
        JSON.stringify(datasetData.columnNames), // Store as JSON array
        JSON.stringify(datasetData.sampleData),  // Store as JSON
        JSON.stringify(datasetData.statistics),  // Store as JSON
        JSON.stringify(datasetData.metadata)     // Store as JSON
      ];

      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating dataset:", error);
      throw error;
    }
  }

  // Add this method: Get all datasets
  async getDatasets(): Promise<any[]> {
    try {
      // Create table if it doesn't exist (for first-time use)
      await this.createDatasetsTableIfNotExists();

      const sql = `
        SELECT * FROM datasets 
        ORDER BY upload_date DESC
      `;

      const result = await this.pool.query(sql);
      return result.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : [],
        column_names: row.column_names ? JSON.parse(row.column_names) : [],
        sample_data: row.sample_data ? JSON.parse(row.sample_data) : [],
        statistics: row.statistics ? JSON.parse(row.statistics) : {},
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      }));
    } catch (error) {
      console.error("Error fetching datasets:", error);
      return [];
    }
  }

  // Add this helper method: Create datasets table if not exists
  private async createDatasetsTableIfNotExists(): Promise<void> {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS datasets (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          file_name VARCHAR(255) NOT NULL,
          file_size BIGINT NOT NULL,
          file_type VARCHAR(100),
          file_path VARCHAR(500) NOT NULL,
          storage_path VARCHAR(500) NOT NULL,
          user_id VARCHAR(255),
          tags JSONB,
          upload_date TIMESTAMP NOT NULL,
          last_modified TIMESTAMP NOT NULL,
          status VARCHAR(50) DEFAULT 'uploaded',
          row_count INTEGER DEFAULT 0,
          column_count INTEGER DEFAULT 0,
          column_names JSONB,
          sample_data JSONB,
          statistics JSONB,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
        CREATE INDEX IF NOT EXISTS idx_datasets_upload_date ON datasets(upload_date);
        CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);
      `;

      await this.pool.query(sql);
      console.log("Datasets table created or already exists");
    } catch (error) {
      console.error("Error creating datasets table:", error);
      throw error;
    }
  }

  // Add this method: Get dataset by ID
  async getDatasetById(datasetId: string): Promise<any | null> {
    try {
      const sql = `
        SELECT * FROM datasets WHERE id = $1
      `;

      const result = await this.pool.query(sql, [datasetId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : [],
        column_names: row.column_names ? JSON.parse(row.column_names) : [],
        sample_data: row.sample_data ? JSON.parse(row.sample_data) : [],
        statistics: row.statistics ? JSON.parse(row.statistics) : {},
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      };
    } catch (error) {
      console.error("Error fetching dataset by ID:", error);
      return null;
    }
  }

  // Add this method: Delete dataset
  async deleteDataset(datasetId: string): Promise<boolean> {
    try {
      // First get the dataset to get file path
      const dataset = await this.getDatasetById(datasetId);

      if (!dataset) {
        return false;
      }

      // Delete from database
      const sql = `
        DELETE FROM datasets WHERE id = $1 RETURNING *
      `;

      const result = await this.pool.query(sql, [datasetId]);

      if (result.rows.length === 0) {
        return false;
      }

      // Try to delete the physical file
      try {
        const fs = require('fs');
        if (fs.existsSync(dataset.storage_path)) {
          fs.unlinkSync(dataset.storage_path);
          console.log(`Deleted file: ${dataset.storage_path}`);
        }
      } catch (fileError) {
        console.warn("Could not delete physical file:", fileError);
      }

      return true;
    } catch (error) {
      console.error("Error deleting dataset:", error);
      return false;
    }
  }

  // Add this method: Update dataset
  async updateDataset(datasetId: string, updates: any): Promise<any | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Build dynamic SET clause
      Object.keys(updates).forEach(key => {
        if (key === 'tags' || key === 'column_names' || key === 'sample_data' ||
          key === 'statistics' || key === 'metadata') {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(JSON.stringify(updates[key]));
        } else if (key === 'last_modified') {
          // Skip, we'll handle this separately
          return;
        } else {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
        }
        paramIndex++;
      });

      // Always update last_modified
      setClauses.push('last_modified = $' + paramIndex);
      values.push(new Date().toISOString());
      paramIndex++;

      // Add datasetId as the last parameter
      values.push(datasetId);

      const sql = `
        UPDATE datasets 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(sql, values);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : [],
        column_names: row.column_names ? JSON.parse(row.column_names) : [],
        sample_data: row.sample_data ? JSON.parse(row.sample_data) : [],
        statistics: row.statistics ? JSON.parse(row.statistics) : {},
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      };
    } catch (error) {
      console.error("Error updating dataset:", error);
      throw error;
    }
  }

  // Add this method: Search datasets
  async searchDatasets(searchTerm: string, filters?: any): Promise<any[]> {
    try {
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Add search term condition
      if (searchTerm) {
        whereClauses.push(`(
          name ILIKE $${paramIndex} OR 
          description ILIKE $${paramIndex} OR
          tags::text ILIKE $${paramIndex}
        )`);
        values.push(`%${searchTerm}%`);
        paramIndex++;
      }

      // Add filter conditions
      if (filters) {
        if (filters.userId) {
          whereClauses.push(`user_id = $${paramIndex}`);
          values.push(filters.userId);
          paramIndex++;
        }

        if (filters.fileType) {
          whereClauses.push(`file_type = $${paramIndex}`);
          values.push(filters.fileType);
          paramIndex++;
        }

        if (filters.minDate) {
          whereClauses.push(`upload_date >= $${paramIndex}`);
          values.push(filters.minDate);
          paramIndex++;
        }

        if (filters.maxDate) {
          whereClauses.push(`upload_date <= $${paramIndex}`);
          values.push(filters.maxDate);
          paramIndex++;
        }

        if (filters.tags && filters.tags.length > 0) {
          const tagConditions = filters.tags.map((tag: string, index: number) => {
            whereClauses.push(`tags::text ILIKE $${paramIndex + index}`);
            values.push(`%${tag}%`);
          });
          paramIndex += filters.tags.length;
        }
      }

      // Build WHERE clause
      const whereClause = whereClauses.length > 0
        ? `WHERE ${whereClauses.join(' AND ')}`
        : '';

      const sql = `
        SELECT * FROM datasets 
        ${whereClause}
        ORDER BY upload_date DESC
        LIMIT 100
      `;

      const result = await this.pool.query(sql, values);

      return result.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : [],
        column_names: row.column_names ? JSON.parse(row.column_names) : [],
        sample_data: row.sample_data ? JSON.parse(row.sample_data) : [],
        statistics: row.statistics ? JSON.parse(row.statistics) : {},
        metadata: row.metadata ? JSON.parse(row.metadata) : {}
      }));
    } catch (error) {
      console.error("Error searching datasets:", error);
      return [];
    }
  }

  // Method to connect to the database
  async connect(): Promise<void> {
    try {
      // No need to check if already connected as `pg` handles connection pooling internally
      // Connect to the database using the configured pool
      await this.pool.connect();

      console.log("Connected to the database.");
    } catch (error) {
      console.error("Error connecting to the database:", error);
      throw error;
    }
  }


  async insert<
    T extends Record<string, any>
  >(
    tableName: string,
    data: T,
    additionalString?: string
  ): Promise<any> {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');

      let sql = `INSERT INTO ${tableName} (${columns}${additionalString ? ", additionalString" : ""
        }) VALUES(${placeholders}${additionalString ? ", $" + (Object.keys(data).length + 1) : ""
        }) RETURNING *`;

      const values = [
        ...Object.values(data),
        ...(additionalString ? [additionalString] : []),
      ];

      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error inserting data:", error);
      throw error;
    }
  }


  // Method to execute a query
  async query<R extends QueryResultRow = any, I = any[]>(
    queryTextOrConfig: string | QueryConfig<I>,
    values?: QueryConfigValues<I>
  ): Promise<QueryResult<R>> {
    try {
      let result: QueryResult<R>;
      if (values) {
        // If values are provided, execute the query with values
        result = await this.pool.query(queryTextOrConfig, values);
      } else {
        // If values are not provided, execute the query without values
        result = await this.pool.query(queryTextOrConfig);
      }

      console.log("Query executed successfully:", queryTextOrConfig);
      return result;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  // Method to close the database connection
  async close(): Promise<void> {
    try {
      // Close the pool to release all resources
      await this.pool.end();

      console.log("Database connection closed.");
    } catch (error) {
      console.error("Error closing database connection:", error);
      throw error;
    }
  }

  // Method to upload a dataset
  static async uploadDataset<
    T extends BaseDataEntity,
    K extends T = T
  >(formData: FormData): Promise<DatasetModel<T, K> | null> {
    try {
      const endpoint = endpoints.data.uploadData; // Use endpoint configuration
      const url = buildUrl(endpoint); // Even for endpoints without params
      const response = await internalApiService.post<DatasetModel<T, K>>(
        url,
        formData,
        {
          config: {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading dataset:", error);
      return null;
    }
  }

  // Method to run a hypothesis test

  static async runHypothesisTest(
    datasetId: number,
    testType: string
  ): Promise<void> {
    try {
      const endpoint = endpoints.data.hypothesisTest;
      const url = buildUrl(endpoint, { datasetId, testType }); // Use URL builder
      await internalApiService.post(url, { datasetId, testType });
      console.log("Hypothesis test executed successfully");
    } catch (error) {
      console.error("Error running hypothesis test:", error);
      throw error;
    }
  }

  static async fetchDatasets<T extends BaseDataEntity, K extends T = T>(): Promise<DatasetModel<T, K>[]> {
    try {
      const endpoint = endpoints.data.list;
      const url = buildUrl(endpoint); // Use URL builder
      const response = await internalApiService.get<DatasetModel<T, K>[]>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching datasets:", error);
      return [];
    }
  }

  static async getDatasetById<T extends BaseDataEntity, K extends T = T>(
    datasetId: number
  ): Promise<DatasetModel<T, K> | null> {
    try {
      const endpoint = endpoints.data.single;
      const url = buildUrl(endpoint, { id: datasetId }); // Use URL builder
      const response = await internalApiService.get<DatasetModel<T, K>>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching dataset:", error);
      return null;
    }
  }

  static async deleteDataset(datasetId: number): Promise<void> {
    try {
      const endpoint = endpoints.data.remove;
      const url = buildUrl(endpoint, { id: datasetId }); // Use URL builder

      await internalApiService.delete(url);
      console.log("Dataset deleted successfully");
    } catch (error) {
      console.error("Error deleting dataset:", error);
      throw error;
    }
  }

  // ADD: Database backup/restore using the integrated pattern
  static async backupDatabase(): Promise<any> {
    try {
      const endpoint = endpoints.documents.backup;
      const url = buildUrl(endpoint); // Use URL builder
      const response = await internalApiService.post(url);
      return response.data;
    } catch (error) {
      console.error("Error backing up database:", error);
      throw error;
    }
  }

  static async restoreDatabase(backupId: string): Promise<void> {
    try {
      const endpoint = endpoints.documents.retrieveBackup;
      const url = buildUrl(endpoint, { backupId }); // Use URL builder
      await internalApiService.post(url, { backupId });
      console.log("Database restored successfully");
    } catch (error) {
      console.error("Error restoring database:", error);
      throw error;
    }
  }

  async insertData<T extends Record<string, any>>(
    tableName: string,
    data: T
  ): Promise<any> {
    return this.insert(tableName, data);
  }

  async upsertData<T extends Record<string, any>>(
    tableName: string,
    data: T,
    conflictColumn: string = 'id'
  ): Promise<any> {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
      const updateColumns = Object.keys(data)
        .map((col, index) => `${col} = EXCLUDED.${col}`)
        .join(', ');

      const sql = `
      INSERT INTO ${tableName} (${columns}) 
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumn}) 
      DO UPDATE SET ${updateColumns}
      RETURNING *
    `;

      const values = Object.values(data);
      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error upserting data:", error);
      throw error;
    }
  }

  // Also add a generic data retrieval method
  async getData<T = any>(
    tableName: string,
    conditions?: Record<string, any>,
    limit?: number,
    offset?: number
  ): Promise<T[]> {
    try {
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (conditions) {
        Object.keys(conditions).forEach(key => {
          whereClauses.push(`${key} = $${paramIndex}`);
          values.push(conditions[key]);
          paramIndex++;
        });
      }

      const whereClause = whereClauses.length > 0
        ? `WHERE ${whereClauses.join(' AND ')}`
        : '';

      const limitClause = limit ? `LIMIT $${paramIndex}` : '';
      if (limit) {
        values.push(limit);
        paramIndex++;
      }

      const offsetClause = offset ? `OFFSET $${paramIndex}` : '';
      if (offset) {
        values.push(offset);
        paramIndex++;
      }

      const sql = `
      SELECT * FROM ${tableName} 
      ${whereClause}
      ${limitClause}
      ${offsetClause}
    `;

      const result = await this.pool.query(sql, values);
      return result.rows;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
  // Add this method to DatabaseClient class
  async createTableIfNotExists(tableName: string, schemaDefinition: string): Promise<void> {
    try {
      const sql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${schemaDefinition}
      );
    `;

      await this.pool.query(sql);
      console.log(`Table ${tableName} created or already exists`);
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }

  async update<T extends Record<string, any>>(
    tableName: string,
    id: string,
    updates: T
  ): Promise<any> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Build dynamic SET clause
      Object.keys(updates).forEach(key => {
        // Handle JSON fields
        if (typeof updates[key] === 'object' && updates[key] !== null) {
          setClauses.push(`${key} = $${paramIndex}::jsonb`);
          values.push(JSON.stringify(updates[key]));
        } else {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
        }
        paramIndex++;
      });

      // Add id as the last parameter
      values.push(id);

      const sql = `
        UPDATE ${tableName} 
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  async pushToArray(
    tableName: string,
    id: string,
    arrayField: string,
    value: any
  ): Promise<any> {
    try {
      const sql = `
        UPDATE ${tableName} 
        SET 
          ${arrayField} = COALESCE(${arrayField}, '[]'::jsonb) || $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      // Ensure value is properly stringified as JSON
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      const result = await this.pool.query(sql, [jsonValue, id]);
      return result.rows[0];
    } catch (error) {
      console.error(`Error pushing to array ${arrayField} in ${tableName}:`, error);
      throw error;
    }
  }

  async findOne<T = any>(
    tableName: string,
    conditions: Record<string, any>
  ): Promise<T | null> {
    try {
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.keys(conditions).forEach(key => {
        whereClauses.push(`${key} = $${paramIndex}`);
        values.push(conditions[key]);
        paramIndex++;
      });

      const whereClause = whereClauses.length > 0
        ? `WHERE ${whereClauses.join(' AND ')}`
        : '';

      const sql = `
        SELECT * FROM ${tableName} 
        ${whereClause}
        LIMIT 1
      `;

      const result = await this.pool.query(sql, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error(`Error finding one in ${tableName}:`, error);
      return null;
    }
  }

  async find<T = any>(
    tableName: string,
    conditions?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    }
  ): Promise<T[]> {
    try {
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (conditions) {
        Object.keys(conditions).forEach(key => {
          // Handle special operators like $in
          if (key === '$in' && conditions.$in && conditions.$in.field && Array.isArray(conditions.$in.values)) {
            const placeholders = conditions.$in.values.map((_, i) => `$${paramIndex + i}`).join(', ');
            whereClauses.push(`${conditions.$in.field} IN (${placeholders})`);
            values.push(...conditions.$in.values);
            paramIndex += conditions.$in.values.length;
          } else if (typeof conditions[key] === 'object' && conditions[key] !== null) {
            // Handle other operators if needed
            console.warn(`Operator not supported: ${key}`, conditions[key]);
          } else {
            // Standard equality
            whereClauses.push(`${key} = $${paramIndex}`);
            values.push(conditions[key]);
            paramIndex++;
          }
        });
      }

      const whereClause = whereClauses.length > 0
        ? `WHERE ${whereClauses.join(' AND ')}`
        : '';

      const orderClause = options?.orderBy
        ? `ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`
        : '';

      const limitClause = options?.limit ? `LIMIT $${paramIndex}` : '';
      if (options?.limit) {
        values.push(options.limit);
        paramIndex++;
      }

      const offsetClause = options?.offset ? `OFFSET $${paramIndex}` : '';
      if (options?.offset) {
        values.push(options.offset);
        paramIndex++;
      }

      const sql = `
        SELECT * FROM ${tableName} 
        ${whereClause}
        ${orderClause}
        ${limitClause}
        ${offsetClause}
      `;

      const result = await this.pool.query(sql, values);
      return result.rows;
    } catch (error) {
      console.error(`Error finding in ${tableName}:`, error);
      return [];
    }
  }
}


Then update your route to ensure table exists before operations:
export async function POST(request: NextRequest) {
  try {
    const { snapshotData, config, snapshotId, operationType } = await request.json();

    const dbConfig: DatabaseConfig = config || defaultDatabaseConfig;
    const dbClient = new DatabaseClient(dbConfig);
    await dbClient.connect();

    // Ensure snapshots table exists
    await dbClient.createTableIfNotExists("snapshots", `
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB,
      user_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active'
    `);

    // Create indexes separately (PostgreSQL syntax)
    await dbClient.query(`
      CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON snapshots(user_id);
      CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON snapshots(created_at);
    `);

    // Perform database operation
    let result;
    if (operationType === "upsert") {
      if (snapshotId && !snapshotData.id) {
        snapshotData.id = snapshotId;
      }
      result = await dbClient.upsertData("snapshots", snapshotData, 'id');
    } else {
      result = await dbClient.insertData("snapshots", snapshotData);
    }

    await dbClient.close();

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error('Failed to persist snapshot:', error);
    return NextResponse.json({ 
      error: 'Failed to persist snapshot' 
    }, { status: 500 });
  }
}

export default DatabaseClient;