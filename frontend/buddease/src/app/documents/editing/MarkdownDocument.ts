// MarkdownDocument.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CommonDocumentPropertiesAndMethods } from "./CommonDocumentPropertiesAndMethods";

export interface MarkdownDocument<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonDocumentPropertiesAndMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  convertToHTML(markdown: string): void
}