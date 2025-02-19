import { Client, Pool } from 'pg';
import { getAuthToken } from "../components/auth/getAuthToken";
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
  host: string;
  username: string; // Assuming the username is always required
  password: string;
  database?: string;
  authToken: string | undefined;
  port: number;
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

  findOne(params: { tableName: string; query: { id: string; }}): Promise<any>;

  update(data: any, whereClause: any): Promise<any>;
  create(data: any): Promise<any>;

  insert(data: any, modelData: any): Promise<any>;
  disconnect(): void;
  confirmDisconnect(message: string): Promise<boolean>;
  findAll(tableName: string): Promise<any[]>;
  count(): Promise<number>;
  bulkCreate(data: any[]): Promise<any[]>;
  findAllByAttribute(table: string, column: string, value: any): Promise<any[]>;
  findByAttribute(table: string, column: string, value: any): Promise<any>;
  aggregate(aggregation: any): Promise<any>;
  upsert(data: any): Promise<any>;
  transaction(operations: any[]): Promise<any>;
  batchInsert(data: any[]): Promise<any[]>;
  
  // Add other database operations as needed (e.g., insert, update, delete, query)
}

export abstract class BaseDatabaseService implements DatabaseService {
  protected client: any; // Declare a client property to hold the database connection

  private pool: Pool = new Pool();

  constructor(config: DatabaseConfig) {
    // Initialize the database connection
    this.client = new Client(config);
  }

  private validTables: Set<string> = new Set(['users', 'orders', 'products']);  // Define allowed tables

