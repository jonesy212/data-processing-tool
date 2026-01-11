// realtimeTypes.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedIdentifiers } from "@/core/documents/RelatedProps";
import { RealtimeUpdateCallback } from '@/core/hooks/commHooks/useRealtimeData';
import { Data } from '@/core/models/data/Data';
import type { SharedMetadata } from '@/core/shared/SharedMetadata';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { EventData } from "@/core/state/stores/AssignEventStore";
import { AllTypes } from "@/core/typings/PropTypes";

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

