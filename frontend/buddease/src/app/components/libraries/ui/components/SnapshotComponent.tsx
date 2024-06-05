// SnapshotComponent

import { Data } from "@/app/components/models/data/Data";
import { SnapshotStoreConfig } from "@/app/components/snapshots/SnapshotConfig";
import SnapshotStore, { Snapshot } from "@/app/components/snapshots/SnapshotStore";
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
const SnapshotComponent: React.FC<SnapshotProps> = ({ snapshotConfig, id, snapshotData, category,  }) => {
    const [snapshot, setSnapshot] = useState<SnapshotStore<Snapshot<Data>> | null>(null);
  
    useEffect(() => {
      const fetchSnapshot = async () => {
        try {
          // Assuming id, snapshotData, and category are defined somewhere
          const { snapshot: newSnapshot } = await snapshotConfig.snapshot(id, snapshotData, category);
          setSnapshot(newSnapshot);
        } catch (error) {
          console.error('Error fetching snapshot:', error);
        }
      };
  
      fetchSnapshot();
  
      // Cleanup function
      return () => {
        // Perform cleanup if necessary
      };
    }, [snapshotConfig, id, snapshotData, category]);
  
    return (
      <div>
        {/* Render your snapshot component here */}
      </div>
    );
  };
  
  export default SnapshotComponent;