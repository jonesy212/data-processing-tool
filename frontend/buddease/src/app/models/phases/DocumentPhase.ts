// DocumentPhase.ts
import { BaseDataEntity } from '@/app/config/BaseConfig';
import { ProjectPhaseTypeEnum } from '@/app/models/data/StatusType';
import { TagsRecord } from '@/app/models/tracker/Tag';

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
