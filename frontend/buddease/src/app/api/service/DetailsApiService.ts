// DetailsApiService.ts
import { endpoints } from '@/app/api/endpointConfigurations';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import { BaseApiService } from '@/BaseApiService';
import { Data } from '@/components/models/data/Data';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

export class DetailsApiService extends BaseApiService {
  constructor() {
    super(endpoints.details.list);
  }

  async fetchDetails<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T,
  >(): Promise<DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return this.get<DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>('');
  }

  async createDetails<    
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(newDetails: DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): Promise<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return this.post<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>('', newDetails);
  }

  async addDetails<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(newDetails: Omit<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, 'id'>): Promise<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return this.post<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>('', newDetails);
  }

  async removeDetails(detailsId: string): Promise<void> {
    return this.delete<void>(`/${detailsId}`);
  }

  async updateDetails<
    T extends BaseDataEntity, 
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    detailsId: string,
    newData: any
  ): Promise<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return this.put<DetailsItem<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>(`/${detailsId}`, newData);
  }
}
