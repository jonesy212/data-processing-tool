import { Attachment, Todo } from "../../todos/Todo";

interface Data {
  id: string | number;
  title: string;
  description?: string | undefined; // Updated this line
  startDate?: Date;
  endDate?: Date;
  status: "pending" | "inProgress" | "completed";
  isActive: boolean;
  tags: string[];

  then: (callback: (newData: Data) => void) => void;
    // Add other common data properties as needed
    
    // Properties specific to Todo
  dueDate?: Date | null;
  priority?: "low" | "medium" | "high";
  assignee?: string | null;
  collaborators?: string[];
  comments?: Comment[];
  attachments?: Attachment[];
  subtasks?: Todo[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
    isBeingReassigned?: boolean;
    analysisType: string;
    analysisResults: string[];
}

export type { Data };
