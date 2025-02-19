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
import { ReassignEventResponse } from "../components/state/stores/AssignEventStore";
import AppTreeService from "../services/AppTreeService";
import { isDataRecentEnough } from "../utils/isDataRecentEnough";
 
const RESPONSES_STORAGE_KEY = 'responses';

const appTreeData = AppTreeService.getTree();
const eventId = Object.keys(appTreeData)[0];
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


  private async fetchCacheKey(): Promise<string> {
    let cacheKey = "";
  
    // Check localStorage first
    const localStorageCacheKey = localStorage.getItem("cacheKey");
    if (localStorageCacheKey) {
      cacheKey = localStorageCacheKey;
    } else {
      // If not found in localStorage, fallback to process.env
      cacheKey = process.env.CACHE_KEY || "";
    }
  
    // Return the cache key (defaulting to an empty string if not found)
    return cacheKey;
  }

  async refreshAppTreeFromApi(): Promise<any> {
    try {
      // Fetch app tree data from local storage
      const cachedData = await this.fetchAppTreeFromLocalStorage();
  
      // Fetch cache key as a string
      const cacheKeyString = await this.fetchCacheKey();
  
      // Convert cacheKeyString to a number
      const cacheKey = parseInt(cacheKeyString, 10); // Convert string to number (adjust radix as needed)
  
      // Calculate the threshold based on the cached data and cache key
      const threshold = setThreshold(cachedData, cacheKey); // Adjust the threshold value as needed
  
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
  
  get cacheKey(): Promise<string> {
    return this.fetchCacheKey();
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

  // Public method to fetch event responses from local storage
  public async fetchEventResponsesFromLocalStorage(eventId: string): Promise<ReassignEventResponse[]> {
    const cachedData = getFromLocalStorage(`${RESPONSES_STORAGE_KEY}_${eventId}`, []);
    return cachedData;
  }

  // Public method to save event responses to local storage
  public async saveEventResponsesToLocalStorage(eventId: string, data: ReassignEventResponse[]): Promise<void> {
    try {
      saveToLocalStorage(`${RESPONSES_STORAGE_KEY}_${eventId}`, data);
    } catch (error) {
      console.error(`Error saving event responses for event ${eventId} to local storage:`, error);
      throw error;
    }
  }
}

const appTreeApiService = new AppTreeApiService(useNotification);




// Fetch event responses
appTreeApiService.fetchEventResponsesFromLocalStorage(eventId)
  .then((responses) => {
    console.log('Fetched responses:', responses);
  })
  .catch((error) => {
    console.error('Error fetching responses:', error);
  });

// Save event responses
// Define responses array
const responses: ReassignEventResponse[] = [
  {
    eventId: "event1",
    assignee: "user1",
    todoId: "todo1",
    assigneeId: "",
    responseId: "",
    userId: "",
    comment: "",
    timestamp: undefined,
    reassignData: [],
    assignedTo: "",

    blockNumber: "",
    transactionHash: "",
    event: "",
    signature: "",
   
  },
  
  {
    eventId: "event2",
    assignee: "user2",
    todoId: "todo2",
    assigneeId: "",
    responseId: "",
    userId: "",
    comment: "",
    timestamp: undefined,
    reassignData: [],
    assignedTo: ""
  },
  // Add more objects as necessary
];

// Iterate over responses array
for (const response of responses) {
  console.log(`Event ID: ${response.eventId}, Assignee: ${response.assignee}, Todo ID: ${response.todoId}`);
  // Process each response object here
}

appTreeApiService.saveEventResponsesToLocalStorage(eventId, responses)
  .then(() => {
    console.log('Responses saved successfully.');
  })
  .catch((error) => {
    console.error('Error saving responses:', error);
  });



export default appTreeApiService;
