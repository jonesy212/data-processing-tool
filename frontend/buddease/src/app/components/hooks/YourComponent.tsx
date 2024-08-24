import * as snapshotApi from '@/app/api/SnapshotApi'
import DataFrameAPI from "@/app/api/DataframeApi";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import React, { useEffect, useState } from "react";
import {
  SimpleCalendarEvent,
  useCalendarContext,
} from "../calendar/CalendarContext";
import DynamicContent from "../documents/DynamicContent";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import LoadingSpinner from "../models/tracker/LoadingSpinner";
import ProgressBar, { ProgressPhase } from "../models/tracker/ProgressBar";
import { Tracker } from "../models/tracker/Tracker";
import { NotificationManagerServiceProps } from "../notifications/NotificationService";
import useNotificationManagerServiceProps from "../notifications/useNotificationManagerServiceProps";
import { PromptPageProps } from "../prompts/PromptPage";
import CalendarEvent, { updateCallback } from "../state/stores/CalendarEvent";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { rootStores } from "../state/stores/RootStores";
import useTrackerStore from "../state/stores/TrackerStore";
import NotificationManager from "../support/NotificationManager";
import { useSecureUserId } from "../utils/useSecureUserId";
import useRealtimeData from "./commHooks/useRealtimeData";
import generateDynamicDummyHook from "./generateDynamicDummyHook";
import useIdleTimeout from "./idleTimeoutHooks";
import { T, K, UpdateSnapshotPayload, snapshot } from "../snapshots";
import SnapshotStore from "../snapshots/SnapshotStore";
import appTreeApiService from "@/app/api/appTreeApi";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import ExampleComponent from '../models/tracker/ExampleComponent';
import { headersConfig } from '../shared/SharedHeaders';
import { StatusType } from '../models/data/StatusType';
import SnapshotStoreOptions from './SnapshotStoreOptions';


interface HooksObject {
  [key: string]: React.FC<{}>;
}

const categoryHooks: { [category: string]: string[] } = {
  Authentication: [
    "useAuthentication",
    "useTwoFactorAuthentication",
    "useSocialAuthentication",
  ],
  UserInterface: [
    "useModal",
    "Sorting",
    "useSorting",
    "usePagination",
    "useLoadingSpinner",
    "useErrorHandling",
    "useToastNotifications",
    "useDatePicker",
    "useThemeSwitching",
    "useNotificationBar",
    "useDarkModeToggle",
    "useResizablePanels",
  ],
  DataManagement: [
    "useJobSearch",
    "useRecruiterDashboard",
    "useJobApplications",
    "useMessagingSystem",
    "useDataAnalysisTools",
    "useTaskManagement",
    "useUserFeedback",
    "useNotificationSystem",
    "useFileUpload",
    "useSearch",
    "useUserSupport",
    "useCompanyProfile",
    "useRecruitmentAnalytics",
    "useTaskHistory",
    "useDocumentPreview",
    "useUserPermissions",
    "useRateLimiting",
    "useDataPreview",
    "useForm",
    "useClipboard",
    "useLocalStorage",
    "useBatchProcessing",
    "useDataExport",
    "useRealtimeData",
  ],
  WebFeatures: [
    "useDeviceDetection",
    "useNotificationSound",
    "useImageUploading",
    "usePasswordStrength",
    "useBrowserHistory",
    "useGeolocation",
    "useWebSockets",
    "useDragAndDrop",
    "useIdleTimeout",
    "useVoiceRecognition",
    "useCameraAccess",
    "useWebNotifications",
  ],
};

export interface YourComponentProps {
  children: React.ReactNode;
  apiConfig: ApiConfig;
}

const YourComponent: React.FC<YourComponentProps> = ({
  apiConfig,
  children,
}) => {
  const initialRealtimeData: RealtimeDataItem[] = []; // Provide an appropriate initial value

  const { realtimeData, fetchData } = useRealtimeData(
    initialRealtimeData, // Pass the realtimeData array from initialState
    updateCallback
  );
  const { isActive, toggleActivation, resetIdleTimeout } =
    useIdleTimeout(undefined); // Destructure the idle timeout properties
  const dataFrameAPI = DataFrameAPI; // Initialize the dataframe API class
  const { calendarData, updateCalendarData } = useCalendarContext();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [promptPages, setPromptPages] = useState<PromptPageProps[]>([]);
  const notificationManagerProps: NotificationManagerServiceProps =
    useNotificationManagerServiceProps();

  const hooks: HooksObject = Object.keys(categoryHooks).reduce(
    (acc, category) => {
      categoryHooks[category].forEach((hookName: string) => {
        const dummyHook = generateDynamicDummyHook(hookName);
        const HookComponent = dummyHook.hook as unknown as React.FC<{}>;
        acc[hookName] = HookComponent;
      });

      return acc;
    },
    {} as HooksObject
  );

  // Simulated tracker setup
  const tracker = {
    id: "1",
    name: "Your Tracker",
    phases: [], // You may initialize with actual phases
    progress: 50, // Simulated progress value
    loading: false, // Simulated loading state
  };

  const { addTracker, removeTracker, getTrackers } =
    useTrackerStore(rootStores); // Import and use the tracker store

  useEffect(() => {
    // Simulate fetching trackers from an API
    const fetchData = async () => {
      await dataFrameAPI.fetchDataFromBackend();
      const data = getTrackers();
      data.forEach((tracker: any) => addTracker(tracker));
    };

    fetchData();
  }, [dataFrameAPI, addTracker, getTrackers]);



  const updateSnapshot = async (
    snapshotId: string,
    data: Data,
    events: Record<string, CalendarEvent<T, K>[]>,
    snapshotStore: SnapshotStore<BaseData, K>,
    dataItems: RealtimeDataItem[],
    newData: Data,
    payload: UpdateSnapshotPayload<Data>
  ) => {
    try {
      // Implement the logic to update the snapshot
      console.log("Updating snapshot with payload:", payload);
      // Call your API or logic here
    } catch (error) {
      console.error("Error during snapshot update:", error);
    }
  };


  // Example usage of updateSnapshot
  const handleUpdateSnapshot = async () => {
    const snapshotId = getSnapshotId(snapshot.id);
    const baseURL = "https://example.com";
    const enabled = true;
    const maxRetries = 3;
    const retryDelay = 1000;
    const maxAge = 1000;
    const staleWhileRevalidate = 1000;
    const cacheKey = await appTreeApiService.cacheKey;
    const newData: Data = { timestamp: undefined };
    const payload: UpdateSnapshotPayload<Data> = {
      snapshotId: snapshotId,
      newData: newData,
      title: "",
      description: "",
      createdAt: undefined,
      updatedAt: undefined,
      status: StatusType.Active,
      category: ""
    };

    
    const storeId = snapshotApi.getSnapshotStoreId(Number(snapshotId));
    const events: Record<string, CalendarEvent<T, K>[]> = {};
    const options = snapshotApi.getOptions
    const category = 
    const snapshotStore = new SnapshotStore<BaseData, K>(await storeId, options, category, config, operation);
    const dataItems: RealtimeDataItem[] = [];


    await updateSnapshot(
      String(snapshotId),
      data,
      events,
      snapshotStore,
      dataItems,
      newData,
      payload
    );
  };
  const handleNextPage = async () => {
    // Increment the page number
    const nextPage = currentPage + 1;

    // Check if there is a next page
    if (nextPage < promptPages.length) {
      // Set the next page
      setCurrentPage(nextPage);

      // Fetch data for the next page
      const nextPageData = promptPages[nextPage];
      // Example: Assuming the data for the next page has an 'id' property
      const newData = (await dataFrameAPI.fetchDataFrame()).filter(
        (row) => row.id === nextPageData.id
      );
      dataFrameAPI.setDataFrame(newData);
    } else {
      // Optionally, handle the case where there are no more pages
      console.log("No more pages available");
    }
  };

  const handleAppendData = async (): Promise<void> => {
    const newData: SimpleCalendarEvent[] = [
      {
        id: "uniqueId", // Assign a unique ID
        title: "New Event", // Set the title
        date: new Date(), // Set the date
        isActive: true, // Set isActive flag
        reminder: <div>Reminder</div>, // Define the reminder
        category: "Category", // Set the category
        description: "Description", // Set the description
        startDate: new Date(), // Set the start date
        endDate: new Date(), // Set the end date
        shared: <div>Shared</div>, // Define the shared content
        details: {} as DetailsItem, // Define the details item
        bulkEdit: false, // Set bulkEdit flag
        recurring: false, // Set recurring flag
        customEventNotifications: "Custom notifications", // Define custom notifications
        comment: "Comment", // Define the comment
        attachment: "Attachment", // Define the attachment
        // Add more properties as needed
      },
    ];

    const userId = useSecureUserId()?.toString()!
      // Append data to the backend and trigger a manual update
      await dataFrameAPI.appendDataToBackend(newData);
      fetchData(userId, (action: any) => {
        updateCalendarData((prevState: SimpleCalendarEvent[]) => [
          ...prevState,
          ...action,
        ]);
      });
    };



  // Use notificationManagerProps to show notifications or any other logic
  useEffect(() => {
    const notifyFunction = () =>
      notificationManagerProps.notify( "New Event Added");
    notifyFunction();

    return () => {
      notificationManagerProps.clearNotifications();
    };
  }, [notificationManagerProps]);

  // Render UI components to display appended data
  return (
    <div>
      {/* Display the progress bar and loading spinner */}
      <ProgressBar
        duration={0.5}
        phase={{
          type: "determinate",
          duration: 0,
          value: tracker.progress,
        }}
        animationID={"animationID"}
        uniqueID={"uniqueID"}
        progress={calendarData[0]?.projects?.[0]?.progress}
        phaseType={ProgressPhase.Ideation}
      />

      {/* Display the notification manager */}

      <NotificationManager
        notifications={[]}
        setNotifications={() => {}}
        notify={() => {
          // Implement logic to handle notification
          console.log("Notification triggered");
          return Promise.resolve();
        }}
        onConfirm={(message) => console.log(message)}
        onCancel={() => {}}
      />

      <LoadingSpinner loading={tracker.loading} />

      {Object.keys(hooks).map((key) => {
        const HookComponent = hooks[key];
        return (
          <React.Fragment key={key}>
            <HookComponent />
            {/* Use the realtimeData in your component, for example: */}
            <p>{realtimeData.length}</p>
            {/* Example usage of useIdleTimeout properties */}
            <p>{isActive ? "Active" : "Inactive"}</p>
          </React.Fragment>
        );
      })}

      {/* Use the tracker information in your component */}
      <h2>{tracker.name}</h2>
      <p>Phases: {tracker.phases.length}</p>
      {/* Example usage of useRealtimeData */}
      <p>{realtimeData.length}</p>
      {/* Example usage of useIdleTimeout properties */}
      <p>{isActive ? "Active" : "Inactive"}</p>

      {/* Example usage of apiConfig */}
      <p>{apiConfig.baseUrl}</p>

      {/* Example usage of toggleActivation */}
      <button onClick={toggleActivation}>
        {isActive ? "Deactivate" : "Activate"}
      </button>

      {/* Example usage of resetIdleTimeout */}
      <button onClick={() => resetIdleTimeout()}>Reset Idle Timeout</button>

      {/* Example usage of removeTracker */}
      <button onClick={() => removeTracker(tracker.id as unknown as Tracker)}>
        Remove Tracker
      </button>

      <DynamicContent
        fontSize="16px"
        fontFamily="Arial, sans-serif"
        content={<p>Hello, Dynamic Content!</p>}
      />

      {children}

      {/* Example buttons to demonstrate notifications */}
      <button
        onClick={() =>
          notificationManagerProps.notify("New Event Added")
        }
      >
        Show Info Notification
      </button>
      <button onClick={notificationManagerProps.clearNotifications}>
        Clear Notifications
      </button>
      
      <button onClick={handleAppendData}>Append Data</button>
      <button onClick={handleNextPage}>Next</button>
    </div>
  );
};

