// SQLDocument.ts 

export interface SQLDocument {
  // SQL document properties and methods...
  query: string; // Example property for SQL query
  execute(): Promise<void>; // Example method to execute the SQL query
}
