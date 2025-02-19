// SQLDoc.ts

import { Task } from "../models/tasks/Task";
import { SQLDocument } from "./DocumentInterfaces";

// SQLDocument Implementation
class SQLDoc implements SQLDocument {
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
    tasks!: Task[];
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

// Creating and using an SQLDocument
const sqlDoc = new SQLDoc("SELECT * FROM users", "Author Name");
sqlDoc.printInfo();
sqlDoc.execute();
