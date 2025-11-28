// realtimeTypes.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { Data } from '@/app/models/data/Data';
import { RealtimeUpdateCallback } from '@/app/hooks/commHooks/useRealtimeData';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { EventData } from "@/app/state/stores/AssignEventStore";
import { AllTypes } from "@/app/typings/PropTypes";

interface BaseRealtimeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K> {
  id: string | number; // Override id to ensure it's required (remove undefined)
  name: string;
  value?: string | number | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  type: string | AllTypes; // Remove null to align with BaseData's expectation
  date: string | Date; 
  // Add other common properties shared by RealtimeDataItem and RealtimeData here
}


interface RealtimeData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  data: T;
  metadata: Meta;
  attachments?: AttachmentType[];
  lastUpdated: Date;
  version: number;
  subscribers: Set<RealtimeUpdateCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
}

interface RealtimeDataItem<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends 
  EventData, 
  BaseRealtimeData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
 
  title?: string;
  userId: string;
  dispatch: (action: any) => void;
  timestamp: Date;
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
}


interface RealtimeDataProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends RealtimeDataItem <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  userId: string;
  dispatch: (action: any) => void;
  value: string;
}


export type { RealtimeDataProps };



export type { RealtimeData, RealtimeDataItem };
