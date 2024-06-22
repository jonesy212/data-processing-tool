import axios from 'axios';
import { AxiosError } from 'axios';
import { Phase } from '../components/phases/Phase';
import { apiNotificationMessages, fetchData, handleApiErrorAndNotify } from './ApiData';
import { AxiosResponse } from 'axios';
import { endpoints } from './ApiEndpoints';
import { NotificationType } from '../components/support/NotificationContext';

// Base URL for your API
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = endpoints.phases;
// Define your notification messages interface
interface DataNotificationMessages {
  // Define your notification IDs as needed
  FetchPhaseErrorId: keyof typeof apiNotificationMessages;
  AddPhaseErrorId: keyof typeof apiNotificationMessages;
  UpdatePhaseErrorId: keyof typeof apiNotificationMessages;
  RemovePhaseErrorId: keyof typeof apiNotificationMessages;
  PhaseError: keyof typeof apiNotificationMessages;
  // Add more as necessary
}

// Function to handle Axios errors and notify
const handlePhaseApiError = (error: AxiosError<unknown>,
  errorMessage: string,
  notificationId: DataNotificationMessages
): void => {
  console.error(`Error in Phase API: ${errorMessage}`, error);
  handleApiErrorAndNotify(error, errorMessage, "FetchPhaseErrorId" );
};


const fetchPhases = async (): Promise<Phase[]> => {
  try {
    const response = await axios.get<Phase[]>(`${API_BASE_URL}`, { headers: this.headers });
    return response.data;
  } catch (error) {
    const errorMessage = 'Error fetching phases';
    handlePhaseApiError(error as AxiosError<unknown>, errorMessage, 'FetchPhaseErrorId');
    throw error;
  }
}




const bulkAssignPhases= async (phaseIds: number[], teamId: number): Promise<void> {
  const url = endpoints?.phases?.bulkAssign; // Assuming endpoints are imported and structured properly
  if (!url) {
    const errorMessage = "URL for bulk assigning phases not found";
    throw new Error(errorMessage);
  }

  try {
    await axios.post(url, { phaseIds, teamId }, { headers: this.headers });
  } catch (error) {
    const errorMessage = 'Error bulk assigning phases';
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

// Function to add a new phase
export const addPhase = async (newPhase: Phase): Promise<void> => {
  try {
    const endpoint = `${BASE_URL}/phases`; // Replace with your actual endpoint
    const response = await axios.post(endpoint, newPhase);
    console.log('Added phase successfully:', response.data);
    // Optionally handle response if needed
  } catch (error) {
    handlePhaseApiError(error as AxiosError<unknown>, 'Failed to add phase', 'AddPhaseErrorId');
    throw error;
  }
};

// Function to get a phase by name
export const getPhaseByName = async (phaseName: string): Promise<Phase | null> => {
  try {
    const endpoint = `${BASE_URL}/phases/${phaseName}`; // Replace with your actual endpoint
    const response = await axios.get<Phase>(endpoint);
    console.log(`Fetched phase ${phaseName} successfully:`, response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`Phase ${phaseName} not found.`);
      return null;
    } else {
      handlePhaseApiError(error as AxiosError<unknown>, `Failed to fetch phase ${phaseName}`, 'FetchPhaseErrorId');
      throw error;
    }
  }
  
};

// Function to remove a phase
export const removePhase = async (phaseId: string): Promise<void> => {
  try {
    const endpoint = `${BASE_URL}/phases/${phaseId}`; // Replace with your actual endpoint
    await axios.delete(endpoint);
    console.log(`Removed phase with ID ${phaseId} successfully.`);
  } catch (error) {
    handlePhaseApiError(error as AxiosError<unknown>, `Failed to remove phase with ID ${phaseId}`, 'RemovePhaseErrorId');
    throw error;
  }
};

// Function to update a phase
export const updatePhase = async (phaseId: string, updatedPhase: Phase): Promise<void> => {
  try {
    const endpoint = `${BASE_URL}/phases/${phaseId}`; // Replace with your actual endpoint
    const response = await axios.put(endpoint, updatedPhase);
    console.log(`Updated phase with ID ${phaseId} successfully:`, response.data);
    // Optionally handle response if needed
  } catch (error) {
    handlePhaseApiError(error as AxiosError<unknown>, `Failed to update phase with ID ${phaseId}`);
    throw error;
  }
};
