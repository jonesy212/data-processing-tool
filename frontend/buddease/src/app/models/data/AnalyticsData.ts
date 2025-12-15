// AnalyticsData.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SupportedData } from "@/app/models/CommonData";
import { Project } from "@/app/models/projects/Project";

  interface AnalyticsData<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  > {
    id: string;
    projectId: Project
    supportedData: SupportedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  }
  
  export default AnalyticsData;
  