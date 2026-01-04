// applicationUtils.tsx
import * as articleApi from '@/core/api/articleApi';
import { ApiNotificationsService } from '@/core/api/NotificationsService';
import { sendEmail } from '@/core/api/sendEmail';
import { sendSMS } from '@/core/api/sendSMS';
import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
} from "@/core/config/BaseConfig";
import {
    fetchUserAreaDimensions,
    UnifiedMetadata,
    UnifiedMetaDataOptions,
} from '@/core/config/MetaDataOptions';
import { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { Content } from '@/core/models/content/AddContent';
import {
    ActivityActionEnum,
    ActivityTypeEnum,
    ProjectStateEnum,
    StatusType
} from '@/core/models/data/StatusType';
import { Project, ProjectDetails } from '@/core/models/projects/Project';
import { Task } from '@/core/models/tasks/Task';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { updateProject } from '@/core/state/redux/slices/ProjectManagerSlice';
import { UnsubscribeDetails } from '@/core/typings/eventHandlers/eventTypes';
import { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';

import { useMeta } from "@/core/config/useMeta";
import { useMetadata } from "@/core/config/useMetadata";
import NotificationManager from "@/core/features/support/NotificationManager";
import { useSecureUserId } from "@/core/hooks/useSecureUserId";
import {
    CombinedEvents,
    useSnapshotManager,
} from "@/core/hooks/useSnapshotManager";
import { CalendarEventWithCriteria } from "@/core/pages/searches/FilterCriteria";
import { createSnapshot } from "@/core/snapshots/createSnapshot";
import { SnapshotData } from "@/core/snapshots/SnapshotData";
import { SnapshotStoreProps } from "@/core/snapshots/SnapshotStoreProps";
import { useDataStore } from "@/core/state/stores/DataStore";
import { SubscriberCollection } from "@/core/subscribers/SubscriberCollection";
import { SubscriberCallbackType } from "@/core/subscriptions/Subscription";
import { SnapshotEvents } from "@/core/typings/snapshotTypes";
import { snapshot } from "@/utils/snapshotUtils";

const dispatch = useDispatch();
const { notify } = useNotification();

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
  params?: Record<string, unknown>;
}

interface AnalyticsEvent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  event: string | CombinedEvents<T, K> | SnapshotEvents<T, K>;
  snapshot: Snapshot<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >; // Include snapshot in the type definition
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

function isSnapshotStoreProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(obj: any): obj is SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (
    obj &&
    typeof obj.storeId === "string" &&
    typeof obj.name === "string" &&
    typeof obj.version === "number" &&
    typeof obj.schema !== "undefined" &&
    typeof obj.options !== "undefined" &&
    typeof obj.category === "string" &&
    typeof obj.config !== "undefined" &&
    typeof obj.operation !== "undefined" &&
    (obj.expirationDate === undefined || obj.expirationDate instanceof Date) &&
    typeof obj.payload !== "undefined" &&
    typeof obj.callback === "function" &&
    typeof obj.endpointCategory === "string"
  );
}

