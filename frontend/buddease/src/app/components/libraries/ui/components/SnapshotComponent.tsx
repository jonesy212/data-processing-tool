import React, { useEffect, useState } from "react";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { BaseData, Data } from "@/app/components/models/data/Data";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { SnapshotStoreConfig, SnapshotWithCriteria } from "@/app/components/snapshots";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";

// Define props interface
type CreateSnapshotType = (additionalData: any) => Snapshot<any, BaseData> | SnapshotWithCriteria<any, BaseData> | null | undefined;

interface SnapshotProps {
  snapshotConfig: SnapshotStoreConfig<Snapshot<any, BaseData> | SnapshotWithCriteria<any, BaseData>, Data>;
  id: string | number | null;
  snapshotData: Snapshot<SnapshotWithCriteria<BaseData, any>, Data>;
  snapshotStoreData: SnapshotStore<BaseData, Data>;
  categoryProperties: CategoryProperties;
  category: string;
  callback: (snapshot: Snapshot<SnapshotWithCriteria<BaseData, any>, any> | null) => void;
  createSnapshot: CreateSnapshotType | null | undefined;
}

const SnapshotComponent: React.FC<SnapshotProps> = ({
  snapshotConfig,
  id,
  snapshotData,
  category,
  categoryProperties,
  callback,
  createSnapshot,
}) => {
  const [snapshots, setSnapshots] = useState<Snapshot<BaseData>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { error, handleError, clearError } = useErrorHandling();

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const snapshotId = snapshotData?.id ? String(snapshotData.id) : id !== null ? String(id) : null;
        
        // Invoke createSnapshot if it's defined, and pass the result to snapshotConfig.snapshot
        const snapshotContainer = createSnapshot ? createSnapshot({}) : null;

        const newSnapshot = await snapshotConfig.snapshot(
          String(id),
          snapshotId,
          snapshotData,
          category,
          categoryProperties,
          callback,
          snapshotContainer // Pass the result of createSnapshot here
        );

        const snapshotArray = Array.isArray(newSnapshot)
          ? newSnapshot
          : [newSnapshot.snapshotData];

        setSnapshots((prevSnapshots) => [
          ...prevSnapshots,
          ...snapshotArray,
        ]);
      } catch (error: any) {
        const errorMessage = "Failed to fetch snapshot";
        handleError(errorMessage, { componentStack: error.stack });
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();

    return () => {
      // Perform cleanup if necessary
    };
  }, [snapshotConfig, id, snapshotData, category, categoryProperties, callback, createSnapshot, handleError]);

  const handleCreateSnapshot = () => {
    const additionalData = { /* Any additional data for the snapshot */ };

    if (createSnapshot) {
      const newSnapshot = createSnapshot(additionalData);
      // Handle the created snapshot as needed
    }
  };

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

 