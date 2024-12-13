import { NestedEndpoints } from "@/app/api/ApiEndpoints";
import { DefaultCalendarEvent } from "../actions/CalendarEventActions";
import { Highlight } from "../documents/NoteData";
import CustomFile from "../documents/File";
import {  Snapshot} from "../snapshots";
import { BaseData } from "./data/Data";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

interface LogData<
  T extends BaseData<T>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
> extends BaseData<T>
  {
  date: Date | string | number;
  timestamp: Date | number;
  level: string; // Log level (e.g., INFO, WARNING, ERROR)
  message: string;
  user?: string | null; // Optional user information associated with the log
  content?: string
  createdAt?: Date | string;
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
  topics: string[] | undefined,
  highlights: Highlight[]
  files: CustomFile[]
  meta: Map<string, Snapshot<T, K>> | null
  // Additional fields specific to completionMessageLog
}

export type { LogData };
