import { NestedEndpoints } from "@/app/api/ApiEndpoints";
import { DefaultCalendarEvent } from "../actions/CalendarEventActions";

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




  sent: Date,
  isSent: boolean,
  isDelivered: boolean,
  delivered: Date | null,
  opened: Date | null,
  clicked: Date | null,
  responded: boolean,
  responseTime: Date | null,
  eventData: DefaultCalendarEvent | null, // todo verify
  // Additional fields specific to completionMessageLog
}

export type { LogData };
