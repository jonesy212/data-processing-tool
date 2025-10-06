// VersionDataApiService.ts
import { BaseApiService } from '@/BaseApiService';
import { endpoints } from '@/app//endpointConfigurations'; // Your updated endpoints
import { BaseData, BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { YourResponseType } from "@/app/components/typings/types";
import { Attachment } from '@/components/models/data/Attachment';

export class VersionDataApiService extends BaseApiService {
  constructor() {
    super(endpoints.versionData);
  }

  async fetchVersionData<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(snapshotId: string): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return this.get<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(`/${snapshotId}`);
  }

  async fetchAnalyticsData<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(analyticsId: string): Promise<YourResponseType<T, K, Meta>> {
    return this.get<YourResponseType<T, K, Meta>>(`/analytics/${analyticsId}`);
  }

  // Add other version data methods as needed
}

// Export singleton instance
export const versionDataApiService = new VersionDataApiService();