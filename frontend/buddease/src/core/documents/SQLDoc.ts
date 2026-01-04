SQLDoc.ts

import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SQLDocument } from "@/core/documents/editing/SQLDocument";
import { Task } from "@/core/models/tasks/Task";

SQLDocument Implementation
class SQLDoc<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> implements SQLDocument<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  createdAt!: Date;
  updatedAt!: Date;
  sharedWith!: string[];
  downloadUrl!: string;
  id!: string;
  name!: string;
  description!: string;
  content!: string;
  language!: string;
  userId!: string;
  isPublic!: boolean;
  isArchived!: boolean;
  parentId!: string | null;
  folderId!: string | null;
  fileType!: string;
  fileSize!: number;
  fileExtension!: string;
 
  query: string;
  author: string;

  constructor(query: string, author: string) {
    this.query = query;
    this.author = author;
  }
    version!: number;
    comments!: string[];
    tags!: string[];
    tasks!: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    collaborators!: string[];
    permissions!: Record<string, boolean>;
    parentDocument!: string;
    history!: string[];
    isTemplate!: boolean;
    dueDate!: Date;
    owner!: string;
    favorite!: boolean;
    collaborativeEditing!: boolean;
    taskAssignees!: Record<string, string[]>;

  getTitle(): string {
    return "SQL Document";
  }

  getAuthor(): string {
    return this.author;
  }

  printInfo(): void {
    console.log(`Author: ${this.getAuthor()}, Query: ${this.query}`);
  }

  async execute(): Promise<void> {
    console.log("Executing SQL query...");
  }
}

export default SQLDoc;

Creating and using an SQLDocument
const sqlDoc = new SQLDoc("SELECT * FROM users", "Author Name");
sqlDoc.printInfo();
sqlDoc.execute();
