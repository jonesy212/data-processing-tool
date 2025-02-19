import { apiService } from "@/app/api/ApiDetails";
import { endpoints } from "@/app/api/ApiEndpoints";
import apiNotificationsService from "@/app/api/NotificationsService";
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { AxiosResponse } from "axios";
import { action, observable, runInAction } from "mobx";
import Logger from "../logging/Logger";
import { Task } from "../models/tasks/Task";
import { Progress } from "../models/tracker/ProgressBar";
import axiosInstance from "../security/csrfToken";
import { NotificationTypeEnum } from "../support/NotificationContext";

const API_BASE_URL = endpoints.tasks;

class TaskService<
  T extends BaseData<any>,
  K extends T = T,
> {

  static instance: TaskService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new TaskService();
    }
    return this.instance;
  }

  @observable tasks: Task<T, K>[] = [];
  @observable loading = false;
  @observable error: string | null = null;

  @action
  createTask = async (task: Task<T, K>, name: string,  title: string, type: NotificationTypeEnum, requestData: string) => {
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
        NotificationTypeEnum.OperationSuccess
      );
      runInAction(() => {
        this.tasks.push(task);
      });
    } catch (error) {
      throw new Error("Failed to create task");
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
  fetchTask = (taskId: number, requestData: string): Promise<AxiosResponse<Task<T, K>, any>> => {
    const endpoint = `${API_BASE_URL}/${taskId}`; // Construct the endpoint URL
    return apiService.callApi(endpoint, requestData)
      .then(apiEndpoint => axiosInstance.get<AxiosResponse<Task<T, K>, any>>(apiEndpoint))
      .then(response => response.data)
      .catch(error => {
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
        NotificationTypeEnum.OperationSuccess
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
  addTask = (newTask: Task<T, K>, requestData: string): Promise<AxiosResponse<Task<T, K>, any>> => {
    const endpoint = API_BASE_URL.add;
    return apiService.callApi(`${endpoint}`, requestData)
      .then(apiEndpoint => axiosInstance.post<AxiosResponse<Task<T, K>, any>>(apiEndpoint, newTask, {
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
  processTasks = async (updatedTasks: Task<T, K>[], taskType: string) => {
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
  updateTask = (taskId: number, requestData: any): Promise<AxiosResponse<Task<T, K>, any>> => {
    const endpoint = `${API_BASE_URL}/${taskId}`; // Construct the endpoint URL

    return axiosInstance.put<AxiosResponse<Task<T, K>, any>>(endpoint, requestData, {
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
  getTasks = async (requestData: string): Promise<Task<T, K>[]> => {
    try {
      const response = await axiosInstance.get(
        await apiService.callApi(
          `${API_BASE_URL.list}`,
          requestData
        )
      );
      return response.data as Task<T, K>[];
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
  getTaskById(id: string): Task<T, K> | null {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      return task;
    }
    return null;
  }

  @action
  fetchTaskData(taskId: number): Promise<Task<T, K>> {
    return new Promise(async (resolve, reject) => {
      axiosInstance.get(await apiService.callApi(`${API_BASE_URL}/${taskId}`, ""))
        .then(response => {
          resolve(response.data as Task<T, K>);
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
        NOTIFICATION_MESSAGES.Task<T, K>.TASK_MARKED_IN_PROGRESS_FAILED
      );
    }
  }
}
export const taskService = new TaskService();
export default TaskService;
