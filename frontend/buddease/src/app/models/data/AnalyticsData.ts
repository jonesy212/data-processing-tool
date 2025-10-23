import {Project} from "@/app/models/projects/Project";
import { SupportedData } from "@/app/models/CommonData";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta, BaseDataRoot } from '@/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";

  // AnalyticsData.ts
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
  