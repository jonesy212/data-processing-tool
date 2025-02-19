
import RandomWalkSuggestions from '@/app/components/hooks/userInterface/RandomWalkSuggestions';
import { Data } from '@/app/components/models/data/Data';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import configServiceInstance from '@/app/configs/ConfigurationService';
import ReactDOM from 'react-dom';



// Automated system setup process
const setupAutomationSystem = (
  config: SnapshotStoreConfigType<SnapshotStore<Snapshot<Data, Data>>>
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
const config = configServiceInstance.getSnapshotConfig(); // Example: Get the config from a service or provide a valid config object
setupAutomationSystem(config); // Pass the config object as an argument



export default setupAutomationSystem;
