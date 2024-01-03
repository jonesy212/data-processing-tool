// tasks/TaskActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Task } from "../models/tasks/Task";

export const TaskActions = {
  toggle: createAction<number>("toggleTask"),
  add: createAction<Task>("addTask"),
  remove: createAction<number>("removeTask"),
  updateTask: createAction<{ id: number, newTitle: string,  }>("updateTaskTitle"),
  updateTitle: createAction<{ id: number, newTitle: string }>("updateTaskTitle"),
  fetchTasksRequest: createAction("fetchTasksRequest"),
  fetchTasksSuccess: createAction<{ tasks: Task[] }>("fetchTasksSuccess"),
  fetchTasksFailure: createAction<{ error: string }>("fetchTasksFailure"),
  completeAllTasksRequest: createAction("completeAllTasksRequest"),
  completeAllTasksSuccess: createAction("completeAllTasksSuccess"),
  completeAllTasksFailure: createAction<{ error: string }>("completeAllTasksFailure"),

  updateTaskSuccess: createAction<{ task: Task }>("updateTaskSuccess"),
  updateTasksSuccess: createAction<{ tasks: Task[] }>("updateTasksSuccess"),
  updateTaskFailure: createAction<{ error: string }>("updateTaskFailure"),

  // Add more actions as needed
};
