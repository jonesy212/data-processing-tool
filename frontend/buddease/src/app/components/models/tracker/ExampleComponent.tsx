import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../hooks/useStore';
import { Tracker } from './Tracker';
import ListGenerator, { DetailsItemCommon } from '@/app/generators/ListGenerator';
import { Data } from '../data/Data';

const ExampleComponent: React.FC = observer(() => {
  const { trackerManager } = useStore(); // Replace with your actual store names

  const addNewTracker = () => {
    const newTracker: Tracker = {
      id: 'uniqueId', // Assign a unique identifier
      name: 'New Tracker', // Provide a default name
      phases: [], // Initialize phases as an empty array
      trackFileChanges: (file) => {
        // Implement file tracking logic here
        console.log(`Tracking changes for file: ${file.title}`);
      },
      trackFolderChanges: () => {
        // Implement folder tracking logic here
        console.log('Tracking changes for folder.');
      },
      updateUserProfile: (userData) => {
        // Implement user profile update logic here
        console.log('Updating user profile:', userData);
      },
      sendNotification: (notification, userData) => {
        // Implement notification sending logic here
        console.log('Sending notification:', notification);
      },
    };

    trackerManager.addTracker(newTracker); // Replace with the actual method in your store
  };

  return (
    <div>
      <button onClick={addNewTracker}>Add Tracker</button>
      <ListGenerator<Data, Tracker>
        items={Object.values(trackerManager.trackers)}
        onItemClick={(
          contentItemId: DetailsItemCommon<Data>,
          tracker: Tracker
        ) => {
          // Handle onItemClick logic if needed
          console.log('Clicked on tracker:', tracker);
        }}
      />
    </div>
  );
});

export default ExampleComponent;
