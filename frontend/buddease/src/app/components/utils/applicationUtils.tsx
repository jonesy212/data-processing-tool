// applicationUtils.tsx

import { ApiNotificationsService } from "@/app/api/NotificationsService";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Article } from "@/app/pages/blog/Blog";
import { AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import * as articleApi from '../../../app/api/articleApi';
import { sendEmail } from "../communications/email/SendEmail";
import { sendSMS } from "../communications/sendSMS";
import { ActivityActionEnum, ActivityTypeEnum, ProjectStateEnum, StatusType } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";
import { Project, ProjectDetails } from "../projects/Project";
import { updateProject } from "../state/redux/slices/ProjectManagerSlice";
import { NotificationData } from "../support/NofiticationsSlice";
import {
  NotificationTypeEnum,
  useNotification,
} from "../support/NotificationContext";
import NotificationManager from "../support/NotificationManager";
const dispatch = useDispatch()
const { notify } = useNotification()


interface LogActivityParams {
  activityType: ActivityTypeEnum;
  action: ActivityActionEnum;
  userId: string;
  date: Date;
  snapshotId: string;
  description?: string; // Optional description field
  data?: any; // Optional additional data
}

interface TriggerIncentivesParams {
  userId: string;
  incentiveType: string;
  params?: any;
}

// Define the NotificationManager instance and ApiNotificationsService instance if needed
const notificationManager = new NotificationManager({
  notifications: [],
  notify: () => {},
  setNotifications: () => {},
  onConfirm: () => {},
  onCancel: () => {},
});

const apiNotificationsService = new ApiNotificationsService(useNotification);

const notifyEventSystem = (
  eventType: string,
  eventData: any,
  source: string
) => {
  // Logic to notify the event system
  console.log(`Event '${eventType}' occurred from ${source}. Data:`, eventData);
  // Additional logic to trigger any necessary actions based on the event

  // Create a NotificationData object based on the eventType and eventData
  const notificationData: NotificationData = {
    id: UniqueIDGenerator.generateNotificationID(
      {
        message: eventType,
        id: "",
        content: "",
        sendStatus: "Delivered",
        completionMessageLog: {
          timestamp: new Date(),
          level: "info",
          message: "",
        },
      },
      new Date(),
      NotificationTypeEnum.Info,
      {
        id: "",
        content: "Add content here",
        timestamp: new Date(),
        level: "info",
        message: "",
        sendStatus: "Delivered",
        completionMessageLog: {
          timestamp: new Date(),
          level: "info",
          message: "",
        },
      }
    ),
    notificationType: NotificationTypeEnum.Info,
    createdAt: new Date(),
    date: new Date(),
    content: JSON.stringify({ message: eventData }),
    message: eventType,
    completionMessageLog: {
      timestamp: new Date(),
      level: "info",
      message: "",
      data: eventData,
    },
    sendStatus: "Sent",
  };

  const completionMessageData: NotificationData = {
    id: "",
    content: "Add content here",
    timestamp: new Date(),
    level: "info",
    message: "",
    sendStatus: "Delivered",
    completionMessageLog: {
      timestamp: new Date(),
      level: "info",
      message: "",
    },
  };

  // Example: Notify the event system by adding a notification
  notificationManager.addNotification(
    notificationData,
    new Date(), // Provide a valid date here
    completionMessageData, // Provide the completion message log data here
    NotificationTypeEnum.Info // Provide the notification type here
  );

  const sendNotification = apiNotificationsService.sentNotification;

  // Example: Notify the event system by sending a notification to the API
  sendNotification(eventType, eventData, new Date(), NotificationTypeEnum.Info);
};




const updateProjectState = (
  stateType: ProjectStateEnum,
  projectId: string,
  newState: Project,
  content: any
) => {
  // Logic to update the state of the project with the provided ID
  console.log(`Updating state of project '${projectId}' to:`, newState);

  // Additional logic to perform the state update
  try {
    // Validate the new state before updating
    validateProjectState(newState);

    // Dispatch the updateProject action with the new state
    dispatch(updateProject(newState));

    // Notify user or system about successful state update
    notify("success", `Project '${projectId}' state updated successfully`, null, new Date(), NotificationTypeEnum.Success);
} catch (error: any) {
    // Handle validation errors or any other errors during state update
    console.error(`Error updating state of project '${projectId}':`, error);

    const errorMessage = error.message || "Unknown error";
    // Notify user or system about the error
    notify(
        "error",
        `Failed to update state of project '${projectId}': ${errorMessage}`,
        null,
        new Date(),
        NotificationTypeEnum.Error
      );
  }
};
  
  // Function to validate the project state before updating
const validateProjectState = (newState: Project) => {
  // Example validation logic:
  if (!newState.name || newState.name.trim() === "") {
    throw new Error("Project name is required");
  }

  if (!newState.title || newState.title.trim() === "") {
    throw new Error("Project title is required");
  }

  // Validate the status property
  if (!isValidStatus(newState.status as StatusType)) {
    throw new Error("Invalid project status");
  }

  // Validate tasks array
  if (!isValidTasks(newState.tasks)) {
    throw new Error("Invalid tasks in the project");
  }

  // Validate project details if provided
  if (newState.projectDetails) {
    if (!isValidProjectDetails(newState.projectDetails)) {
      throw new Error("Invalid project details");
    }
  }

  // Check if the project description is provided and not empty
  if (!newState.description || newState.description.trim() === "") {
    throw new Error("Project description is required");
  }

  // Check if the project start date is provided
  if (!newState.startDate) {
    throw new Error("Project start date is required");
  }

  // Check if the project end date is provided and is after the start date
  if (!newState.endDate) {
    throw new Error("Project end date is required");
  } else if (newState.endDate <= newState.startDate) {
    throw new Error("Project end date must be after the start date");
  }
  // Add more validation logic as needed...
};
  


// Helper function to validate project status
const isValidStatus = (status: StatusType): boolean => {
    // List of valid status types
    const validStatusTypes: StatusType[] = [StatusType.Pending, StatusType.InProgress, StatusType.Completed];
  
    // Check if the provided status is included in the valid status types
    return validStatusTypes.includes(status);
  };
  
  // Helper function to validate tasks array
  const isValidTasks = (tasks: Task[]): boolean => {
    // Check if tasks array is not empty
    if (tasks.length === 0) {
      return false;
    }
  
    // Check if all tasks have valid properties
    for (const task of tasks) {
      // Check if task has a title
      if (!task.title || task.title.trim() === '') {
        return false;
      }
      // Add more validations as needed for other task properties
    }
  
    // All tasks are valid
    return true;
  };
  
  // Helper function to validate project details
  const isValidProjectDetails = (projectDetails: Partial<ProjectDetails>): boolean => {
    // Check if projectDetails object is not null or undefined
    if (!projectDetails) {
      return false;
    }
  
    // Check if title and description are provided and not empty
    if (!projectDetails.title || projectDetails.title.trim() === '' || !projectDetails.description || projectDetails.description.trim() === '') {
      return false;
    }
  
    // Check if status is valid
    if (!isValidStatus(projectDetails.status!)) {
      return false;
    }
  
    // Check if tasks array is valid
    if (!isValidTasks(projectDetails.tasks || [])) {
      return false;
    }
  
    // Project details are valid
    return true;
  };
  
  

  
  const logActivity = ({
    activityType,
    action,
    userId,
    date,
    snapshotId,
    description = '',
    data,
  }: LogActivityParams) => {
    // Logic to log the activity
    console.log(`Activity '${activityType}': ${description}`);
    console.log(`Action: '${action}' by User: '${userId}' on ${date}`);
    console.log(`Snapshot ID: '${snapshotId}'`);
    
    if (data) {
      console.log("Additional data:", data);
    }
    
    // Additional logic to handle the logged activity
  };
  
  const triggerIncentives = ({
    userId,
    incentiveType,
    params,
  }: TriggerIncentivesParams) => {
    // Logic to trigger incentives for the user with the provided ID
    console.log(`Triggering '${incentiveType}' incentive for user '${userId}'`);
  
    // Check if additional parameters are provided
    if (params) {
      console.log("Additional parameters:", params);
      // Additional logic to handle the triggered incentive with parameters
      handleIncentiveWithParameters(params);
    } else {
      // Additional logic to handle the triggered incentive without parameters
      handleIncentiveWithoutParameters();
    }
  };
  

  
  // Additional logic to handle the triggered incentive with parameters
  const handleIncentiveWithParameters = (params: any) => {
    // Example: Validate parameters
    if (!isValidParameters(params)) {
      throw new Error("Invalid parameters for triggering incentives");
    }
  
    // Example: Perform actions based on parameters
    performActionsWithParameters(params);
  
    // Example: Log relevant information
    console.log("Handling incentive with parameters:", params);
  };
  
  // Additional logic to handle the triggered incentive without parameters
  const handleIncentiveWithoutParameters = () => {
    // Example: Perform generic actions
    performGenericActions();
  
    // Example: Log relevant information
    console.log("Handling incentive without parameters");
  };
  


// Example: Validate parameters
const isValidParameters = (params: any): boolean => {
    // Your validation logic here
    // For example, checking if params is an object and has required properties for a user registration
    return typeof params === 'object' && params !== null &&
      typeof params.username === 'string' &&
      typeof params.email === 'string' &&
      typeof params.password === 'string';
  };
  
  // Example: Perform actions based on parameters
  const performActionsWithParameters = (params: any): void => {
    // Your actions based on parameters here
    // For example, performing different actions based on the values of params for sending notifications
    if (params.type === 'email') {
      // Send an email notification
      sendEmail(params.recipient,params.subject, params.message);
    } else if (params.type === 'sms') {
      // Send an SMS notification
      sendSMS(params.phoneNumber, params.message);
    } else {
      // Log an error for unknown notification type
      console.error('Unknown notification type:', params.type);
    }
  };
  
  // Example: Perform generic actions
  const performGenericActions = (): void => {
    // Your generic actions here
    // For example, fetching and displaying recent articles from a news API
    articleApi.articleApiService.fetchRecentArticles()
    .then((response: AxiosResponse<Article[]>) => {
      const articles = response.data;
      articleApi.articleApiService.displayArticles(articles);
    })

      .catch((error: any) => {
        // Log and handle any errors that occur during fetching
        console.error('Error fetching recent articles:', error);
      });
  };
  


  
  export {
  logActivity, notifyEventSystem, triggerIncentives, updateProjectState
};

