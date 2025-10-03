// todo/TodoActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Todo } from "./Todo";

export const TodoActions = {
  toggle: createAction<string>("toggle"),
  addTodo: createAction<string>("add"),
  type: createAction("type"),
  remove: createAction<string>("remove"),
  updateTodo: createAction<{ id: number; newTitle: string }>("updateTodoTitle"),
  updateTitle: createAction<{ id: string; newTitle: string }>("updateTitle"),
  fetchTodosRequest: createAction("fetchTodosRequest"),
  fetchTodoSuccess: createAction<{ todo: Todo }>("fetchTodosSuccess"),
  fetchTodosSuccess: createAction<{ todos: Todo[] }>("fetchTodosSuccess"),
  fetchTodosFailure: createAction<{ error: string }>("fetchTodosFailure"),
  completeAllTodosRequest: createAction("completeAllTodosRequest"),
  completeAllTodosSuccess: createAction("completeAllTodosSuccess"),
  completeAllTodosFailure: createAction<{ error: string }>(
    "completeAllTodosFailure"
  ),

  updateTodoSuccess: createAction<{ todo: Todo }>("updateTodoSuccess"),
  updateTodosSuccess: createAction<{ todos: Todo[] }>("updateTodoSuccess"),
  updateTodoFailure: createAction<{ error: string }>("updateTodoFailure"),

  batchAssignTodos: createAction<{ todoIds: string[]; assigneeId: string }>(
    "batchAssignTodos"
  ),
  batchAssignSuccess: createAction<{ todoIds: string[]; assigneeId: string }>(
    "batchAssignSuccess"
  ),

  batchAssignFailure: createAction<{ error: string }>("batchAssignFailure"),
  // Add more actions as needed

  //todo create the functions
  batchReassignTodos: createAction<{ todoIds: number[]; newTeamId: number }>(
    "batchReassignTodos"
  ),
  batchReassignSuccess: createAction<{ todoIds: number[]; newTeamId: number }>(
    "batchReassignSuccess"
  ),
  batchReassignFailure: createAction<{ error: string }>("batchReassignFailure"),
};




