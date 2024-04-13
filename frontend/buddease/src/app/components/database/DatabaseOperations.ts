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
      databaseService = new PostgresDatabaseService();
    } else if (config.url.includes('mysql')) {
      databaseService = new MysqlDatabaseService();
    } else {
      throw new Error('Unsupported database type');
    }
  
    // Perform the specified database operation
    switch (operation) {
      case 'createDatabase':
        return await databaseService.createDatabase(config, databaseQuery);
      // Add other database operations as needed
      default:
        throw new Error('Unsupported database operation');
    }
  };
  

export default performDatabaseOperation;
export let databaseService: DatabaseService;

if (config.url.includes("postgres")) {
  databaseService = new PostgresDatabaseService();
} else if (config.url.includes("mysql")) {
  databaseService = new MysqlDatabaseService();
} else {
  throw new Error("Unsupported database type");
}
