// tasks/TaskActions.ts
import { createAction } from "@reduxjs/toolkit";
import { Task } from "../models/tasks/Task";

export const TaskActions = {
  //standard actions
  add: createAction<Task>("addTask"),
  remove: createAction<number>("removeTask"),
  toggle: createAction<number>("toggleTask"),
  updateTask: createAction<{ id: number, newTitle: string, }>("updateTaskTitle"),
  
  fetchTasksRequest: createAction("fetchTasksRequest"),
  fetchTasksSuccess: createAction<{ tasks: Task[] }>("fetchTasksSuccess"),
  fetchTasksFailure: createAction<{ error: string }>("fetchTasksFailure"),
  completeAllTasksRequest: createAction("completeAllTasksRequest"),
  completeAllTasksSuccess: createAction("completeAllTasksSuccess"),
  completeAllTasksFailure: createAction<{ error: string }>("completeAllTasksFailure"),
  
  updateTitle: createAction<{ id: number, newTitle: string }>("updateTaskTitle"),
  updateTaskSuccess: createAction<{ task: Task }>("updateTaskSuccess"),
  updateTasksSuccess: createAction<{ tasks: Task[] }>("updateTasksSuccess"),
  updateTaskFailure: createAction<{ error: string }>("updateTaskFailure"),
  
  removeTaskSuccess: createAction<number>("removeTaskSuccess"),
  removeTasksSuccess: createAction<{ tasks: Task[] }>("removeTasksSuccess"),
  removeTaskFailure: createAction<{ error: string }>("removeTaskFailure"),
  // Add more actions as needed
};
