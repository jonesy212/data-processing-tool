// DocumentBuilderEntity.ts
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

export type DocumentBuilderEntity = BaseDataEntity;
export type DocumentBuilderK = DocumentBuilderEntity;
export type DocumentBuilderMeta = DefaultMeta<DocumentBuilderEntity, DocumentBuilderK>;
export type DocumentBuilderAttachment = Attachment;
export type DocumentBuilderExcludedFields = never;
export type DocumentBuilderIncludedFields = keyof DocumentBuilderEntity;

export type FrontendStructureEntity = BaseDataEntity;
export type FrontendStructureK = FrontendStructureEntity;
export type FrontendStructureMeta = DefaultMeta<FrontendStructureEntity, FrontendStructureK>;
export type FrontendStructureAttachment = Attachment;
export type FrontendStructureExcludedFields = never;
export type FrontendStructureIncludedFields = keyof FrontendStructureEntity;    