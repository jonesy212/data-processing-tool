import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { Data } from "@/app/components/models/data/Data";
import { DataStore } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { CustomSnapshotData, SnapshotConfig, SnapshotContainer, SnapshotStoreConfig, SnapshotStoreProps } from "@/app/components/snapshots";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { isSnapshot } from "@/app/components/typings/YourSpecificSnapshotType";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { useEffect, useState } from "react";


type CreateSnapshotType<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> = (
  additionalData: CustomSnapshotData
) => SnapshotContainer<T, Meta, K> | null | undefined;

interface SnapshotProps<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  snapshotConfig: SnapshotStoreConfig<T, Meta, K>;
  id: string | number | null;
  snapshotData: SnapshotData<T, Meta, K>;
  snapshotStoreData: SnapshotStore<T, Meta, K>;
  categoryProperties: CategoryProperties;
  category: string;
  callback: (snapshot: Snapshot<T, any> | null) => void;
  createSnapshot: CreateSnapshotType<T, Meta, K> | null | undefined;
  
   // Add the missing props here
   dataStore: DataStore<T, Meta, K>,
dataStoreMethods: DataStoreMethods<T, Meta, K>;          
   metadata: UnifiedMetaDataOptions;             
   subscriberId: string;                         
   endpointCategory: string | number;           
   storeProps: SnapshotStoreProps<T, Meta, K>;         
   snapshotConfigData: SnapshotConfig<T, Meta, K>;      
   snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>; 
 
}

const SnapshotComponent  = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshotProps: SnapshotProps<T, Meta, K>
): JSX.Element => {
  const {
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
  } = snapshotProps




  const [snapshots, setSnapshots] = useState<Snapshot<T, Meta, K>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { error, handleError, clearError } = useErrorHandling();

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        
        if(snapshotData === undefined){
          throw new Error("Snapshot data is undefined");
        }

        const snapshotId = 'id' in snapshotData && snapshotData.id ? String(snapshotData.id) : id !== null ? String(id) : null;
        
        // Invoke createSnapshot if it's defined, and pass the result to snapshotConfig.snapshot
        const snapshotContainer = createSnapshot ? createSnapshot({}) : null;
        if(snapshotContainer === null){
          throw new Error("Snapshot container is null");
        }
        const newSnapshot = await snapshotConfig.snapshot(
          String(id),                           // id
          snapshotId,                           // snapshotId
          snapshotData,                         // snapshotData
          category,                             // category
          categoryProperties,                   // categoryProperties
          callback,                             // callback
          dataStoreMethods,                     // dataStoreMethods (make sure this is defined)
          metadata,                             // metadata (make sure this is defined)
          subscriberId,                         // subscriberId (make sure this is defined)
          endpointCategory,                     // endpointCategory (make sure this is defined)
          storeProps,                           // storeProps (make sure this is defined)
          snapshotConfigData,                   // snapshotConfigData (make sure this is defined)
          snapshotStoreConfigData,              // snapshotStoreConfigData (optional)
          snapshotContainer                      // snapshotContainer (optional)
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
  }, [snapshotConfig, id, snapshotData, category, categoryProperties, callback, createSnapshot,
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

  const handleCreateSnapshot = () => {
    const additionalData = {
      // Any additional data for the snapshot, such as metadata or custom properties
      customField: 'exampleData',
    };
  
    if (createSnapshot) {
      try {
        const newSnapshot = createSnapshot(additionalData);
          // Check if the newSnapshot is valid
          if (newSnapshot && isSnapshot(newSnapshot)) {
            setSnapshots((prevSnapshots) => {
              const newData = newSnapshot.snapshotData;
          
              // Create a new array of Snapshots to add
              let snapshotsToAdd: Snapshot<T, Meta, K>[] = [];
          
              // If newData is a Map, extract values and ensure they're of type Snapshot<T, Meta, K>
              if (newData instanceof Map) {
                snapshotsToAdd = Array.from(newData.values()).filter(isSnapshot);
              } else if (newData && isSnapshot(newData)) {
                snapshotsToAdd = [newData as Snapshot<T, Meta, K>];
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

 