const notifyEventSystem = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  eventType: string,
  eventData: any,
  source: string,
  event: Event,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  const area = fetchUserAreaDimensions().toString();
  const currentMeta: StructuredMetadata<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  > = useMeta<T, K>(area);
  
  const currentMetadata: UnifiedMetadata<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
    > = useMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(area);
  
  // Logic to notify the event system
  console.log(`Event '${eventType}' occurred from ${source}. Data:`, eventData);
  // Additional logic to trigger any necessary actions based on the event

  // Use the type guard to validate storeProps
  if (!isSnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeProps)) {
    throw new Error("Invalid or missing storeProps");
  }

  const {
    storeId,
    name,
    version,
    schema,
    options,
    category,
    config,
    operation,
    expirationDate,
    payload,
    callback,
    endpointCategory,
  } = storeProps;

  // Create a NotificationData object based on the eventType and eventData
  const notificationData: NotificationData<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  > = {
    topics: [],
    highlights: [],
    files: [],
    meta: currentMeta,
    rsvpStatus: "notResponded",
    participants: [],
    teamMemberId: "",

    currentMeta: currentMeta,
    currentMetadata: currentMetadata,

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
        currentMeta: currentMeta,
        currentMetadata: currentMetadata as unknown as UnifiedMetaDataOptions<
          T,
          K,
          Meta,
          AttachmentType,
          ExcludedFields,
          IncludedFields
        >,

        getCalendarSnapshotStoreData: function (): Promise<
          CalendarEventWithCriteria[]
        > {
          const snapshotStore = new SnapshotStore<
            T,
            K,
            Meta,
            AttachmentType,
            ExcludedFields,
            IncludedFields
          >({
            storeId,
            name,
            version,
            schema,
            options,
            category,
            config,
            operation,
            expirationDate,
            payload,
            currentMeta,
            callback,
            storeProps,
            endpointCategory,
          });

          // Return the snapshot store data as CalendarEventWithCriteria[]
          const calendarSnapshots = snapshotStore
            .getSnapshotStoreData(
              snapshotStore,
              snapshot,
              snapshotId,
              snapshotData
            )
            .map(
              (
                snapshot: Snapshot<
                  T,
                  K,
                  Meta,
                  AttachmentType,
                  ExcludedFields,
                  IncludedFields
                >
              ) => ({
                ...snapshot, // Spread properties
                // Add any CalendarEvent-specific fields if necessary
              })
            ) as CalendarEventWithCriteria[];

          return Promise.resolve(calendarSnapshots);
        },
        getData: async function (): Promise<
          Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        > {

          // Prepare the necessary inputs
          const snapshotManager = await useSnapshotManager<
            T,
            K,
            Meta,
            AttachmentType,
            ExcludedFields,
            IncludedFields
          >(storeId, storeProps);
          const snapshotId = await snapshot.store.snapshotId;
          const eventData: BaseDataEntity = {
            /* your event data */
          };
          const category = "EventSystem"; // Your category

          // Create a snapshot instance using createSnapshot
          const newSnapshot = createSnapshot<
            T,
            K,
            Meta,
            AttachmentType,
            ExcludedFields,
            IncludedFields
          >(
            eventData, // data
            {
              baseMeta: {
                // Populate with required metadata
                events: [],
                callbacks: [],
                subscribers: [],
                eventIds: [],
              },
            },
            snapshotId,
            category,
            undefined, // Assuming no snapshotStore
            snapshotManager,
            useDataStore().snapshotStoreConfig,
            storeProps
          );

          return newSnapshot; // Return the snapshot directly (not an array)
        },
      },
      new Date(),
      NotificationTypeEnum.INFO,
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
        getSnapshotStoreData: function (): Promise<
          SnapshotStore<
            T,
            K,
            Meta,
            AttachmentType,
            ExcludedFields,
            IncludedFields
          >[]
        > {
          if (!storeProps) {
            return new Error("missing store props ");
          }
          const { options, config, operation } = storeProps;
          const snapshotStore = new SnapshotStore<
            T,
            K,
            Meta,
            AttachmentType,
            ExcludedFields,
            IncludedFields
          >({
            storeId,
            name,
            version,
            schema,
            options,
            category,
            config,
            operation,
            expirationDate,
            payload,
            callback,
            storeProps,
            endpointCategory,
            storeId,
            initialState,
          });
          return Promise.resolve([snapshotStore]);
        },
        getData: function (): Promise<
          Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
        > {
          throw new Error("Function not implemented.");
        },
      }
    ),
    notificationType: NotificationTypeEnum.INFO,
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
      meta: null,
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
    currentMeta: currentMeta,
    currentMetadata: currentMetadata,
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
      meta: null,
    },
    topics: [],
    highlights: [],
    files: [],
    meta: undefined,
  };

  // Example: Notify the event system by adding a notification
  notificationManager.addNotification(
    notificationData,
    new Date(), // Provide a valid date here
    completionMessageData, // Provide the completion message log data here
    NotificationTypeEnum.INFO // Provide the notification type here
  );

  const sendNotification = apiNotificationsService.sentNotification;

  // Example: Notify the event system by sending a notification to the API
  sendNotification(eventType, eventData, new Date(), NotificationTypeEnum.INFO);
};

const updateProjectState = (
  stateType: ProjectStateEnum,
  projectId: string,
  newState: Project,
  content: Content,
  state: object
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
    notify(
      "success",
      `Project '${projectId}' state updated successfully`,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
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
      NotificationTypeEnum.ERROR
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
  const validStatusTypes: StatusType[] = [
    StatusType.Pending,
    StatusType.InProgress,
    StatusType.Completed,
  ];

  // Check if the provided status is included in the valid status types
  return validStatusTypes.includes(status);
};

// Helper function to validate tasks array
const isValidTasks = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): boolean => {
  if (tasks.length === 0) return false;
  for (const task of tasks) {
    if (!task.title?.trim()) return false;
  }
  return true;
};


