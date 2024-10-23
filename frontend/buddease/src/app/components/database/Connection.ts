// Connection.ts
import {Client as PostgresClient} from "./Client";
import { ClientConfig } from './Client';

class Connection {
  private client: PostgresClient | null = null;

  constructor(private config: ClientConfig) {}


  // Method to establish the database connection
  async connect(): Promise<void> {
    try {
      // Check if already connected
      if (this.client && this.client.getConnected()) {
        console.log('Already connected to the database.');
        return;
      }

      // Create a new database client
      this.client = new PostgresClient(this.config);

      // Connect to the database
      await this.client.connect();

      console.log('Connected to the database.');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error; // Propagate the error to the caller
    }
  }



  // Method to execute a query
  async query(sql: string, values?: any[]): Promise<any> {
    try {
      // Check if connected to the database
      if (!this.client || !this.client.getConnected()) {
        throw new Error('Not connected to the database.');
      }

      // Execute the query
      const result = await this.client.query(sql, values);

      console.log('Query executed successfully:', sql);
      return result.rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error; // Propagate the error to the caller
    }
  }


  // Method to close the database connection
  async close(): Promise<void> {
    try {
      // Check if connected to the database
      if (!this.client || !this.client.getConnected()) {
        console.log('Not connected to the database.');
        return;
      }

      // Close the database connection
      await this.client.end();

      console.log('Database connection closed.');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error; // Propagate the error to the caller
    }
  }
}

export default Connection;
