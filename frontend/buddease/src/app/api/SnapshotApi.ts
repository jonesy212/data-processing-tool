// SnapshotApi.ts
import axios from 'axios';
import useSnapshotManager from '../components/hooks/useSnapshotManager';
import { Data } from '../components/models/data/Data';
import { Snapshot } from '../components/state/stores/SnapshotStore';
import { useNotification } from '../components/support/NotificationContext';
import { Todo } from '../components/todos/Todo';
import { VideoData } from '../components/video/Video';

const API_BASE_URL = '/api/snapshots';  // Replace with your actual API endpoint
const { notify } = useNotification()

export const fetchSnapshots = async (): Promise<Snapshot<Data>[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data.snapshots;
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    throw error;
  }
};

export const addSnapshot = async (newSnapshot: Omit<Snapshot<Data>, 'id'>) => {
  try {
    const response = await fetch('/api/snapshots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSnapshot),
    });

    if (response.ok) {
      const createdSnapshot: Snapshot<Data> = await response.json();
      const snapshotManagerStore = useSnapshotManager();

      // Transform the createdSnapshot into a Todo object
      const todo: Todo = {
        ...createdSnapshot,
        // Add additional properties as needed
        done: false,
        status: 'pending',
        todos: [],
        description: '',
        dueDate: null,
        priority: 'low',
        assignedTo: null,
        assignee: null,
        assignedUsers: [],
        collaborators: [],
        labels: [],
        comments: [],
        attachments: [],
        subtasks: [],
        isArchived: false,
        isCompleted: false,
        isBeingEdited: false,
        isBeingDeleted: false,
        isBeingCompleted: false,
        isBeingReassigned: false,
        save: async function (): Promise<void> {
          try {
            // Simulate saving data to a database or an external service
            // For example, you can make an API call to save the data
            const response = await axios.post('/api/saveData', {/* data to save */});
        
            // Check if the save operation was successful
            if (response.status === 200) {
              notify('success', 'Data saved successfully!', new Date);
            } else {
              notify('error', 'Failed to save data', new Date, );
              console.error('Failed to save data:', response.statusText);
            }
          } catch (error) {
            notify('error', 'Error saving data', new Date, );
            console.error('Error saving data:', error);
            throw error; // Re-throw the error if necessary
          }
        },
        
        snapshot: {} as Snapshot<Data>,
        _id: '',
        id: '',
        title: '',
        isActive: false,
        tags: [],
        phase: null,
        then: async function (callback: (newData: Snapshot<Data>) => void): Promise<void> {
          try {
            // Simulate fetching updated data after saving
            const updatedData: Snapshot<Data> = await fetchUpdatedData(createdSnapshot.id); // You need to implement this function to fetch the updated data

            // Execute the callback with the updated data
            callback(updatedData);
          } catch (error) {
            console.error('Error fetching updated data:', error);
            throw error; // Re-throw the error if necessary
          }
        },
        analysisType: '',
        analysisResults: [],
        videoData: {} as VideoData
      };

      snapshotManagerStore.takeSnapshotSuccess(todo); // Pass the transformed Todo object to takeSnapshotSuccess
    } else {
      console.error('Failed to add snapshot:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding snapshot:', error);
  }
};

export const removeSnapshot = async (snapshotId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${snapshotId}`);
  } catch (error) {
    console.error('Error removing snapshot:', error);
    throw error;
  }
};


// Add more methods as needed for snapshot-related operations

// Example usage:
// const snapshots = await fetchSnapshots();
// console.log(snapshots);

// You can adapt and extend this structure based on the specific requirements of your application.
