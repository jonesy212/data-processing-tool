// DataEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

interface DataEntity extends BaseDataEntity {
  id: string;                        // required for uniqueness
  name?: string;
  description?: string;
  children?: DataEntity[];           // nested children
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  version?: string | number;
  [key: string]: any;                
}

type DataK = DataEntity;
type DataMeta = DefaultMeta<DataEntity, DataK>;
type DataAttachment = Attachment;
type DataIncludedFields = keyof DataEntity;
type DataExcludedFields = DefaultExcludedFields<DataEntity>;


export type { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta };
