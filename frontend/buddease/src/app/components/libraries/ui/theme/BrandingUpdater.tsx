import React from "react";

import RandomWalkSuggestions from '@/app/components/hooks/userInterface/RandomWalkSuggestions';
import { Data } from '@/app/components/models/data/Data';
import SnapshotStore, { Snapshot } from '@/app/components/snapshots/SnapshotStore';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import configurationService from '@/app/configs/ConfigurationService';
import ReactDOM from 'react-dom';



// Automated system setup process
const setupAutomationSystem = (
  config: SnapshotStoreConfigType<SnapshotStore<Snapshot<Data, Meta, Data>>>
) => {
  const { notify } = useNotification();
  typeof SnapshotStoreConfig === "function" &&
    new SnapshotStoreConfig(config, (message, content, date, type) => {
      notify(
        "System setup in progress...",
        NotificationTypeEnum.SystemUpdateInProgress,
        new Date()
      );
    }); // Pass the config directly

  // Create and render RandomWalkSuggestions component
  const rootElement = document.getElementById("root");
  rootElement && ReactDOM.render(<RandomWalkSuggestions />, rootElement);
}


// Run the setup process with a valid config object
const config = configurationService.getSnapshotConfig(); // Example: Get the config from a service or provide a valid config object
setupAutomationSystem(config); // Pass the config object as an argument



export default setupAutomationSystem;
