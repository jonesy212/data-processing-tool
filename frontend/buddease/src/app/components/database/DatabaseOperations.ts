// DatabaseOperations.ts

import {
  DatabaseConfig,
  DatabaseService,
  MysqlDatabaseService,
  PostgresDatabaseService
} from "@/app/configs/DatabaseConfig";
// Function to perform database operation

const performDatabaseOperation = async (
  operation: string,
  config: DatabaseConfig,
  databaseQuery: any
): Promise<any> => {
  let databaseService: DatabaseService;

  // Determine which database service to use based on the configuration
  if (config.url.includes('postgres')) {
      databaseService = new PostgresDatabaseService(config);
  } else if (config.url.includes('mysql')) {
      databaseService = new MysqlDatabaseService(config);
  } else {
      throw new Error('Unsupported database type');
  }

  try {
      // Perform the specified database operation
      switch (operation) {
          case 'createDatabase':
              return await databaseService.createDatabase(config, databaseQuery);
          case 'findByAttribute':
              // Call `findByAttribute` on the service with any custom query parameters
              return await databaseService.findByAttribute(databaseQuery.table, databaseQuery.column, databaseQuery.value);
          // Add other operations as needed
          default:
              throw new Error('Unsupported database operation');
      }
  } finally {
      // Ensure the database connection is closed after the operation completes
      await databaseService.disconnect();
  }
};

  

export default performDatabaseOperation;
export let databaseService: DatabaseService;

