// DocumentPhase.ts

// ---------------------------
// Supporting Interfaces (New)
// ---------------------------

// Document Phase interface
interface DocumentPhase<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
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
  tags?: TagsRecord<T, K, Meta, ExcludedFields> | string[];
  phaseType: ProjectPhaseTypeEnum;
  customProp1: string;
  customProp2: number;
  onChange: (phase: ProjectPhaseTypeEnum) => void;
}

export type { DocumentPhase }