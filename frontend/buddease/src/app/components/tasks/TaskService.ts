import { apiService } from "@/app/api/ApiDetails";
import { endpoints } from "@/app/api/ApiEndpoints";
import apiNotificationsService from "@/app/api/NotificationsService";
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import axios from "axios";
import dotProp from "dot-prop";
import { action, observable, runInAction } from "mobx";
import Logger from "../logging/Logger";
import { Task } from "../models/tasks/Task";
import { Progress } from "../models/tracker/ProgressBar";
import { NotificationTypeEnum } from "../support/NotificationContext";

const API_BASE_URL = endpoints.tasks;
class TaskService {
  @observable tasks: Task[] = [];
  @observable loading = false;
  @observable error: string | null = null;

  @action
  createTask = async (task: Task,  taskId: string, requestData: string) => { 
    try {
      task.id =  UniqueIDGenerator.generateTaskID(taskId, await task);

      const endpoint = dotProp.getProperty(API_BASE_URL, 'tasks.create');
      await axios.post(await apiService.callApi(`${endpoint}`, requestData), task);

      apiNotificationsService.notify(
        task.id,
        NOTIFICATION_MESSAGES.Tasks.TASK_CREATED,
        task,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      runInAction(() => {
        this.tasks.push(task);
      });
    } catch (error) {
      throw new Error("Failed to create task");
    }
  }

  @action
  fetchTasks = async (requestData: string): Promise<void> => {
    try {
      this.loading = true;
  
      const endpoint = dotProp.getProperty(API_BASE_URL, 'tasks.list()');
      const response = await axios.get(await apiService.callApi(`${endpoint}`, requestData));
  
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
  fetchTask = async (taskId: number, requestData: string): Promise<Task> => {
    try {
      const response = await axios.get(
        await apiService.callApi(dotProp.getProperty(API_BASE_URL, `tasks.single(${taskId})`), requestData)
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch task with ID ${taskId}`);
    }
  };

  @action
  addTask = async (newTask: Task, requestData: string): Promise<Task> => {
    try {
      const response = await axios.post(
        await apiService.callApi(dotProp.getProperty(API_BASE_URL, "tasks.add"), requestData),
        newTask,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      runInAction(() => {
        this.tasks.push(response.data);
        this.error = null;
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to add task");
    }
  };

  @action
  removeTask = async (taskId: number, requestData: string): Promise<void> => {
    try {
      await axios.delete(await apiService.callApi(dotProp.getProperty(API_BASE_URL, `tasks.remove(${taskId})`), requestData));
    } catch (error) {
      throw new Error("Failed to remove task");
    }
  };

  @action
  updateTask = async (
    taskId: number,
    newTitle?: string,
    requestData?: any
  ): Promise<Task> => {
    try {
      const endpointPath = `tasks.update(${taskId})`;
      const endpoint = dotProp.getProperty(API_BASE_URL, endpointPath) as
        | string
        | undefined;

      if (!endpoint) {
        throw new Error(`${endpointPath} endpoint not found`);
      }

      const response = await axios.put(endpoint, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      runInAction(() => {
        const updatedTask = response.data;
        const index = this.tasks.findIndex(
          (task) => task.id === updatedTask.id
        );

        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.error = null;
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to update task");
    }
  };

  @action
  getTasks = async (requestData: string): Promise<Task[]> => {
    try {
      const response = await axios.get(
        await apiService.callApi(
          dotProp.getProperty(API_BASE_URL, "tasks.list"),
          requestData
        )
      );
      return response.data as Task[];
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
      await axios.post(await apiService.callApi(dotProp.getProperty(API_BASE_URL, "tasks.completeAll"), requestData));
    } catch (error) {
      throw new Error("Failed to complete all tasks");
    }
  };

  @action
  toggleTask = async (taskId: number, requestData?: any): Promise<void> => {
    try {
      await axios.put(
        await apiService.callApi(dotProp.getProperty(API_BASE_URL, `tasks.toggle(${taskId})`), requestData),
        requestData
      );
    } catch (error) {
      throw new Error("Failed to toggle task");
    }
  };

  @action
  removeTasks = async (taskIds: number[], requestData: string): Promise<void> => {
    try {
      await axios.post(await apiService.callApi(dotProp.getProperty(API_BASE_URL, "tasks.removeMultiple"), requestData), {
        taskIds,
      });
    } catch (error) {
      throw new Error("Failed to remove tasks");
    }
  };
  @action
  toggleTasks = async (taskIds: number[], requestData: string): Promise<void> => {
    try {
      const endpoint = dotProp.getProperty(API_BASE_URL, 'tasks.toggleMultiple');
      await axios.post(await apiService.callApi(`${endpoint}`, requestData), {
        taskIds,
      });
    } catch (error) {
      throw new Error("Failed to toggle tasks");
    }
  };
  
  @action
  getTaskById(id: string): Task | null {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      return task;
    }
    return null;
  }
  
  @action
  async markTaskInProgress(taskId: number, requestdata: string): Promise<void> {
    try {
      const endpoint = dotProp.getProperty(API_BASE_URL, `tasks.markInProgress(${taskId})`);
      await axios.put(await apiService.callApi(`${endpoint}`, requestdata));
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
      const endpoint = dotProp.getProperty(API_BASE_URL, `tasks.markInProgress(${taskId})`);
      await axios.put(await apiService.callApi(`${endpoint}`, requestData));
  
      const task = this.getTaskById(taskId);
      if (task) {
        task.status = "In Progress";
      }
    } catch (error: any) {
      Logger.error(error);
      apiNotificationsService.error(
        NOTIFICATION_MESSAGES.Task.TASK_MARKED_IN_PROGRESS_FAILED
      );
    }
  };
}  

export const taskService = new TaskService();
