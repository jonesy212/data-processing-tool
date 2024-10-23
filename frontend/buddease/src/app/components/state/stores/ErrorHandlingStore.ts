import { fetchData } from "@/app/api/ApiData";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { makeAutoObservable } from "mobx";
import { LogData } from "../../models/LogData";
import { NotificationTypeEnum, useNotification } from "../../support/NotificationContext";
import userService from "../../users/ApiUser";
import { NotificationPosition } from "../../models/data/StatusType";
import { authToken } from "../../auth/authToken";
import { endpoints } from "@/app/api/endpointConfigurations";


interface ErrorHandlingActions {
  triggerAction: () => void; // Define the type of triggerAction as a function with no arguments and void return type
  
  // Add more action types if needed
}

const BASE_URL = endpoints.users

// Type guard function to check if an object conforms to LogData interface
function isLogData(obj: any): obj is LogData {
  return (
    typeof obj.timestamp === "object" && // Assuming timestamp is always a Date object
    typeof obj.level === "string" &&
    typeof obj.message === "string"
    // Add additional checks as needed for other fields
  );
}

class ErrorHandlingStore {
  errorMessage = "";
  showError: boolean = false;
  notify = useNotification().notify; // Extract notify function

  constructor() {
    makeAutoObservable(this);
  }

  private subscriptions: (() => void)[] = [];
  

  getState() {
    // Implement the logic to get the current state
    return {
      errorMessage: "An error occurred",
      showError: true,
    };
  }

  subscribe(callback: () => void) {
    this.subscriptions.push(callback);
    // Notify the callback immediately with the current state
    callback();
    // Implement subscription logic to handle errors and log errors
    this.subscriptions.push(() => this.handleErrors("", {
      triggerAction: function (): void {
        console.log("Triggered action");
      }
    }));
    this.subscriptions.push(() => this.logError("Logged error", "Details"));
  }
  // Method to set error message and show error flag
  setError(message: string | Message) {
    this.errorMessage = typeof message === "string" ? message : message.text;
    this.showError = true;
  }

  // Method to clear error message and hide error flag
  clearError() {
    this.errorMessage = "";
    this.showError = false;
  }


  // Method to log error to console
  async logError(error: string | LogData | Error, endpoint: string) {
    // create getUserId with authentication
    const userId = await fetchData(BASE_URL)
    const userName = await userService.fetchUser(String(userId), authToken)
    const idGenerator = UniqueIDGenerator.generateUserID(userName);
    const iterator = idGenerator[Symbol.iterator]();
    const iteratorResult = iterator.next();

    const uniqueId = iteratorResult.value;
    if (typeof error === "string") {
      console.error(error);
      this.notify(uniqueId, error, endpoint, new Date(), NotificationTypeEnum.Error, NotificationPosition.TopRight);
    } else if (isLogData(error)) {
      console.error(error.message);
      this.notify(uniqueId, error.message, endpoint, new Date(), NotificationTypeEnum.Error, NotificationPosition.TopRight);
    } else {
      console.error("An error occurred:", error.toString());
      this.notify(uniqueId, error.toString(), endpoint, new Date(), NotificationTypeEnum.Error, NotificationPosition.TopRight);
    }
  }

  handleErrors(message: string, actions: ErrorHandlingActions) {
    this.setError(message);
    this.logError(message, "unknown");
    if (actions && typeof actions === "object" && actions.triggerAction && typeof actions.triggerAction === "function") {
      actions.triggerAction();
    }
  }
}

const errorHandlingStore = new ErrorHandlingStore();
export default errorHandlingStore;
