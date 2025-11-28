// TaskService.ts
import { apiService } from "@/app/api/ApiDetails";
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import apiNotificationsService from "@/app/api/NotificationsService";
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import Logger from "@/app/logging/Logger";
import { Task } from "@/app/models/tasks/Task";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskMeta } from '@/app/typings/entities/TaskEntity';
import { Idea } from '@/app/users/Ideas';
import { AxiosResponse } from "axios";
import { action, observable, runInAction } from "mobx";

const API_BASE_URL = endpoints.tasks;


/* ================================================================== */
/*  1.  generic singleton helper (module-scoped)                      */
/* ================================================================== */
const TASK_CACHE = new Map<string, TaskService<any, any, any, any, any, any>>();

function getCacheKey<
  T extends TaskEntity,
  K extends T = T,
  Meta extends TaskMeta = TaskMeta,
  AttachmentType extends TaskAttachment = TaskAttachment,
  ExcludedFields extends keyof T = TaskExcludedFields,
  IncludedFields extends keyof T = keyof T
>(): string {
  // stable key from the *actual* types passed at call-site
  return `${T.name}-${K.name}-${Meta.name}-${AttachmentType.name}-${String(ExcludedFields)}-${String(IncludedFields)}`;
}

class TaskService<
  T extends TaskEntity,
  K extends T = T,
  Meta extends TaskMeta = TaskMeta,
  AttachmentType extends TaskAttachment = TaskAttachment,
  ExcludedFields extends keyof T = TaskExcludedFields,
  IncludedFields extends keyof T = keyof T