// Helper function to validate project details
const isValidProjectDetails = (
  projectDetails: Partial<ProjectDetails>
): boolean => {
  // Check if projectDetails object is not null or undefined
  if (!projectDetails) {
    return false;
  }

  // Check if title and description are provided and not empty
  if (
    !projectDetails.title ||
    projectDetails.title.trim() === "" ||
    !projectDetails.description ||
    projectDetails.description.trim() === ""
  ) {
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
  description = "",
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
}: {
  userId: string;
  snapshotId: string;
}) => {
  // Logic to update the user's portfolio snapshot
  console.log(
    `Updating portfolio snapshot '${snapshotId}' for user '${userId}'`
  );

  // Additional logic to handle the portfolio update
  if (!userId || userId.trim() === "") {
    throw new Error("User ID is required for portfolio updates");
  }
  if (!snapshotId || snapshotId.trim() === "") {
    throw new Error("Snapshot ID is required for portfolio updates");
  }
};

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
  console.log(
    `Executing trade for user '${userId}' with snapshot '${snapshotId}'`
  );
  console.log(`Trade type: '${tradeExecutionType}'`);
  console.log("Trade data:", tradeExecutionData);
  // Additional logic to handle the trade execution
  if (!userId || userId.trim() === "") {
    throw new Error("User ID is required for trade execution");
  }
  if (!snapshotId || snapshotId.trim() === "") {
    throw new Error("Snapshot ID is required for trade execution");
  }
  if (!tradeExecutionType || tradeExecutionType.trim() === "") {
    throw new Error("Trade execution type is required");
  }
  if (!tradeExecutionData || typeof tradeExecutionData !== "object") {
    throw new Error("Trade execution data is required and should be an object");
  }
  if (typeof tradeExecutionData !== "object") {
    throw new Error("Trade execution data should be an object");
  }
  if (Array.isArray(tradeExecutionData)) {
    throw new Error("Trade execution data should not be an array");
  }
};

const userId = useSecureUserId();

const unsubscribe = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: number,
  unsubscribeDetails: UnsubscribeDetails,
  callback: SubscriberCallbackType<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  > | null
) => {
  // Log the snapshot unsubscribe action
  console.log(
    `Unsubscribing user ${unsubscribeDetails.userId} from snapshot ${unsubscribeDetails.snapshotId}`
  );

  // Example: Perform actions based on unsubscribeType
  switch (unsubscribeDetails.unsubscribeType) {
    case "email":
      sendEmail(
        unsubscribeDetails.userId,
        "Unsubscribe Notification",
        "You have been unsubscribed."
      );
      break;
    case "sms":
      sendSMS(
        unsubscribeDetails.userId,
        "You have been unsubscribed from SMS notifications."
      );
      break;
    default:
      console.warn(
        `Unknown unsubscribe type: ${unsubscribeDetails.unsubscribeType}`
      );
      break;
  }

  // Log unsubscribe details for audit purposes
  console.log(`Unsubscribe Date: ${unsubscribeDetails.unsubscribeDate}`);
  console.log(`Unsubscribe Reason: ${unsubscribeDetails.unsubscribeReason}`);
  console.log(`Additional Data:`, unsubscribeDetails.unsubscribeData);

  // If a callback is provided, call it with a status
  if (callback) {
    callback(
      "success",
      `User ${unsubscribeDetails.userId} successfully unsubscribed from snapshot ${snapshotId}`
    );
  }
};

const triggerEvent = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event:
    | string
    | CombinedEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | SnapshotEvents<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >,
  snapshot: Snapshot<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >,
  eventDate: Date,
  snapshotId: string,
  subscribers: SubscriberCollection<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >,
  type: string,
  snapshotData: SnapshotData<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >
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
    snapshot, // Include snapshot data
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
const sendEventToAnalyticsService = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  event: AnalyticsEvent<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >
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
  return (
    typeof params === "object" &&
    params !== null &&
    typeof params.username === "string" &&
    typeof params.email === "string" &&
    typeof params.password === "string"
  );
};

// Example: Perform actions based on parameters
const performActionsWithParameters = (params: any): void => {
  // Your actions based on parameters here
  // For example, performing different actions based on the values of params for sending notifications
  if (params.type === "email") {
    // Send an email notification
    sendEmail(params.recipient, params.subject, params.message);
  } else if (params.type === "sms") {
    // Send an SMS notification
    sendSMS(params.phoneNumber, params.message);
  } else {
    // Log an error for unknown notification type
    console.error("Unknown notification type:", params.type);
  }
};

// Example: Perform generic actions
const performGenericActions = (): void => {
  // Your generic actions here
  // For example, fetching and displaying recent articles from a news API
  articleApi.articleApiService
    .fetchRecentArticles()
    .then((response: AxiosResponse<ArticleEntity[]>) => {
      const articles = response.data;
      articleApi.articleApiService.displayArticles(articles);
    })

    .catch((error: any) => {
      // Log and handle any errors that occur during fetching
      console.error("Error fetching recent articles:", error);
    });
};

export {
    logActivity,
    notifyEventSystem,
    portfolioUpdates,
    tradeExections,
    triggerEvent,
    triggerIncentives,
    unsubscribe,
    updateProjectState
};

  export type { LogActivityParams, TriggerIncentivesParams };

