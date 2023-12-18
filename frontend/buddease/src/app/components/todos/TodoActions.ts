// todo/TodoActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Todo } from "./TodoReducer";

export const TodoActions = {
  toggle: createAction<string>("toggle"),
  add: createAction<string>("add"),
  type: createAction("type"),
  remove: createAction<string>("remove"),
  updateTitle: createAction<{ id: string, newTitle: string }>("updateTitle"),
  fetchTodosRequest: createAction("fetchTodosRequest"),
  fetchTodosSuccess: createAction<{ todos: Todo[] }>("fetchTodosSuccess"),
  fetchTodosFailure: createAction<{ error: string }>("fetchTodosFailure"),
  completeAllTodosRequest: createAction("completeAllTodosRequest"),
  completeAllTodosSuccess: createAction("completeAllTodosSuccess"),
  completeAllTodosFailure: createAction<{ error: string }>("completeAllTodosFailure"),

  // Add more actions as needed
};
