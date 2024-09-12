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
import { useSecureUserId } from "./useSecureUserId";
import { BaseData, Data } from "../models/data/Data";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotWithCriteria } from "../snapshots/SnapshotWithCriteria";
import { K } from "../snapshots";
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


interface AnalyticsEvent<T extends Data, K extends Data> {
  type: string;
  snapshot: Snapshot<T, K>; // Include snapshot in the type definition
  date: string;
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

const notifyEventSystem = <T extends Data, K extends Data>(
  eventType: string,
  eventData: any,
  source: string
) => {
  // Logic to notify the event system
  console.log(`Event '${eventType}' occurred from ${source}. Data:`, eventData);
  // Additional logic to trigger any necessary actions based on the event

  // Create a NotificationData object based on the eventType and eventData
  const notificationData: NotificationData = {
    topics, highlights, files, meta, rsvpStatus, participants, teamMemberId,
    
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
          date: new Date(),
          sent: new Date(),
          isSent: false,
          isDelivered: false,
          delivered: new Date(),
          opened: new Date(),
          clicked: new Date(),
          responded: false,
          responseTime: new Date(),
          eventData: eventData,
        },
        timestamp: undefined,
        topics: [],
        highlights: [],
        files: [],
        meta: undefined,
        rsvpStatus: "yes",
        participants: [],
        teamMemberId: "",
        getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
         
          const snapshotStore = new SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>(storeId, options, config, operation);
          return Promise.resolve([snapshotStore]);
        },
        getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
          const snapshot = new Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>(
            {
              data: eventData,
              category: "EventSystem",
              timestamp: new Date(),
              dataItems: [],
              newData: eventData,
              meta: {
                events: [],
                callbacks: [],
                subscribers: [],
                eventIds: [],
              },
              fetchSnapshot: () => Promise.resolve(eventData),
            },
            "EventSystem"
          );
          return Promise.resolve([snapshot]);
        }
      },


      new Date(),
      NotificationTypeEnum.Info,
      {
        id: "",
        content: "Add content here",
        timestamp: undefined,
        level: "info",
        message: "",
        sendStatus: "Delivered",
        completionMessageLog: {
          timestamp: new Date(),
          level: "info",
          message: "",
          date: new Date(),
          sent: new Date(),
          isSent: false,
          isDelivered: false,
          delivered: new Date(),
          opened: new Date(),
          clicked: new Date(),
          responded: false,
          responseTime: new Date(),
          eventData: eventData,
        },
        topics: [],
        highlights: [],
        files: [],
        meta: undefined,
        rsvpStatus: "yes",
        participants: [],
        teamMemberId: "",
        getSnapshotStoreData: function (): Promise<SnapshotStore<T, K>[]> {
          const snapshotStore = new SnapshotStore<T, K>(storeId, options, config, operation);
          return Promise.resolve([snapshotStore]);
        },
        getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
          throw new Error("Function not implemented.");
        }
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
      date: new Date(),
      sent: new Date(),
      isSent: false,
      delivered: new Date(),
      isDelivered: false,
      opened: new Date(),
      clicked: new Date(),
      responded: false,
      responseTime: new Date(),
      eventData: eventData,
      topics: [],
      highlights: [], 
      files: [],
      meta: null
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
    rsvpStatus: "no",
    participants: [],
    teamMemberId: "",
    completionMessageLog: {
      timestamp: new Date(),
      level: "info",
      message: "",
      date: new Date(),
      sent: new Date(),
      isSent: false,
      delivered: new Date(),
      isDelivered: false,
      opened: new Date(),
      clicked: new Date(),
      responded: false,
      responseTime: new Date(),
      eventData: eventData,
      topics: [],
      highlights: [], 
      files: [],
      meta: null
    },
    topics: [],
    highlights: [], 
    files: [],
    meta: undefined
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


const portfolioUpdates = ({
  userId,
  snapshotId,
}:{userId: string, snapshotId: string}) => {
  // Logic to update the user's portfolio snapshot
  console.log(`Updating portfolio snapshot '${snapshotId}' for user '${userId}'`);

  // Additional logic to handle the portfolio update
  if (!userId || userId.trim() === '') {
    throw new Error("User ID is required for portfolio updates");
  }
  if (!snapshotId || snapshotId.trim() === '') {
    throw new Error("Snapshot ID is required for portfolio updates");
  }
}

