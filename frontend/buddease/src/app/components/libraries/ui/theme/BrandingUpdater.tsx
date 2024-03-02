import RandomWalkSuggestions from '@/app/components/hooks/userInterface/RandomWalkSuggestions';
import { Data } from '@/app/components/models/data/Data';
import SnapshotStoreConfig, { Snapshot, SnapshotStoreConfig as SnapshotStoreConfigType, } from '@/app/components/state/stores/SnapshotStore';
import configurationService from '@/app/configs/ConfigurationService';
import ReactDOM from 'react-dom';

// Automated system setup process
const setupAutomationSystem = (config: SnapshotStoreConfigType<Snapshot<Data>>) => {
  typeof SnapshotStoreConfig === 'function' && new SnapshotStoreConfig(config,notify); // Pass the config directly

  // Create and render RandomWalkSuggestions component
  const rootElement = document.getElementById('root');
  rootElement && ReactDOM.render(<RandomWalkSuggestions />, rootElement);
};


// Run the setup process with a valid config object
const config = configurationService.getSnapshotConfig(); // Example: Get the config from a service or provide a valid config object
setupAutomationSystem(config); // Pass the config object as an argument


// Run the setup process
setupAutomationSystem();

export default setupAutomationSystem;
