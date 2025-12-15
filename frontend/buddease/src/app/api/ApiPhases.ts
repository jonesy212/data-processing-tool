// ApiPhases.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/app/state/context/NotificationContext';
import { AppPhase } from '@/app/typings/entities/PhaseEntity';
import { logPhaseError } from '@/app/hooks/phaseHooks/CollaborationPhaseHooks'
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

const handleApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof PhaseNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessageText = apiNotificationMessages[errorMessageId] || errorMessage;
  
  // Create more detailed error message based on HTTP status
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    switch (axiosError.response.status) {
      case 400:
        userFriendlyMessage = "Invalid phase data provided";
        break;
      case 401:
        userFriendlyMessage = "Authentication required for phase operation";
        break;
      case 403:
        userFriendlyMessage = "You don't have permission to perform this phase operation";
        break;
      case 404:
        userFriendlyMessage = "Phase not found";
        break;
      case 409:
        userFriendlyMessage = "Phase conflict occurred";
        break;
      case 422:
        userFriendlyMessage = "Phase validation failed";
        break;
      case 500:
        userFriendlyMessage = "Server error while processing phase";
        break;
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error: Unable to connect to phase server";
  }
  
  // Show notification using consistent object format
  notify({
    id: `phase_error_${errorMessageId}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'phase',
      entityId: additionalData?.phaseId || additionalData?.id || 'unknown',
      action: additionalData?.action || errorMessageId.toLowerCase().replace('_error', ''),
      originalError: axiosError.message,
      statusCode: axiosError.response?.status,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
  
  // Call the original error handler with the enhanced message
  handleApiError(error, userFriendlyMessage);
  
  // Optional: Log to analytics or monitoring service
  logPhaseError({
    errorMessageId,
    error: axiosError,
    userMessage: userFriendlyMessage,
    additionalData
  });
};


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
