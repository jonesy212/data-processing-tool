import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStore } from '../../hooks/useStore';

import ListGenerator, { DetailsItemCommon } from '@/app/generators/ListGenerator';
import { NotificationData } from '../../support/NofiticationsSlice';
import { UserData } from '../../users/User';
import { Data } from '../data/Data';
import FileData from '../data/FileData';
import FolderData from '../data/FolderData';
import { CommonTrackerProps, TrackerProps } from './Tracker';

const ExampleComponent: React.FC = observer(() => {
  const { trackerManager } = useStore(); // Replace with your actual store names

  const addNewTracker = () => {
    const newTracker: CommonTrackerProps = {
      id: 'uniqueId', // Assign a unique identifier
      name: 'New Tracker', // Provide a default name
      phases: [], // Initialize phases as an empty array
  
      
      strokeWidth: 2, // Assign default stroke width
      fillColor: '#000000', // Assign default fill color
      isFlippedX: false, // Default value for isFlippedX
      isFlippedY: false, // Default value for isFlippedY
      x: 0, // Default x position
      y: 0, // Default y position

      updateAppearance: function (updates, newStroke, newFillColor) {
        // Ensure updates object has values and then update stroke
        if (updates.stroke && this.stroke !== undefined) {
          if (updates.stroke.width !== undefined) {
            this.stroke.width = updates.stroke.width;  // Update stroke width if provided
          }
          if (updates.stroke.color !== undefined) {
            this.stroke.color = updates.stroke.color;  // Update stroke color if provided
          }
          
          // Update fill color
          this.fillColor = newFillColor;
          
          console.log(`Appearance updated: stroke ${this.stroke.width}px ${this.stroke.color}, fill ${newFillColor}`);
        }
      },

      trackFileChanges: (file: FileData) => {
        // Implement file tracking logic here
        console.log(`Tracking changes for file: ${file.title}`);
        // Simulate tracking content changes
        const contentChanges = `Detected changes in file: ${file.title}`;
        console.log(contentChanges);
      },
  
      trackFolderChanges: (folder: FolderData) => {
        // Implement folder tracking logic here
        console.log(`Tracking changes for folder: ${folder.name}`);
        folder.files.forEach((file: FileData) => {
          console.log(`Checking file: ${file.title}`);
          // Simulate detecting changes for each file in the folder
          const fileChanges = `Changes detected in file: ${file.title}`;
          console.log(fileChanges);
        });
      },
  
      updateUserProfile: (userData: UserData) => {
        // Implement user profile update logic here
        console.log(`Updating user profile for user: ${userData.username} (ID: ${userData.id})`);
        // Simulate profile update
        const updateMessage = `User profile updated: ${userData.username}`;
        console.log(updateMessage);
      },
  
      sendNotification: (notification: NotificationData, userData: UserData) => {
        // Implement notification sending logic here
        console.log(`Sending ${notification.type} notification to ${userData.username}: ${notification.message}`);
        // Simulate sending notification
        const notificationStatus = `Notification sent to ${userData.username}: ${notification.message}`;
        console.log(notificationStatus);
      },
  
      stroke: {
        width: 2,
        color: 'black',
      },
    };
  
    // Simulate adding tracker to the tracker manager (replace with actual logic)
    trackerManager.addTracker(newTracker); // Replace with the actual method in your store
  };

  return (
    <div>
      <button onClick={addNewTracker}>Add Tracker</button>
      <ListGenerator<Data, TrackerProps>
        items={Object.values(trackerManager.trackers)}
        onItemClick={(
          contentItemId: DetailsItemCommon<Data>,
          tracker: TrackerProps
        ) => {
          // Handle onItemClick logic if needed
          console.log('Clicked on tracker:', tracker);
        }}
      />
    </div>
  );
});

export default ExampleComponent;
