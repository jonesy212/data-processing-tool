// ExportTasksPayload.tsx
import { Task } from "@/core/components/models/tasks/Task";

interface ExportTasksPayload {
    tasks: Task[]; // Array of tasks to be exported
    format: ExportFormat; // Format in which tasks should be exported
  }
  
  // Define an enum for export formats
  enum ExportFormat {
    CSV = "csv",
    JSON = "json",
    PDF = "pdf",
    // Add more export formats as needed
  }
  
  export default ExportTasksPayload;
  