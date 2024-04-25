import { Client } from "pg"; // Import the Client class
import performDatabaseOperation from "../components/database/DatabaseOperations";
import { sanitizeInput } from "../components/security/SanitizationFunctions";
import { database } from "../generators/GenerateDatabase";


// Call getAuthToken without passing any arguments
const YOUR_AUTH_TOKEN = getAuthToken();
// Define the databaseQuery interface
interface DatabaseQuery {
  query: string;
  params?: any[]; // Optional parameters for the query
}

// DatabaseConfig.tsx
interface DatabaseConfig {
  url: string;
  username: string; // Assuming the username is always required
  authToken: string; // Authentication token to be used for backend authentication
  database?: string;
  saveUserProfiles?(userProfiles: any[]): Promise<void>;
}
interface DatabaseService {
  createDatabase(config: DatabaseConfig, databaseQuery: string): Promise<any>;

  insertData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any>;

  updateData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any>;

  deleteData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any>;

  queryData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any>;
  // Add other database operations as needed (e.g., insert, update, delete, query)
}

export abstract class BaseDatabaseService implements DatabaseService {
  protected client: any; // Declare a client property to hold the database connection

  constructor(config: DatabaseConfig) {
    // Initialize the database connection
    this.client = new Client(config);
  }

  async createDatabase(config: DatabaseConfig): Promise<any> {
    try {
      await this.client.connect();
      await this.client.query(`CREATE DATABASE ${config.database}`);
      console.log(`Database ${config.database} created!`);
    } catch (error) {
      console.error("Error creating database", error);
      throw error;
    } finally {
      await this.client.end();
    }
  }

  async insertData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any> {
    try {
      await this.client.connect();
      const result = await this.client.query(databaseQuery); // Execute the INSERT query
      console.log(`Data inserted successfully for operation '${operation}'`);
      return result.rows; // Return any relevant data or confirmation
    } catch (error) {
      console.error(
        `Error inserting data for operation '${operation}':`,
        error
      );
      throw error;
    } finally {
      await this.client.end();
    }
  }

  async updateData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any> {
    try {
      await this.client.connect();
      const result = await this.client.query(databaseQuery); // Execute the UPDATE query
      console.log(`Data updated successfully for operation '${operation}'`);
      return result.rows; // Return any relevant data or confirmation
    } catch (error) {
      console.error(`Error updating data for operation '${operation}':`, error);
      throw error;
    } finally {
      await this.client.end();
    }
  }

  async deleteData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any> {
    try {
      await this.client.connect();
      const result = await this.client.query(databaseQuery); // Execute the DELETE query
      console.log(`Data deleted successfully for operation '${operation}'`);
      return result.rows; // Return any relevant data or confirmation
    } catch (error) {
      console.error(`Error deleting data for operation '${operation}':`, error);
      throw error;
    } finally {
      await this.client.end();
    }
  }

  async queryData(
    config: DatabaseConfig,
    operation: string,
    databaseQuery: string
  ): Promise<any> {
    try {
      await this.client.connect();
      const result = await this.client.query(databaseQuery); // Execute the SELECT query
      console.log(`Data retrieved successfully for operation '${operation}'`);
      return result.rows; // Return the retrieved data
    } catch (error) {
      console.error(`Error querying data for operation '${operation}':`, error);
      throw error;
    } finally {
      await this.client.end();
    }
  }
}

export class PostgresDatabaseService extends BaseDatabaseService {
  constructor(config: DatabaseConfig) {
    super(config); // Call the constructor of the base class
  }
}

export class MysqlDatabaseService extends BaseDatabaseService {
  constructor(config: DatabaseConfig) {
    super(config); // Call the constructor of the base class
  }
}

// Example usage (replace with your actual database logic)
const databaseConfig: DatabaseConfig = {
  url: "your_database_url",
  database: "your_database_name",
  username: sanitizeInput("your_username"),
  authToken: `${YOUR_AUTH_TOKEN}`,
  // isValidAuthToken("your_auth_token"),
};

const databaseQuery: DatabaseQuery = {} as DatabaseQuery;
const operation = "createDatabase";
performDatabaseOperation(operation, databaseConfig, databaseQuery)
  .then(() => {
    console.log("Database operation successful");
  })
  .catch((error) => {
    console.error("Database operation failed:", error);
  });

if (database.success) {
  console.log("Database created successfully!");
} else {
  console.error("Error creating database:");
  // Handle errors appropriately
}

export { databaseConfig, databaseQuery };
export type { DatabaseConfig, DatabaseService };

