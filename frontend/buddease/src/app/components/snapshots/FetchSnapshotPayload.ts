import { Subscriber } from "../users/Subscriber";
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { CalendarEvent } from "../calendar/CalendarEvent";
import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { StatusType } from "../models/data/StatusType";
import { Category } from "../libraries/categories/generateCategoryProperties";


interface FetchSnapshotPayload<T extends Data, K extends Data = T> {
  title: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  status: StatusType | undefined;
  category?: Category; // Optional category properties related to the snapshot
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  events: Record<string, CalendarEvent<T, K>[]>;
  dataItems: T[];
  newData: T;
  metadata: any;
  id: string; // Adding id
  key: string; // Adding key
  topic: string; // Adding topic
  date: Date; // Adding date
  message: string; // Adding message
  timestamp: number; // Adding timestamp
  createdBy: string; // Adding createdBy
  eventRecords: Record<string, any>; // Adding eventRecords
  type: string; // Adding type
  subscribers: Subscriber<T, K>[]; // Adding subscribers
  snapshots: Map<string, Snapshot<T, K>>; // Adding snapshots
  requestTimestamp: Date; // Timestamp of when the fetch request was made
  requestContext: string; // Context or purpose of the fetch operation
  queryParams?: Record<string, any>; // Optional query parameters to customize the fetch
  filters?: Partial<T>; // Optional filters to apply during the fetch
  includeMetaData?: boolean; // Flag to include/exclude metadata in the response
  categoryProperties?: CategoryProperties; // Optional category properties related to the snapshot
  source?: 'remote' | 'local'; // Indicates whether the snapshot is fetched from a remote server or local storage
  priority?: 'high' | 'normal' | 'low'; // Optional priority level for the fetch operation
  customPayload?: Record<string, any>; // Custom data that might be needed for special cases

}


interface FetchTaskSnapshotPayload {
  taskId: string; // Required to specify which task's snapshot to fetch
  includeDetails?: boolean; // Optional: Include additional details in the snapshot
  includeDependencies?: boolean; // Optional: Include dependencies in the snapshot
  includeAnalysis?: boolean; // Optional: Include analysis results
  includeMedia?: boolean; // Optional: Include media such as video thumbnail, video duration, etc.
  userId?: number; // Optional: Filter by user ID if needed
  query?: string; // Optional: Query parameter to filter or search tasks
}


export default FetchSnapshotPayload;
export type { FetchTaskSnapshotPayload };
