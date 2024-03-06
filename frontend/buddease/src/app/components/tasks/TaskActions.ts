// tasks/TaskActions.ts

import { createAction } from "@reduxjs/toolkit";
import { Task } from "../models/tasks/Task";

export const TaskActions = {
  // Standard actions
  add: createAction<Task>("addTask"),
  remove: createAction<number>("removeTask"),
  toggle: createAction<number>("toggleTask"),
  updateTask: createAction<{ id: number, newTitle: string }>("updateTaskTitle"), // Adjusted
  validateTask: createAction<Task>("validateTask"),
  fetchTasksRequest: createAction("fetchTasksRequest"),
  fetchTasksSuccess: createAction<{ tasks: Task[] }>("fetchTasksSuccess"),
  fetchTasksFailure: createAction<{ error: string }>("fetchTasksFailure"),
  
  
  completeAllTasks: createAction("completeAllTasks"),
  completeAllTasksRequest: createAction("completeAllTasksRequest"),
  completeAllTasksSuccess: createAction("completeAllTasksSuccess"),
  completeAllTasksFailure: createAction<{ error: string }>("completeAllTasksFailure"),


  addTaskSuccess: createAction<{ task: Task }>("addTaskSuccess"),
  addTaskFailure: createAction<{ error: string }>("addTaskFailure"),

  // Additional actions for updating tasks
  updateTaskSuccess: createAction<{ task: Task }>("updateTaskSuccess"),
  updateTasksSuccess: createAction<{ tasks: Task[] }>("updateTasksSuccess"),
  updateTaskFailure: createAction<{ error: string }>("updateTaskFailure"),
  
  // Additional actions for removing tasks
  removeTaskSuccess: createAction<number>("removeTaskSuccess"),
  removeTasksSuccess: createAction<{ tasks: Task[] }>("removeTasksSuccess"),
  removeTaskFailure: createAction<{ error: string }>("removeTaskFailure"),
  
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

  markTaskAsComplete: createAction<string>("markTaskAsComplete"),
  markTaskAsCompleteRequest: createAction<string>("markTaskAsCompleteRequest"),
  markTaskAsCompleteSuccess: createAction<string>("markTaskAsCompleteSuccess"),
  markTaskAsCompleteFailure: createAction<{ taskId: string, error: string }>("markTaskAsCompleteFailure"),
};
