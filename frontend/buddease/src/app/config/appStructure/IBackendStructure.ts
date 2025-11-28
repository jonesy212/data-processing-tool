// IBackendStructure.ts
// app/interfaces/IBackendStructure.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { AppStructureItem } from "@/app/config/appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";

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
