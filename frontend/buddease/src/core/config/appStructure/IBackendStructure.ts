// IBackendStructure.ts
// app/interfaces/IBackendStructure.ts
import type { AppStructureItem } from "@/core/config/appStructure/AppStructure";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';

export interface IBackendStructure<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  getStructure(): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>;
  getStructureAsArray(): AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  traverseDirectory?(dir: string): Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  getStructureHash?(): Promise<string | number | undefined>;
  setStructureHash?(hash: string): Promise<void>;
}
