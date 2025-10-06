import useErrorHandling from "@/app/hooks/useErrorHandling";
import { BaseData, Data } from '@/app/models/data/Data';
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
  CustomSnapshotData,
  Snapshot,
  SnapshotConfig,
  SnapshotContainer,
  SnapshotData,
  SnapshotStoreConfig,
  SnapshotStoreProps,
} from "@/app/snapshots";
import {
  Snapshot
} from "@/app/snapshots/Snapshot";
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { isSnapshot } from "@/app/utils/snapshotUtils";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useEffect, useState } from "react";

type CreateSnapshotType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = (
  additionalData: CustomSnapshotData
) => SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;

interface SnapshotProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  id: string | number | null;
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStoreData: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  categoryProperties: CategoryProperties;
  category: string;
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void;
  createSnapshot: CreateSnapshotType<T, K> | null | undefined;
  dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  metadata: UnifiedMetadata;
  subscriberId: string;
  endpointCategory: string | number;
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

const SnapshotComponent = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
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

  const [snapshots, setSnapshots] = useState<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);
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
          let snapshotsToAdd: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

          // If newData is a Map, extract values and ensure they're of type Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          if (newData instanceof Map) {
            snapshotsToAdd = Array.from(newData.values()).filter(isSnapshot);
          } else if (newData && isSnapshot(newData)) {
            snapshotsToAdd = [newData as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>];
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
