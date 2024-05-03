// Assuming you have an interface for the User and Team models as well
import {
  Pool,
  PoolConfig,
  QueryConfig,
  QueryConfigValues,
  QueryResult,
  QueryResultRow
} from "pg";

import { AxiosResponse } from "axios";
import { Team } from "../../models/teams/Team";
import axiosInstance from "../../security/csrfToken";
import { DocumentPath } from "../../documents/DocumentGenerator";

interface DatasetModel {
  id: number;
  name: string;
  description: string | null;
  filePathOrUrl: string;
  uploadedBy: number; // Assuming this is the user ID
  uploadedAt: string; // Assuming the date is sent as a string
  tagsOrCategories: string; // Comma-separated list or JSON array
  format: string;
  visibility: "public" | "private" | "shared"; // Assuming visibility can only be one of these values
  // Add other fields as needed
  type: "file" | "url";
  // Relationships
  uploadedByTeamId: number | null; // Assuming this is the team ID
  uploadedByTeam: Team | null; // Assuming you have a Team interface
  lastModifiedDate: Date;
  filePath?: DocumentPath;

  // Optional: Add other relationships as needed
}

// Example usage:
const dataset: DatasetModel = {
  id: 1,
  name: "Example Dataset",
  description: "An example dataset",
  filePathOrUrl: "/datasets/example.csv",
  uploadedBy: 1, // Assuming user ID 1
  uploadedAt: "2023-01-01T12:00:00Z", // Example date string
  tagsOrCategories: "tag1, tag2",
  format: "csv",
  visibility: "private",
  uploadedByTeamId: 1, // Assuming team ID 1
  uploadedByTeam: null,
  type: "url",
  lastModifiedDate: new Date()
  // Other fields
};

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
  }async insert(
    tableName: string,
    data: DatasetModel,
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
  static async uploadDataset(formData: FormData): Promise<DatasetModel | null> {
    try {
      const response: AxiosResponse<DatasetModel> = await axiosInstance.post(
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

export { dataset };
export type { DatasetModel };

