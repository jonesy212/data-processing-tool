// tasks/TaskActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Task } from "../models/tasks/Task";

export const TaskActions = {
  toggle: createAction<number>("toggleTask"),
  add: createAction<Task>("addTask"),
  remove: createAction<number>("removeTask"),
  updateTitle: createAction<{ id: number, newTitle: string }>("updateTaskTitle"),
  fetchTasksRequest: createAction("fetchTasksRequest"),
  fetchTasksSuccess: createAction<{ tasks: Task[] }>("fetchTasksSuccess"),
  fetchTasksFailure: createAction<{ error: string }>("fetchTasksFailure"),
  completeAllTasksRequest: createAction("completeAllTasksRequest"),
  completeAllTasksSuccess: createAction("completeAllTasksSuccess"),
  completeAllTasksFailure: createAction<{ error: string }>("completeAllTasksFailure"),

  // Add more actions as needed
};
