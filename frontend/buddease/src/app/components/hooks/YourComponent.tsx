import DataFrameAPI from "@/app/api/DataframeApi";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import { DataAnalysisAction } from "@/app/typings/dataAnalysisTypes";
import React, { useEffect, useState } from "react";
import { useCalendarContext } from "../calendar/CalendarContext";
import DynamicContent from "../documents/DynamicContent";
import LoadingSpinner from "../models/tracker/LoadingSpinner";
import ProgressBar from "../models/tracker/ProgresBar";
import { Tracker } from "../models/tracker/Tracker";
import useNotificationManagerService, { NotificationManagerServiceProps } from "../notifications/NotificationService";
import { PromptPageProps } from "../prompts/PromptPage";
import { rootStores } from "../state/stores/RootStores";
import useTrackerStore from "../state/stores/TrackerStore";
import NotificationManager from "../support/NotificationManager";
import useIdleTimeout from "./commHooks/useIdleTimeout";
import useRealtimeData from "./commHooks/useRealtimeData";
import generateDynamicDummyHook from "./generateDynamicDummyHook";
import { initialState } from "../state/redux/slices/RootSlice";
import { NotificationTypeEnum, useNotification } from "../support/NotificationContext";
import Logger from "@/app/pages/logging/Logger";


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
  const { realtimeData, fetchData } = useRealtimeData(initialState, updateCallback);
  const { isActive, toggleActivation, resetIdleTimeout } = useIdleTimeout(); // Destructure the idle timeout properties
  const dataFrameAPI = DataFrameAPI; // Initialize the dataframe API class
  const { calendarData, updateCalendarData } = useCalendarContext();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [promptPages, setPromptPages] = useState<PromptPageProps[]>([]);
  const notificationManagerProps: NotificationManagerServiceProps = useNotificationManagerService();
  

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
      const newData = (await dataFrameAPI.fetchDataFrame()).filter((row) =>
        row.id === nextPageData.id
      )
      dataFrameAPI.setDataFrame(newData);
    } else {
      // Optionally, handle the case where there are no more pages
      console.log("No more pages available");
    }
  };

  
  
  const handleAppendData = async (): Promise<void> => {
    
    
    // const userId = await userService.fetchUser(calendarData[0].userId);
    const newData = [{ column1: 'value1', column2: 'value2' }];
    // Append data to the backend and trigger a manual update
    await dataFrameAPI.appendDataToBackend(newData);
    fetchData("", {} as (action: DataAnalysisAction) => {
      // trigger update after append
       updateCalendarData(newData)
    });
  }
  // Render UI components to display appended data
  return (
    <div>
      {/* Display the progress bar and loading spinner */}
      <ProgressBar progress={calendarData[0].projects[0].progress} />
      {/* Display the notification manager */}

      <NotificationManager
          notifications={[]}
          setNotifications={() => { }}
          notify={() => {
            // Implement logic to handle notification
            console.log("Notification triggered");
            return Promise.resolve();
          }}
          onConfirm={(message) => console.log(message)}
          onCancel={() => { }}
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
      <button onClick={resetIdleTimeout}>Reset Idle Timeout</button>

      {/* Example usage of removeTracker */}
      <button onClick={() => removeTracker(tracker.id as unknown as Tracker)}>Remove Tracker</button>

      <DynamicContent fontSize="16px" fontFamily="Arial, sans-serif" content={<p>Hello, Dynamic Content!</p>} />

      {children}
      <button onClick={handleAppendData}>Append Data</button>
      <button onSubmit={handleNextPage}>Next</button>


  
    </div>
  );
};

export default YourComponent;
