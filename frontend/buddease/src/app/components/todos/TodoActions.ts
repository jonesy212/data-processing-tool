// todo/TodoActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Todo } from "./Todo";

export const TodoActions = {
  toggle: createAction<string>("toggle"),
  addTodo: createAction<string>("add"),
  type: createAction("type"),
  remove: createAction<string>("remove"),
  updateTitle: createAction<{ id: string, newTitle: string }>("updateTitle"),
  fetchTodosRequest: createAction("fetchTodosRequest"),
  fetchTodosSuccess: createAction<{ todos: Todo[] }>("fetchTodosSuccess"),
  fetchTodosFailure: createAction<{ error: string }>("fetchTodosFailure"),
  completeAllTodosRequest: createAction("completeAllTodosRequest"),
  completeAllTodosSuccess: createAction("completeAllTodosSuccess"),
  completeAllTodosFailure: createAction<{ error: string }>("completeAllTodosFailure"),

  updateTodoSuccess: createAction<{ todos: Todo[] }>("updateTodoSuccess"),
  updateTodoFailure: createAction<{ error: string }>("updateTodoFailure"),

  // Add more actions as needed
};
