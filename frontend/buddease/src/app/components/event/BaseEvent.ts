import { BaseData } from '@/app/components/models/data/Data';
import { SharedSnapshotEvent } from "@/app/typings/eventTypes";

interface BaseEvent {
  eventId: string;
  eventType: string; // A string or enum to identify the event type
  timestamp: Date; // Timestamp of the event
  type: string;
}

interface SystemEvent<T extends BaseData<any>, K extends T = T> 
  extends SharedSnapshotEvent<T, K> {
  eventType: "system"; // Event type identifier
  systemMessage: string; // Description or message of the system event
  severity: "info" | "warning" | "error"; // Level of importance
}


interface CustomEventType<T extends BaseData<any>, K extends T = T> extends SharedSnapshotEvent<T, K> {
  eventType: "custom";
  description: string;
  metadata?: Record<string, any>;
}

export type { BaseEvent, CustomEventType, SystemEvent };

