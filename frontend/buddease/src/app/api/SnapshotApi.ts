// SnapshotApi.ts
import axios from 'axios';
import useSnapshotManager from '../components/hooks/useSnapshotManager';
import { Snapshot } from '../components/snapshots/Snapshot';
const API_BASE_URL = '/api/snapshots';  // Replace with your actual API endpoint

export const fetchSnapshots = async (): Promise<Snapshot[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data.snapshots;
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    throw error;
  }
};

export const addSnapshot = async (newSnapshot: Omit<Snapshot, 'id'>) => {
  try {
    const response = await fetch('/api/snapshots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSnapshot),
    });

    if (response.ok) {
      const createdSnapshot: Snapshot = await response.json();
      const snapshotManagerStore = useSnapshotManager();
      snapshotManagerStore.addSnapshotSuccess({ snapshot: createdSnapshot });
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
