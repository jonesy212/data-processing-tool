// DataEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { Attachment } from '@/core/documents/attachment/Attachment';

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


type DataUnifiedMetadata = UnifiedMetadata<
  DataEntity,
  DataK,
  DataMeta,
  DataAttachment,
  DataExcludedFields,
  DataIncludedFields
>;

type DataStructuredMetadata = StructuredMetadata<
  DataEntity,
  DataK,
  DataMeta,
  DataAttachment,
  DataExcludedFields,
  DataIncludedFields,
  DataUnifiedMetadata
>;

export type { DataAttachment, DataEntity, DataExcludedFields, DataIncludedFields, DataK, DataMeta, DataStructuredMetadata };
