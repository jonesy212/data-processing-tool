import { Snapshot } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import axios from "axios";
import { BaseData, Data } from "../components/models/data/Data";
import { AnalysisTypeEnum } from "../components/projects/DataAnalysisPhase/AnalysisType";
import SnapshotStore from "../components/snapshots/SnapshotStore";
import { VideoData } from "../components/video/Video";
import axiosInstance from '../api/axiosInstance';
import { CategoryProperties } from '../pages/personas/ScenarioBuilder';

// Define the API endpoint for retrieving snapshot data
const SNAPSHOT_DATA_API_URL = "https://example.com/api/snapshot";

// Define the type for the response data
interface SnapshotDataResponse {
 id: number;
  timestamp: Date;
  videoData: VideoData;
  category: string
  // Other properties...
}

// Define the Snapshot interface including the responseData property
interface RetrievedSnapshot<T> extends Snapshot<Data> {
  id: string;
  timestamp: string | Date;
  category: string | CategoryProperties
  data: Map<string, Data> | null | undefined;
}



// Define a function to convert RetrievedSnapshot<SnapshotDataResponse> to SnapshotStore<Snapshot<Data>>

// Define a function to convert RetrievedSnapshot<SnapshotDataResponse> to SnapshotStore<Snapshot<Data>>
const convertToSnapshotStore = (
  retrievedSnapshot: RetrievedSnapshot<SnapshotDataResponse>
): SnapshotStore<T,K> => {
  const snapshotStore: SnapshotStore<T,K> = {
    key: retrievedSnapshot.id,
    state: {
      data: retrievedSnapshot.data ? new Map<string, Data>([[retrievedSnapshot.id, retrievedSnapshot.data]]) : new Map<string, Data>(),
      timestamp: retrievedSnapshot.timestamp,
      category: retrievedSnapshot.category,
    },
    id: '',
    topic: '',
    date: undefined,
    configOption: null,
    config: null,
    title: '',
    subscription: null,
    type: '',
    subscribers: [],
    set: undefined,
    snapshots: [],
    subscribeToSnapshots: (snapshotId, callback) => {
      // Implement subscription logic
    },
    subscribeToSnapshot: (snapshotId, callback, snapshot) => {
      // Implement subscription to a specific snapshot logic
    },
  };

  return snapshotStore;
};



// Define a function to convert SnapshotStore<Snapshot<Data>> to RetrievedSnapshot<SnapshotDataResponse>


// Define a function to convert SnapshotStore<Snapshot<Data>> to RetrievedSnapshot<SnapshotDataResponse>
const convertToRetrievedSnapshot = (
  snapshotStore: SnapshotStore<T, K>
): RetrievedSnapshot<SnapshotDataResponse> => {
  // Perform the conversion here
  const retrievedSnapshot: RetrievedSnapshot<SnapshotDataResponse> = {
    id: snapshotStore.key,
    category: snapshotStore.state?.category ?? '', // Default value if state or category is null
    timestamp: snapshotStore.state?.timestamp ?? new Date(),
    data: snapshotStore.state?.data ?? null, // Default empty object or handle appropriately
    // Additional properties from SnapshotDataResponse
  };

  return retrievedSnapshot;
};


export const RetrievedSnapshotData = (): Promise<RetrievedSnapshot<SnapshotDataResponse> | null> => {
  return new Promise<RetrievedSnapshot<SnapshotDataResponse> | null>(async (resolve, reject) => {
    try {
      // Fetch snapshot data from the API endpoint
      const response = await axiosInstance.get<SnapshotDataResponse>(SNAPSHOT_DATA_API_URL);

      // Validate the response data
      if (!isValidSnapshotDataResponse(response.data)) {
        throw new Error('Invalid snapshot data response');
      }

      // Create data map or handle appropriately
      const dataMap = new Map<string, Data>();

      // Add your data to the map
      dataMap.set(response.data.id.toString(), {
        ...response.data,
        _id: '', // Adjust based on your structure
        analysisResults: [],
        analysisType: AnalysisTypeEnum.DESCRIPTIVE,
        timestamp: response.data.timestamp,
      });

      // Construct the retrieved snapshot object
      const snapshotData: RetrievedSnapshot<SnapshotDataResponse> = {
        id: response.data.id.toString(),
        timestamp: new Date(response.data.timestamp),
        category: response.data.category,
        data: dataMap,
      };

      resolve(snapshotData);
    } catch (error) {
      console.error('Error retrieving snapshot data:', error);
      reject(error);
    }
  });
};

// Helper function to validate the snapshot data response
function isValidSnapshotDataResponse(data: any): data is SnapshotDataResponse {
  // Add your validation logic here
  // For example, check if the required properties exist and have the correct types
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'number' &&
    typeof data.category === 'string' &&
    typeof data.timestamp === 'string'
  );
}



export default RetrievedSnapshotData;
const retrieveData = async () => {
  const snapshot = await RetrievedSnapshotData();
  return snapshot;
};


export const retrieveSnapshotData = (id: string): Promise<RetrievedSnapshot<SnapshotDataResponse> | null> => {
  return new Promise<RetrievedSnapshot<SnapshotDataResponse> | null>(async (resolve, reject) => {
    try {
      const response = await axiosInstance.get<SnapshotDataResponse>(`${SNAPSHOT_DATA_API_URL}/${id}`);

      const snapshotData: RetrievedSnapshot<SnapshotDataResponse> = {
        id: response.data.id.toString(),
        timestamp: new Date(response.data.timestamp),
        category: response.data.category,
        data: null, // Adjust this as per your data structure
      };

      resolve(snapshotData);
    } catch (error) {
      console.error("Error retrieving snapshot data by id:", error);
      reject(error);
    }
  });
};