   // Validate that the table name is in the allowed set
   private validateTableName(table: string): string {
    if (!this.validTables.has(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }
    return table;
  }

  // Basic validation for column names (could use more specific criteria)
  private validateColumnName(column: string): string {
    if (!/^[a-zA-Z0-9_]+$/.test(column)) {
      throw new Error(`Invalid column name: ${column}`);
    }
    return column;
  }

  public async findAllByAttributes(
    table: string,
    column1: string,
    value1: any,
    column2: string,
    value2: any
  ): Promise<any[]> {
    const sanitizedTable = this.validateTableName(table);
    const sanitizedColumn1 = this.validateColumnName(column1);
    const sanitizedColumn2 = this.validateColumnName(column2);
  
    const queryText = `SELECT * FROM ${sanitizedTable} WHERE ${sanitizedColumn1} = $1 AND ${sanitizedColumn2} = $2`;
    return await this.executeQuery(queryText, [value1, value2]);
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

  async findOne(params: { tableName: string; query: { id: string; } }): Promise<any> {
    try {
      const { tableName, query } = params;
      // Execute database query to find a record by identifier
      const result = await this.client.query(
        `SELECT * FROM ${tableName} WHERE id = $1`,
        [query.id]
      );

      // Check if any record was found
      if (result.rows.length > 0) {
        // Return the first record found
        return result.rows[0];
      } else {
        // If no record found, return null or throw an error as per your application logic
        return null; // Or throw new Error('Record not found');
      }
    } catch (error) {
      console.error("Error in findOne method:", error);
      throw error;
    }
  }
  async update(data: any): Promise<any> {
    try {
      // Extract the necessary data for the update operation
      const { id, ...updatedFields } = data;

      // Execute the update query
      const result = await this.client.query(
        `UPDATE your_table SET ${Object.keys(updatedFields)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(", ")} WHERE id = $${Object.keys(updatedFields).length + 1}`,
        [...Object.values(updatedFields), id]
      );

      // Return any relevant data or confirmation
      return result.rows;
    } catch (error) {
      console.error("Error in update method:", error);
      throw error;
    }
  }

  async create(data: any): Promise<any> {
    try {
      // Execute the insert query
      const result = await this.client.query(
        `INSERT INTO your_table (${Object.keys(data).join(
          ", "
        )}) VALUES (${Object.keys(data)
          .map((_, index) => `$${index + 1}`)
          .join(", ")}) RETURNING *`,
        Object.values(data)
      );

      // Return the inserted data
      return result.rows[0];
    } catch (error) {
      console.error("Error in create method:", error);
      throw error;
    }
  }

  async insert(data: any): Promise<any> {
    try {
      // Execute the insert query
      const result = await this.client.query(
        `INSERT INTO your_table (${Object.keys(data).join(
          ", "
        )}) VALUES (${Object.keys(data)
          .map((_, index) => `$${index + 1}`)
          .join(", ")}) RETURNING *`,
        Object.values(data)
      );
      // Return the inserted data
      return result.rows[0];
    } catch (error) {
      console.error("Error in insert method:", error);
      throw error;
    }
  }

  async delete(identifier: string): Promise<any> {
    try {
      // Execute the delete query
      const result = await this.client.query(
        `DELETE FROM your_table WHERE id = $1`,
        [identifier]
      );

      // Return any relevant data or confirmation
      return result.rows;
    } catch (error) {
      console.error("Error in delete method:", error);
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      // Execute the SELECT query to retrieve all records
      const result = await this.client.query(`SELECT * FROM your_table`);

      // Return the retrieved data
      return result.rows;
    } catch (error) {
      console.error("Error in findAll method:", error);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      // Execute the SELECT query to count the number of records
      const result = await this.client.query(`SELECT COUNT(*) FROM your_table`);

      // Extract the count value from the query result
      const count = parseInt(result.rows[0].count);

      // Return the count value
      return count;
    } catch (error) {
      console.error("Error in count method:", error);
      throw error;
    }
  }

  async bulkCreate(data: any[]): Promise<any[]> {
    try {
      // Prepare the values for bulk insertion
      const values = data
        .map(
          (item) =>
            `(${Object.values(item)
              .map((value) => `'${value}'`)
              .join(", ")})`
        )
        .join(", ");

      // Execute the bulk insert query
      const result = await this.client.query(
        `INSERT INTO your_table (${Object.keys(data[0]).join(
          ", "
        )}) VALUES ${values} RETURNING *`
      );

      // Return the inserted data
      return result.rows;
    } catch (error) {
      console.error("Error in bulkCreate method:", error);
      throw error;
    }
  }


  async aggregate(aggregation: any): Promise<any> {
    try {
      // Initialize the base aggregation query
      let query = `SELECT `;

      // Check if the aggregation operation is specified
      if (aggregation.operation) {
        // Add the aggregation operation to the query
        query += `${aggregation.operation.toUpperCase()}(`;
      }

      // Add the field to be aggregated
      query += `${aggregation.field})`;

      // Add the table name
      query += ` FROM your_table`;

      // Check if a condition is provided
      if (aggregation.condition) {
        // Add the condition to the query
        query += ` WHERE ${aggregation.condition}`;
      }

      // Execute the constructed aggregation query
      const result = await this.client.query(query);

      // Return the result of the aggregation
      return result.rows[0]; // Assuming the result is a single row
    } catch (error) {
      console.error("Error in aggregate method:", error);
      throw error;
    }
  }

  async upsert(data: any): Promise<any> {
    try {
      // Implementing upsert (insert or update) logic depends on the specific database system you're using.
      // For PostgreSQL, you can use the ON CONFLICT DO UPDATE statement.
      // For MySQL, you can use the INSERT INTO ... ON DUPLICATE KEY UPDATE statement.
      // Here's a generalized example using PostgreSQL syntax:

      // Construct the INSERT query with data
      const insertQuery = `INSERT INTO your_table (column1, column2, ...) VALUES ($1, $2, ...) 
                           ON CONFLICT (unique_column) DO UPDATE SET column1 = $1, column2 = $2, ...`;

      // Extract values from the data object
      const values = [data.column1, data.column2 /* ... */];

      // Execute the query with the values
      const result = await this.client.query(insertQuery, values);

      // Return any relevant data or confirmation
      return result.rows; // Or return the inserted/updated record
    } catch (error) {
      console.error("Error in upsert method:", error);
      throw error;
    }
  }

  async transaction(operations: (() => Promise<any>)[]): Promise<any> {
    try {
      await this.client.query("BEGIN");
      for (const operation of operations) {
        await operation();
      }
      await this.client.query("COMMIT");
    } catch (error) {
      await this.client.query("ROLLBACK");
      console.error("Transaction error:", error);
      throw error;
    }
  }
  

  async batchInsert(data: any[]): Promise<any[]> {
    try {
      // Implementing batch insert logic depends on the specific database system you're using.
      // For PostgreSQL, you can use the COPY command for efficient bulk inserts.
      // For MySQL, you can use multiple INSERT statements within a single transaction for batch inserts.

      // Construct the batch insert query dynamically based on the data array
      let insertQuery = `INSERT INTO your_table (column1, column2, ...) VALUES `;
      const values: any[] = [];

      // Iterate over the data array to construct the query and values array
      for (let i = 0; i < data.length; i++) {
        // Assuming data[i] is an object with properties corresponding to the columns in the database
        const rowData = data[i];
        const placeholders = new Array(Object.keys(rowData).length)
          .fill("$")
          .map((v, index) => v + (index + 1))
          .join(", ");

        // Construct the part of the query for this row
        insertQuery += `(${placeholders}), `;

        // Push the values of this row into the values array
        for (const key in rowData) {
          if (Object.hasOwnProperty.call(rowData, key)) {
            values.push(rowData[key]);
          }
        }
      }

      // Remove the trailing comma and space from the insertQuery
      insertQuery = insertQuery.slice(0, -2);

      // Execute the batch insert query with data values
      const result = await this.client.query(insertQuery, values);

      // Return any relevant data or confirmation
      return result.rows;
    } catch (error) {
      console.error("Error in batchInsert method:", error);
      throw error;
    }
  }

  // Example method to find by attribute, with sanitization
  public async findByAttribute(table: string, column: string, value: any): Promise<any> {
    const sanitizedTable = this.validateTableName(table);
    const sanitizedColumn = this.validateColumnName(column);
    
    const queryText = `SELECT * FROM ${sanitizedTable} WHERE ${sanitizedColumn} = $1`;
    return await this.executeQuery(queryText, [value]);
  }

  public async findAllByAttribute(table: string, column: string, value: any): Promise<any[]> {
    const sanitizedTable = this.validateTableName(table);
    const sanitizedColumn = this.validateColumnName(column);

    const queryText = `SELECT * FROM ${sanitizedTable} WHERE ${sanitizedColumn} = $1`;
    return await this.executeQuery(queryText, [value]);
  }

  // Close the pool when the service is no longer needed
  public async disconnect(): Promise<void> {
    await this.pool.end();
  }

  // Generic method to execute queries
  protected async executeQuery(queryText: string, params: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(queryText, params);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async confirmDisconnect(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
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

//todo maek dynamic and use
// Example usage (replace with your actual database logic)
const databaseConfig: DatabaseConfig = {
  url: "your_database_url",
  database: "your_database_name",
  username: sanitizeInput("your_username"),
  authToken: `${YOUR_AUTH_TOKEN}`,
  host: "",
  password: "",
  port: 0
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

