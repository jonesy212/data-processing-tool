import { NestedEndpoints } from "@/app/api/ApiEndpoints";

interface LogData {
  date: Date | string | number;
  timestamp: Date | number;
  level: string; // Log level (e.g., INFO, WARNING, ERROR)
  message: string;
  user?: string | null; // Optional user information associated with the log
  content?: string
  createdAt?: Date | string | number;
  endpoint?: NestedEndpoints | string;
  method?: string,
  status?: string,
  response?: any,

  // Additional fields specific to completionMessageLog
}

export type { LogData };
