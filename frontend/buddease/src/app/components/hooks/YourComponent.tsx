import { ApiConfig } from "@/app/configs/ConfigurationService";
import React, { useEffect } from "react";
import LoadingSpinner from "../models/tracker/LoadingSpinner";
import ProgressBar from "../models/tracker/ProgresBar";
import { Tracker } from "../models/tracker/Tracker";
import { rootStores } from "../state/stores/RootStores";
import useTrackerStore from "../state/stores/TrackerStore";
import useIdleTimeout from "./commHooks/useIdleTimeout";
import useRealtimeData from "./commHooks/useRealtimeData";
import generateDynamicDummyHook from "./generateDynamicDummyHook";



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
  const realtimeData = useRealtimeData([]); // Initialize with an empty array or appropriate initial value
  const { isActive, toggleActivation, resetIdleTimeout } = useIdleTimeout(); // Destructure the idle timeout properties

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
      const data = getTrackers();
      data.forEach((tracker: any) => addTracker(tracker));
    };

    fetchData();
  }, [addTracker, getTrackers]);


  
  return (
    <div>
      {/* Display the progress bar and loading spinner */}
      <ProgressBar progress={tracker.progress} />
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

      {children}
    </div>
  );
};

export default YourComponent;
