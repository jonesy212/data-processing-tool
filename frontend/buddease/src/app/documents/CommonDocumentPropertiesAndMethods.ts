// CommonDocumentPropertiesAndMethods.ts
import { Task } from "@/app/models/tasks/Task";
import Collaborator from "@/app/models/teams/TeamMembers";

interface CommonDocumentPropertiesAndMethods {
  //Common propertis and methods for a document ypes
  getTitle(): string;
  getAuthor(): string;
  printInfo(): void;
  createdAt: Date;
  updatedAt: Date;
  sharedWith: string[];
  downloadUrl: string;
  version: number;
  comments: string[];
  tags: string[];
  tasks: Task[];
  collaborators: Collaborator[];
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
}

export type { CommonDocumentPropertiesAndMethods };
