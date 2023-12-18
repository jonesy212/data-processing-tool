// todo/TodoReducer.ts
import { Draft } from "immer";
import { TodoActions } from "./TodoActions";

interface ToggleAction {
  type: typeof TodoActions.toggle;
  payload?: string;
}

interface AddAction {
  type: typeof TodoActions.add;
  payload?: string;
}

interface RemoveAction {
  type: typeof TodoActions.remove;
  payload?: string;
}

interface UpdateTitleAction {
  type: typeof TodoActions.updateTitle;
  payload: { id: string; newTitle: string };
}

interface FetchTodosRequestAction {
  type: typeof TodoActions.fetchTodosRequest;
}

interface FetchTodosSuccessAction {
  type: typeof TodoActions.fetchTodosSuccess;
  payload: { todos: Todo[] };
}

interface FetchTodosFailureAction {
  fetchTodosFailure: FetchTodosFailureAction;
  type: typeof TodoActions.fetchTodosFailure;
  payload: { error: string };
}

interface CompleteAllTodosRequestAction {
  type: typeof TodoActions.completeAllTodosRequest;
}

interface CompleteAllTodosSuccessAction {
  type: typeof TodoActions.completeAllTodosSuccess;
}

interface CompleteAllTodosFailureAction {
  type: typeof TodoActions.completeAllTodosFailure;
  payload: { error: string };
}

export type TodoAction =
  | ToggleAction
  | AddAction
  | RemoveAction
  | UpdateTitleAction
  | FetchTodosRequestAction
  | FetchTodosSuccessAction
  | FetchTodosFailureAction
  | CompleteAllTodosRequestAction
  | CompleteAllTodosSuccessAction
  | CompleteAllTodosFailureAction;

export const TodoReducer = (draft: Draft<Todo[]>, action: TodoAction) => {
  switch (action.type) {
    case TodoActions.toggle:
      const todo = draft.find(
        (todo: Todo) => todo.id === (action as ToggleAction).payload
      );
      if (todo && typeof (action as ToggleAction).payload === "string") {
        todo.done = !todo.done;
      }
      break;

    case TodoActions.add:
      draft.push({
        id: (action as AddAction).payload!,
        title: "A new todo",
        done: false,
        todos: [],
        description: "",
        dueDate: null,
        priority: "low",
        assignee: null,
        collaborators: [],
        labels: [],
        comments: [],
        attachments: [],
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "",
        updatedBy: "",
        isArchived: false,
        isCompleted: false,
        isBeingEdited: false,
        isBeingDeleted: false,
        isBeingCompleted: false,
        isBeingReassigned: false,
      });
      break;

    case TodoActions.remove:
      const index = draft.findIndex(
        (todo: Todo) => todo.id === (action as RemoveAction).payload
      );
      if (index !== -1) {
        draft.splice(index, 1);
      }
      break;

    case TodoActions.updateTitle:
      const updateTitleAction = action as UpdateTitleAction;
      const todoToUpdateTitle = draft.find(
        (todo: Todo) => todo.id === updateTitleAction.payload.id
      );
      if (todoToUpdateTitle) {
        todoToUpdateTitle.title = updateTitleAction.payload.newTitle;
      }
      break;

    case TodoActions.fetchTodosSuccess:
      const fetchTodosSuccessAction = action as FetchTodosSuccessAction;
      draft.push(...fetchTodosSuccessAction.payload.todos);
      break;

    case TodoActions.fetchTodosFailure:
      const fetchTodosFailureAction = action as FetchTodosFailureAction;
      // Handle fetch todos failure if needed
      fetchTodosFailureAction.fetchTodosFailure =
        action as FetchTodosFailureAction;
      break;

    case TodoActions.completeAllTodosRequest:
      // Handle complete all todos request if needed
      // update UI state to indicate that all todos are being completed
      draft.forEach((todo: Todo) => {
        todo.done = true;
      });

      // Make sure to return the modified draft at the end
      return draft;

    case TodoActions.completeAllTodosSuccess:
      // Mark all todos as done
      draft.forEach((todo: Todo) => {
        todo.done = true;
      });
      break;

    default:
      break;
  }
};

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

export interface User { 
    id: string
    username: string
}

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
