import { Data } from "../components/models/data/Data";
import { SnapshotStoreConfig } from "../components/snapshots";

export function getConfigPromise<T extends Data, K extends Data>(): Promise<SnapshotStoreConfig<T, K>[]> {
  return new Promise((resolve, reject) => {
      try {
          // Simulate asynchronous data retrieval, e.g., from a database or API
          const simulatedData: SnapshotStoreConfig<T, K>[] = [
              {
                initialState: "",
                 id: "",
                  data: "",
                  timestamp: "", 
          category: 'Category1',
          clearSnapshotSuccess: (context) => {
            console.log('Cleared snapshot for Category1');
          },
        },


        {
          category: 'Category2',
          clearSnapshotSuccess: (context) => {
            console.log('Cleared snapshot for Category2');
          },
        },
        // Add more configurations as needed...
      ];

      // Resolve the promise with the simulated data
      resolve(simulatedData);
    } catch (error) {
      // Reject the promise in case of an error
      reject(error);
    }
  });
}