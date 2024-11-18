// tasks/TaskActions.ts

import { createAction } from "@reduxjs/toolkit";
import { Task } from "../models/tasks/Task";
import { Idea } from "../users/Ideas";
import { T, K } from "@/app/components/models/data/dataStoreMethods";

export const TaskActions = {
  // Standard actions
  add: createAction<Task<T, K<T>>>("addTask"),
  remove: createAction<number>("removeTask"),
  toggle: createAction<number>("toggleTask"),
  updateTask: createAction<{ taskId: number, task: Task<T, K<T>>, newTitle?: string }>("updateTaskTitle"), // Adjusted
  validateTask: createAction<Task<T, K<T>>>("validateTask"),
  createTask: createAction<{ projectId: string; phaseId: string; task: Task<T, K<T>> }>("createTask"),
  assignTask: createAction<{ projectId: string; taskId: string; assigneeId: string }>("assignTask"),
  fetchTaskData: createAction<Task<T, K<T>>>("fetchDataSaga"),

  fetchTasksRequest: createAction("fetchTasksRequest"),
  fetchTasksByTaskUserId: createAction<{
    assigneeId: string,
    tasks: Task<T, K<T>>[],
  }>("fetchTasksByTaskUserId"),
  fetchTasksSuccess: createAction<{ tasks: Task<T, K<T>>[] }>("fetchTasksSuccess"),
  fetchTasksFailure: createAction<{ error: string }>("fetchTasksFailure"),
  
  
  completeAllTasks: createAction("completeAllTasks"),
  completeAllTasksRequest: createAction("completeAllTasksRequest"),
  completeAllTasksSuccess: createAction("completeAllTasksSuccess"),
  completeAllTasksFailure: createAction<{ error: string }>("completeAllTasksFailure"),
  
  updateTaskPrioritySuccess: createAction<{
    taskId: Task<T, K<T>>, priority: string
    
   }>("updateTaskPrioritySuccess"),
  assignTaskToCurrentUser: createAction<{generatedTask: Promise<Task<T, K<T>>>, currentUser: string }>("assignTaskToCurrentUser"),
  addTaskSuccess: createAction<{ task: Task<T, K<T>> }>("addTaskSuccess"),
  addTaskFailure: createAction<{ error: string }>("addTaskFailure"),

  // Additional actions for updating tasks
  updateTaskSuccess: createAction<{ task: Task<T, K<T>> }>("updateTaskSuccess"),
  updateTasksSuccess: createAction<{ tasks: Task<T, K<T>>[] }>("updateTasksSuccess"),
  updateTaskFailure: createAction<{ error: string }>("updateTaskFailure"),
  
  // Additional actions for removing tasks
  removeTaskSuccess: createAction<number>("removeTaskSuccess"),
  removeTasksSuccess: createAction<{ tasks: Task<T, K<T>>[] }>("removeTasksSuccess"),
  removeTaskFailure: createAction<{ error: string }>("removeTaskFailure"),
  


  // Additional actions for updating task assignee
  sortByDueDate: createAction("sortByDueDate"),
  exportTasksToCSV: createAction("exportTasksToCSV"),
  updateTaskPriority: createAction<{ taskId: number, newPriority: string }>("updateTaskPriority"),
  updateTaskPriorityFailure: createAction<{ taskId: string, error: string }>("updateTaskPriorityFailure"),

  filterTasksByStatus: createAction<{ status: string }>("filterTasksByStatus"),
  getTaskCountByStatus: createAction("getTaskCountByStatus"),
  clearAllTasks: createAction("clearAllTasks"),
  archiveCompletedTasks: createAction("archiveCompletedTasks"),



  markTaskAsInProgressSuccess: createAction<{taskId: Task<T, K<T>>, requestData: string}>("markTaskAsInProgressSuccess"),

  updateTaskIdeas: createAction<{taskId: string, ideas: Idea[]}>("updateTaskIdeas"),
  // Batch actions for fetching
  batchFetchTasksRequest: createAction("batchFetchTasksRequest"),
  batchFetchTasksSuccess: createAction<{ tasks: Task<T, K<T>>[] }>("batchFetchTasksSuccess"),
  batchFetchTasksFailure: createAction<{ error: string }>("batchFetchTasksFailure"),

  // Batch actions for updating
  batchUpdateTasksRequest: createAction<{ ids: number[], newTitles: string[] }>("batchUpdateTasksRequest"),
  batchUpdateTasksSuccess: createAction<{ tasks: Task<T, K<T>>[] }>("batchUpdateTasksSuccess"),
  batchUpdateTasksFailure: createAction<{ error: string }>("batchUpdateTasksFailure"),

  // Batch actions for removing
  batchRemoveTasksRequest: createAction<number[]>("batchRemoveTasksRequest"),
  batchRemoveTasksSuccess: createAction<number[]>("batchRemoveTasksSuccess"),
  batchRemoveTasksFailure: createAction<{ error: string }>("batchRemoveTasksFailure"),

  markTaskAsComplete: createAction<string>("markTaskAsComplete"),
  markTaskAsCompleteRequest: createAction<string>("markTaskAsCompleteRequest"),
  markTaskAsCompleteSuccess: createAction<string>("markTaskAsCompleteSuccess"),
  markTaskAsCompleteFailure: createAction<{ taskId: string, error: string }>("markTaskAsCompleteFailure"),


  setAssignedTaskStore: createAction<{ task: Task<T, K<T>> | undefined , assignee: string, assignees?: string[], tasks?: Task<T, K<T>>[] }>("setAssignedTaskStore"),
  
};
