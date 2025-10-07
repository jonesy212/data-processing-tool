// tasks/TaskActions.ts

import { createAction } from "@reduxjs/toolkit";
import { Task } from "@/app/models/tasks/Task";
import { Idea } from "@/app/users/Ideas";

export const TaskActions = {
  // Standard actions with full generic support
  add: createAction<{ 
    task: Task<any, any, any, any, any, any> 
  }>("addTask"),
  
  remove: createAction<number>("removeTask"),
  toggle: createAction<number>("toggleTask"),
  
  updateTask: createAction<{ 
    taskId: number, 
    task: Task<any, any, any, any, any, any>, 
    newTitle?: string 
  }>("updateTaskTitle"),
  
  validateTask: createAction<{ 
    task: Task<any, any, any, any, any, any> 
  }>("validateTask"),
  
  createTask: createAction<{ 
    projectId: string; 
    phaseId: string; 
    task: Task<any, any, any, any, any, any> 
  }>("createTask"),
  
  assignTask: createAction<{ 
    projectId: string; 
    taskId: string; 
    assigneeId: string 
  }>("assignTask"),
  
  fetchTaskData: createAction<{ 
    task: Task<any, any, any, any, any, any> 
  }>("fetchDataSaga"),

  unassignTask: createAction<{ taskId: string }>("tasks/unassignTask"),
  markTaskAsCompleted: createAction<{ taskId: string }>("tasks/markTaskAsCompleted"),
  getTaskDetails: createAction<string>("tasks/getTaskDetails"),
  listTasks: createAction("tasks/listTasks"),

  fetchTasksRequest: createAction("fetchTasksRequest"),
  fetchTasksByTaskUserId: createAction<{
    assigneeId: string,
    tasks: Task<any, any, any, any, any, any>[],
  }>("fetchTasksByTaskUserId"),
  
  fetchTasksSuccess: createAction<{ 
    tasks: Task<any, any, any, any, any, any>[] 
  }>("fetchTasksSuccess"),
  
  fetchTasksFailure: createAction<{ error: string }>("fetchTasksFailure"),
  
  completeAllTasks: createAction("completeAllTasks"),
  completeAllTasksRequest: createAction("completeAllTasksRequest"),
  completeAllTasksSuccess: createAction("completeAllTasksSuccess"),
  completeAllTasksFailure: createAction<{ error: string }>("completeAllTasksFailure"),
  
  updateTaskPrioritySuccess: createAction<{
    taskId: string, 
    priority: string,
    task?: Task<any, any, any, any, any, any>
  }>("updateTaskPrioritySuccess"),
  
  assignTaskToCurrentUser: createAction<{
    generatedTask: Promise<Task<any, any, any, any, any, any>>, 
    currentUser: string 
  }>("assignTaskToCurrentUser"),
  
  addTaskSuccess: createAction<{ 
    task: Task<any, any, any, any, any, any> 
  }>("addTaskSuccess"),
  
  addTaskFailure: createAction<{ error: string }>("addTaskFailure"),

  // Additional actions for updating tasks
  updateTaskSuccess: createAction<{ 
    task: Task<any, any, any, any, any, any> 
  }>("updateTaskSuccess"),
  
  updateTasksSuccess: createAction<{ 
    tasks: Task<any, any, any, any, any, any>[] 
  }>("updateTasksSuccess"),
  
  updateTaskFailure: createAction<{ error: string }>("updateTaskFailure"),
  
  // Additional actions for removing tasks
  removeTaskSuccess: createAction<number>("removeTaskSuccess"),
  removeTasksSuccess: createAction<{ 
    tasks: Task<any, any, any, any, any, any>[] 
  }>("removeTasksSuccess"),
  
  removeTaskFailure: createAction<{ error: string }>("removeTaskFailure"),

  // Additional actions for updating task assignee
  sortByDueDate: createAction("sortByDueDate"),
  exportTasksToCSV: createAction("exportTasksToCSV"),
  updateTaskPriority: createAction<{ 
    taskId: number, 
    newPriority: string 
  }>("updateTaskPriority"),
  
  updateTaskPriorityFailure: createAction<{ 
    taskId: string, 
    error: string 
  }>("updateTaskPriorityFailure"),

  filterTasksByStatus: createAction<{ status: string }>("filterTasksByStatus"),
  getTaskCountByStatus: createAction("getTaskCountByStatus"),
  clearAllTasks: createAction("clearAllTasks"),
  archiveCompletedTasks: createAction("archiveCompletedTasks"),

  markTaskAsInProgressSuccess: createAction<{
    taskId: string, 
    requestData: string,
    task?: Task<any, any, any, any, any, any>
  }>("markTaskAsInProgressSuccess"),

  updateTaskIdeas: createAction<{
    taskId: string, 
    ideas: Idea[] 
  }>("updateTaskIdeas"),
  
  // Batch actions for fetching
  batchFetchTasksRequest: createAction("batchFetchTasksRequest"),
  batchFetchTasksSuccess: createAction<{ 
    tasks: Task<any, any, any, any, any, any>[] 
  }>("batchFetchTasksSuccess"),
  
  batchFetchTasksFailure: createAction<{ error: string }>("batchFetchTasksFailure"),

  // Batch actions for updating
  batchUpdateTasksRequest: createAction<{ 
    ids: number[], 
    newTitles: string[] 
  }>("batchUpdateTasksRequest"),
  
  batchUpdateTasksSuccess: createAction<{ 
    tasks: Task<any, any, any, any, any, any>[] 
  }>("batchUpdateTasksSuccess"),
  
  batchUpdateTasksFailure: createAction<{ error: string }>("batchUpdateTasksFailure"),

  // Batch actions for removing
  batchRemoveTasksRequest: createAction<number[]>("batchRemoveTasksRequest"),
  batchRemoveTasksSuccess: createAction<number[]>("batchRemoveTasksSuccess"),
  batchRemoveTasksFailure: createAction<{ error: string }>("batchRemoveTasksFailure"),

  markTaskAsComplete: createAction<string>("markTaskAsComplete"),
  markTaskAsCompleteRequest: createAction<string>("markTaskAsCompleteRequest"),
  markTaskAsCompleteSuccess: createAction<string>("markTaskAsCompleteSuccess"),
  markTaskAsCompleteFailure: createAction<{ 
    taskId: string, 
    error: string 
  }>("markTaskAsCompleteFailure"),

  setAssignedTaskStore: createAction<{ 
    task: Task<any, any, any, any, any, any> | undefined, 
    assignee: string, 
    assignees?: string[], 
    tasks?: Task<any, any, any, any, any, any>[] 
  }>("setAssignedTaskStore"),
    // State management actions
  updateTasksState: createAction<{ 
    tasks: Task<any, any, any, any, any, any>[] 
  }>("tasks/updateTasksState"),
  
  resetTaskState: createAction("tasks/resetTaskState"),
  
  refreshTaskData: createAction<{ taskId?: number }>("tasks/refreshTaskData"),
  
  // UI/Notification actions (if needed)
  showNotification: createAction<{ 
    message: string; 
    type: 'success' | 'error' | 'info' 
  }>("ui/showNotification"),
};