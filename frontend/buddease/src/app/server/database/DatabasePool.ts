import { Pool, QueryResult } from 'pg';

// Define the Pool class
export class DatabasePool {
  private pool: Pool;
//   private static config: any;

  constructor(config: any) {
      this.pool = new Pool(config);
    //   this.pool = new Pool(DatabasePool.config);
  }

  // Method to connect to the database
  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      console.log('Connected to the database.');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error; // Propagate the error to the caller
    }
  }

  // Method to execute a query
  async query(sql: string, values?: any[]): Promise<any> {
    try {
      const result: QueryResult<any> = await this.pool.query(sql, values);
      console.log('Query executed successfully:', sql);
      return result.rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error; // Propagate the error to the caller
    }
  }

  // Method to end the database connection
  async end(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database connection closed.');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error; // Propagate the error to the caller
    }
  }
    
  getPool(): Pool {
    return this.pool;
  }
}
