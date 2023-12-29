// todo/Todo.ts
import { User } from "./tasks/User";



  
export interface Todo {
  id: string;
  title: string;
  done: boolean;
  todos: Todo[];
  description: string;
  dueDate: Date | null;
  priority: "low" | "medium" | "high";
  assignee: string | null; // User ID of the assigned person
  collaborators: string[]; // User IDs of collaborators
  labels: string[]; // Tags or labels associated with the todo
  comments: Comment[];
  attachments: Attachment[];
  subtasks: Todo[];
  createdAt: Date;
  updatedAt: Date; //
  createdBy: string; // User ID of the creator
  updatedBy: string; // User ID of the last updater
  isArchived: boolean;
  isCompleted: boolean;
  isBeingEdited: boolean; // Indicates if the todo is currently being edited
  isBeingDeleted: boolean; // Indicates if the todo is currently being deleted
  isBeingCompleted: boolean;
  isBeingReassigned: boolean; // Indicates if the todo is currently being reassigned to another user
}


// export type TodoAction =
//   | ToggleAction
//   | AddAction
//   | RemoveAction
//   | UpdateTitleAction
//   | FetchTodosRequestAction
//   | FetchTodosSuccessAction
//   | FetchTodosFailureAction
//   | CompleteAllTodosRequestAction
//   | CompleteAllTodosSuccessAction
//   | CompleteAllTodosFailureAction;




// export interface TodosProps {
//   id: string;
//   todoName: string;
//   isComplete: boolean;
// }

// interface TogglePayload {
//   id: string;
//   title: string;
//   error?: string; 
// }

// interface ToggleAction {
//   type: typeof TodoActions.toggle;
//   payload?: TogglePayload;
// }

// export interface AddAction {
//   type: typeof TodoActions.add;
//   payload?: string;
// }


// export interface RemoveAction {
//   type: typeof TodoActions.remove;
//   payload?: string;
// }

// export interface UpdateTitleAction {
//   type: typeof TodoActions.updateTitle;
//   payload: { id: string; newTitle: string };
// }

// interface FetchTodosRequestAction {
//   type: typeof TodoActions.fetchTodosRequest;
// }

// interface FetchTodosSuccessAction {
//   type: typeof TodoActions.fetchTodosSuccess;
//   payload: { todos: Todo[] };
// }

// interface FetchTodosFailureAction {
//   fetchTodosFailure: FetchTodosFailureAction;
//   type: typeof TodoActions.fetchTodosFailure;
//   payload: { error: string  };
// }

// interface CompleteAllTodosRequestAction {
//   type: typeof TodoActions.completeAllTodosRequest;
// }

// interface CompleteAllTodosSuccessAction {
//   type: typeof TodoActions.completeAllTodosSuccess;
// }

// interface CompleteAllTodosFailureAction {
//   type: typeof TodoActions.completeAllTodosFailure;
//   payload: { id: string, title: string, done: boolean, error?: string };
// }

  
  export interface Comment {
    id: string;
    text: string;
    createdAt: Date;
    createdBy: string; // User ID of the commenter
    editedAt?: Date; // Timestamp indicating when the comment was last edited
    editedBy?: string; // User ID of the person who last edited the comment
    attachments?: Attachment[]; // List of attachments associated with the comment
    replies?: Comment[]; // List of replies to the comment
    likes?: User[]; // List of users who liked the comment
  }
  
  export interface Attachment {
    id: string;
    url: string;
    name: string;
    fileType: FileType;
    size: number; // Size of the attachment in bytes
    uploadedAt: Date;
    uploadedBy: string; // User ID of the person who uploaded the attachment
    isImage?: boolean; // Indicates if the attachment is an image
    metadata?: Record<string, any>; // Additional metadata specific to the attachment type
  }
  
  export type FileType =
    | "image"
    | "document"
    | "link"
    | "audio"
    | "video"
    | "other";
  
  
  
  
  





 
  