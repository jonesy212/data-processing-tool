// AutomatioProcess.ts
import ReactDOM from 'react';
import SnapshotStoreConfig, { Snapshot, SnapshotStoreConfig as SnapshotStoreConfigType, } from '../../state/stores/SnapshotStore';
import RandomWalkSuggestions from './RandomWalkSuggestions';

import { Data } from '../../models/data/Data';
// Automated system setup process
const config: SnapshotStoreConfigType<Snapshot<Data>> = new SnapshotStoreConfig({} as SnapshotStoreConfig<Snapshot<Data>>).configure();

const setupAutomationSystem = (config: SnapshotStoreConfigType<Snapshot<Data>>) => {
  // Configure SnapshotStore
  typeof SnapshotStoreConfig === "function" && new SnapshotStoreConfig(config);

  // Create and render RandomWalkSuggestions component
  // (Assuming you have a root element with id 'root' in your HTML)
  const rootElement = document.getElementById("root");
  rootElement && ReactDOM.render(<RandomWalkSuggestions />, rootElement);
};

// Run the setup process
setupAutomationSystem(config as  SnapshotStoreConfigType<Snapshot<Data>>);