> {

  @observable tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  @observable loading = false;
  @observable error: string | null = null;

  @action
  createTask = async (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, name: string,  title: string, type: NotificationType, requestData: string) => {
    try {
      task.id = UniqueIDGenerator.generateTaskID(name, title, type);

      const endpoint = API_BASE_URL.create;
      await axiosInstance.post(
        await apiService.callApi(`${endpoint}`, requestData),
        task
      );

      apiNotificationsService.notify(
        task.id,
        NOTIFICATION_MESSAGES.Tasks.TASK_CREATED,
        task,
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      runInAction(() => {
        this.tasks.push(task);
      });
    } catch (error) {
      throw new Error("Failed to create task");
    }
  };

  @action
  assignTask = async (projectId: string, taskId: string, assigneeId: string, requestData: string): Promise<void> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/assign`;
      await axiosInstance.put(await apiService.callApi(endpoint, requestData), {
        projectId,
        assigneeId
      });
      
      const task = this.getTaskById(taskId);
      if (task) {
        task.assigneeId = assigneeId;
      }
    } catch (error) {
      throw new Error("Failed to assign task");
    }
  };

  @action
  unassignTask = async (taskId: string, requestData: string): Promise<void> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/unassign`;
      await axiosInstance.put(await apiService.callApi(endpoint, requestData));
      
      const task = this.getTaskById(taskId);
      if (task) {
        task.assigneeId = undefined;
      }
    } catch (error) {
      throw new Error("Failed to unassign task");
    }
  };

  @action
  updateTaskPriority = async (taskId: number, newPriority: string, requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/priority`;
      const response = await axiosInstance.put(await apiService.callApi(endpoint, requestData), {
        priority: newPriority
      });
      
      const updatedTask = response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      const index = this.tasks.findIndex(task => task.id === String(taskId));
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      
      return updatedTask;
    } catch (error) {
      throw new Error("Failed to update task priority");
    }
  };

  @action
  markTaskComplete = async (taskId: string, requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/complete`;
      const response = await axiosInstance.put(await apiService.callApi(endpoint, requestData));
      
      const updatedTask = response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      const index = this.tasks.findIndex(task => task.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      
      return updatedTask;
    } catch (error) {
      throw new Error("Failed to mark task as complete");
    }
  };
  @action
  fetchTasks = async (requestData: string): Promise<void> => {
    try {
      this.loading = true;

      const endpoint = API_BASE_URL.list;
      const response = await axiosInstance.get(await apiService.callApi(`${endpoint}`, requestData));

      runInAction(() => {
        this.tasks = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to fetch tasks";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  @action
  fetchTask = (taskId: number, requestData: string): Promise<AxiosResponse<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>> => {
    const endpoint = `${API_BASE_URL}/${taskId}`;
    return apiService.callApi(endpoint, requestData)
      .then(apiEndpoint => axiosInstance.get<AxiosResponse<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>>(apiEndpoint))
      .then(response => response.data)
      .catch((error: unknown) => {
        throw new Error(`Failed to fetch task with ID ${taskId}`);
      });
  };

  @action
  fetchUpdatedData = async (
    progress: Progress,
    requestData: string
  ): Promise<void> => {
    try {
      this.loading = true;
      const endpoint = API_BASE_URL.update;
      const response = await axiosInstance.post(
        await apiService.callApi(`${endpoint}`, requestData),
        progress
      );
      runInAction(() => {
        this.tasks = response.data;
        this.error = null;
      });
      apiNotificationsService.notify(
        progress.id,
        NOTIFICATION_MESSAGES.Tasks.TASK_UPDATED,
        progress,
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      Logger.info(`Updated task: ${progress.id}`);
      Logger.info(response.data);
      Logger.info(response.status.toString());
      Logger.info(response.statusText);
      Logger.info(JSON.stringify(response.headers));
      Logger.info(JSON.stringify(response.config));
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to fetch updated data";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  @action
  addTask = (newTask: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, requestData: string): Promise<AxiosResponse<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>> => {
    const endpoint = API_BASE_URL.add;
    return apiService.callApi(`${endpoint}`, requestData)
      .then(apiEndpoint => axiosInstance.post<AxiosResponse<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>>(apiEndpoint, newTask, {
        headers: {
          "Content-Type": "application/json",
        },
      }))
      .then(response => {
        runInAction(() => {
          this.tasks.push(response.data.data);
          this.error = null;
        });
        return response.data;
      })
      .catch(error => {
        throw new Error("Failed to add task");
      });
  };

  @action
  removeTask = async (taskId: number, requestData: string): Promise<void> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}`; // Construct the endpoint URL
      await axiosInstance.delete(await apiService.callApi(endpoint, requestData));
    } catch (error) {
      throw new Error("Failed to remove task");
    }
  };


  @action
  processTasks = async (updatedTasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], taskType: string) => {
    try {
      const requestData = {
        taskIds: updatedTasks.map((task) => task.id),
        taskType: taskType,
      };

      this.loading = true;

      const endpoint = API_BASE_URL.process;

      await axiosInstance.post(await apiService.callApi(`${endpoint}`, requestData), {
        taskIds: updatedTasks.map((task) => task.id),
        taskType: taskType,
      });
    } catch (error: any) {
      throw new Error("Failed to process task");
    }
  };

  @action
  updateTask = (taskId: number, requestData: any): Promise<AxiosResponse<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>> => {
    const endpoint = `${API_BASE_URL}/${taskId}`; // Construct the endpoint URL

    return axiosInstance.put<AxiosResponse<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>>(endpoint, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => {
        runInAction(() => {
          const updatedTask = response.data.data;
          const index = this.tasks.findIndex(task => task.id === updatedTask.id);

          if (index !== -1) {
            this.tasks[index] = updatedTask;
          }
          this.error = null;
        });

        return response.data;
      })
      .catch(error => {
        throw new Error("Failed to update task");
      });
  };


  @action
  getTasks = async (requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
    try {
      const response = await axiosInstance.get(
        await apiService.callApi(
          `${API_BASE_URL.list}`,
          requestData
        )
      );
      return response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to fetch tasks";
      });
      return [];
    }
  };

  @action
  completeAllTasks = async (requestData: string): Promise<void> => {
    try {
      await axiosInstance.post(
        await apiService.callApi(`${API_BASE_URL.completeAll}`, requestData)
      );
    } catch (error) {
      throw new Error("Failed to complete all tasks");
    }
  };

  @action
  toggleTask = async (taskId: number, requestData?: any): Promise<void> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}`; // Construct the endpoint URL
      await axiosInstance.put(
        await apiService.callApi(endpoint, requestData),
        requestData
      );
    } catch (error) {
      throw new Error("Failed to toggle task");
    }
  };


  @action
  removeTasks = async (taskIds: number[], requestData: string): Promise<void> => {
    try {
      await axiosInstance.post(await apiService.callApi(`${API_BASE_URL.removeMultiple}`, requestData), {
        taskIds,
      });
    } catch (error) {
      throw new Error("Failed to remove tasks");
    }
  };

  @action
  toggleTasks = async (taskIds: number[], requestData: string): Promise<void> => {
    try {
      const endpoint = API_BASE_URL.toggleMultiple;
      await axiosInstance.post(await apiService.callApi(`${endpoint}`, requestData), {
        taskIds,
      });
    } catch (error) {
      throw new Error("Failed to toggle tasks");
    }
  };

  @action
  getTaskById(id: string): Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      return task;
    }
    return null;
  }

  @action
  fetchTaskData(taskId: number): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    return new Promise(async (resolve, reject) => {
      axiosInstance.get(await apiService.callApi(`${API_BASE_URL}/${taskId}`, ""))
        .then(response => {
          resolve(response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        })
        .catch(error => {
          reject(new Error("Failed to fetch task data"));
        });
    });
  }
  

  @action
  async markTaskInProgress(taskId: number, requestdata: string): Promise<void> {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/markInProgress`; 
      await axiosInstance.put(await apiService.callApi(endpoint, requestdata));
    } catch (error) {
      throw new Error("Failed to mark task as in progress");
    }
  }


  @action
  updateTaskProgress(id: string, progress: Progress): void {
    const task = this.getTaskById(id);
    if (task) {
      task.updateProgress(progress);
    }
  }

  @action
  markTaskAsInProgress = async (taskId: string, requestData: string) => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/markInProgress`; 
      await axiosInstance.put(await apiService.callApi(endpoint, requestData));

      const task = this.getTaskById(taskId);
      if (task) {
        task.status = "In Progress";
      }
    } catch (error: any) {
      Logger.error(error);
      apiNotificationsService.error(
        NOTIFICATION_MESSAGES.Tasks.TASK_MARKED_IN_PROGRESS_FAILED
      );
    }
  }

  @action
  batchUpdateTasks = async (ids: number[], newTitles: string[], requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
    try {
      const endpoint = API_BASE_URL.batchUpdate;
      const response = await axiosInstance.put(await apiService.callApi(endpoint, requestData), {
        ids,
        newTitles
      });
      
      const updatedTasks = response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      
      // Update local state
      updatedTasks.forEach(updatedTask => {
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      });
      
      return updatedTasks;
    } catch (error) {
      throw new Error("Failed to batch update tasks");
    }
  };

  @action
  batchRemoveTasks = async (taskIds: number[], requestData: string): Promise<void> => {
    try {
      const endpoint = API_BASE_URL.batchRemove;
      await axiosInstance.post(await apiService.callApi(endpoint, requestData), {
        taskIds
      });
      
      // Remove from local state
      this.tasks = this.tasks.filter(task => !taskIds.includes(Number(task.id)));
    } catch (error) {
      throw new Error("Failed to batch remove tasks");
    }
  };


  @action
  filterTasksByStatus = async (status: string, requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
    try {
      const endpoint = `${API_BASE_URL}/filter`;
      const response = await axiosInstance.post(await apiService.callApi(endpoint, requestData), {
        status
      });
      
      return response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    } catch (error) {
      throw new Error("Failed to filter tasks by status");
    }
  };

  @action
  sortTasksByDueDate = async (requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
    try {
      const endpoint = `${API_BASE_URL}/sort/due-date`;
      const response = await axiosInstance.get(await apiService.callApi(endpoint, requestData));
      
      return response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    } catch (error) {
      throw new Error("Failed to sort tasks by due date");
    }
  };


  @action
  updateTaskIdeas = async (taskId: string, ideas: Idea[], requestData: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    try {
      const endpoint = `${API_BASE_URL}/${taskId}/ideas`;
      const response = await axiosInstance.put(await apiService.callApi(endpoint, requestData), {
        ideas
      });
      
      const updatedTask = response.data as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      const index = this.tasks.findIndex(task => task.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      
      return updatedTask;
    } catch (error) {
      throw new Error("Failed to update task ideas");
    }
  };


  @action
  exportTasksToCSV = async (requestData: string): Promise<string> => {
    try {
      const endpoint = `${API_BASE_URL}/export/csv`;
      const response = await axiosInstance.get(await apiService.callApi(endpoint, requestData));
      
      return response.data;
    } catch (error) {
      throw new Error("Failed to export tasks to CSV");
    }
  };

  @action
  getTaskCountByStatus = async (requestData: string): Promise<Record<string, number>> => {
    try {
      const endpoint = `${API_BASE_URL}/counts/by-status`;
      const response = await axiosInstance.get(await apiService.callApi(endpoint, requestData));
      
      return response.data;
    } catch (error) {
      throw new Error("Failed to get task counts by status");
    }
  };

  @action
  archiveCompletedTasks = async (requestData: string): Promise<void> => {
    try {
      const endpoint = API_BASE_URL.archiveCompleted;
      await axiosInstance.post(await apiService.callApi(endpoint, requestData));
      
      // Remove completed tasks from local state
      this.tasks = this.tasks.filter(task => !task.isComplete);
    } catch (error) {
      throw new Error("Failed to archive completed tasks");
    }
  };

  @action
  clearAllTasks = async (requestData: string): Promise<void> => {
    try {
      const endpoint = API_BASE_URL.clearAll;
      await axiosInstance.delete(await apiService.callApi(endpoint, requestData));
      
      // Clear local state
      this.tasks = [];
    } catch (error) {
      throw new Error("Failed to clear all tasks");
    }
  };


}
export const taskService = new TaskService();
export default TaskService;
