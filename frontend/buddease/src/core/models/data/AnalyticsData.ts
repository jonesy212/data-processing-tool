// AnalyticsData.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SupportedData } from "@/core/models/CommonData";
import { Project } from "@/core/models/projects/Project";

  interface AnalyticsData<
    T extends BaseDataEntity = BaseDataEntity,
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
  