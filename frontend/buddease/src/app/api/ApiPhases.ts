// ApiPhases.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { AppPhase } from '@/app/typings/entities/PhaseEntity';
import { NotificationType, useNotification } from '@/state/context/NotificationContext';
import axios, { AxiosError } from 'axios';

// Base URL for your API
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URL = endpoints.phases;

// Define your notification messages interface
interface PhaseNotificationMessages {
  FetchPhaseErrorId: string;
  AddPhaseErrorId: string;
  UpdatePhaseErrorId: string;
  RemovePhaseErrorId: string;
  PhaseError: string;
  // Add more as necessary
}

const apiNotificationMessages: PhaseNotificationMessages = {
  FetchPhaseErrorId: 'FetchPhaseErrorId',
  AddPhaseErrorId: 'AddPhaseErrorId',
  UpdatePhaseErrorId: 'UpdatePhaseErrorId',
  RemovePhaseErrorId: 'RemovePhaseErrorId',
  PhaseError: 'PhaseError',
  // Define other messages as necessary
};

const handleApiErrorAndNotify= (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof PhaseNotificationMessages
) => {
  handleApiError(error, errorMessage);
  if(errorMessageId) {
    const errorMessageText = apiNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "PhaseApiError" as NotificationType
    );
  }
}

// Function to handle Axios errors and notify
const handlePhaseApiError = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof PhaseNotificationMessages
): void => {
  console.error(`Error in Phase API: ${errorMessage}`, error);
  handleApiErrorAndNotify(
    error,
    errorMessage,
    "APIPhaseError" as keyof PhaseNotificationMessages
  );
};



// Function to fetch phases
const fetchPhases = async (): Promise<AppPhase[]> => {
  try {
    const response = await axios.get<AppPhase[]>(`${API_BASE_URL}`, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    const errorMessage = "Error fetching phases";
    handlePhaseApiError(
      error as AxiosError<unknown>,
      errorMessage,
      "FetchPhaseErrorId"
    );
    throw error;
  }
};

const bulkAssignPhases= async (phaseIds: number[], teamId: number): Promise<void> => {
  const url = endpoints?.phases?.bulkAssign; // Assuming endpoints are imported and structured properly
  if (!url) {
    const errorMessage = "URL for bulk assigning phases not found";
    throw new Error(errorMessage);
  }

  try {
    await axios.post(`${url}`, { phaseIds, teamId }, { headers: headersConfig });
  } catch (error) {
    const errorMessage = 'Error bulk assigning phases';
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

// Function to add a new phase
export const addPhase = async (newPhase: AppPhase): Promise<void> => {
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

export const getPhaseByName = (phaseName: string): Promise<AppPhase | null> => {
  return new Promise<AppPhase | null>(async (resolve, reject) => {
    try {
      const endpoint = `${BASE_URL}/phases/${phaseName}`; // Replace with your actual endpoint
      const response = await axios.get<AppPhase>(endpoint, { headers: headersConfig });
      console.log(`Fetched phase ${phaseName} successfully:`, response.data);
      resolve(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log(`Phase ${phaseName} not found.`);
        resolve(null);
      } else {
        handlePhaseApiError(
          error as AxiosError<unknown>,
          `Failed to fetch phase ${phaseName}`,
          'FetchPhaseErrorId'
        );
        reject(error);
      }
    }
  });
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
export const updatePhase = async (phaseId: string, updatedPhase: AppPhase): Promise<void> => {
  try {
    const endpoint = `${BASE_URL}/phases/${phaseId}`; // Replace with your actual endpoint
    const response = await axios.put(endpoint, updatedPhase);
    console.log(`Updated phase with ID ${phaseId} successfully:`, response.data);
    // Optionally handle response if needed
  } catch (error) {
    handlePhaseApiError(error as AxiosError<unknown>,
      `Failed to update phase with ID ${phaseId}`,
      'UpdatePhaseErrorId'
    );
    throw error;
  }
};
