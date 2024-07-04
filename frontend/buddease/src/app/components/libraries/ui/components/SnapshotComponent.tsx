import React from "react";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { BaseData, Data } from "@/app/components/models/data/Data";
import { SnapshotStoreConfig } from "@/app/components/snapshots/SnapshotConfig";
import { useEffect, useState } from "react";
import { Snapshot, Snapshots } from "@/app/components/snapshots/LocalStorageSnapshotStore";

// Define props interface
interface SnapshotProps {
  snapshotConfig: SnapshotStoreConfig<BaseData, Data>;
  id: any; // Define the type of id
  snapshotData: SnapshotStoreConfig<any, Data>; // Define the type of snapshotData
  category: string; // Define the type of category
  createSnapshot: (additionalData: any) => void; // Define the type of createSnapshot
}


// Define the Snapshot component
const SnapshotComponent: React.FC<SnapshotProps> = ({ snapshotConfig, id, snapshotData, category, createSnapshot }) => {
  const [snapshots, setSnapshots] = useState<Snapshots<Data>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { error, handleError, clearError } = useErrorHandling();

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const newSnapshot = await snapshotConfig.snapshot(id, snapshotData, category, createSnapshot);
        setSnapshots((prevSnapshots) => [
          ...prevSnapshots,
          ...(Array.isArray(newSnapshot.snapshot)
            ? newSnapshot.snapshot : [newSnapshot.snapshot]),
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
  }, [snapshotConfig, id, snapshotData, category, handleError]);

  // Snapshot creation handler
  const handleCreateSnapshot = () => {
    const additionalData = { /* Any additional data for the snapshot */ };
    createSnapshot(additionalData);
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
}

export default SnapshotComponent;