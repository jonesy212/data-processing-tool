// Client.ts
import { Pool, QueryResult } from 'pg';

import clientApiService from "@/app/api/ApiClient";
import { DatabasePool } from './DatabasePool';
import { ClientInformation } from './ClientInformation';
import { mapLanguageToEnum } from '../communications/Language';

// Define the structure for ClientConfig
export interface ClientConfig {
  clientId: string;
  clientName: string;
  clientEmail: string;
  notificationMessages: {
    updateClientDetailsError: string; // Define any other necessary properties
  };
  // Add other properties as needed
}

// Define the Client class

// Define the Client class
export class Client {
  private config: ClientConfig;
  private pool: Pool; // Change from 'private client: any;' to 'private pool: Pool;'
  private connected: boolean = false; // Change from '_connected' to 'connected'
 
  constructor(config: ClientConfig) {
    this.config = config;
    this.pool = new DatabasePool(config).getPool();
  }


  // Method to get client ID
  getClientId(): string {
    return this.config.clientId;
  }

  // Method to get client name
  getClientName(): string {
    return this.config.clientName;
  }

  // Method to get client email
  getClientEmail(): string {
    return this.config.clientEmail;
  }


  // Method to establish the database connection
  async connect(): Promise<void> {
    try {
      // Connect to the database using the connection pool
      await this.pool.connect();

      // Simulating connection by logging a message
      console.log('Connected to the database.');

      // Update connection status
      this.connected = true;
    } catch (error) {
      // Handle any errors that occur during connection
      console.error('Error connecting to the database:', error);
      throw error; // Propagate the error to the caller
    }
  }

  // Method to execute a query
  async query(sql: string, values?: any[]): Promise<any> {
    try {
      // Execute the query using the connection pool
      const result: QueryResult<any> = await this.pool.query(sql, values);

      // Log a message indicating successful query execution
      console.log('Query executed successfully:', sql);

      // Return the query result
      return result.rows;
    } catch (error) {
      // Handle any errors that occur during query execution
      console.error('Error executing query:', error);
      throw error; // Propagate the error to the caller
    }
  }

  // Method to close the database connection
  async end(): Promise<void> {
    try {
      // Close the database connection
      await this.pool.end();

      // Log a message to indicate successful closure
      console.log('Database connection closed.');

      // Update connection status
      this.connected = false;
    } catch (error) {
      // Handle any errors that occur during connection closing
      console.error('Error closing database connection:', error);
      throw error; // Propagate the error to the caller
    }
  }



  // Method to call client API service to connect with the backend
  async connectWithBackend(tenantId: number): Promise<void> {
    try {
      // Call the client API service to connect with the backend
      await clientApiService.connectWithTenant(tenantId);
    } catch (error) {
      console.error('Error connecting with the backend:', error);
      throw error; // Propagate the error to the caller
    }
  }

  // Method to call client API service to execute queries
  async executeClientQuery(/* Pass necessary parameters */): Promise<any> {
    try {
      // Call the client API service to execute queries
      const result = await clientApiService.listClientTasks(/* pass necessary parameters */);

      // Log a message indicating successful query execution
      console.log('Client query executed successfully');

      // Return the result
      return result;
    } catch (error) {
      console.error('Error executing client query:', error);
      throw error; // Propagate the error to the caller
    }
  }

  // Getter for connected property
  getConnected(): boolean {
    return this.connected; // Change from '_connected' to 'connected'
  }
  // Method to get client information
  getClientInformation(): ClientInformation {
    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: mapLanguageToEnum(navigator.language),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  // Add other methods as needed
}

// Example usage
const clientConfig: ClientConfig = {
  clientId: "123",
  clientName: "Example Corp",
  clientEmail: "example@example.com",
  notificationMessages: {
    updateClientDetailsError: "Error updating client details." // Set the error message
  }
  // Add other properties as needed
};

const client = new Client(clientConfig);

console.log("Client ID:", client.getClientId());
console.log("Client Name:", client.getClientName());
console.log("Client Email:", client.getClientEmail());
