// SnapshotContainer.tsx
import * as React from "react";import useErrorHandling from "../hooks/userInterface/automation_process";
import { useNotification } from "../support/NotificationContext";
import { Snapshot, Snapshots } from "./LocalStorageSnapshotStore";
import { constructTarget, Target } from "@/app/api/EndpointConstructor";
import SnapshotList from "./SnapshotList";
import { endpoints } from "@/app/api/ApiEndpoints";
import endpointConfigurations from "@/app/api/endpointConfigurations";

interface SnapshotContainerProps {
  target: Target;
}


const SnapshotContainer: React.FC<SnapshotContainerProps> = ({ target }) => {
    const { addNotification } = useNotification();
    const { handleError } = useErrorHandling();
    const [snapshots, setSnapshots] = React.useState<Snapshots<T>>([]);
    const [snapshot, setSnapshot] = React.useState<Snapshot<T, K>>(null);
  
    const [snapshotList, setSnapshotList] = React.useState<SnapshotList | null>(null);
  
    const getSnapshotList = async (target: Target): Promise<SnapshotList> => {
      try {
        // Destructure the target object to extract the endpoint and params
        const { endpoint, params } = target;
        // Construct the target URL using the endpoint and params
        const constructedTarget = constructTarget("apiWebBase", endpoint, params);
        // Fetch snapshots using the constructed target
        const snapshotsList = await fetchAllSnapshots(constructedTarget.toArray());
        // Optional: Sort snapshots within the SnapshotList object
        snapshotsList.sortSnapshotItems();
        // Return the sorted snapshot list
        setSnapshotList(snapshotsList);
        setSnapshot(snapshotsList.getSnapshot(0));
        return snapshotsList;
      } catch (error) {
        const errorMessage = "Failed to get snapshot list";
        handleError(errorMessage);
        throw error;
      }
    }
    return (
      <div>
        <h1>Snapshot Container</h1>
        <button onClick={() => getSnapshotList(constructTarget("apiWebBase", endpointConfigurations.snapshots.list, {}))}>Get Snapshot List</button>
  
        {snapshotList && <SnapshotList
          snapshots={snapshotList.getSnapshots()}
          context={snapshotList.getContext()}
        />}
      </div>
    );
  
  }