const tradeExections = ({
  userId,
  snapshotId,
  tradeExecutionType,
  tradeExecutionData,
}: {
  userId: string;
  snapshotId: string;
  tradeExecutionType: string;
  tradeExecutionData: any;
}) => {
  // Logic to execute trades based on the provided data
  console.log(`Executing trade for user '${userId}' with snapshot '${snapshotId}'`);
  console.log(`Trade type: '${tradeExecutionType}'`);
  console.log("Trade data:", tradeExecutionData);
  // Additional logic to handle the trade execution
  if (!userId || userId.trim() === '') {
    throw new Error("User ID is required for trade execution");
  }
  if (!snapshotId || snapshotId.trim() === '') {
    throw new Error("Snapshot ID is required for trade execution");
  }
  if (!tradeExecutionType || tradeExecutionType.trim() === '') {
    throw new Error("Trade execution type is required");
  }
  if (!tradeExecutionData || typeof tradeExecutionData !== 'object') {
    throw new Error("Trade execution data is required and should be an object");
  }
  if (typeof tradeExecutionData !== 'object') {
    throw new Error("Trade execution data should be an object");
  }
  if (Array.isArray(tradeExecutionData)) {
    throw new Error("Trade execution data should not be an array");
  }
}
  
const userId = useSecureUserId()
const unsubscribe = (unsubscribeDetails: {
  userId: string;
  snapshotId: string;
  unsubscribeType: string;
  unsubscribeDate: Date;
  unsubscribeReason: string;
  unsubscribeData: any;
}
) => {
  // Implement logic to unsubscribe or clean up resources
  console.log(`Unsubscribing user ${userId} from snapshot ${unsubscribeDetails.snapshotId}`);
  
  // Example: Perform actions based on unsubscribeType
  switch (unsubscribeDetails.unsubscribeType) {
    case 'email':
      sendEmail(unsubscribeDetails.userId, 'Unsubscribe Notification', 'You have been unsubscribed.');
      break;
    case 'sms':
      sendSMS(unsubscribeDetails.userId, 'You have been unsubscribed from SMS notifications.');
      break;
    default:
      console.warn(`Unknown unsubscribe type: ${unsubscribeDetails.unsubscribeType}`);
      break;
  }
  // Example: Log unsubscribe details
  console.log(`Unsubscribe Date: ${unsubscribeDetails.unsubscribeDate}`);
  console.log(`Unsubscribe Reason: ${unsubscribeDetails.unsubscribeReason}`);
  console.log(`Additional Data:`, unsubscribeDetails.unsubscribeData);
  // Additional logic here...
};

const triggerEvent = <T extends Data, K extends Data>(
  event: string,            // Match parameter name with the CombinedEvents interface
  snapshot: Snapshot<T, K>, // Ensure Snapshot type is used here
  eventDate: Date
) => {
  // Log the event for debugging purposes
  console.log("Event Triggered:");
  console.log(`Event: ${event}`);
  console.log(`Snapshot:`, snapshot);
  console.log(`Date: ${eventDate.toISOString()}`);

  // You can add additional logic here to handle the event
  // For example, send the event data to an analytics service, or trigger specific actions based on event

  // Example: Send event data to an analytics service
  sendEventToAnalyticsService({
    type: event,
    snapshot,                // Include snapshot data
    date: eventDate.toISOString(), // Format date as an ISO string for consistency
  });

  // Example: Handle specific event types
  switch (event) {
    case "USER_LOGIN":
      handleUserLogin(snapshot);
      break;
    case "USER_LOGOUT":
      handleUserLogout(snapshot);
      break;
    default:
      console.warn(`Unhandled event type: ${event}`);
  }
};

// Example function to send event data to an analytics service
const sendEventToAnalyticsService = <T extends Data, K extends Data>(
  event: AnalyticsEvent<T, K>
) => {
  // Replace with actual analytics service logic
  console.log("Sending event to analytics service:", event);
};

// Example functions to handle specific event types
const handleUserLogin = (data: any) => {
  // Logic for handling user login events
  console.log("User logged in with data:", data);
};

const handleUserLogout = (data: any) => {
  // Logic for handling user logout events
  console.log("User logged out with data:", data);
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
  logActivity, notifyEventSystem, portfolioUpdates, tradeExections, triggerIncentives, unsubscribe, updateProjectState, triggerEvent
};

  export type { TriggerIncentivesParams };
