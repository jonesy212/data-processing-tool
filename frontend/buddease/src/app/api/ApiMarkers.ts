// ApiMarkers.ts
import axios from 'axios';
import {endpoints} from '@/app/api/ApiEndpoints';
// Define the base URL for the markers API
const MARKERS_API_BASE_URL = endpoints.marker

// Function to fetch markers from the backend
export const fetchMarkers = async (): Promise<any> => {
  try {
    const response = await axios.get(`${MARKERS_API_BASE_URL}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch markers');
  }
};

// Function to add a new marker to the backend
export const addMarker = async (markerData: any): Promise<any> => {
  try {
    const response = await axios.post(`${MARKERS_API_BASE_URL}`, markerData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to add marker');
  }
};

// Function to update an existing marker on the backend
export const updateMarker = async (markerId: string, updatedData: any): Promise<any> => {
  try {
    const response = await axios.put(`${MARKERS_API_BASE_URL}/${markerId}`, updatedData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update marker');
  }
};

// Function to remove a marker from the backend
export const removeMarker = async (markerId: string): Promise<void> => {
  try {
    await axios.delete(`${MARKERS_API_BASE_URL}/${markerId}`);
  } catch (error) {
    throw new Error('Failed to remove marker');
  }
};
