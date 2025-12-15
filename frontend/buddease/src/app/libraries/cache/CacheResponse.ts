// CacheResponse.ts
import { EventAttendance } from '@/app/components/calendar/AttendancePrediction';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SupportedData } from '@/app/models/CommonData';

type CacheReadOptions<T extends BaseDataEntity = BaseDataRoot> = {
  filePath: string;
  apiKey: string;
  token: string;
  currentEvent: EventAttendance | null;
};

// Define the structure of the response data
interface CacheResponse<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id?: string | number | undefined;
  data: SupportedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}


export type { CacheReadOptions, CacheResponse };
