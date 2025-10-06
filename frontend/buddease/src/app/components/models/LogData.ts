import { NestedEndpoints } from "@/app/api/ApiEndpoints";
import CustomFile from "@/app/documents/File";
import { Highlight } from "@/app/documents/NoteData";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { BaseData } from "./data/Data";
interface LogData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K, DefaultMeta<T, K>, Attachment, DefaultExcludedFields<T>, keyof T> = StructuredMetadata<T, K, DefaultMeta<T, K>, Attachment, DefaultExcludedFields<T>, keyof T>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  date: Date | string | number;
  timestamp: Date | number;
  level: string;
  message: string;
  user?: string | null;
  content?: string;
  createdAt?: Date | string;
  endpoint?: NestedEndpoints | string;
  method?: string;
  status?: string;
  response?: any;
  sent: Date;
  isSent: boolean;
  isDelivered: boolean;
  delivered: Date | null;
  opened: Date | null;
  clicked: Date | null;
  responded: boolean | null;
  responseTime: Date | null;
  eventData: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  topics: string[] | undefined;
  highlights: Highlight[];
  files: CustomFile[];
  meta: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null;
}

export type { LogData };
