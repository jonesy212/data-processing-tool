import { BaseDataEntity } from '@/app/config/BaseConfig';
import { BaseData } from '@/app/models/data/Data';
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
import internalApiService from "@/app/api/ApiClient"; // ADD THIS
import { endpoints } from "@/app/api/endpointConfigurations"; // ADD THIS


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
    T extends BaseDataEntity,
    K extends T = T
  >(formData: FormData): Promise<DatasetModel<T, K> | null> {
    try {
      const endpoint = endpoints.data.uploadData; // Use endpoint configuration
      const response = await internalApiService.post<DatasetModel<T, K>>(
        endpoint.path,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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
      const response: AxiosResponse<void> = await axiosInstance.post(
        "/api/hypothesis-test",
        { datasetId, testType }
      );
      console.log("Hypothesis test executed successfully:", response.data);
    } catch (error) {
      console.error("Error running hypothesis test:", error);
    }
  }

  static async runHypothesisTest(
    datasetId: number,
    testType: string
  ): Promise<void> {
    try {
      const endpoint = endpoints.data.hypothesisTest; // You'll need to add this to your endpoints
      await internalApiService.post(
        endpoint.path,
        { datasetId, testType }
      );
      console.log("Hypothesis test executed successfully");
    } catch (error) {
      console.error("Error running hypothesis test:", error);
      throw error;
    }
  }

  static async fetchDatasets<T extends BaseDataEntity, K extends T = T>(): Promise<DatasetModel<T, K>[]> {
    try {
      const endpoint = endpoints.data.list; // Use your data list endpoint
      const response = await internalApiService.get<DatasetModel<T, K>[]>(endpoint.path);
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
      const endpoint = endpoints.data.single(datasetId); // Use your data single endpoint
      const response = await internalApiService.get<DatasetModel<T, K>>(endpoint.path);
      return response.data;
    } catch (error) {
      console.error("Error fetching dataset:", error);
      return null;
    }
  }

  static async deleteDataset(datasetId: number): Promise<void> {
    try {
      const endpoint = endpoints.data.remove(datasetId); // Use your data remove endpoint
      await internalApiService.delete(endpoint.path);
      console.log("Dataset deleted successfully");
    } catch (error) {
      console.error("Error deleting dataset:", error);
      throw error;
    }
  }

  // ADD: Database backup/restore using the integrated pattern
  static async backupDatabase(): Promise<any> {
    try {
      const endpoint = endpoints.documents.backup; // Use your documents backup endpoint
      const response = await internalApiService.post(endpoint.path);
      return response.data;
    } catch (error) {
      console.error("Error backing up database:", error);
      throw error;
    }
  }

  static async restoreDatabase(backupId: string): Promise<void> {
    try {
      const endpoint = endpoints.documents.retrieveBackup; // Use your documents retrieveBackup endpoint
      await internalApiService.post(endpoint.path, { backupId });
      console.log("Database restored successfully");
    } catch (error) {
      console.error("Error restoring database:", error);
      throw error;
    }
  }  
}

export default DatabaseClient;