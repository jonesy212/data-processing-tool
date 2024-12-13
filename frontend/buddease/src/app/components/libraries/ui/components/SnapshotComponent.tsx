import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { BaseData, Data } from '@/app/components/models/data/Data';
import { DataStoreMethods } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
    CustomSnapshotData,
    SnapshotConfig,
    SnapshotContainer,
    SnapshotData,
    SnapshotStoreConfig,
    SnapshotStoreProps,
} from "@/app/components/snapshots";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { isSnapshot } from "@/app/components/utils/snapshotUtils";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useEffect, useState } from "react";

type CreateSnapshotType<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = (
  additionalData: CustomSnapshotData
) => SnapshotContainer<T, K> | null | undefined;

interface SnapshotProps<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  snapshotConfig: SnapshotStoreConfig<T, K>;
  id: string | number | null;
  snapshotData: SnapshotData<T, K>;
  snapshotStoreData: SnapshotStore<T, K>;
  categoryProperties: CategoryProperties;
  category: string;
  callback: (snapshot: Snapshot<T, any> | null) => void;
  createSnapshot: CreateSnapshotType<T, K> | null | undefined;
  dataStore: DataStore<T, K>;
  dataStoreMethods: DataStoreMethods<T, K>;
  metadata: UnifiedMetaDataOptions;
  subscriberId: string;
  endpointCategory: string | number;
  storeProps: SnapshotStoreProps<T, K>;
  snapshotConfigData: SnapshotConfig<T, K>;
  snapshotStoreConfigData?: SnapshotStoreConfig<T, K>;
}

const SnapshotComponent = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotProps: SnapshotProps<T, K>
): JSX.Element => {
  const {
    snapshotConfig,
    id,
    snapshotData,
    category,
    categoryProperties,
    callback,
    createSnapshot,
    dataStore,
    dataStoreMethods,
    metadata,
    subscriberId,
    endpointCategory,
    storeProps,
    snapshotConfigData,
    snapshotStoreConfigData,
  } = snapshotProps;

  const [snapshots, setSnapshots] = useState<Snapshot<T, K>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { error, handleError, clearError } = useErrorHandling();

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        if (snapshotData === undefined) {
          throw new Error("Snapshot data is undefined");
        }

        const snapshotId =
          "id" in snapshotData && snapshotData.id
            ? String(snapshotData.id)
            : id !== null
            ? String(id)
            : null;

        // Invoke createSnapshot if it's defined, and pass the result to snapshotConfig.snapshot
        const snapshotContainer = createSnapshot ? createSnapshot({}) : null;
        if (snapshotContainer === null) {
          throw new Error("Snapshot container is null");
        }
        const newSnapshot = await snapshotConfig.snapshot(
          String(id), // id
          snapshotId, // snapshotId
          snapshotData, // snapshotData
          category, // category
          categoryProperties, // categoryProperties
          callback, // callback
          dataStore,
          dataStoreMethods, // dataStoreMethods (make sure this is defined)
          metadata, // metadata (make sure this is defined)
          subscriberId, // subscriberId (make sure this is defined)
          endpointCategory, // endpointCategory (make sure this is defined)
          storeProps, // storeProps (make sure this is defined)
          snapshotConfigData, // snapshotConfigData (make sure this is defined)
          snapshotStoreConfigData, // snapshotStoreConfigData (optional)
          snapshotContainer // snapshotContainer (optional)
        );

        const snapshotArray = Array.isArray(newSnapshot)
          ? newSnapshot
          : [newSnapshot.snapshotData];

        setSnapshots((prevSnapshots) => [...prevSnapshots, ...snapshotArray]);
      } catch (error: any) {
        const errorMessage = "Failed to fetch snapshot";
        handleError(errorMessage, { componentStack: error.stack });

        // Set a timer to clear the error after 5 seconds
        const timer = setTimeout(() => {
          clearError();
        }, 5000);

        return () => clearTimeout(timer);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshot();

    return () => {
      // Perform cleanup if necessary
    };
  }, [
    snapshotConfig,
    id,
    snapshotData,
    category,
    categoryProperties,
    callback,
    createSnapshot,
    dataStoreMethods,
    metadata,
    subscriberId,
    endpointCategory,
    storeProps,
    snapshotConfigData,
    snapshotStoreConfigData,
    handleError,
    clearError,
  ]);

  const handleCreateSnapshot = (context: string) => {
    const additionalData: CustomSnapshotData<Data<any>> = {
      timestamp: new Date(),
      value: "exampleData",
      orders: [],
    };

    const snapshotData = buildSnapshotData(context);

    const snapshot = createSnapshotInstance({
      id: snapshotData.id,
      data: snapshotData,
      timestamp: additionalData.timestamp,
      additionalData,
    });

    console.log("Created snapshot:", snapshot);
  };
  Fv;

  if (createSnapshot) {
    try {
      const newSnapshot = createSnapshot(additionalData);
      // Check if the newSnapshot is valid
      if (newSnapshot && isSnapshot(newSnapshot)) {
        setSnapshots((prevSnapshots) => {
          const newData = newSnapshot.snapshotData;

          // Create a new array of Snapshots to add
          let snapshotsToAdd: Snapshot<T, K>[] = [];

          // If newData is a Map, extract values and ensure they're of type Snapshot<T, K>
          if (newData instanceof Map) {
            snapshotsToAdd = Array.from(newData.values()).filter(isSnapshot);
          } else if (newData && isSnapshot(newData)) {
            snapshotsToAdd = [newData as Snapshot<T, K>];
          }

          // Return the updated array of Snapshots
          return [...prevSnapshots, ...snapshotsToAdd];
        });
      } else {
        throw new Error("Failed to create a new snapshot");
      }
    } catch (error: any) {
      handleError("An error occurred while creating a snapshot", {
        componentStack: error.stack,
      });

      // Set a timer to clear the error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      // Cleanup to avoid memory leaks
      return () => clearTimeout(timer);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Snapshot Component</h1>
      <button onClick={handleCreateSnapshot}>Create Snapshot</button>

      {snapshots.length > 0 ? (
        <div>
          <h3>Snapshot List</h3>
          {snapshots.map((snapshot, index) => (
            <div key={index}>
              <h4>Snapshot {index + 1}</h4>
              <p>Timestamp: {snapshot.timestamp?.toString() || "N/A"}</p>
              <pre>{JSON.stringify(snapshot.data, null, 2)}</pre>
            </div>
          ))}
        </div>
      ) : (
        <div>No snapshots available</div>
      )}
    </div>
  );
};

export default SnapshotComponent;
