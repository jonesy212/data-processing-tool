import { BaseData } from '@/app/components/models/data/Data';
import { AxiosResponse } from "axios";
import axiosInstance from '@/app/api/csrfToken';
import {
    Pool,
    PoolConfig,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow
} from "pg";
import { DatasetModel } from "@/app/components/todos/tasks/DataSetModel";


const pg = require('pg');
pg.defaults.ssl = { rejectUnauthorized: false };
pg.native = null; // ← This disables pg-native

class DatabaseClient {
  private pool: Pool;
  private config: PoolConfig; // Declare config as an instance variable

  constructor(config: PoolConfig) {
    // Force non-native client
    this.pool = new Pool({
      ...config,
      // Add connection options to avoid native
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
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
      
      let sql = `INSERT INTO ${tableName} (${columns}${
        additionalString ? ", additionalString" : ""
      }) VALUES(${placeholders}${
        additionalString ? ", $" + (Object.keys(data).length + 1) : ""
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
    T extends  BaseData<any>,
    K extends T = T
  >(formData: FormData): Promise<DatasetModel<T, K> | null> {
    try {
      const response: AxiosResponse<DatasetModel<T, K>> = await axiosInstance.post(
        "/api/upload",
        formData
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
      const response: AxiosResponse<void> = await axiosInstance.post(
        "/api/hypothesis-test",
        { datasetId, testType }
      );
      console.log("Hypothesis test executed successfully:", response.data);
    } catch (error) {
      console.error("Error running hypothesis test:", error);
    }
  }
}

export default DatabaseClient;