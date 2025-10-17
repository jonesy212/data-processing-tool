
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


export { DataEntity,
    DataK
    DataMeta,
DataAttachment,
DataIncludedFields,
DataExcludedFields, 
 }