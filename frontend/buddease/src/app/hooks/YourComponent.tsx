import { endpoints } from '@/api/endpointConfigurations';
import appTreeApiService from "@/app/api/appTreeApi";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import CalendarManagerStoreClass, { CalendarEvent } from '@/app/calendar/CalendarEvent';
import useDocumentManagement from '@/app/hooks/documents/useDocumentManagement';
import { BaseData, Data } from '@/app/models/data/Data';
import { K, T } from '@/app/models/data/dataStoreMethods';
import { StatusType } from "@/app/models/data/StatusType";
import { RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import { ApiConfig } from "@/app/services/ConfigurationService";
import { SnapshotStoreProps } from '@/app/snapshots';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { storeProps } from "@/app/snapshots/SnapshotStoreProps";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Snapshot } from '@/app/snapshots/Snapshot';


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
  description?: string
  updateSnapshot: (
    snapshotId: string,
    data: any,
    events: any,
    snapshotStore: any,
    dataItems: any,
    newData: any,
    updatedPayload: any
  ) => Promise<void>;
} 

const updateSnapshotMethod = (
  snapshotId: string,
  data: any,
  events: any,
  snapshotStore: any,
  dataItems: any,
  newData: any,
  updatedPayload: any
): Promise<void> => {
  // Implementation of the updateSnapshot logic
  return Promise.resolve();
};

const data = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(); // or whatever type fits

// Assuming CalendarManagerStoreClass has a constructor that takes a snapshot as input
const records = Array.from(data.values()).reduce<Record<string, CalendarManagerStoreClass<BaseData<any>, K>[]>>(
  (acc, snapshot) => {
    const id = snapshot.id; // Replace with a unique ID field
    if (!acc[id]) {
      acc[id] = [];
    }

    const documentManager = useDocumentManagement();

    const calendarManagerInstance = new CalendarManagerStoreClass(
      category,
      documentManager,
      storeProps,
      snapshot
    );

    acc[id].push(calendarManagerInstance);
    return acc;
  },
  {} // Initial value matches the reduce type
);


  

const {storeId, name, version, schema, options, category, config, operation, state, expirationDate, initialState } = storeProps
const snapshotId = storeProps.state?.[0]?.id 
  ? getSnapshotId(storeProps.state[0].id) 
  : null;

 

