// todo/Todo.ts
import { Data } from "../models/data/Data";
import { User } from "../users/User";
  

export interface Todo extends Data {
  done: boolean;
  status: "pending" | "inProgress" | "completed";
  todos: Todo[];
  description: string;
  dueDate: Date | null;
  priority: "low" | "medium" | "high";
  assignedTo: User | null;
  assignee: User | null;
  assignedUsers: string[];
  collaborators: string[];
  labels: string[];
  comments: Comment[] ;
  attachments: Attachment[];
  subtasks: Todo[];
  isArchived: boolean;
  isCompleted: boolean;
  isBeingEdited: boolean;
  isBeingDeleted: boolean;
  isBeingCompleted: boolean;
  isBeingReassigned: boolean;
  save: () => Promise<void>;
}


export interface Comment extends Data, CharacterData {
  text: string;
  editedAt?: Date;
  editedBy?: string;
  attachments?: Attachment[];
  replies?: Comment[];
  likes?: User[];
  
}

export interface Attachment extends Data {
  url: string;
  name: string;
  fileType: FileType;
  size: number;
  isImage?: boolean;
  metadata?: Record<string, any>;
}

export type FileType = "image" | "document" | "link" | "audio" | "video" | "other";

export interface TodoManagerState {
  entities: Record<string, Todo>;
}

export const todoInitialState: TodoManagerState = {
  entities: {},
};




 
  