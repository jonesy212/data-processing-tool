// ConfigEntity.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

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

