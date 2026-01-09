// DocumentPhase.ts
import type { BaseDataEntity } from '@/core/config/BaseConfig';
import { ProjectPhaseTypeEnum } from '@/core/models/data/StatusType';
import type { TagsRecord } from '@/core/models/tracker/Tag';

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

export type { DocumentPhase };
