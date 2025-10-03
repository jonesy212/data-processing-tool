import { Task } from "./Task";

// ImportTasksPayload.tsx
interface ImportTasksPayload {
    data: string; // Data containing tasks to be imported, e.g., JSON data
    format: ImportFormat; // Format of the imported data
    tasks: Task[]; // Array of imported tasks after parsing data
  }
  
  // Define an enum for import formats
  enum ImportFormat {
    CSV = "csv",
    JSON = "json",
    XML = "xml",
    // Add more import formats as needed
  }
  
  export default ImportTasksPayload;
  