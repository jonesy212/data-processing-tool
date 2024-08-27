import React from 'react';
import { constructTarget, Target } from '@/app/api/EndpointConstructor';
import { fetchAllSnapshots } from '../../api/SnapshotApi';
import { endpoints } from '../../api/endpointConfigurations';
import useErrorHandling from '../hooks/userInterface/automation_process';
import { Data } from '../models/data/Data';
import { useNotification } from '../support/NotificationContext';
import SnapshotList from './SnapshotList'; // Use the existing SnapshotList class
import { Snapshot } from './LocalStorageSnapshotStore';
import { T, K } from './SnapshotConfig';

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
