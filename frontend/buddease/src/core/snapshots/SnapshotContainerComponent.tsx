// SnapshotContainerComponent.tsx
import { constructTarget, Target } from '@/core/api/EndpointConstructor';
import { fetchAllSnapshots } from '@/core/api/SnapshotApi';
import { endpoints } from '@/core/api/endpointConfigurations';
import useErrorHandling from '@/core/hooks/userInterface/automation_process';
import { Data } from '@/core/models/data/Data';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotList from '@/core/snapshots/SnapshotList'; // Use the existing SnapshotList class
import { useNotification } from '@/core/state/context/NotificationContext';
import React from 'react';
interface SnapshotContainerProps {
  target: Target;
}

const SnapshotContainerComponent: React.FC<SnapshotContainerProps> = ({ target }) => {
  const { addNotification } = useNotification();
  const  {handleErrors} = useErrorHandling();

  const [snapshotList, setSnapshotList] = React.useState<SnapshotList<Data, Data> | null>(null);

  const getSnapshotList = async (target: Target): Promise<void> => {
    try {
      const { endpoint, params } = target;
      const constructedTarget = constructTarget("apiWebBase", endpoint, params);
      const snapshotsList = await fetchAllSnapshots(constructedTarget.toArray());

      

    // Initialize SnapshotList and populate it with fetched snapshots
    const snapshotListInstance = new SnapshotList<Data, Data>();
    snapshotsList.forEach((snapshot: Snapshot<Data, any>) => {
      const snapshotItem = convertSnapshotToItem(snapshot, UniqueIDGenerator.generateSnapshoItemID(Date.now().toString()));
      snapshotListInstance.addSnapshot(snapshotItem);
    });
      
      snapshotListInstance.sortSnapshotItems();
      setSnapshotList(snapshotListInstance);
    } catch (error) {
      handleErrors("Failed to get snapshot list");
      throw error;
    }
  };

  return (
    <div>
      <h1>Snapshot Container</h1>
      <button onClick={() => getSnapshotList(constructTarget("apiWebBase", endpoints.snapshots.list, {
        sortBy: "createdAt",
        limit: 10
      }))}>Get Snapshot List</button>

      {snapshotList && (
        <div>
          {snapshotList.getSnapshots().map((snapshot, index) => (
            <div key={snapshot.id}>
              {/* Render snapshot data here */}
              <p>{snapshot.label}</p>
              <p>{snapshot.timestamp.toString()}</p>
              {/* Additional rendering logic */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SnapshotContainerComponent;
