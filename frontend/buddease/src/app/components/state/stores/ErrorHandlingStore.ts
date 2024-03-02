import { fetchData } from "@/app/api/ApiData";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { makeAutoObservable } from "mobx";
import { LogData } from "../../models/LogData";
import { NotificationTypeEnum, useNotification } from "../../support/NotificationContext";
import userService from "../../users/ApiUser";


interface ErrorHandlingActions {
  triggerAction: () => void; // Define the type of triggerAction as a function with no arguments and void return type
  // Add more action types if needed
}

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
  async logError(error: string | LogData | Error) {
    // create getUserId with authentication
    const userId = await fetchData()
    const userName=  await userService.fetchUserById(userId.toString())
    const idGenerator = UniqueIDGenerator.generateUserID(userName);
    const iterator = idGenerator[Symbol.iterator]();
    const iteratorResult = iterator.next();

    const uniqueId = iteratorResult.value; if (typeof error === "string") {
      console.error(error);
      this.notify(uniqueId, error, undefined, undefined, NotificationTypeEnum.Error);
    } else if (isLogData(error)) {
      console.error(error.message);
      this.notify(uniqueId, error.message, undefined, undefined, NotificationTypeEnum.Error);
    } else {
      console.error("An error occurred:", error.toString());
      this.notify(uniqueId, error.toString(), undefined, undefined, NotificationTypeEnum.Error);
    }
  }

  handleErrors(message: string, actions: ErrorHandlingActions) {
    this.setError(message);
    this.logError(message);
    if (actions && typeof actions === "object" && actions.triggerAction && typeof actions.triggerAction === "function") {
      actions.triggerAction();
    }
  }
}

const errorHandlingStore = new ErrorHandlingStore();
export default errorHandlingStore;
