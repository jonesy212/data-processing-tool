// SnapshotApi.ts
import axios from 'axios';
import useSnapshotManager from '../components/hooks/useSnapshotManager';
import { Data } from '../components/models/data/Data';
import { Snapshot } from '../components/state/stores/SnapshotStore';
import { Todo } from '../components/todos/Todo';

const API_BASE_URL = '/api/snapshots';  // Replace with your actual API endpoint

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
        save: function (): Promise<void> {
          throw new Error('Function not implemented.');
        },
        snapshot: undefined,
        _id: '',
        id: '',
        title: '',
        isActive: false,
        tags: [],
        phase: null,
        then: function (callback: (newData: Snapshot<Data>) => void): void {
          throw new Error('Function not implemented.');
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
