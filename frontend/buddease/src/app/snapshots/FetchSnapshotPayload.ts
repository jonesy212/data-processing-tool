// FetchSnapshotPayload.ts
import { CalendarEvent } from "@/app/calendar/CalendarEvent";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { simulateFetch } from "@/app/simulate/simulateFetch";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';


interface FetchSnapshotPayload<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
    title?: string;
    description?: string;
    createdAt: string | Date | undefined
    updatedAt: string | Date | undefined
    status: StatusType | undefined;
    category?:  Category; // Optional category properties related to the snapshot
    data: T | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined;
    events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
    dataItems: () => RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
    metadata: any;
    id: string; // Adding id
    key: string; // Adding key
    topic: string; // Adding topic
    date: Date; // Adding date
    message: string; // Adding message
    timestamp: number; // Adding timestamp
    createdBy: string | undefined; // Adding createdBy
    eventRecords: Record<string, any>; // Adding eventRecords
    type: string; // Adding type
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // Adding subscribers
    snapshots: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>; // Adding snapshots
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


async function fetchSnapshotPayload<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  options?: {
    includeMetaData?: boolean;
    filters?: Partial<T>;
    queryParams?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
    source?: 'remote' | 'local';
    requestContext?: string;
  }
): Promise<FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  // Initialize defaults for options
  const {
    includeMetaData = true,
    filters = {},
    queryParams = {},
    priority = 'normal',
    source = 'remote',
    requestContext = 'default',
  } = options || {};

  // Record request timestamp
  const requestTimestamp = new Date();

  // Simulate fetching data (replace this with actual API call)
  const fetchedData = await simulateFetch<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, queryParams);

  if (!fetchedData) {
    throw new Error(`Snapshot with ID "${snapshotId}" not found.`);
  }

  // Map the fetched data to the FetchSnapshotPayload format
  const payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: snapshotId,
    key: `key-${snapshotId}`, // Simulate a key
    topic: fetchedData.topic || 'Default Topic',
    date: fetchedData.date || new Date(),
    message: fetchedData.message || 'No message provided',
    timestamp: fetchedData.timestamp || Date.now(),
    createdBy: fetchedData.createdBy || undefined,
    eventRecords: fetchedData.eventRecords || {},
    type: fetchedData.type || 'default',
    subscribers: fetchedData.subscribers || [],
    snapshots: fetchedData.snapshots || new Map(),
    requestTimestamp,
    requestContext,
    queryParams,
    filters,
    includeMetaData,
    category: fetchedData.category || undefined,
    categoryProperties: fetchedData.categoryProperties || undefined,
    source,
    priority,
    customPayload: fetchedData.customPayload || {},
    title: fetchedData.title || 'Untitled Snapshot',
    description: fetchedData.description || '',
    createdAt: fetchedData.createdAt || new Date(),
    updatedAt: fetchedData.updatedAt || new Date(),
    status: fetchedData.status || undefined,
    data: fetchedData.data || null,
    events: fetchedData.events ?? {},
    dataItems: fetchedData.dataItems || (() => null),
    newData: fetchedData.newData || null,
    metadata: includeMetaData ? fetchedData.metadata : null,
  };

  return payload;
}



export { fetchSnapshotPayload };
export type { FetchSnapshotPayload, FetchTaskSnapshotPayload };

