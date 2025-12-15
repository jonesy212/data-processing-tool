// VersionDataApiService.ts
import { BaseApiService } from '@/app/api/service/BaseApiService';
import { endpoints } from '@/app/api/endpointConfigurations'; // Your updated endpoints
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { YourResponseType } from '@/app/typings/responseTypes';

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