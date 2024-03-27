import axios from "axios";
import { Data } from "../components/models/data/Data";
import SnapshotStore, { Snapshot } from "../components/snapshots/SnapshotStore";
import { VideoData } from "../components/video/Video";

// Define the API endpoint for retrieving snapshot data
const SNAPSHOT_DATA_API_URL = "https://example.com/api/snapshot";

// Define the type for the response data
interface SnapshotDataResponse {
 id: number;
  timestamp: string;
  videoData: VideoData;
  // Other properties...
}

// Define the Snapshot interface including the responseData property
interface RetrievedSnapshot<T> extends Snapshot<Data> {
  id: string;
  timestamp: Date;
}



// Define a function to convert RetrievedSnapshot<SnapshotDataResponse> to SnapshotStore<Snapshot<Data>>
const convertToSnapshotStore = (
  retrievedSnapshot: RetrievedSnapshot<SnapshotDataResponse>
): SnapshotStore<Snapshot<Data>> => {
  // Perform the conversion here
  const snapshotStore: SnapshotStore<Snapshot<Data>> = {
    key: "example_key",
    state: {} as SnapshotStore<Snapshot<Data>>,
    snapshotData: () => ({ snapshot: [] }),
    createSnapshot: () => {}, // Implement as needed
    ...retrievedSnapshot, // Copy properties from retrievedSnapshot
    // Additional properties and methods
  };
  return snapshotStore;
};

// Define a function to convert SnapshotStore<Snapshot<Data>> to RetrievedSnapshot<SnapshotDataResponse>
const convertToRetrievedSnapshot = (
  snapshotStore: SnapshotStore<Snapshot<Data>>
): RetrievedSnapshot<SnapshotDataResponse> => {
  // Perform the conversion here
  const retrievedSnapshot: RetrievedSnapshot<SnapshotDataResponse> = {
    id: snapshotStore.key,
    timestamp: snapshotStore.state.timestamp ?? new Date(),
    data: snapshotStore.state.data,
    // Additional properties from SnapshotDataResponse
  };
  return retrievedSnapshot;
};

// Define the function to retrieve Retrievedsnapshot data
export const RetrievedSnapshotData =
  async (): Promise<RetrievedSnapshot<SnapshotDataResponse> | null> => {
    try {
      // Fetch snapshot data from the API endpoint
      const response = await axios.get<SnapshotDataResponse>(
        SNAPSHOT_DATA_API_URL
      );

      // Extract the snapshot data from the response
      const snapshotData: RetrievedSnapshot<SnapshotDataResponse> = {
        id: response.data.id.toString(),
        timestamp: new Date(response.data.timestamp),
        data: {
          ...response.data,
          _id: "",
          analysisResults: [],
          analysisType: AnalysisTypeEnum.DESCRIPTIVE,
           timestamp: response.data.timestamp,
        },
      };

      return snapshotData;
    } catch (error) {
      console.error("Error retrieving snapshot data:", error);
      return null; // Return null if an error occurs
    }
  };

export default RetrievedSnapshotData;
const retrieveData = async () => {
  const snapshot = await RetrievedSnapshotData();
  return snapshot;
};

export const retrieveSnapshotData = async (id: string) => {
  try {
    const response = await axios.get<SnapshotDataResponse>(
      `${SNAPSHOT_DATA_API_URL}/${id}`
    );
    // Extract the snapshot data from the response
    const snapshotData: RetrievedSnapshot<SnapshotDataResponse> = {
      id: response.data.id.toString(),
      timestamp: new Date(response.data.timestamp), 
      data:  {} as RetrievedSnapshot<SnapshotDataResponse>["data"],
    };
    return snapshotData;
  } catch (error) {
    console.error("Error retrieving snapshot data by id:", error);
    return null;
  }
};
