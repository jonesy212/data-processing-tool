// MarkdownDoc.ts
import { Task } from '@/app/models/tasks/Task';
import { Collaborator } from '@/app/collaborators/Collaborator';

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from "@/app/documents/attachment/Attachment";
import { MarkdownDocument } from "@/app/documents/DocumentInterfaces";

// MarkdownDocument Implementation
class MarkdownDoc<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements MarkdownDocument<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    id: string;
    title: string;
    content: string;
    htmlContent: string;
    author: string;
    author: string;
    tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = []; // Can initialize empty array
    collaborators: Collaborator[] = [];

    createdAt: Date;
    updatedAt: Date;
    sharedWith: string[];
    downloadUrl: string;
    version: number;
    comments: string[];
    tags: string[];
    tasks: any[]; // Can be Task<T,K,...>
    collaborators: any[];
    permissions: Record<string, boolean>;
    isPublic: boolean;
    parentDocument: string;
    history: string[];
    isTemplate: boolean;
    dueDate: Date;
    owner: string;
    favorite: boolean;
    collaborativeEditing: boolean;
    taskAssignees: Record<string, string[]>;

    fileType: string;
    constructor(id: string, title: string, content: string, author: string) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.author = author;
      this.htmlContent = '';
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.sharedWith = [];
      this.downloadUrl = '';
      this.version = 1;
      this.comments = [];
      this.tags = [];
      this.tasks = [];
      this.collaborators = [];
      this.permissions = {};
      this.isPublic = false;
      this.parentDocument = '';
      this.history = [];
      this.isTemplate = false;
      this.dueDate = new Date();
      this.owner = author;
      this.favorite = false;
      this.collaborativeEditing = false;
      this.taskAssignees = {};
      this.fileType = 'markdown';
    }
  
    getTitle(): string {
      return this.title;
    }
  
    getAuthor(): string {
      return this.author;
    }
  
    printInfo(): void {
      console.log(`Title: ${this.getTitle()}, Author: ${this.getAuthor()}`);
    }
  
    convertToHTML(markdown: string): void {
      this.htmlContent = markdown; // Here, convert markdown to HTML logic should be implemented
    }
  }
  
export default MarkdownDoc
  
// Creating and using a MarkdownDocument
const markdownDoc = new MarkdownDoc('1', 'Markdown Title', '# Markdown Content', 'Author Name');
markdownDoc.printInfo();
markdownDoc.convertToHTML(markdownDoc.content);
