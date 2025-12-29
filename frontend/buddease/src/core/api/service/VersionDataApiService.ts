// VersionDataApiService.ts
import { endpoints } from '@/core/api/endpointConfigurations'; // Your updated endpoints
import { BaseApiService } from '@/core/api/service/BaseApiService';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { YourResponseType } from '@/core/typings/responseTypes';

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
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(analyticsId: string): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return this.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(`/analytics/${analyticsId}`);
  }

  // Add other version data methods as needed
}

// Export singleton instance
export const versionDataApiService = new VersionDataApiService();