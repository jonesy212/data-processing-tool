import { BaseData } from '@/app/models/data/Data';
import { SharedSnapshotEvent } from "@/app/typings/appEventTypes";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";

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


interface CustomEventType<
  T extends BaseDataEntity, 
  K extends T = T
> extends SharedSnapshotEvent<T, K> {
  eventType: "custom";
  description: string;
  metadata?: Record<string, any>;
}

export type { BaseEvent, CustomEventType, SystemEvent };

