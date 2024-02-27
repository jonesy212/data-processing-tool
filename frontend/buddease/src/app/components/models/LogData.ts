import { Data } from "./data/Data";

// LogData.ts
interface LogData extends Partial<Data> {
    timestamp: Date;
    level: string; // Log level (e.g., INFO, WARNING, ERROR)
    message: string;
    user?: string | null; // Optional user information associated with the log
    // Add additional fields as needed based on the application's requirements
  }
  
  export default LogData;
  