export default YourComponent;



// Example:

const snapshotId = getSnapshotId(snapshot.id)
const storeId = snapshotApi.getSnapshotStoreId(Number(snapshotId));
const events: Record<string, CalendarEvent<T, K>[]> = {};
const data = new SnapshotStore<T, K>(await storeId, options, config, operation);
const snapshotStore = new SnapshotStore<BaseData, K>(storeId, snapshotStoreOptions, config, operation);
const dataItems: RealtimeDataItem[] = [];
const newData: Data = {
  timestamp: undefined
};


const baseURL = "https://example.com";
const enabled = true;
const maxRetries = 3;
const retryDelay = 1000;
const maxAge = 1000;
const staleWhileRevalidate = 1000;
const cacheKey = await appTreeApiService.cacheKey
const payload: UpdateSnapshotPayload<Data> = {
  snapshotId: snapshotId, // Assign snapshotId here
  newData: newData,
  title: "",
  description: "",
  createdAt: undefined,
  updatedAt: undefined,
  status: "active",
  category: ""
};

// Example component update call
const component = <YourComponent
  apiConfig={{
    name: "exampleName",
    baseURL: baseURL,
    timeout: 1000,
    headers: headersConfig,
    retry: {
      enabled: enabled,
      maxRetries: maxRetries,
      retryDelay: retryDelay
    },
    cache: {
      enabled: enabled,
      maxAge: maxAge,
      staleWhileRevalidate: staleWhileRevalidate,
      cacheKey: cacheKey
    },
    responseType: "json",
    withCredentials: false
  }}
  children={[]}
/>;

component
  .updateSnapshot(
    snapshotId,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    payload
  )
  .then(() => {
    console.log("Snapshot update completed.");
  })
  .catch((error: any) => {
    console.error("Error during snapshot update:", error);
  });

