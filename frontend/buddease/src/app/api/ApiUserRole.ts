import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import dotProp from 'dot-prop';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

// Define the base URL for user roles API
const API_BASE_URL = endpoints.userRoles.list;

// Define notification messages for user roles API
interface UserRoleNotificationMessages {
  FETCH_USER_ROLES_SUCCESS: string;
  FETCH_USER_ROLES_ERROR: string;
  CREATE_USER_ROLE_SUCCESS: string;
  CREATE_USER_ROLE_ERROR: string;
  UPDATE_USER_ROLE_SUCCESS: string;
  UPDATE_USER_ROLE_ERROR: string;
  DELETE_USER_ROLE_SUCCESS: string;
  DELETE_USER_ROLE_ERROR: string;
  // Add more keys as needed
}

const userRoleNotificationMessages: UserRoleNotificationMessages = {
  FETCH_USER_ROLES_SUCCESS: 'User roles fetched successfully',
  FETCH_USER_ROLES_ERROR: 'Failed to fetch user roles',
  CREATE_USER_ROLE_SUCCESS: 'User role created successfully',
  CREATE_USER_ROLE_ERROR: 'Failed to create user role',
  UPDATE_USER_ROLE_SUCCESS: 'User role updated successfully',
  UPDATE_USER_ROLE_ERROR: 'Failed to update user role',
  DELETE_USER_ROLE_SUCCESS: 'User role deleted successfully',
  DELETE_USER_ROLE_ERROR: 'Failed to delete user role',
  // Add more properties as needed
};

// Function to handle API errors and notify

// Function to handle API errors and notify
const handleUserRoleApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof UserRoleNotificationMessages
) => {
  console.error('Error:', error);

  const errorMessage = dotProp.getProperty(userRoleNotificationMessages, errorMessageId) || 'Unknown error';
  useNotification().notify(
    errorMessageId,
    errorMessage,
    null,
    new Date(),
    NotificationTypeEnum.Error
  );
  throw error;
};

export const fetchUserRoles = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    const userRoles = response.data;
    
    // Notify success
    const successMessage = userRoleNotificationMessages.FETCH_USER_ROLES_SUCCESS;
    useNotification().notify(
      'FETCH_USER_ROLES_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );

    return userRoles;
  } catch (error) {
    handleUserRoleApiErrorAndNotify(error as AxiosError<unknown>, 'FETCH_USER_ROLES_ERROR');
  }
  return [];
};

export const createUserRole = async (newRole: any): Promise<void> => {
  try {
    await axiosInstance.post(`${API_BASE_URL}`, newRole);

    // Notify success
    const successMessage = userRoleNotificationMessages.CREATE_USER_ROLE_SUCCESS;
    useNotification().notify(
      'CREATE_USER_ROLE_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    handleUserRoleApiErrorAndNotify(error as AxiosError<unknown>, 'CREATE_USER_ROLE_ERROR');
  }
};


export const updateUserRole = async (roleId: number, updatedRole: any): Promise<void> => {
  try {
    const endpointPath = `userRoles.single(${roleId})`; // Define the dotProp path to the endpoint
    const endpoint = dotProp.getProperty(endpoints, endpointPath) as string | undefined; // Retrieve the endpoint using dotProp

    if (!endpoint) {
      throw new Error(`${endpointPath} endpoint not found`);
    }

    await axiosInstance.put(endpoint, updatedRole);

    // Notify success
    const successMessage = userRoleNotificationMessages.UPDATE_USER_ROLE_SUCCESS;
    useNotification().notify(
      'UPDATE_USER_ROLE_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    handleUserRoleApiErrorAndNotify(error as AxiosError<unknown>, 'UPDATE_USER_ROLE_ERROR');
  }
};

export const deleteUserRole = async (roleId: number): Promise<void> => {
  try {
    const endpointPath = `userRoles.single(${roleId})`; // Define the dotProp path to the endpoint
    const endpoint = dotProp.getProperty(endpoints, endpointPath) as string | undefined; // Retrieve the endpoint using dotProp

    if (!endpoint) {
      throw new Error(`${endpointPath} endpoint not found`);
    }

    await axiosInstance.delete(endpoint);

    // Notify success
    const successMessage = userRoleNotificationMessages.DELETE_USER_ROLE_SUCCESS;
    useNotification().notify(
      'DELETE_USER_ROLE_SUCCESS',
      successMessage,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error) {
    handleUserRoleApiErrorAndNotify(error as AxiosError<unknown>, 'DELETE_USER_ROLE_ERROR');
  }
};


// Add other user role-related actions as needed
