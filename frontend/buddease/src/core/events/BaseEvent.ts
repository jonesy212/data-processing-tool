// BaseEvent.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedSnapshotEvent } from "@/core/typings/appEventTypes";

interface BaseEvent {
  eventId: string;
  eventType: string; // A string or enum to identify the event type
  timestamp: number; // Timestamp of the event
  type: string;
}

interface SystemEvent<  
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> 
  extends SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "system"; // Event type identifier
  systemMessage: string; // Description or message of the system event
  severity: "info" | "warning" | "error"; // Level of importance
}



// CustomEventType with all required generic parameters for SharedSnapshotEvent
interface CustomEventType<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedSnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  eventType: "custom";
  description: string;
  metadata?: Record<string, any>;
}

export type { BaseEvent, CustomEventType, SystemEvent };

