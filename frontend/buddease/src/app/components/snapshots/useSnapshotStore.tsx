// useSnapshotStore.ts
import { SnapshotStoreConfig, snapshotConfig } from "@/app/components/snapshots/SnapshotConfig";
import { BaseData, Data } from "../models/data/Data";
import {  SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { DataAnalysisDispatch } from "@/app/typings/dataAnalysisTypes";
import { LiveEvent } from "@refinedev/core";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as snapshotApi from "../../api/SnapshotApi";
import { CryptoActions } from "../actions/CryptoActions";
import { ProjectManagementActions } from "../actions/ProjectManagementActions";
import { SubscriptionPayload } from "../actions/SubscriptionActions";
import { TaskActions } from "../actions/TaskActions";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { ModifiedDate } from "../documents/DocType";
import useSubscription from "../hooks/useSubscription";
import { SnapshotLogger } from "../logging/Logger";
import { Content } from "../models/content/AddContent";
import {
  ActivityActionEnum,
  ActivityTypeEnum,
  PriorityTypeEnum,
  ProjectStateEnum,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import {
  displayToast,
  showErrorMessage,
  showToast,
} from "../models/display/ShowToast";
import { Member } from "../models/teams/TeamMembers";
import { Project, ProjectData, ProjectType } from "../projects/Project";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import {
  NotificationData,
  addNotification,
} from "../support/NofiticationsSlice";
import {
  NotificationContextType,
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import UserRoles from "../users/UserRoles";
import {
  logActivity,
  notifyEventSystem,
  triggerIncentives,
  updateProjectState,
} from "../utils/applicationUtils";
import { useSecureUserId } from "../utils/useSecureUserId";
import { SnapshotActions } from "./SnapshotActions";
import SnapshotStore, { initialState } from "./SnapshotStore";
import { CustomSnapshotData, Payload, Snapshot, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { delegate, deleteSnapshot, subscribeToSnapshots } from "../snapshotHandlers";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";

const SNAPSHOT_URL = process.env.REACT_APP_SNAPSHOT_URL;

const convertSubscriptionPayloadToSubscriber = (
  payload: SubscriptionPayload
): Subscriber<CustomSnapshotData, Data> => {
  const subscriber = new Subscriber<CustomSnapshotData, Data>(
    payload.id,
    // Assuming payload.name is a string, replace with your actual data structure
    payload.name,
    {
      subscriberId: payload.subscriberId,
      subscriberType: SubscriberTypeEnum.FREE, // or appropriate value
      subscriptionType: SubscriptionTypeEnum.Snapshot, // or appropriate value
      getPlanName: () => SubscriberTypeEnum.FREE, // or appropriate function
      portfolioUpdates: () => {},
      tradeExecutions: () => {},
      marketUpdates: () => {},
      communityEngagement: () => {},
      triggerIncentives: () => {},
      unsubscribe: () => { },
      determineCategory: (data) => data.category,
      portfolioUpdatesLastUpdated: {
        value: new Date(),
        isModified: false,
        
      } as ModifiedDate,
    },
    payload.subscriberId,
    notifyEventSystem, // Replace with your actual function
    updateProjectState, // Replace with your actual function
    logActivity, // Replace with your actual function
    triggerIncentives, // Replace with your actual function
    {
      email: payload.email,
      timestamp: new Date(),
      value: payload.value,
      category: payload.category || "",
    }
  );

  return subscriber;
};

// Create the snapshot store
const useSnapshotStore = async (
  addToSnapshotList: (
    snapshot: Snapshot<any>,
    subscribers: Subscriber<Data, CustomSnapshotData>[]
  ) => void
): Promise<SnapshotStore<any>> => {
  // Initialize state for snapshots
  // const snapshotId =  UniqueIDGenerator.generateSnapshoItemID();
  const [snapshots, setSnapshots] = useState<SnapshotStore<BaseData> | undefined>(
    undefined
  );
  const [subscribers, setSubscribers] = useState<
    Subscriber<Data, CustomSnapshotData>[]
  >([]);
  
  
  const addSnapshot = async (snapshot: Snapshot<any>) => {
    const defaultImplementation = (): void => {
      console.log("Default implementation - Method not provided.");
    };
  
    const resolvedDelegate = await delegate(); // Resolve the promise
    

    // Convert dataStoreMethods
    const dataStoreMethods = snapshot.store?.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K>;

    const data = {} as Partial<SnapshotStore<any, any>>
    // const delegate = {} as SnapshotStoreConfig<any, any>[]
    const snapshotStoreOptions: SnapshotStoreOptions<any, any> = {
      snapshotId: "defaultId",
      category: {} as CategoryProperties,
      dataStoreMethods: dataStoreMethods || { addSnapshot: defaultImplementation },
      type,
      date,
      data,
      snapshotConfig,
      delegate: delegate,
      getDelegate,
      
    };
  
    const newSnapshot = new SnapshotStore<any>(snapshotStoreOptions);
  
    const dataStore = newSnapshot.getDataStore();
  
    // Add the new snapshot to the list (example usage)
    addToSnapshotList(newSnapshot, []);
  
    // Update the state synchronously
    setSnapshots((currentSnapshots) => {
      const updatedSnapshots = currentSnapshots
        ? [...currentSnapshots, newSnapshot]
        : [newSnapshot];
      return updatedSnapshots;
    });
  };
  
  
  
  // Subscribe to live events using useSubscription hook
  const { subscribe, unsubscribe } = useSubscription({
    channel: "your_channel_here",
    onLiveEvent: (event: LiveEvent) => {
      const payload = event.payload;

      // Handle errors in the payload
      if (payload.error) {
        const errorLogType = "Error";
        const errorMessage = `Received error in payload: ${payload.error}`;
        SnapshotLogger.log(errorLogType, errorMessage);
        return;
      }

      // Log the payload
      const payloadLogType = "Payload";
      const payloadMessage = "Received new snapshot payload";
      SnapshotLogger.log(payloadLogType, payloadMessage, payload);

      // Update snapshots based on the payload
      const snapshot = payload.data;
      setSnapshots((snapshots) => {
        const newSnapshots: SnapshotStore<Data> = snapshots
          ? [...snapshots, { snapshot }]
          : [{ snapshot }];
        addToSnapshotList(snapshot, subscribers);
        return newSnapshots;
      });
    },
    enabled: true, // Enable subscription
  });

  const [project, setProject] = useState<Project>();

  const takeSnapshot = async (
    content: Content,
    date: Date,
    projectType: ProjectType,
    projectId: string,
    projectState: ProjectStateEnum,
    projectPriority: PriorityTypeEnum,
    projectMembers: Member[]
  ) => {
    const snapshot = await snapshotApi.takeSnapshot(
      content,
      date,
      projectType,
      projectId,
      projectState,
      projectPriority,
      projectMembers
    );
    return snapshot;
  };

  useEffect(() => {
    const payload: SubscriptionPayload = {
      id: "unique_id",
      subscriberId: "unique_id",
      email: "<EMAIL>",
      value: 100,
      category: "category",
      notify: undefined,
      content: undefined,
      date: undefined,
      subscribers: undefined,
      subscription: undefined,
      onSnapshotCallbacks: undefined,
      onSnapshotCallback: undefined,
      onSnapshotCallbackError: undefined,
      onSnapshotCallbackRemoved: undefined,
      onSnapshotCallbackAdded: undefined,
      onSnapshotCallbackScheduled: undefined,
      onDisconnectingCallbacks: undefined,
      onDisconnectCallback: undefined,
      onDisconnectCallbackError: undefined,
      onDisconnectCallbackRemoved: undefined,
      onDisconnectCallbackAdded: undefined,
      onDisconnectCallbackScheduled: undefined,
      onReconnectingCallbacks: undefined,
      onReconnectCallback: undefined,
      onReconnectCallbackError: undefined,
      onReconnectCallbackRemoved: undefined,
      onReconnectCallbackAdded: undefined,
      onReconnectCallbackScheduled: undefined,
      onErrorCallbacks: undefined,
      onUnsubscribeCallbacks: undefined,
      state: undefined,
      notifyEventSystem: notifyEventSystem,
      updateProjectState: updateProjectState,
      logActivity: logActivity,
      triggerIncentives: triggerIncentives,
      name: undefined,
      data: undefined,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      toSnapshotStore: undefined,
      getId: undefined,
      getUserId: undefined,
      receiveSnapshot: undefined,
      getState: undefined,
      onError: undefined,
      triggerError: undefined,
      onUnsubscribe: undefined,
      onSnapshot: undefined,
      triggerOnSnapshot: undefined,
      subscriber: undefined,
    };

    const takeSnapshot = async (snapshot: Snapshot<Data>) => {
      const snapshotUrl = `${SNAPSHOT_URL}/snapshot`;
      const response = await fetch(snapshotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snapshot),
      });
      const data = await response.json();
      console.log(data);
    };
    // Create a new Subscriber instance with the required arguments
    const subscriber = new Subscriber<CustomSnapshotData | Data>(
      payload.id, // Replace 'unique_id' with the actual subscriber ID
      payload.name,
      {
        subscriberId: "subscriber_id", // Replace 'subscriber_id' with the actual subscriber ID
        subscriberType: SubscriberTypeEnum.FREE, // or appropriate value
        subscriptionType: SubscriptionTypeEnum.Snapshot, // or appropriate value
        getPlanName: () => SubscriberTypeEnum.FREE, // or appropriate function
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        communityEngagement: () => {},
        triggerIncentives: () => {},
        unsubscribe: () => { },
        determineCategory: (data) => data.category,
        portfolioUpdatesLastUpdated: {
          value: new Date(),
          isModified: false,
        } as ModifiedDate,
      },
      "subscriber_id", // Replace 'subscriber_id' with the actual subscriber ID
      notifyEventSystem, // Replace with your actual function
      updateProjectState, // Replace with your actual function
      logActivity, // Replace with your actual function
      triggerIncentives, // Replace with your actual function
      {
        email: "<EMAIL>", // Replace '<EMAIL>' with the subscriber's email
        timestamp: new Date(),
        value: 100, // Replace with the appropriate value
        category: "category", // Replace 'category' with the appropriate value or leave empty string if not applicable
      }
    );

    subscribe();

    return () => {
      const subscriberId = subscriber.id!
      unsubscribe(subscriberId);
    };
  }, [
    notifyEventSystem,
    updateProjectState,
    logActivity,
    triggerIncentives,
    subscribe,
    unsubscribe,
  ]);

  const dispatch = useDispatch();
  const { notify } = useNotification();
  const notificationContext = useNotification();
  const userId = useSecureUserId();

  const id = "unique_notification_id";
  const message = "New snapshot created successfully!";
  const content = "Details of the new snapshot";
  const date = new Date(); // Current date and time
  const type: NotificationType = NotificationTypeEnum.Success;
  let currentState: any = null;

  // Define or initialize newData (placeholder)
  const newData: Data = {
    id: "new-id",
    name: "New Name",
    value: "New Value",
    timestamp: new Date(),
    category: "New Category",
  };

  // Example usage:
  const newSnapshot: Snapshot<Data> = {
    id: "123",
    data: newData,
    timestamp: new Date(),
    category: "New Category",
    type: "",
  };

  const flatMap = () => {
    const flatMap = (
      snapshots: Snapshot<Data>[],
      callback: (snapshot: Snapshot<Data>) => void
    ) => {
      snapshots.forEach((snapshot) => {
        callback(snapshot);
      });
    };
    if (snapshots && Array.isArray(snapshots)) {
      flatMap(snapshots, (snapshot) => {
        console.log(snapshot);
      });
    }
    console.log("Flat map complete");
    return;
  };

  addSnapshot(newSnapshot);

  // Function to update an existing snapshot
  const updateSnapshot = async (snapshotIdToUpdate: string, newData: Data) => {
    // Fetch the snapshot from the database asynchronously using the provided ID
    const snapshotToUpdate = await snapshotApi.fetchSnapshotById(
      snapshotIdToUpdate
    );

    // Check if the snapshot exists
    if (snapshotToUpdate) {
      // Update the snapshot's data with the new data
      snapshotToUpdate.data = newData;
      snapshotToUpdate.timestamp = new Date(); // Update timestamp
      console.log(`Snapshot ${snapshotIdToUpdate} updated successfully.`);
    } else {
      console.warn(`Snapshot ${snapshotIdToUpdate} not found.`);
    }
  };

  // Function to remove a snapshot
  const removeSnapshot = (snapshotToRemove: Snapshot<any>) => {
    if (snapshots) {
      const index = snapshots.findIndex(
        (snapshot: Snapshot<Data>) => snapshot.id === snapshotToRemove.id
      );
      if (index !== -1) {
        snapshots.splice(index, 1);
        console.log(`Snapshot ${snapshotToRemove.id} removed successfully.`);
      } else {
        console.warn(`Snapshot ${snapshotToRemove.id} not found.`);
      }
    }
  };

  const clearSnapshots = () => {
    setSnapshots([]);
  }; // Function to notify subscribers

  const notifySubscribers = async (
    subscribers: Subscriber<CustomSnapshotData | Data>[], // Accept both Data and CustomSnapshotData
    notify: NotificationContextType["notify"],
    id: string,
    notification: NotificationData,
    date: Date,
    content?: string | Content,
    type?: string
  ): Promise<void> => {
    // Iterate over each subscriber
    for (const subscriber of subscribers) {
      // Customize notification message if needed
      const personalizedMessage = `${notification.message} - Sent to: ${
        subscriber.getData()?.name ?? ""
      } (${subscriber.getData()?.email ?? ""})`;

      // Check if the subscriber data type is CustomSnapshotData
      if (
        subscriber.getData()?.data &&
        "category" in subscriber.getData()?.data
      ) {
        // Convert CustomSnapshotData to Data
        const data: Data = {
          email: subscriber.getData()?.data.email ?? "",
          timestamp: subscriber.getData()?.data.timestamp ?? 0,
          value: subscriber.getData()?.data.value ?? "",
          // Map other properties as needed
        };

        // Send notification to the subscriber
        await notify(
          subscriber.getSubscriberId(),
          personalizedMessage,
          data,
          new Date(),
          notification.type!
        );
      } else if (subscriber.getData()?.data) {
        // Send notification to the subscriber using existing data
        await notify(
          subscriber.getSubscriberId(),
          personalizedMessage,
          subscriber.getData()?.data, // Assert type to Data
          new Date(),
          notification.type!
        );
      }
    }
  };

  const addSnapshotSuccess = async (
    snapshot: Snapshot<Data>,
    subscribers: Subscriber<CustomSnapshotData | Data>[]
  ) => {
    // Notify subscribers
    await notifySubscribers(
      subscribers,
      notify,
      id,
      {
        id: id,
        message: message,
        content: content,
        date: date,
        type: type,
        completionMessageLog: {
          message: "Snapshot added successfully.",
          date: new Date(),
          timestamp: new Date().getTime(),
          level: "info",
        },
        topics: [],
        highlights: [],
        files: [],
        rsvpStatus: "yes",
        host: {} as Member,
        participants: [],
        teamMemberId: "",
      },
      date,
      content,
      type
    );
    console.log("Snapshot added successfully.");
    return;
  };

  // Function to get subscribers
  const getSubscribers = (
    payload: SubscriptionPayload
  ): Subscriber<CustomSnapshotData | Data>[] => {
    // Implement logic to fetch subscribers from a database or an API
    // For demonstration purposes, returning a mock list of subscribers
    const subscribers: Subscriber<CustomSnapshotData | Data>[] = [];
    const subscriberId = payload.getId()
    const userId = useSecureUserId(); // Retrieve the user ID using the hook
    // Create subscriber instances and push them into the array
    const subscriber1 = new Subscriber<CustomSnapshotData | Data>(
      payload.id,
      payload.name,
      {

        subscriberId: subscriberId,
        subscriberType: SubscriberTypeEnum.STANDARD,
        subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
        getPlanName: () => SubscriberTypeEnum.STANDARD,
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        communityEngagement: () => { },
        triggerIncentives: () => {},
        unsubscribe: () => { },
        determineCategory: (data: any) => data,
        portfolioUpdatesLastUpdated: {
          value: new Date(),
          isModified: false,
        } as ModifiedDate,
      },
      subscriberId,
      notifyEventSystem,
      updateProjectState,
      logActivity,
      triggerIncentives,
      {
        email: "john@example.com",
        timestamp: new Date(),
        value: 42,
        category: "",
      }
    );

    const subscriber2 = new Subscriber<CustomSnapshotData | Data>(
      payload.id,
      payload.name,      
      {
        subscriberId: subscriberId,
        subscriberType: SubscriberTypeEnum.STANDARD,
        subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
        getPlanName: () => SubscriberTypeEnum.STANDARD,
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        communityEngagement: () => { },
        triggerIncentives: () => { },
        determineCategory: (data: any) => data,
        unsubscribe: () => {},
        portfolioUpdatesLastUpdated: {
          value: new Date(),
          isModified: false,
        } as ModifiedDate,
      },
      subscriberId,
      notifyEventSystem,
      updateProjectState,
      logActivity,
      triggerIncentives,
      {
        email: "jane@example.com",
        timestamp: new Date(),
        value: 42,
        category: "example-category",
      }
    );

    subscribers.push(subscriber1, subscriber2);

    return subscribers;
  };

  // Usage example
  // const subscribers = getSubscribers()
  const notification: NotificationData = {
    id: "notification-id", // Provide a unique identifier
    message: "Notification message",
    content: "Notification content",
    type: NotificationTypeEnum.Info,
    sendStatus: false, // Assuming sendStatus indicates whether the notification was sent
    completionMessageLog: {
      timestamp: new Date(),
      level: "0",
      message: "Notification message",
      date: new Date(),
    },
    topics: [],
    highlights: [],
    files: [],
    rsvpStatus: "yes",
    host: {} as Member,
    participants: [],
    teamMemberId: "",
  };

  const convertedSubscribers = subscribers.map(
    convertSubscriptionPayloadToSubscriber
  );

  await notifySubscribers(
    convertedSubscribers,
    notify,
    id,
    notification,
    date,
    content,
    type
  );

  const snapshotId = UniqueIDGenerator.generateSnapshotID();

  const convertSnapshotToProject = (snapshot: Snapshot<Data>): Project => {
    return {
      id: snapshot.id!.toString(),
      data: snapshot.data as ProjectData,
      timestamp: snapshot.timestamp,
      category: snapshot.category,
      type: snapshot.type as ProjectType,
      phase: snapshot.phase!,
      name: "",
      description: "",
      members: [],
      tasks: [],
      status: "",
      priority: "",
      isActive: false,
      leader: {
        id: "",
        username: "",
        email: "",
        avatarUrl: "",
        role: UserRoles.Administrator,
        isCurrent: false,
        firstName: "",
        lastName: "",
        tier: "",
        token: "",
      } as Member,
      budget: 0,
      phases: [],
      currentPhase: {
        id: "",
        name: "",
        description: "",
        subPhases: [],
        duration: 0,
        startDate: new Date(),
        endDate: new Date(),
        component: {} as FC<any>,
      },
      startDate: new Date(),
      endDate: new Date(),
    };
  };

  const updateSnapshotSuccess = (
    snapshot: Snapshot<Data>,
    subscribers: Subscriber<CustomSnapshotData | Data>[]
  ) => {
    // Update the snapshot in the database or an API
    // For demonstration purposes, updating the snapshot in the snapshots array
    const snapshotIndex = snapshots.findIndex(
      (snapshot) => snapshot.id === snapshot.id
    );
    snapshots[snapshotIndex] = snapshot;
    // Notify subscribers
    notifySubscribers(
      subscribers,
      notify,
      id,
      notification,
      date,
      content,
      type
    );
    // Convert snapshot to project
    const project = convertSnapshotToProject(snapshot);

    // Update the project state
    updateProjectState(
      ProjectStateEnum.Snapshots,
      snapshot.id!.toString(),
      project,
      content
    );
    // Log the activity
    logActivity({
      activityType: ActivityTypeEnum.Snapshot,
      action: ActivityActionEnum.Create,
      userId: "user_id", // Replace with actual user ID
      date: new Date(),
      snapshotId: snapshot.id!.toString(),
    });
  };

  const createSnapshot = (
    id: string,
    subscribers: Subscriber<CustomSnapshotData | Data>[], // Accept both Data and CustomSnapshotData
    notify: NotificationContextType["notify"],
    message: string,
    notification: NotificationData,
    content: any,
    date: Date,
    type: NotificationType
  ) => {
    const generateSnapshotID = () => {
      return UniqueIDGenerator.generateSnapshotID();
    };

    const newSnapshot: Snapshot<Data> = {
      id: generateSnapshotID().toString(),
      data: content,
      timestamp: date,
      category: type,
      type: type,
    };

    // Add the new snapshot to the snapshots array
    addSnapshot(newSnapshot);

    // Notify subscribers or perform any other necessary actions
    notifySubscribers(
      convertedSubscribers,
      notify,
      id,
      notification,
      date,
      type
    );

    // Call the success callback with the newly created snapshot
    createSnapshotSuccess(newSnapshot);
  };

  const configureSnapshotStore = (subscriber: SubscriptionPayload) => {
    const subscribers = getSubscribers(subscriber);
    const notify = (
      id: string,
      notification: WritableDraft<NotificationData>,
      date: Date,
      content: any,
      type: NotificationType
    ) => {
      // Add the notification to the notifications array
      addNotification(notification);
      // Example: Initializing any required variables or setting up connections
      console.log("Snapshot store configured successfully.");
    };
  };

  // This function takes an existing snapshot and updates its data
  const updateExistingSnapshot = (
    existingSnapshot: Snapshot<Data>,
    newData: Data
  ): Snapshot<Data> => {
    // Assuming newData is an object with updated data
    const updatedSnapshot: Snapshot<Data> = {
      ...existingSnapshot, // Copy existing snapshot properties
      data: newData, // Update data with new data
      timestamp: new Date(), // Update timestamp to indicate modification time
    };
    return updatedSnapshot;
  };

  // Define the updatedData
  const updatedData: Data = {
    id: "updated-id",
    name: "Updated Name",
    value: "Updated Value",
    timestamp: new Date(),
    category: "Updated Category",
    // Add other properties if needed
  };

  // Assuming you have the ID of the snapshot you want to update
  const snapshotIdToUpdate = "123";

  // Fetch the existing snapshot from the database
  const existingSnapshot = snapshotApi.fetchSnapshotById(snapshotIdToUpdate);

  if (existingSnapshot) {
    // Assuming you have some updated data
    const updatedData: Data = {
      id: "updated-id",
      name: "Updated Name",
      value: "Updated Value",
      timestamp: new Date(),
      category: "Updated Category",
      // Add other properties if needed
    };

    // Update the existing snapshot with the new data
    const updatedSnapshot = updateExistingSnapshot(
      await existingSnapshot,
      updatedData
    );

    // Now you can use the updatedSnapshot as needed
    console.log("Updated Snapshot:", updatedSnapshot);
  } else {
    console.warn("Snapshot not found.");
  }

  const createSnapshotSuccess = (snapshot: Snapshot<Data>) => {
    // Perform any actions or UI updates required after successful snapshot creation
    console.log("Snapshot created successfully:", snapshot);
    // For example, update UI to reflect the newly created snapshot
    updateUIWithNewSnapshot(snapshot);
  };

  const createSnapshotFailure = (error: Payload) => {
    // Handle error logging or display error messages after failed snapshot creation
    console.error("Snapshot creation failed:", error);
    // For example, display an error message to the user or log the error for debugging

    // Notify the user about failed snapshot creation
    useNotification().showErrorNotification(
      "SNAPSHOT_CREATION_FAILED",
      "Failed to create snapshot. Please try again later.",
      null
    );
  };
  const updateUIWithNewSnapshot = (snapshot: Snapshot<Data>) => {
    // Assuming you have a state variable to store snapshots
    // const [snapshots, setSnapshots] = useState<Snapshot<Data>[]>([]);

    // Update the state with the newly created snapshot
    setSnapshots([...snapshots, snapshot]);

    // Show a success notification to the user
    useNotification().showSuccessNotification(
      "Snapshot Created", // Provide an ID for the notification
      {
        text: "Snapshot created successfully!",
        description: "Snapshot Created",
      } as Message, // Provide a message object
      "Details of the new snapshot", // Provide content
      new Date(), // Provide the current date
      NotificationTypeEnum.Success // Provide the notification type
    );
  };
  const updateSnapshots = () => {
    // Logic to update multiple snapshots
    // This function can iterate over the existing snapshots and update them accordingly
    snapshots.forEach((snapshot) => {
      // Logic to update each snapshot
      // For example, update the data or timestamp of each snapshot
      snapshot.data = updatedData;
      snapshot.timestamp = new Date();
    });

    // After updating all snapshots, perform any necessary actions
    // Function to notify subscribers
    const notifySubscribers = async (
      notify: NotificationContextType["notify"],
      id: string,
      message: string,
      content: any,
      date: Date,
      type: NotificationType
    ) => {
      // Assuming `notify` is a function provided by the notification context
      await notify(id, message, content, date, type); // Call the notify function with the provided parameters
    };

    // Updated call to notifySubscribers with example arguments
    notifySubscribers(
      notify, // Pass the notify function
      id,
      message,
      content,
      date,
      type
    );

    // Call the success callback to indicate successful snapshot updates
    updateSnapshotsSuccess();
    dispatch(SnapshotActions.batchTakeSnapshots({ snapshots: { snapshots } }));
  };

  const showErrorModal = (title: string, message: string) => {
    // Assuming you have a modal component that displays the title and message
    console.error(`Error: ${title}`, message);
    // You can customize this function to display a modal in your UI framework
  };

  // Function to handle error logging or display error messages after failed snapshot update
  const updateSnapshotFailure = (error: Error) => {
    // Example: Display an error modal with the error message to the user
    showErrorModal(
      "Snapshot Update Failed",
      `Failed to update snapshot: ${error.message}`
    );
    // Example: Log the error message to a remote logging service for further investigation
    SnapshotLogger.logErrorToService(error);
  };

  // Function to handle actions or UI updates after successful batch snapshot updates
  const updateSnapshotsSuccess = () => {
    // Example: Show a success message indicating that batch updates were successful

    showToast({ content: "Batch Updates Successful" });
    showToast({ content: "Snapshots were successfully updated in batch." }); // Additional actions or UI updates can be added here
    // For example, you can update the UI to reflect the changes made by batch updates
  };
  const updateSnapshotsFailure = (error: Error | { message: string }) => {
    // Log the error to a logging service
    console.error("Failed to update snapshots:", error);

    // Display an error modal with the error message to the user
    showErrorModal(
      "Snapshot Update Failed",
      `Failed to update snapshots: ${
        error instanceof Error ? error.message : error
      }`
    );

    // Log the error message to a remote logging service for further investigation
    if (error instanceof Error) {
      SnapshotLogger.logErrorToService(error);
    } else {
      const errorMessage = error.message;
      SnapshotLogger.logErrorToService(new Error(errorMessage));
    }

    // Optionally, display an error message to the user
    if (typeof showErrorMessage === "function") {
      showErrorMessage("Failed to update snapshots. Please try again later.");
    }
  };

  const snapshotStore: SnapshotStore<Data> = {
    // Initialize the snapshot data
    snapshots: [],
    config: {
      snapshotId: "",
      initialConfig: null,
      initialState: {},
      timestamp: new Date(),
      state: [],
      // handleSnapshot: handleSnapshot,
      snapshots: [],
      // snapshot: null,
      subscribers: [],
      category: "",
      createSnapshot: createSnapshot,
      configureSnapshotStore: configureSnapshotStore,
    }, // Initialize the config object with appropriate initialConfig

    // Function to initialize the snapshot
    initSnapshot: async () => {
      try {
        // Perform initialization logic here, such as fetching initial snapshot data
        // For example:
        const initialSnapshotData = await fetchInitialSnapshotData();

        // Update the snapshotData in the store
        snapshotStore.snapshots = initialSnapshotData;

        // Optionally, perform any additional logic after initialization
      } catch (error) {
        // Handle initialization error
        console.error("Error initializing snapshot:", error);
      }
    },

    takeSnapshot: async (
      updatedSnapshots: Snapshot<Data>[]
    ): Promise<Snapshot<Data>[] | null> => {
      try {
        // Perform logic to capture a snapshot, such as fetching current data
        // Assuming you have a function to fetch current data
        const currentData = await fetchCurrentData();

        // Create a new snapshot object
        const newSnapshot: Snapshot<Data> = {
          id: "unique-id",
          timestamp: new Date(),
          data: currentData,
          category: "example-category",
          type: "example-type",
        };

        // Optionally, you can add the new snapshot to the updatedSnapshots array
        const snapshots = [...updatedSnapshots, newSnapshot];

        // Return the array of snapshots
        return snapshots;
      } catch (error) {
        // Handle snapshot capture error
        console.error("Error capturing snapshot:", error);
        return null;
      }
    },

    // Function to handle actions or UI updates after successful single snapshot capture
    takeSnapshotSuccess: (snapshot: Snapshot<Data>) => {
      // Example: Display a success message indicating that the snapshot was captured successfully
      showToast({ content: "Snapshot captured successfully!" });

      // Additional actions or UI updates can be added here
      // For example, update the UI to reflect the newly captured snapshot
      updateSnapshotList(snapshot);
    },

    // Function to handle actions or UI updates after successful batch snapshot captures
    takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {
      // Example: Display a success message indicating that batch snapshots were captured successfully
      showToast({ content: "Batch snapshots captured successfully!" });

      // Additional actions or UI updates can be added here
      // For example, update the UI to reflect the batch of captured snapshots
      snapshots.forEach((snapshot) => {
        updateSnapshotList(snapshot);
      });
    },

    // fetchSnapshotById: async (id: string) => {
    //   try {
    //     // Perform logic to fetch a snapshot by id, such as fetching data from a database
    //     // For example:
    //     const snapshot = await fetchSnapshotById(id);
    //     return snapshot;
    //   } catch (error) {
    //     // Handle snapshot capture error
    //     console.error("Error capturing snapshot:", error);
    //     return null;
    //   }
    // },
  };

  // Example function to update the UI with the newly captured snapshot
  const updateSnapshotList = (snapshot: Snapshot<Data>) => {
    // Assuming you have a function to add the snapshot to a list in your UI
    addToSnapshotList(snapshot);
  };
  // Assuming you have a function to display toast messages in your UI
  displayToast(message);

  // Example functions for fetching initial snapshot data and current data
  const fetchInitialSnapshotData = async (): Promise<Snapshot<Data>[]> => {
    // Simulate fetching initial snapshot data from an API
    // For example, you can fetch data from a database or external service
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

    // Return initial snapshot data as an array of Snapshot<Data> objects
    return [
      {
        id: "1",
        data: {
          exampleData: "Initial snapshot data 1",
          timestamp: undefined,
          category: "",
        },
        timestamp: new Date(),
        category: "Initial Category 1",
        type: "",
      },
      {
        id: "2",
        data: {
          exampleData: "Initial snapshot data 2",
          timestamp: undefined,
          category: "",
        },
        timestamp: new Date(),
        category: "Initial Category 2",
        type: "",
      },
      // Add more initial snapshot data objects as needed
    ];
  };

  const fetchCurrentData = async (): Promise<{
    exampleData: string;
    timestamp: Date;
    category: string;
  }> => {
    // Simulate fetching current data from an API
    // For example, you can fetch data from a database or external service
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay of 1 second

    // Return current data object
    return {
      exampleData: "Current data",
      timestamp: new Date(),
      category: "Current Category",
    };
  };

  const getData = async (dispatch: DataAnalysisDispatch) => {
    try {
      // Call the fetchData function to fetch data from the API
      const data = await dispatch(
        SnapshotActions.fetchSnapshotData(`${SNAPSHOT_URL}`)
      );
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const setData = (data: Data) => {
    snapshotApi.saveSnapshotToDatabase(data);
  };

  // Function to get the current state
  const getState = () => {
    return currentState;
  };

  // Function to set the state
  const setState = (state: any) => {
    currentState = state;
  };

  // Function to validate a snapshot
  const validateSnapshot = (snapshot: Snapshot<Data>): boolean => {
    // Implement your validation logic here
    // For example, you can check if the snapshot data meets certain criteria
    if (snapshot.data && snapshot.data.name !== "") {
      // Valid snapshot based on specific criteria
      return true;
    }

    // Add your demonstration validation logic here
    // For demonstration, let's assume the snapshot is valid if it has a timestamp
    return snapshot.timestamp !== undefined;
  };

  // Function to handle a snapshot
  const handleSnapshot = (
    snapshot: Snapshot<Data> | null,
    snapshotId: string
  ) => {
    if (snapshot) {
      // Implement actions based on the snapshot
      // For example, you can log the snapshot details
      console.log(`Handling snapshot with ID ${snapshotId}:`, snapshot);
    } else {
      // Handle the case when snapshot is null
      console.warn(`Snapshot with ID ${snapshotId} is null.`);
    }
  };

  // Function to handle actions
  const handleActions = async () => {
    try {
      // Example actions related to project management
      // These actions can interact with project-related data and functionalities

      // Action: Start a new project
      dispatch(ProjectManagementActions.startNewProject());

      // Action: Add a team member to a project
      dispatch(
        ProjectManagementActions.addTeamMember({
          projectId: "project123",
          memberId: "user456",
        })
      );

      // Action: Update project status
      dispatch(
        ProjectManagementActions.updateProjectStatus({
          projectId: "project123",
          status: "In Progress",
        })
      );

      // Action: Create a new task within a project phase
      dispatch(
        TaskActions.createTask({
          projectId: "project123",
          phaseId: "phase456",
          task: {
            name: "Task 1",
            description: "Description of Task 1",
            id: "",
            title: "",
            assignedTo: null,
            assigneeId: undefined,
            dueDate: undefined,
            payload: undefined,
            priority: PriorityTypeEnum.Low,
            previouslyAssignedTo: [],
            done: false,
            data: undefined,
            source: "user",
            startDate: undefined,
            endDate: undefined,
            isActive: false,
            tags: [],
            [Symbol.iterator]: function (): Iterator<any, any, undefined> {
              throw new Error("Function not implemented.");
            },
            timestamp: undefined,
            category: "",
          },
        })
      );

      // Action: Assign a task to a team member
      dispatch(
        TaskActions.assignTask({
          projectId: "project123",
          taskId: "task789",
          assigneeId: "user456",
        })
      );

      // Example actions related to crypto functionalities
      // These actions can interact with cryptocurrency-related data and functionalities
      // Action: Buy cryptocurrency
      dispatch(CryptoActions.buyCrypto({ currency: "BTC", amount: 1 }));

      // Action: Sell cryptocurrency
      dispatch(CryptoActions.sellCrypto({ currency: "ETH", amount: 2 }));

      // Action: Monitor crypto market trends
      dispatch(CryptoActions.monitorMarketTrends());

      // Action: Join a crypto community forum
      dispatch(CryptoActions.joinCryptoCommunity({ communityId: "crypto123" }));
      console.log("Actions handled successfully.");
    } catch (error) {
      console.error("Error handling actions:", error);
    }
  };
  // Function to set a single snapshot
  const setSnapshot = (snapshot: Snapshot<Data>) => {
    const dispatch = useDispatch();
    // Dispatch the add snapshot action with the provided snapshot
    dispatch(SnapshotActions.add(snapshot));
  };

  // Function to clear a snapshot from the store
  const clearSnapshot = (snapshotId: string) => {
    const updatedSnapshots = snapshots?.filter(
      (snapshot: Snapshot<Data>) => snapshot.id !== snapshotId
    );
    setSnapshots(updatedSnapshots);
  };

  // Function to merge new snapshots into the store
  const mergeSnapshots = (newSnapshots: Snapshot<Data>[]) => {
    // Merge the new snapshots with the existing ones
    setSnapshots([...snapshots, ...newSnapshots]);
  };

  const reduceSnapshots = () => {
    const uniqueSnapshots = Array.from(
      new Set(snapshots.map((snapshot) => snapshot.id))
    )
      .map((id) => snapshots.find((snapshot) => snapshot.id === id))
      .filter((snapshot) => snapshot !== undefined) as Snapshot<Data>[];
    setSnapshots(uniqueSnapshots);
  };

  const sortSnapshots = () => {
    const sortedSnapshots = [...snapshots].sort((a, b) => {
      const aTimestamp = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTimestamp = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTimestamp - bTimestamp;
    });
    setSnapshots(sortedSnapshots);
  };

  const filterSnapshots = () => {
    const filteredSnapshots =
      snapshots?.filter(
        (snapshot: Snapshot<Data>) => snapshot.type === "important"
      ) || [];
    setSnapshots(filteredSnapshots);
  };

  // Function to map snapshots based on a specific criterion
  const mapSnapshots = (callback: (snapshot: Snapshot<Data>) => any) => {
    // Apply the callback function to each snapshot and return the results
    return snapshots.map(callback);
  };

  // Function to find a specific snapshot by ID
  const findSnapshot = (snapshotId: string) => {
    // Find the snapshot with the matching ID
    return snapshots.find((snapshot) => snapshot.id === snapshotId);
  };

  // // Function to send a notification
  // const notify = (notification: NotificationData): void => {
  //   // Implement logic to send the notification (e.g., via email, push notification, etc.)
  //   console.log(`Notification sent: ${notification.message}`);
  // };

  // Return the snapshot store object

  return {
    // flatMap,
    snapshots,
    snapshotId,
    findSnapshot,
    addSnapshot,
    takeSnapshot,
    updateSnapshot,
    removeSnapshot,
    clearSnapshots,
    handleActions,
    handleSnapshot,
    validateSnapshot,
    addSnapshotSuccess,
    // Snapshot Creation and Management
    createSnapshot: (): Snapshot<Data> => {
      // Implement logic to create a new snapshot
      return {
        id: "",
        data: {} as Data,
        timestamp: new Date().toISOString(),
        type: "regular",
      };
    },
    createSnapshotSuccess: (snapshot: Snapshot<Data>) => {},
    createSnapshotFailure: (error: Error) => {},
    updateSnapshots: () => {},
    updateSnapshotSuccess: () => {},
    updateSnapshotFailure: (error: Payload) => {},
    updateSnapshotsSuccess: () => {},
    updateSnapshotsFailure: (error: Payload) => {},
    initSnapshot: () => {},
    initSnapshotSuccess: (snapshot: Snapshot<Data>) => {},
    takeSnapshotSuccess: (snapshot: Snapshot<Data>) => {},
    takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {},

    // Configuration
    configureSnapshotStore: () => {},

    // Data and State Handling
    getData: () => {
      return {} as Promise<Data>;
    },
    setData: (data: Data) => {},
    getState: () => null,
    setState: (state: any) => {},
    // validateSnapshot: (snapshot: Snapshot<Data>) => false,
    // handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => {},
    // handleActions: () => {},

    // Snapshot Operations
    setSnapshot: (snapshot: Snapshot<Data>) => {},
    setSnapshots: (snapshots: Snapshot<Data>[]) => {},
    clearSnapshot: (snapshotId: string) => {},
    mergeSnapshots: (snapshots: Snapshot<Data>[]) => {},
    reduceSnapshots: () => {},
    sortSnapshots: () => {},
    filterSnapshots: () => {},
    mapSnapshots: () => {},
    taskIdToAssign: {} as Snapshot<Data>,

    // Subscribers and Notifications
    getSubscribers: () => {},
    notify: () => {},
    notifySubscribers: () => {},
    subscribe: () => {},
    unsubscribe: () => {},

    // Fetching Snapshots
    fetchSnapshot: () => {},
    fetchSnapshotSuccess: () => {},
    fetchSnapshotFailure: () => {},
    getSnapshot: () => {},
    getSnapshots: () => {},
    getAllSnapshots: () => {},

    // Utility Methods
    generateId: () => {},

    // Batch Operations
    batchFetchSnapshots: () => {},
    batchTakeSnapshotsRequest: () => {},
    batchUpdateSnapshotsRequest: () => {},
    batchFetchSnapshotsSuccess: () => {},
    batchFetchSnapshotsFailure: () => {},
    batchUpdateSnapshotsSuccess: () => {},
    batchUpdateSnapshotsFailure: () => {},
    batchTakeSnapshot: () => new Promise<{ snapshots: Snapshots<Snapshot<any>>; }>,

    // Additional properties
    config: {} as SnapshotStoreConfig<Snapshot<any>, any>[],
  };
};

export { useSnapshotStore };
export type {SubscriptionPayload}