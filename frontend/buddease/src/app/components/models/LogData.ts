import { NotificationTypeEnum } from "../support/NotificationContext";
import { Data } from "./data/Data";

interface LogData extends Partial<Data> {
  timestamp: Date;
  level: string; // Log level (e.g., INFO, WARNING, ERROR)
  message: string;
  user?: string | null; // Optional user information associated with the log
  content?: string
  // Additional fields specific to completionMessageLog
}

export type { LogData };
