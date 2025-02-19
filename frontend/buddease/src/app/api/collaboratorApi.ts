
import { AxiosError } from 'axios';
import CalendarEventCollaborator from '../components/calendar/CalendarEventCollaborator';
import InvitationData from '../components/state/redux/slices/InvitationData';
import { NotificationType, useNotification } from '../components/support/NotificationContext';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

// Define the API base URL
const API_BASE_URL = endpoints.collaborators.base;

// Define notification messages for collaborator actions
interface CollaboratorNotificationMessages {
  FETCH_COLLABORATORS_ERROR: string;
  INVITE_COLLABORATOR_ERROR: string;
  // Add more keys as needed
}

const collaboratorApiNotificationMessages: CollaboratorNotificationMessages = {
  FETCH_COLLABORATORS_ERROR: 'Failed to fetch collaborators.',
  INVITE_COLLABORATOR_ERROR: 'Failed to invite collaborator.',
  // Add more messages as needed
};

// Function to handle API errors and notify for collaborators
const handleCollaboratorApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof CollaboratorNotificationMessages
) => {
  const errorMessageText = collaboratorApiNotificationMessages[errorMessageId];
  // Notify the error message
  useNotification().notify(
    errorMessageId,
    errorMessageText,
    null,
    new Date(),
    "ApiClientError" as NotificationType
  );
};

// Function to fetch collaborators
export const fetchCollaborators = async (): Promise<CalendarEventCollaborator[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    return response.data.collaborators;
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    handleCollaboratorApiErrorAndNotify(
      error as AxiosError<unknown>,
      'FETCH_COLLABORATORS_ERROR'
    );
    throw error;
  }
};

// Function to invite a collaborator
export const inviteCollaborator = async (invitationData: InvitationData): Promise<void> => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/invite`, invitationData);

    if (response.status === 200 || response.status === 201) {
      // Dispatch success action or update state accordingly
    } else {
      console.error('Failed to invite collaborator:', response.statusText);
    }
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    handleCollaboratorApiErrorAndNotify(
      error as AxiosError<unknown>,
      'INVITE_COLLABORATOR_ERROR'
    );
    throw error;
  }
};

// Add more functions for managing collaborators as needed
