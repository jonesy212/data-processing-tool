import React from "react";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { Data } from "@/app/components/models/data/Data";
import { SnapshotStoreConfig } from "@/app/components/snapshots/SnapshotConfig";
import { Snapshot } from "@/app/components/snapshots/SnapshotStore";
import { useEffect, useState } from "react";

// Define props interface
interface SnapshotProps {
  snapshotConfig: SnapshotStoreConfig<Snapshot<Data>>;
  id: any; // Define the type of id
  snapshotData: SnapshotStoreConfig<any>; // Define the type of snapshotData
  category: string; // Define the type of category
  createSnapshot: (additionalData: any) => void; // Define the type of createSnapshot
  
}

// Define the Snapshot component
const SnapshotComponent: React.FC<SnapshotProps> = ({ snapshotConfig, id, snapshotData, category, createSnapshot }) => {
  const [snapshots, setSnapshots] = useState<Snapshot<Data>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { error, handleError, clearError } = useErrorHandling();

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const { snapshot: newSnapshot } = await snapshotConfig.snapshot(id, snapshotData, category);
        setSnapshots(prevSnapshots => [...prevSnapshots, newSnapshot]);
      } catch (error: any) {
        const errorMessage = 'Failed to fetch snapshot';
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
              <p>Timestamp: {snapshot.timestamp.toString()}</p>
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
