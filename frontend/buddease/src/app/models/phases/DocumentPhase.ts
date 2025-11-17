// DocumentPhase.ts
import { ProjectPhaseTypeEnum } from '@/app/models/data/StatusType';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta, DefaultIncludedFields  } from '@/app/config/BaseConfig';

// ---------------------------
// Supporting Interfaces (New)
// ---------------------------

// Document Phase interface
interface DocumentPhase<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
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
  tags?: TagsRecord<T>| string[];
  phaseType: ProjectPhaseTypeEnum;
  customProp1: string;
  customProp2: number;
  onChange: (phase: ProjectPhaseTypeEnum) => void;
}

export type { DocumentPhase }