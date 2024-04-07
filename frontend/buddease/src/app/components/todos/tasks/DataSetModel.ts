// Assuming you have an interface for the User and Team models as well
import { Pool, PoolConfig, QueryArrayResult, QueryConfig, QueryConfigValues, QueryResult, QueryResultRow } from 'pg';

import { AxiosResponse } from "axios";
import { Team } from "../../models/teams/Team";
import axiosInstance from "../../security/csrfToken";
import Connection from "../../database/Connection";
import { da } from '@faker-js/faker';

interface DatasetModel {
    id: number;
    name: string;
    description: string | null;
    filePathOrUrl: string;
    uploadedBy: number; // Assuming this is the user ID
    uploadedAt: string; // Assuming the date is sent as a string
    tagsOrCategories: string; // Comma-separated list or JSON array
    format: string;
    visibility: 'public' | 'private' | 'shared'; // Assuming visibility can only be one of these values
    // Add other fields as needed
  
    // Relationships
    uploadedByTeamId: number | null; // Assuming this is the team ID
    uploadedByTeam: Team | null; // Assuming you have a Team interface
  
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
  // Other fields
};



class DatabaseClient {
  private pool: Pool;

  constructor(private config: PoolConfig) {
    this.pool = new Pool(config);
  }

  // Method to connect to the database
  async connect(): Promise<void> {
    try {
      // No need to check if already connected as `pg` handles connection pooling internally
      // Connect to the database using the configured pool
      await this.pool.connect();

      console.log('Connected to the database.');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }

  async insert(dataset: DatasetModel): Promise<any> {
    try {
      const sql =
        "INSERT INTO table_name VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";
      const values = [
        dataset.name,
        dataset.description,
        dataset.filePathOrUrl,
        dataset.uploadedBy,
        dataset.uploadedAt,
        dataset.tagsOrCategories,
        dataset.format,
        dataset.visibility,
        dataset.uploadedByTeamId,
      ];
      const result = await this.pool.query(sql, [values]);
      return result.rows[0];
    } catch (error) {
      console.error("Error inserting dataset:", error);
      throw error;
    }
  }
  

// Method to execute a query
async query<R extends QueryResultRow = any, I = any[]>(queryTextOrConfig: string | QueryConfig<I>, values?: QueryConfigValues<I>): Promise<QueryResult<R>> {
  try {
    const result: QueryResult<R> = await this.pool.query(queryTextOrConfig, values);

    console.log('Query executed successfully:', queryTextOrConfig);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}




  // Method to close the database connection
  async close(): Promise<void> {
    try {
      // Close the pool to release all resources
      await this.pool.end();

      console.log('Database connection closed.');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }

  // Method to upload a dataset
  static async uploadDataset(formData: FormData): Promise<DatasetModel | null> {
    try {
      const response: AxiosResponse<DatasetModel> = await axiosInstance.post('/api/upload', formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading dataset:', error);
      return null;
    }
  }

  // Method to run a hypothesis test
  static async runHypothesisTest(datasetId: number, testType: string): Promise<void> {
    try {
      const response: AxiosResponse<void> = await axiosInstance.post('/api/hypothesis-test', { datasetId, testType });
      console.log('Hypothesis test executed successfully:', response.data);
    } catch (error) {
      console.error('Error running hypothesis test:', error);
    }
  }
}

export default DatabaseClient;

  export { dataset };
export type { DatasetModel };

