import { BaseData } from '@/app/components/models/data/Data';
import { AxiosResponse } from "axios";
import axiosInstance from "../../security/csrfToken";

import {
    Pool,
    PoolConfig,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow
} from "pg";
import { DatasetModel } from "./DataSetModel";

class DatabaseClient {
  private pool: Pool;
  private config: PoolConfig; // Declare config as an instance variable


  constructor(config: PoolConfig) {
    this.pool = new Pool(config);
    this.config = config; // Store the provided config
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
    T extends  BaseData<any>, 
    K extends T = T>(
    tableName: string,
    data: DatasetModel<T, K>,
    additionalString?: string
  ): Promise<any> {
    try {
      
      let sql = `INSERT INTO ${tableName} (name, description, filePathOrUrl, uploadedBy, uploadedAt, tagsOrCategories, format, visibility, uploadedByTeamId${
        additionalString ? ", additionalString" : ""
      }) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9${
        additionalString ? ", $10" : ""
      }) RETURNING *`;
      const values = [
        data.name,
        data.description,
        data.filePathOrUrl,
        data.uploadedBy,
        data.uploadedAt,
        data.tagsOrCategories,
        data.format,
        data.visibility,
        data.uploadedByTeamId,
        ...(additionalString ? [additionalString] : []),
      ];
  
      const result = await this.pool.query(sql, [values]);
      return result.rows[0];
    } catch (error) {
      console.error("Error inserting dataset:", error);
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