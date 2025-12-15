// NoteEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';

// --- 1️⃣ Core entity definition ---
interface NoteEntity extends BaseDataEntity {
  id: string | number;
  title: string;
  content: string;
  tags?: string[];
  attachments?: Attachment[];
}

// --- 2️⃣ Entity type aliases for use as generics ---
type NoteK = NoteEntity;
type NoteMeta = DefaultMeta<NoteEntity, NoteK>;
type NoteAttachment = Attachment;
type NoteExcludedFields = DefaultExcludedFields<NoteEntity>;
type NoteIncludedFields = keyof NoteEntity;


export type {
  NoteAttachment, NoteEntity, NoteExcludedFields,
  NoteIncludedFields, NoteK,
  NoteMeta
};

