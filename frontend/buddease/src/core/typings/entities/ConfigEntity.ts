// ConfigEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Core Config base types
type ConfigEntity = BaseDataEntity;
type ConfigK = ConfigEntity;
type ConfigMeta = DefaultMeta<ConfigEntity, ConfigK>;
type ConfigAttachment = Attachment;
type ConfigExcludedFields = DefaultExcludedFields<ConfigEntity>;
type ConfigIncludedFields = keyof ConfigEntity;

// Parameter container for consistent referencing
type ConfigBaseParams = {
  T: ConfigEntity;
  K: ConfigK;
  Meta: ConfigMeta;
  AttachmentType: ConfigAttachment;
  ExcludedFields: ConfigExcludedFields;
  IncludedFields: ConfigIncludedFields;
};

export type {
    ConfigAttachment, ConfigBaseParams, ConfigEntity, ConfigExcludedFields,
    ConfigIncludedFields, ConfigK,
    ConfigMeta
};

