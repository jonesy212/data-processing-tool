// DocumentPhase.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta, DefaultIncludedFields  } from '@/app/config/BaseConfig';

// ---------------------------
// Supporting Interfaces (New)
// ---------------------------

// Document Phase interface
interface DocumentPhase<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  name?: string;
  originalPath?: string;
  alternatePaths?: string[];
  fileType?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  authors?: string[];
  contributors?: string[];
  publisher?: string;
  copyright?: string;
  license?: string;
  links?: string[];
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| string[];
  phaseType: ProjectPhaseTypeEnum;
  customProp1: string;
  customProp2: number;
  onChange: (phase: ProjectPhaseTypeEnum) => void;
}

export type { DocumentPhase }