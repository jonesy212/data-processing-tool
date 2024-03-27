import { endpoints } from "@/app/api/ApiEndpoints";
import axios from "axios";
import dotProp from 'dot-prop';
import { action, observable, runInAction } from 'mobx';
import { Task } from "../models/tasks/Task";
import { Progress } from "../models/tracker/ProgressBar";
import { apiService } from "@/app/api/ApiDetails";
import { NOTIFICATION_MESSAGES } from "@/app/constants/NotificationMessages";
import { Logger } from "@/app/utils/Logger";
import { UniqueIDGenerator } from "@/app/utils/UniqueIDGenerator";


const API_BASE_URL = endpoints.tasks;
class TaskService {
  @observable tasks: Task[] = [];
  @observable loading = false;
  @observable error: string | null = null;

  @action
  fetchTasks = async (): Promise<void> => {
    try {
      this.loading = true;

      const response = await axios.get(apiService.callApi(endpoints.tasks.list()));

      runInAction(() => {
        this.tasks = response.data;
        this.error = null; // Clear any previous errors on success
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
  fetchTask = async (taskId: number): Promise<Task> => {
    try {
      const response = await axios.get(apiService.callApi(endpoints.tasks.single(taskId)));
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch task with ID ${taskId}`);
    }
  };

  @action
  addTask = async (newTask: Task): Promise<Task> => {
    try {
      const response = await axios.post(apiService.callApi(endpoints.tasks.add), newTask, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      runInAction(() => {
        this.tasks.push(response.data);
        this.error = null; // Clear any previous errors on success
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to add task");
    }
  };

  @action
  removeTask = async (taskId: number): Promise<void> => {
    try {
      await axios.delete(apiService.callApi(endpoints.tasks.remove(taskId)));
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
      const endpoint = dotProp.getProperty(API_BASE_URL, endpointPath) as string | undefined;

      if (!endpoint) {
        throw new Error(`${endpointPath} endpoint not found`);
      }

      const response = await axios.put(
        endpoint,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      runInAction(() => {
        const updatedTask = response.data;
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);

        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }

        this.error = null; // Clear any previous errors on success
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to update task");
    }
  };


  @action
  completeAllTasks = async (): Promise<void> => {
    try {
      await axios.post(apiService.callApi(endpoints.tasks.completeAll));
    } catch (error) {
      throw new Error("Failed to complete all tasks");
    }
  };

  @action
  toggleTask = async (taskId: number, requestData?: any): Promise<void> => {
    try {
      await axios.put(
        await apiService.callApi(endpoints.tasks.toggle(taskId), requestData),
        requestData
      );
    } catch (error) {
      throw new Error("Failed to toggle task");
    }
  };

  // multiple/bulk action
  @action
  removeTasks = async (taskIds: number[]): Promise<void> => {
    try {
      // Assuming there is an endpoint to remove multiple tasks
      await axios.post(apiService.callApi(endpoints.tasks.removeMultiple), { taskIds });
    } catch (error) {
      throw new Error("Failed to remove tasks");
    }
  };

  @action
  toggleTasks = async (taskIds: number[]): Promise<void> => {
    try {
      // Assuming there is an endpoint to toggle multiple tasks
      await axios.post(apiService.callApi(endpoints.tasks.toggleMultiple), { taskIds });
    } catch (error) {
      throw new Error("Failed to toggle tasks");
    }
  }

  @action
  getTaskById(id: string): Task | null { 
    const task = this.tasks.find(task => task.id === id);
    if (task) {
      return task;
    }
    return null;
  }

  @action
  async markTaskInProgress(taskId: number): Promise<void> { 
    try {
      await axios.put(apiService.callApi(endpoints.tasks.markInProgress(taskId)));
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
  }

  export const taskService = new TaskService();
