import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Tracker } from './Tracker';

const ExampleComponent: React.FC = observer(() => {
  const { trackerStore } = useStore(); // Replace with your actual store names

  const addNewTracker = () => {
    const newTracker: Tracker = {
        name: 'New Tracker',
        phases: [],
        id: ''
    };

    trackerStore.addTracker(newTracker); // Replace with the actual method in your store
  };

  return (
    <div>
      <button onClick={addNewTracker}>Add Tracker</button>
      {trackerStore.trackers.map((tracker: Tracker) => (
        <div key={tracker.name}>
          <h3>{tracker.name}</h3>
          <p>Phases: {tracker.phases.join(', ')}</p>
        </div>
      ))}
    </div>
  );
});

export default ExampleComponent;
