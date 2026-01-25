// FilterEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define the actual FilterEntity interface
interface FilterEntity extends BaseDataEntity {
  id: string;
  name: string;
  type: string;
  criteria: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  // Add other filter-specific fields
}

Filter-specific type parameters
type FilterK = FilterEntity;
type FilterMeta = DefaultMeta<FilterEntity, FilterK> & {
  description?: string;
  filterType?: string;
  appliedCount?: number;
  customFields?: Record<string, any>;
};
type FilterAttachment = Attachment;
type FilterExcludedFields = DefaultExcludedFields<FilterEntity> | "criteria" | "createdBy";
type FilterIncludedFields = keyof FilterEntity;

// Filter parameters container
type FilterBaseParams = {
  T: FilterEntity;
  K: FilterK;
  Meta: FilterMeta;
  AttachmentType: FilterAttachment;
  ExcludedFields: FilterExcludedFields;
  IncludedFields: FilterIncludedFields;
};

export type {
    FilterAttachment, FilterBaseParams, FilterEntity, FilterExcludedFields,
    FilterIncludedFields, FilterK,
    FilterMeta
};

