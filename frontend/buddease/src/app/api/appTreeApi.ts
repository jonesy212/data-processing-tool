// AppTreeApi.ts
import { handleApiError } from "@/app/api/ApiLogs";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { setThreshold } from '@/app/utils/setThresholdUtils';
import { AxiosError } from "axios";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../components/hooks/useLocalStorage";
import AppTreeService from "../services/AppTreeService";
import { isDataRecentEnough } from "../utils/isDataRecentEnough";

const appTreeData = AppTreeService.getTree();
const defaultValue = appTreeData;

class AppTreeApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void
  ) {
    this.notify = notify;
  }

  private async fetchAppTreeFromLocalStorage(): Promise<any> {
    const cachedData = getFromLocalStorage("appTreeData", defaultValue);
    if (cachedData) {
      return cachedData;
    } else {
      throw new Error("App tree data not found in local storage");
    }
  }

  private async saveAppTreeToLocalStorage(data: any): Promise<void> {
    try {
      saveToLocalStorage("appTreeData", data);
    } catch (error) {
      console.error("Error saving app tree data to local storage:", error);
      throw error;
    }
  }

  async getFetchAppTreeFromLocalStoragetry() {
    try {
      return await this.fetchAppTreeFromLocalStorage();
    } catch (error) {
      console.error("Error fetching app tree from local storage:", error);
    }
  }
  async refreshAppTreeFromApi(): Promise<any> {
    try {
      // Fetch app tree data from local storage
      const cachedData = await this.fetchAppTreeFromLocalStorage();
  
      // Calculate the threshold based on the cached data
      const threshold = setThreshold(cachedData, 0); // Adjust the threshold value as needed
  
      // Check if cachedData exists and if it's recent enough to avoid unnecessary API calls
      if (cachedData && isDataRecentEnough(cachedData, Number(threshold))) {
        // If the cached data is recent enough, return it without making an API call
        return cachedData;
      }
  
      // Notify user about app tree refresh
      this.notify(
        "App tree refresh",
        "Refreshing app tree from API",
        {},
        new Date(),
        NotificationTypeEnum.Info
      );
  
      // Fetch updated app tree data from the API
      const responseData = await this.callApi("getTree");
  
      // Save the updated app tree data to local storage
      await this.saveAppTreeToLocalStorage(responseData);
  
      // Return the updated app tree data
      return responseData;
    } catch (error) {
      // Handle errors
      console.error("Error refreshing app tree from API:", error);
      throw error;
    }
  }
  
  
  private async callApi(endpoint: string): Promise<any> {
    try {
      const responseData = await AppTreeService.getTree(); // Assuming getTree function returns the desired data
      return responseData;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to fetch app tree`);
      throw error;
    }
  }

  async getTree(): Promise<any> {
    try {
      const responseData = await this.callApi("getTree");
      return responseData;
    } catch (error) {
      throw error;
    }
  }

  // Add more methods for other app tree endpoints as needed
}

const appTreeApiService = new AppTreeApiService(useNotification);

export default appTreeApiService;
