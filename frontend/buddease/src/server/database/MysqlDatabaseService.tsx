import {
    BaseDatabaseService,
    DatabaseConfig,
} from "@/app/configs/DatabaseConfig";
import { Tensor3D, Tensor4D, pool } from "@tensorflow/tfjs";
import mysql, { Pool } from "mysql";


export class MysqlDatabaseService extends BaseDatabaseService {
    constructor(config: DatabaseConfig) {
      super(config); // Call the constructor of the base class
    }
  
    async createDatabase(config: DatabaseConfig): Promise<void> {
      try {
        // Define the window shape for pooling
        const windowShape: [number, number] = [2, 2];
  
        // Create a MySQL connection pool
        const mysqlPool: Pool = mysql.createPool({
          host: "localhost",
          user: "root",
          password: "password",
          database: "mydatabase",
        });
  
        // Execute the CREATE DATABASE query
        await new Promise<void>((resolve, reject) => {
          mysqlPool.getConnection((err, connection) => {
            if (err) {
              console.error("Error getting connection from pool:", err);
              reject(err);
            } else {
              connection.query(
                `CREATE DATABASE IF NOT EXISTS ${config.database}`,
                (error, results) => {
                  connection.release(); // Release the connection back to the pool
                  if (error) {
                    console.error("Error creating MySQL database:", error);
                    reject(error);
                  } else {
                    console.log(
                      `Database ${config.database} created successfully`
                    );
                    resolve();
                  }
                }
              );
            }
          });
        });
  
        // Close the MySQL connection pool
        mysqlPool.end();
  
        // Create a TensorFlow.js pooling tensor
        const tensePool: Tensor3D | Tensor4D = pool(
          [], // Provide an empty input tensor or TensorLike
          windowShape, // Provide the window shape for pooling
          "avg", // Specify the pooling type (e.g., 'avg' or 'max')
          "valid" // Specify the padding type (e.g., 'valid' or 'same')
        );
  
        // Dispose of the TensorFlow.js pooling tensor
        tensePool.dispose();
      } catch (error) {
        console.error("Error creating MySQL database:", error);
        throw error;
      }
    }
  }