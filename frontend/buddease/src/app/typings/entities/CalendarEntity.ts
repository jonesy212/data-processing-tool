// CalendarEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import { SubscriberCollection } from "@/app/subscribers/SubscriberCollection";

// Base Calendar entity
export interface CalendarEntity extends BaseDataEntity {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  attendees?: string[];
  category?: string;
  [key: string]: any;
}

// Generics for flexibility
export type CalendarK = CalendarEntity;
export type CalendarMeta = DefaultMeta<CalendarEntity, CalendarK>;
export type CalendarAttachment = Attachment;
export type CalendarExcludedFields = DefaultExcludedFields<CalendarEntity>;
export type CalendarIncludedFields = keyof CalendarEntity;

// Params container for Calendar
export type CalendarBaseParams = {
  T: CalendarEntity;
  K: CalendarK;
  Meta: CalendarMeta;
  AttachmentType: CalendarAttachment;
  ExcludedFields: CalendarExcludedFields;
  IncludedFields: CalendarIncludedFields;
};

// Realtime calendar data items
export type CalendarEntityRealtimeDataItem = RealtimeDataItem<
  CalendarBaseParams['T'],
  CalendarBaseParams['K'],
  CalendarBaseParams['Meta'],
  CalendarBaseParams['AttachmentType'],
  CalendarBaseParams['ExcludedFields'],
  CalendarBaseParams['IncludedFields']
>;

// Subscriber collection type
export type CalendarEntitySubscriberCollection = SubscriberCollection<
  CalendarBaseParams['T'],
  CalendarBaseParams['K'],
  CalendarBaseParams['Meta'],
  CalendarBaseParams['AttachmentType'],
  CalendarBaseParams['ExcludedFields'],
  CalendarBaseParams['IncludedFields']
>;
