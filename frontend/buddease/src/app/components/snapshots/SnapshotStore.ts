import { fetchSnapshotById } from './../../api/SnapshotApi';
//snapshotstore.ts
import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import {
  NotificationContextType,
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { Signature } from "ethers";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as snapshotApi from "../../api/SnapshotApi";
import { CryptoActions } from "../actions/CryptoActions";
import { ProjectManagementActions } from "../actions/ProjectManagementActions";
import { SubscriptionPayload } from "../actions/SubscriptionActions";
import { LanguageEnum } from "../communications/LanguageEnum";
import { CustomTransaction } from "../crypto/SmartContractInteraction";
import { createCustomTransaction } from "../hooks/dynamicHooks/createCustomTransaction";
import useSubscription from "../hooks/useSubscription";
import { SnapshotLogger } from "../logging/Logger";
import { Content } from "../models/content/AddContent";
import { Data } from "../models/data/Data";
import { ProjectPhaseTypeEnum, SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import {
  displayToast,
  showErrorMessage,
  showToast,
} from "../models/display/ShowToast";
import { Tag } from "../models/tracker/Tag";
import { Phase } from "../phases/Phase";
import { Settings } from "../state/stores/SettingsStore";
import { NotificationData } from "../support/NofiticationsSlice";
import { TaskActions } from "../tasks/TaskActions";
import { Subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";
import {
  logActivity,
  notifyEventSystem,
  triggerIncentives,
  updateProjectState,
} from "../utils/applicationUtils";
import { SnapshotActions } from "./SnapshotActions";
import SnapshotStoreConfig from "./SnapshotConfig";
import { useSecureUserId } from '../utils/useSecureUserId';

const { notify } = useNotification();
const dispatch = useDispatch();
const notificationContext = useNotification();
interface Payload {
  error: string;
}

export type Snapshots<Data> = Array<Snapshot<Data>>;
interface UpdateSnapshotPayload<Data> {
  snapshotId: string;
  newData: Data;
}

// Define the interface CustomSnapshotData
interface CustomSnapshotData extends Data {
  timestamp: Date | string | undefined;
  value: number;
  // Add any other properties as needed
}

const SNAPSHOT_URL = endpoints.snapshots;
// Define interface for snapshot object

interface Snapshot<T> {
  id?: string | number;
  data: T; // Data stored in the snapshot
  timestamp: Date | string; // Timestamp of when the snapshot was created
  createdBy?: string; // Optional: User or entity that created the snapshot
  description?: string; // Optional: Description or notes about the snapshot
  tags?: Tag[] | string[]; // Optional: Tags or labels for categorizing the snapshot
  subscriberId?: string;
  length?: number;
  category: any;

  content?: T | string | Content | undefined;
  message?: string;
  type?: string;
}

// Function to initialize data
const initializeData = (): Data => {
  return {
    id: "initial-id",
    name: "Initial Name",
    value: "Initial Value",
    timestamp: new Date(),
    category: "Initial Category",
  };
};

const defaultCategory = "defaultCategory";
const initialState = {
  id: "",
  category: defaultCategory,
  timestamp: new Date(),
  length: 0,
  content: undefined,
  data: undefined,
};
// Define the snapshot store subset
type SnapshotStoreSubset = {
   snapshotId: string;
  addSnapshot: (snapshot: Snapshot<Data>) => void;
  updateSnapshot: (
    snapshotId: string,
    newData: Data,
    payload: UpdateSnapshotPayload<Data>
  ) => void;
  removeSnapshot: (snapshotId: string) => void;
  clearSnapshots: () => void;

  // fetchSnapshotById: (snapshotId: string) => void;
  // Snapshot Creation and Management
  createSnapshot: () => void;
  createSnapshotSuccess: (snapshot: Snapshot<Data>) => void;
  createSnapshotFailure: (error: Payload) => void;
  updateSnapshots: () => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotFailure: (error: Payload) => void;
  updateSnapshotsSuccess: () => void;
  updateSnapshotsFailure: (error: Payload) => void;
  initSnapshot: () => void;
  takeSnapshot: () => void;
  takeSnapshotSuccess: (snapshot: Snapshot<Data>) => void;
  takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => void;

  // Configuration
  configureSnapshotStore: () => void;

  // Data and State Handling
  getData: () => Data | null;
  setData: (data: Data) => void;
  getState: () => any;
  setState: (state: any) => void;
  validateSnapshot: (snapshot: Snapshot<Data>) => boolean;
  handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => void;
  handleActions: () => void;

  // Snapshot Operations
  setSnapshot: (snapshot: Snapshot<Data>) => void;
  setSnapshots: (snapshots: Snapshot<Data>[]) => void;
  clearSnapshot: (snapshotId: string) => void;
  mergeSnapshots: (snapshots: Snapshot<Data>[]) => void;
  reduceSnapshots: () => void;
  sortSnapshots: () => void;
  filterSnapshots: () => void;
  mapSnapshots: () => void;
  findSnapshot: () => void;

  // Subscribers and Notifications
  getSubscribers: () => void;
  notify: () => void;
  notifySubscribers: () => void;
  subscribe: () => void;
  unsubscribe: () => void;

  // Fetching Snapshots
  fetchSnapshot: () => void;
  fetchSnapshotSuccess: () => void;
  fetchSnapshotFailure: () => void;
  getSnapshot: () => void;
  getSnapshots: () => void;
  getAllSnapshots: () => void;

  // Utility Methods
  generateId: () => void;

  // Batch Operations
  batchFetchSnapshots: () => void;
  batchTakeSnapshotsRequest: () => void;
  batchUpdateSnapshotsRequest: () => void;
  batchFetchSnapshotsSuccess: () => void;
  batchFetchSnapshotsFailure: () => void;
  batchUpdateSnapshotsSuccess: () => void;
  batchUpdateSnapshotsFailure: () => void;
  batchTakeSnapshot: () => void;
};

// Define the snapshot store interface
type SnapshotStore<Data> = SnapshotStoreSubset & {
  snapshots: Snapshot<Data>[];
  config: any;
};

const convertSubscriptionPayloadToSubscriber = (
  payload: SubscriptionPayload
): Subscriber<CustomSnapshotData | Data> => {
  return new Subscriber<CustomSnapshotData | Data>(
    payload.id,
    {
      subscriberId: payload.subscriberId,
      subscriberType: SubscriberTypeEnum.FREE, // or appropriate value
      subscriptionType: SubscriptionTypeEnum.Snapshot, // or appropriate value
      getPlanName: () => SubscriberTypeEnum.FREE, // or appropriate function
      portfolioUpdates: () => {},
      tradeExecutions: () => {},
      marketUpdates: () => {},
      communityEngagement: () => {},
      unsubscribe: () => {},
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
};

// Create the snapshot store
const useSnapshotStore = async (
  addToSnapshotList: (snapshot: Snapshot<Data>) => void
): Promise<SnapshotStore<Data>> => {
  // Initialize state and methods
  const [snapshots, setSnapshots] = useState<Snapshot<Data>[]>([]);
  const { subscribe, unsubscribe, subscribers } = useSubscription();

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

  // Define methods to be exposed by the snapshot store
  const addSnapshot = (snapshot: Snapshot<Data>) => {
    setSnapshots([...snapshots, snapshot]);
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
  const removeSnapshot = (snapshotId: string) => {
    const index = snapshots.findIndex((snapshot) => snapshot.id === snapshotId);
    if (index !== -1) {
      snapshots.splice(index, 1);
      console.log(`Snapshot ${snapshotId} removed successfully.`);
    } else {
      console.warn(`Snapshot ${snapshotId} not found.`);
    }
  };

  const clearSnapshots = () => {
    setSnapshots([]);
  }; // Function to notify subscribers
  const notifySubscribers = async (
    subscribers: Subscriber<Data | CustomSnapshotData>[], // Accept both Data and CustomSnapshotData
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
      const personalizedMessage = `${notification.message} - Sent to: ${subscriber.name} (${subscriber.email})`;

      // Check if the subscriber data type is CustomSnapshotData
      if (subscriber.data && "category" in subscriber.data) {
        // Convert CustomSnapshotData to Data
        const data: Data = {
          email: subscriber.data.email,
          timestamp: subscriber.data.timestamp,
          value: subscriber.data.value,
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
      } else if (subscriber.data) {
        // Send notification to the subscriber using existing data
        await notify(
          subscriber.getSubscriberId(),
          personalizedMessage,
          subscriber.data as Data, // Assert type to Data
          new Date(),
          notification.type!
        );
      }
    }
  };

  // Function to get subscribers
  const getSubscribers = (subscriber: SubscriptionPayload): Subscriber<CustomSnapshotData | Data>[] => {
    // Implement logic to fetch subscribers from a database or an API
    // For demonstration purposes, returning a mock list of subscribers
    const subscribers: Subscriber<CustomSnapshotData | Data>[] = [];
    const subscriberId = subscriber.getId();
    const userId = useSecureUserId(); // Retrieve the user ID using the hook
    // Create subscriber instances and push them into the array
    const subscriber1 = new Subscriber<CustomSnapshotData | Data>(
      userId!.toString(),
      {
        subscriberId: subscriberId,
        subscriberType: SubscriberTypeEnum.STANDARD,
        subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
        getPlanName: () => SubscriberTypeEnum.STANDARD,
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        communityEngagement: () => {},
        unsubscribe: () => {},
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
      userId!.toString(),
      {
        subscriberId: subscriberId,
        subscriberType: SubscriberTypeEnum.STANDARD,
        subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
        getPlanName: () => SubscriberTypeEnum.STANDARD,    
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        communityEngagement: () => {},
        unsubscribe: () => {},
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
    },
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

  const createSnapshot = (
    id: string,
    subscribers: Subscriber<Data | CustomSnapshotData>[], // Accept both Data and CustomSnapshotData
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

  // Function to handle actions or UI updates after successful snapshot update
  const updateSnapshotSuccess = () => {
    // Example: Reload the page to reflect the updated snapshot
    window.location.reload();
    // Additional actions or UI updates can be added here
    // For example, you can navigate the user to a different page or show a success modal
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
    config: { initialConfig: null }, // Initialize the config object with appropriate initialConfig

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

    // Function to take a single snapshot
    takeSnapshot: async () => {
      try {
        // Perform logic to capture a snapshot, such as fetching current data
        // For example:
        const currentData = await fetchCurrentData();

        // Create a new snapshot object
        const snapshot: Snapshot<Data> = {
          timestamp: new Date(),
          data: currentData,
          category: undefined,
          type: "",
        };

        // Optionally, perform any additional logic before returning the snapshot
        return snapshot;
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

  }

  











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

  const configureSnapshotStore = () => {
    // Perform any configuration needed for the snapshot store
    // This function can be empty for now
    // Example: Initializing any required variables or setting up connections
    console.log("Snapshot store configured successfully.");
  };

  const getData = async () => {
    try {
      // Call the fetchData function to fetch data from the API
      const data = await fetchData(`${SNAPSHOT_URL}`); // Replace '<your-api-endpoint>' with the actual endpoint
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
            priority: "low",
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
    // Filter out the snapshot with the specified ID
    const updatedSnapshots = snapshots.filter(
      (snapshot) => snapshot.id !== snapshotId
    );
    // Update the snapshot list
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
    const filteredSnapshots = snapshots.filter(
      (snapshot) => snapshot.type === "important"
    );
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
    snapshotId,
    snapshots,
    addSnapshot,
    updateSnapshot,
    removeSnapshot,
    clearSnapshots,

    // Snapshot Creation and Management
    createSnapshot: () => {},
    createSnapshotSuccess: (snapshot: Snapshot<Data>) => {},
    createSnapshotFailure: (error: Payload) => {},
    updateSnapshots: () => {},
    updateSnapshotSuccess: () => {},
    updateSnapshotFailure: (error: Payload) => {},
    updateSnapshotsSuccess: () => {},
    updateSnapshotsFailure: (error: Payload) => {},
    initSnapshot: () => {},
    takeSnapshot: () => {},
    takeSnapshotSuccess: (snapshot: Snapshot<Data>) => {},
    takeSnapshotsSuccess: (snapshots: Snapshot<Data>[]) => {},

    // Configuration
    configureSnapshotStore: () => {},

    // Data and State Handling
    getData: () => null,
    setData: (data: Data) => {},
    getState: () => null,
    setState: (state: any) => {},
    validateSnapshot: (snapshot: Snapshot<Data>) => false,
    handleSnapshot: (snapshot: Snapshot<Data> | null, snapshotId: string) => {},
    handleActions: () => {},

    // Snapshot Operations
    setSnapshot: (snapshot: Snapshot<Data>) => {},
    setSnapshots: (snapshots: Snapshot<Data>[]) => {},
    clearSnapshot: (snapshotId: string) => {},
    mergeSnapshots: (snapshots: Snapshot<Data>[]) => {},
    reduceSnapshots: () => {},
    sortSnapshots: () => {},
    filterSnapshots: () => {},
    mapSnapshots: () => {},
    findSnapshot: () => {},

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
    batchTakeSnapshot: () => {},

    // Additional properties
    config: {} as typeof SnapshotStoreConfig<Data>, // Placeholder, replace with actual configuration object
  };
};

// Export the snapshot store creation function
export { useSnapshotStore };
export type { CustomSnapshotData, Payload, Snapshot };

// Example usage of the Snapshot interface
const snapshot: Snapshot<Data> = {
  id: "snapshot1",
  category: "example category",
  data: {
    _id: "1",
    id: "data1",
    title: "Sample Data",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
    startDate: new Date(),
    endDate: new Date(),
    scheduled: true,
    status: "Pending",
    isActive: true,
    tags: ["Important"],
    phase: {} as Phase,
    phaseType: ProjectPhaseTypeEnum.Ideation,
    dueDate: new Date(),
    priority: "High",
    assignee: {
      id: "assignee1",
      username: "Assignee Name",
    } as User,
    collaborators: ["collab1", "collab2"],
    comments: [],
    attachments: [],
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "creator1",
    updatedBy: "updater1",
    analysisResults: [],
    audioUrl: "sample-audio-url",
    videoUrl: "sample-video-url",
    videoThumbnail: "sample-thumbnail-url",
    videoDuration: 60,
    collaborationOptions: [],
    videoData: {
      id: "video1",
      campaignId: 123,
      resolution: "1080p",
      size: "100MB",
      aspectRatio: "16:9",
      language: "en",
      subtitles: [],
      duration: 60,
      codec: "H.264",
      frameRate: 30,
      url: "",
      thumbnailUrl: "",
      uploadedBy: "",
      viewsCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      title: "",
      description: "",
      tags: [],
      createdAt: new Date(),
      uploadedAt: new Date(),
      updatedAt: new Date(),
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 60,
      uploadDate: new Date(),
      videoLikes: 0,
      videoViews: 0,
      videoComments: 0,
      videoThumbnail: "",
      videoUrl: "",
      videoTitle: "",
      videoDescription: "",
      videoTags: [],
      videoSubtitles: [],
      category: "",
      closedCaptions: [],
      license: "",
      isLive: false,
      isPrivate: false,
      isUnlisted: false,
      isProcessingCompleted: false,
      isProcessingFailed: false,
      isProcessingStarted: false,
      channel: "",
      channelId: "",
      isLicensedContent: false,
      isFamilyFriendly: false,
      isEmbeddable: false,
      isDownloadable: false,
      playlists: [],
    },
    additionalData: {},
    ideas: [],
    members: [],
    leader: {
       id: "leader1",
      username: "Leader Name",
      email: "leader@example.com",
      fullName: "Leader Full Name",
      bio: "Leader Bio",
      userType: "Admin",
      hasQuota: true,
      tier: "0",
      token: "leader-token",
      uploadQuota: 100,
      usedQuota: 50,
      avatarUrl: "avatar-url",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isAdmin: false,
      isActive: true,
      profilePicture: null,
      processingTasks: [],
      role: UserRoles.Leader,
      firstName: "",
      lastName: "",
      friends: [],
      blockedUsers: [],
      persona: new Persona(PersonaTypeEnum.Default),
      settings: {
        id: "",
        filter: (key: keyof Settings) => {},
        appName: "buddease",
        userId: 123,
        userSettings: setTimeout(() => {}, 1000), // Example timeout
        communicationMode: "email",
        enableRealTimeUpdates: true,
        defaultFileType: "pdf",
        allowedFileTypes: ["pdf", "docx", "txt"],
        enableGroupManagement: true,
        enableTeamManagement: true,
        idleTimeout: undefined,
        startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
          // Example implementation
          setTimeout(onTimeout, timeoutDuration);
        },
        idleTimeoutDuration: 60000, // 1 minute
        activePhase: "development",
        realTimeChatEnabled: true,
        todoManagementEnabled: true,
        notificationEmailEnabled: true,
        analyticsEnabled: true,
        twoFactorAuthenticationEnabled: true,
        projectManagementEnabled: true,
        documentationSystemEnabled: true,
        versionControlEnabled: true,
        userProfilesEnabled: true,
        accessControlEnabled: true,
        taskManagementEnabled: true,
        loggingAndNotificationsEnabled: true,
        securityFeaturesEnabled: true,
        collaborationPreference1: "Option 1",
        collaborationPreference2: "Option 2",
        theme: "light",
        language: LanguageEnum.English, // Example language
        fontSize: 14,
        darkMode: false,
        enableEmojis: true,
        enableGIFs: true,
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: "ding.wav", // Example sound file
        timeZone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        defaultProjectView: "list",
        taskSortOrder: "priority",
        showCompletedTasks: true,
        projectColorScheme: "blue",
        showTeamCalendar: true,
        teamViewSettings: [],
        defaultTeamDashboard: "overview",
        passwordExpirationDays: 90,
        privacySettings: [], // Example privacy settings
        thirdPartyApiKeys: {
          google: "your-google-api-key",
          facebook: "your-facebook-api-key",
        },
        externalCalendarSync: true,
        dataExportPreferences: [],
        dashboardWidgets: [],
        customTaskLabels: [],
        customProjectCategories: [],
        customTags: [],
        additionalPreference1: "Option A",
        additionalPreference2: "Option B",
        formHandlingEnabled: true,
        paginationEnabled: true,
        modalManagementEnabled: true,
        sortingEnabled: true,
        notificationSoundEnabled: true,
        localStorageEnabled: true,
        clipboardInteractionEnabled: true,
        deviceDetectionEnabled: true,
        loadingSpinnerEnabled: true,
        errorHandlingEnabled: true,
        toastNotificationsEnabled: true,
        datePickerEnabled: true,
        themeSwitchingEnabled: true,
        imageUploadingEnabled: true,
        passwordStrengthEnabled: true,
        browserHistoryEnabled: true,
        geolocationEnabled: true,
        webSocketsEnabled: true,
        dragAndDropEnabled: true,
        idleTimeoutEnabled: true,
        enableAudioChat: true,
        enableVideoChat: true,
        enableFileSharing: true,
        enableBlockchainCommunication: true,
        enableDecentralizedStorage: true,
        selectDatabaseVersion: "latest",
        selectAppVersion: "2.0",
        enableDatabaseEncryption: true,
      },
      interests: [],
      privacySettings: {
        hidePersonalInfo: true,
        enablePrivacyMode: false,
        enableTwoFactorAuth: true,
        restrictVisibilityToContacts: false,
        restrictFriendRequests: false,
        hideOnlineStatus: false,
        showLastSeenTimestamp: true,
        allowTaggingInPosts: true,
        enableLocationPrivacy: true,
        hideVisitedProfiles: true,
        restrictContentSharing: true,
        enableIncognitoMode: false,
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        chat: false,
        calendar: false,
        task: false,
        file: false,
        meeting: false,
        announcement: false,
        reminder: false,
        project: true,
        enabled: true,
        notificationType: "push",
        audioCall: false,
        videoCall: false,
        screenShare: false,
        mention: false,

        reaction: true,
        follow: true,
        poke: true,
        activity: false,

        thread: false,
        inviteAccepted: true,
        directMessage: true,
      },
      activityLog: [
        {
          id: "",
          activity: "",
          action: "Logged in",
          timestamp: new Date(),
        },
        {
          id: "",
          activity: "",
          action: "Updated profile",
          timestamp: new Date(),
        },
      ],
      socialLinks: {
        facebook: "https://facebook.com/leader",
        twitter: "https://twitter.com/leader",
        website: "https://website.com/leader",
        linkedin: "https://linkedin.com/leader",
        instagram: "https://finstagram.com/leader",
      },
      relationshipStatus: "Single",
      hobbies: ["Reading", "Traveling"],
      skills: ["Project Management", "Software Development"],
      achievements: ["Completed 100 projects", "Employee of the Month"],
      profileVisibility: "Public",
      profileAccessControl: {
        friendsOnly: true,
        allowTagging: true,
        blockList: [],
        allowMessagesFromNonContacts: true,
        shareProfileWithSearchEngines: false,
      },
      activityStatus: "Online",
      isAuthorized: true,
      notificationPreferences: {
        mobile: false,
        desktop: true,
        emailNotifications: true,
        pushNotifications: true,
        enableNotifications: true,
        notificationSound: "birds",
        notificationVolume: 50,
        sms: false,
      },
      securitySettings: {
        securityQuestions: ["What is your pet's name?"],
        twoFactorAuthentication: false,
        passwordPolicy: "StandardPolicy",
        passwordExpirationDays: 90,
        passwordStrength: "Strong",
        passwordComplexityRequirements: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireDigits: true,
          requireSpecialCharacters: false,
        },
        accountLockoutPolicy: {
          enabled: true,
          maxFailedAttempts: 5,
          lockoutDurationMinutes: 15,
        },
      },
      emailVerificationStatus: true,
      phoneVerificationStatus: true,
      walletAddress: "0x123456789abcdef",
      transactionHistory: [
        createCustomTransaction({
          id: "tx1",
          amount: 100,
          date: new Date(),
          description: "Sample transaction",
          type: null,
          typeName: null,
          to: null,
          nonce: 0,
          gasLimit: BigInt(0),
          gasPrice: null,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          data: "",
          value: BigInt(0),
          chainId: BigInt(0),
          signature: null,
          accessList: [],
          maxFeePerBlobGas: null,
          blobVersionedHashes: null,
          hash: null,
          unsignedHash: "",
          from: null,
          fromPublicKey: null,
          isSigned(): boolean {
            return !!(
              this.type &&
              this.typeName &&
              this.from &&
              this.signature
            );
          },
          serialized: "",
          unsignedSerialized: "",
          inferType(): number {
            if (this.type !== null && this.type !== undefined) {
              return this.type;
            }
            return 0;
          },
          inferTypes(): number[] {
            const types: number[] = [];
            if (this.type !== null && this.type !== undefined) {
              types.push(this.type);
            }
            if (
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null
            ) {
              types.push(2);
            }
            if (types.length === 0) {
              types.push(0);
            }
            return types;
          },
          isLegacy() {
            return this.type === 0 && this.gasPrice !== null;
          },
          isBerlin() {
            return (
              this.type === 1 &&
              this.gasPrice !== null &&
              this.accessList !== null
            );
          },
          isLondon() {
            return (
              this.type === 2 &&
              this.accessList !== null &&
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null
            );
          },
          isCancun() {
            return (
              this.type === 3 &&
              this.to !== null &&
              this.accessList !== null &&
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null &&
              this.maxFeePerBlobGas !== null &&
              this.blobVersionedHashes !== null
            );
          },
          clone(): CustomTransaction {
            const clonedData: CustomTransaction = {
              _id: this._id as string,
              id: this.id as string,
              amount: this.amount,
              date: this.date as Date,
              title: this.title as string,
              value: this.value as bigint,
              description: this.description || "",
              startDate: this.startDate ? new Date(this.startDate) : undefined,
              endDate: this.endDate ? new Date(this.endDate) : undefined,
              isSigned:
                typeof this.isSigned === "function"
                  ? this.isSigned.bind(this)
                  : this.isSigned,
              serialized: this.serialized,
              unsignedSerialized: this.unsignedSerialized,
              nonce: this.nonce as number,
              gasLimit: this.gasLimit as bigint,
              chainId: this.chainId,
              hash: this.hash,
              type: this.type as number,
              typeName: this.typeName || "",
              data: this.data || "",
              unsignedHash: this.unsignedHash || "",
              to: this.to,
              gasPrice: this.gasPrice as bigint,
              maxFeePerGas: this.maxFeePerGas as bigint,
              maxPriorityFeePerGas: this.maxPriorityFeePerGas as bigint,
              signature: this.signature as Signature,
              accessList: this.accessList,
              maxFeePerBlobGas: this.maxFeePerBlobGas as bigint,
              blobVersionedHashes: this.blobVersionedHashes as string,
              from: this.from as string,
              fromPublicKey: this.fromPublicKey,
              isLegacy:
                typeof this.isLegacy === "function"
                  ? this.isLegacy.bind(this)
                  : this.isLegacy,
              isBerlin:
                typeof this.isBerlin === "function"
                  ? this.isBerlin.bind(this)
                  : this.isBerlin,
              isLondon:
                typeof this.isLondon === "function"
                  ? this.isLondon.bind(this)
                  : this.isLondon,
              isCancun:
                typeof this.isCancun === "function"
                  ? this.isCancun.bind(this)
                  : this.isCancun,
              inferType:
                typeof this.inferType === "function"
                  ? this.inferType.bind(this)
                  : this.inferType,
              inferTypes:
                typeof this.inferTypes === "function"
                  ? this.inferTypes.bind(this)
                  : this.inferTypes,
              clone: typeof this.clone === "function" ? this.clone : this.clone,

              equals: function (
                this: CustomTransaction,
                data: CustomTransaction
              ): boolean {
                return (
                  this.id === data.id &&
                  this._id === data._id &&
                  this.title === data.title &&
                  this.amount === data.amount &&
                  this.date.getTime() === data.date.getTime() &&
                  this.description === data.description &&
                  this.startDate?.getTime() === data.startDate?.getTime() &&
                  this.endDate?.getTime() === data.endDate?.getTime() &&
                  this.serialized === data.serialized &&
                  this.unsignedSerialized === data.unsignedSerialized &&
                  this.accessList === data.accessList &&
                  this.to === data.to &&
                  this.nonce === data.nonce &&
                  this.gasLimit === data.gasLimit &&
                  this.gasPrice === data.gasPrice &&
                  this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
                  this.maxFeePerGas === data.maxFeePerGas &&
                  this.type === data.type &&
                  this.data === data.data &&
                  this.value === data.value &&
                  this.chainId === data.chainId &&
                  this.signature === data.signature &&
                  this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
                  this.blobVersionedHashes === data.blobVersionedHashes &&
                  this.hash === data.hash &&
                  this.unsignedHash === data.unsignedHash &&
                  this.from === data.from &&
                  this.fromPublicKey === data.fromPublicKey
                  //if ther eare any new props ensure to add && above after the ast value
                  // Check other properties as needed
                  // Add checks for other properties here
                );
              },
              getSubscriptionLevel: function (this: CustomTransaction) {
                return "Pro";
              },
              getRecentActivity: function (this: CustomTransaction) {
                return [
                  { action: "Created snapshot", timestamp: new Date() },
                  { action: "Edited snapshot", timestamp: new Date() },
                ];
              },
              notificationsEnabled: true,
              recentActivity: [
                { action: "Created snapshot", timestamp: new Date() },
                { action: "Edited snapshot", timestamp: new Date() },
              ]
            };
            return clonedData;
          },
          equals(data: CustomTransaction) {
            const isSigned =
              typeof this.isSigned === "function"
                ? this.isSigned()
                : this.isSigned;
            const dataIsSigned =
              typeof data.isSigned === "function"
                ? data.isSigned()
                : data.isSigned;
            const isCancun =
              typeof this.isCancun === "function"
                ? this.isCancun()
                : this.isCancun;
            const dataIsCancun =
              typeof data.isCancun === "function"
                ? data.isCancun()
                : data.isCancun;
            const isLegacy =
              typeof this.isLegacy === "function"
                ? this.isLegacy()
                : this.isLegacy;
            const dataIsLegacy =
              typeof data.isLegacy === "function"
                ? data.isLegacy()
                : data.isLegacy;
            const isBerlin =
              typeof this.isBerlin === "function"
                ? this.isBerlin()
                : this.isBerlin;
            const dataIsBerlin =
              typeof data.isBerlin === "function"
                ? data.isBerlin()
                : data.isBerlin;
            const isLondon =
              typeof this.isLondon === "function"
                ? this.isLondon()
                : this.isLondon;
            const dataIsLondon =
              typeof data.isLondon === "function"
                ? data.isLondon()
                : data.isLondon;

            return (
              this.id === data.id &&
              this.amount === data.amount &&
              this.date?.getTime() === data.date.getTime() &&
              this.description === data.description &&
              this.nonce === data.nonce &&
              this.gasLimit === data.gasLimit &&
              this.gasPrice === data.gasPrice &&
              this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
              this.maxFeePerGas === data.maxFeePerGas &&
              this.data === data.data &&
              this.value === data.value &&
              this.chainId === data.chainId &&
              this.from === data.from &&
              this.fromPublicKey === data.fromPublicKey &&
              this.to === data.to &&
              this.type === data.type &&
              this.typeName === data.typeName &&
              this.serialized === data.serialized &&
              this.unsignedSerialized === data.unsignedSerialized &&
              this.accessList?.length === data.accessList?.length &&
              this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
              this.blobVersionedHashes === data.blobVersionedHashes &&
              (isSigned ?? false) === (dataIsSigned ?? false) &&
              (isCancun ?? false) === (dataIsCancun ?? false) &&
              (isLegacy ?? false) === (dataIsLegacy ?? false) &&
              (isBerlin ?? false) === (dataIsBerlin ?? false) &&
              (isLondon ?? false) === (dataIsLondon ?? false)
            );
          },
          recentActivity: [
            {
              action: "Logged in",
              timestamp: new Date(),
            },
            {
              action: "Updated profile",
              timestamp: new Date(),
            },
          ],
        }),
      ],
    },
    notificationsEnabled: true,
  },
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
};
export default SnapshotStore