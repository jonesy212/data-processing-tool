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

  // Batch actions for fetching
  batchFetchTasksRequest: createAction("batchFetchTasksRequest"),
  batchFetchTasksSuccess: createAction<{ tasks: Task[] }>("batchFetchTasksSuccess"),
  batchFetchTasksFailure: createAction<{ error: string }>("batchFetchTasksFailure"),

  // Batch actions for updating
  batchUpdateTasksRequest: createAction<{ ids: number[], newTitles: string[] }>("batchUpdateTasksRequest"),
  batchUpdateTasksSuccess: createAction<{ tasks: Task[] }>("batchUpdateTasksSuccess"),
  batchUpdateTasksFailure: createAction<{ error: string }>("batchUpdateTasksFailure"),

  // Batch actions for removing
  batchRemoveTasksRequest: createAction<number[]>("batchRemoveTasksRequest"),
  batchRemoveTasksSuccess: createAction<number[]>("batchRemoveTasksSuccess"),
  batchRemoveTasksFailure: createAction<{ error: string }>("batchRemoveTasksFailure"),

  markTaskAsCompleteRequest: createAction<string>("markTaskAsCompleteRequest"),
  markTaskAsCompleteSuccess: createAction<string>("markTaskAsCompleteSuccess"),
  markTaskAsCompleteFailure: createAction<{ taskId: string, error: string }>("markTaskAsCompleteFailure"),

};