// Client-safe version - remove all server-side dependencies
const YourComponent = forwardRef<ComponentMethods, YourComponentProps>(
  ({ apiConfig, children }, ref) => {
    const [isActive, setIsActive] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    // Client-side only implementations
    const toggleActivation = () => setIsActive(!isActive);
    const resetIdleTimeout = () => console.log('Reset idle timeout');

    // Client-safe updateSnapshot - uses API calls instead of direct database access
    // Use your endpoint configuration for updateSnapshot
    const updateSnapshot = async (
      id: string,
      data: object,
      events: object,
      snapshotStore: object,
      dataItems: any[],
      newData: object,
      updatedPayload: object
    ): Promise<void> => {
      try {
        console.log('Updating snapshot via configured endpoint:', { id, data });
        
        // Use your existing endpoint configuration
        const endpoint = endpoints.snapshots.update(id);
        
        const response = await fetch(endpoint, {
          method: 'PUT', // or whatever method your endpoint uses
          headers: { 
            'Content-Type': 'application/json',
            // Add any additional headers from your apiConfig
            ...apiConfig.headers
          },
          body: JSON.stringify({
            id,
            data,
            events,
            snapshotStore,
            dataItems,
            newData,
            updatedPayload
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Snapshot updated successfully via endpoint:', result);
        
        // Handle response based on your endpoint configuration
        if (result.success) {
          // Success logic
          console.log('Update completed successfully');
        } else {
          throw new Error(result.error || 'Update failed');
        }
        
      } catch (error) {
        console.error('Failed to update snapshot:', error);
        
        // You can add retry logic based on your apiConfig
        if (apiConfig.retry?.enabled) {
          console.log('Retrying update...');
          // Implement retry logic here if needed
        }
        
        throw error;
      }
    };

    // Alternative: If you need different HTTP methods based on your endpoints
    const updateSnapshotWithMethodDetection = async (
      id: string,
      data: object,
      events: object,
      snapshotStore: object,
      dataItems: any[],
      newData: object,
      updatedPayload: object
    ): Promise<void> => {
      try {
        // Determine the method based on your endpoint configuration
        const endpointConfig = endpoints.snapshots.update(id);
        const method = endpointConfig.includes('update') ? 'PUT' : 
                      endpointConfig.includes('add') ? 'POST' : 'PATCH';
        
        const response = await fetch(endpointConfig, {
          method: method,
          headers: { 
            'Content-Type': 'application/json',
            ...apiConfig.headers
          },
          body: JSON.stringify({
            snapshotId: id,
            snapshotData: data,
            events,
            snapshotStore,
            dataItems,
            newData,
            updatedPayload,
            timestamp: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle different response formats based on your API
        if (result.data || result.success) {
          console.log('Snapshot update successful:', result);
        } else {
          throw new Error('Invalid response format');
        }
        
      } catch (error) {
        console.error('Snapshot update failed:', error);
        
        // Implement retry logic from your apiConfig
        if (apiConfig.retry?.enabled && apiConfig.retry.maxRetries > 0) {
          return await retryUpdateSnapshot(
            id, data, events, snapshotStore, dataItems, newData, updatedPayload,
            apiConfig.retry.maxRetries,
            apiConfig.retry.retryDelay
          );
        }
        
        throw error;
      }
    };

    // Retry logic helper function
    const retryUpdateSnapshot = async (
      id: string,
      data: object,
      events: object,
      snapshotStore: object,
      dataItems: any[],
      newData: object,
      updatedPayload: object,
      maxRetries: number,
      retryDelay: number
    ): Promise<void> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Retry attempt ${attempt} of ${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          
          const endpoint = endpoints.snapshots.update(id);
          const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id, data, events, snapshotStore, dataItems, newData, updatedPayload
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`Update succeeded on attempt ${attempt}`);
            return;
          }
        } catch (retryError) {
          console.log(`Attempt ${attempt} failed:`, retryError);
          if (attempt === maxRetries) {
            throw retryError;
          }
        }
      }
    };

    useImperativeHandle(ref, () => ({
      updateSnapshot: updateSnapshotWithMethodDetection // Use the enhanced version
    }));

    // Client-side only effects
    useEffect(() => {
      // Client-safe initialization
      console.log('Component mounted with config:', apiConfig);
    }, [apiConfig]);

    const handleAppendData = async (): Promise<void> => {
      try {
        const response = await fetch('/api/calendar/appendData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: {
              id: "uniqueId",
              title: "New Event",
              date: new Date().toISOString(),
              // ... other event data
            }
          })
        });
        
        if (!response.ok) throw new Error('Failed to append data');
        console.log('Data appended successfully');
      } catch (error) {
        console.error('Error appending data:', error);
      }
    };

    const handleNextPage = () => {
      setCurrentPage(prev => prev + 1);
    };

    return (
      <div>
        {/* Client-safe UI components */}
        <div style={{ padding: '20px' }}>
          <h2>Client-Safe YourComponent</h2>
          
          {/* Status indicators */}
          <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
          <p>Current Page: {currentPage}</p>
          
          {/* Control buttons */}
          <button onClick={toggleActivation}>
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          
          <button onClick={resetIdleTimeout}>
            Reset Idle Timeout
          </button>
          
          <button onClick={handleAppendData}>
            Append Data (API)
          </button>
          
          <button onClick={handleNextPage}>
            Next Page
          </button>

          {/* Progress bar placeholder */}
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            margin: '10px 0'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              backgroundColor: '#007acc',
              borderRadius: '10px'
            }}></div>
          </div>

          {/* Children content */}
          {children}
        </div>
      </div>
    );
  }
);

YourComponent.displayName = 'YourComponent';

export default YourComponent;

// Example:
const { callback, payload, endpointCategory } = storeProps as SnapshotStoreProps<T, K>
const events: Record<string, CalendarEvent<T, K>[]> = {};
const storeData = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({ storeId, name, initialState, version, schema, options, category, config, operation, expirationDate, payload, callback, storeProps, endpointCategory, storeId });


const snapshotStore = new SnapshotStore<BaseData, K>({ storeId, name, version, schema, options, category, config, operation, expirationDate, payload, callback, storeProps, endpointCategory});
const dataItems: RealtimeDataItem[] = [];
const newData: Data<BaseData<any>> = {
  timestamp: undefined
};


const baseURL = "https://example.com";
const enabled = true;
const maxRetries = 3;
const retryDelay = 1000;
const maxAge = 1000;
const staleWhileRevalidate = 1000;
const cacheKey = await appTreeApiService.cacheKey
const updatedPayload: UpdateSnapshotPayload<Data<BaseData<any>>> = {
  ...payload,
  snapshotId: snapshotId, // Assign snapshotId here
  newData: newData,
  title: "",
  description: "",
  createdAt: undefined,
  updatedAt: undefined,
  status: StatusType.Active,
  category: ""
};


export type UpdateSnapshotFn = (
  snapshotId: string,
  data: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  events: any,
  snapshotStore: any,
  dataItems: any[],
  newData: any,
  updatedPayload: any
) => Promise<void>;

// Example component update call
const component = forwardRef((props: YourComponentProps, ref) => {
  const updateSnapshot: UpdateSnapshotFn = (
    snapshotId,
    data,
    events,
    snapshotStore,
    dataItems,
    newData,
    updatedPayload,
  ) => {
    // your snapshot update logic here
    console.log("Updating snapshot...");
    return Promise.resolve();
  };

  useImperativeHandle(ref, () => ({
    updateSnapshot,
  }));

  return <div>{props.children}</div>;
});