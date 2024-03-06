import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Tracker } from './Tracker';
import { DocumentData } from '../../documents/DocumentBuilder';
import { User } from '../../users/User';

const ExampleComponent: React.FC = observer(() => {
  const { trackerStore } = useStore(); // Replace with your actual store names

  const addNewTracker = () => {
    const newTracker: Tracker = {
      id: 'uniqueId', // Assign a unique identifier
      name: 'New Tracker', // Provide a default name
      phases: [], // Initialize phases as an empty array
      trackFileChanges: (file: DocumentData) => {
        // Implement file tracking logic here
        console.log(`Tracking changes for file: ${file.title}`);
      },
      trackFolderChanges: () => {
        // Implement folder tracking logic here
        console.log("Tracking changes for folder.");
      },
      updateUserProfile: (userData: User) => {
        // Implement user profile update logic here
        console.log("Updating user profile:", userData);
      },
      sendNotification: (notification: string, userData: User) => {
        // Implement notification sending logic here
        console.log("Sending notification:", notification);
      },
    };

    trackerStore.addTracker(newTracker); // Replace with the actual method in your store
  };

  return (
    <div>
       <button onClick={addNewTracker}>Add Tracker</button>
      {Object.values(trackerStore.trackers).map((tracker: Tracker) => (
        <div key={tracker.id}>
          <h3>{tracker.name}</h3>
          <p>Phases: {tracker.phases.join(', ')}</p>
        </div>
      ))}
    </div>
  );
});

export default ExampleComponent;
