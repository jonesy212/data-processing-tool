ApiUserRole.ts
import internalApiService from "@/core/api/ApiClient";

import { endpoints } from '@/core/api/endpointConfigurations';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";
import { AxiosError } from 'axios';

Define notification messages for user roles API
interface UserRoleNotificationMessages {
  FETCH_USER_ROLES_SUCCESS: string;
  FETCH_USER_ROLES_ERROR: string;
  CREATE_USER_ROLE_SUCCESS: string;
  CREATE_USER_ROLE_ERROR: string;
  UPDATE_USER_ROLE_SUCCESS: string;
  UPDATE_USER_ROLE_ERROR: string;
  DELETE_USER_ROLE_SUCCESS: string;
  DELETE_USER_ROLE_ERROR: string;
  GET_USER_ROLE_SUCCESS: string;
  GET_USER_ROLE_ERROR: string;
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
  GET_USER_ROLE_SUCCESS: 'User role fetched successfully',
  GET_USER_ROLE_ERROR: 'Failed to fetch user role',
};

Function to handle API errors and notify
const handleUserRoleApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof UserRoleNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get error message directly from the messages object
  const errorMessage = userRoleNotificationMessages[errorMessageId] || 'Unknown error';
  
  // Enhanced error message based on HTTP status
  let userFriendlyMessage = errorMessage;
  
  if (error.response) {
    switch (error.response.status) {
      case 400:
        userFriendlyMessage = 'Invalid user role data';
        break;
      case 401:
        userFriendlyMessage = 'Authentication required for user role operations';
        break;
      case 403:
        userFriendlyMessage = 'Permission denied for user role operation';
        break;
      case 404:
        userFriendlyMessage = 'User role not found';
        break;
      case 409:
        userFriendlyMessage = 'User role conflict';
        break;
      case 422:
        userFriendlyMessage = 'User role validation failed';
        break;
      case 500:
        userFriendlyMessage = 'Server error while processing user role';
        break;
    }
  } else if (error.request) {
    userFriendlyMessage = 'Network error: Unable to connect to user role service';
  }
  
  // Log error
  console.error('User Role API Error:', {
    messageId: errorMessageId,
    message: userFriendlyMessage,
    originalError: error.message,
    statusCode: error.response?.status,
    additionalData
  });
  
  // Send notification using object format
  notify({
    id: `user_role_error_${errorMessageId}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'user_role',
      entityId: additionalData?.roleId?.toString() || 'unknown',
      action: errorMessageId.toLowerCase().replace('_error', ''),
      originalError: error.message,
      statusCode: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      errorType: errorMessageId,
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const,
    metadata: {
      isUserRoleError: true,
      operation: errorMessageId.replace('_ERROR', '').toLowerCase()
    }
  });
  
  throw error;
};

Helper function to get endpoint for single user role
const getUserRoleEndpoint = (roleId: number): string => {
  // Access endpoints directly without dotProp
  if (endpoints.userRoles?.single) {
    // Check if it's a function or a string
    if (typeof endpoints.userRoles.single === 'function') {
      return endpoints.userRoles.single(roleId);
    } else {
      return endpoints.userRoles.single.replace(':id', roleId.toString());
    }
  }
  
  // Fallback to default pattern if endpoint structure is different
  return `${endpoints.userRoles?.list || '/api/user-roles'}/${roleId}`;
};

export const fetchUserRoles = async (): Promise<any[]> => {
  try {
    const apiBaseUrl = endpoints.userRoles?.list || '/api/user-roles';
    const response = await internalApiService.get(apiBaseUrl);
    const userRoles = response.data;
    
    // Success notification using object format
    const { notify } = useNotification();
    notify({
      id: `user_roles_fetch_success_${Date.now()}`,
      message: userRoleNotificationMessages.FETCH_USER_ROLES_SUCCESS,
      data: {
        entityType: 'user_role',
        action: 'fetch_all',
        count: userRoles.length,
        responseData: userRoles,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        operation: 'fetch_user_roles',
        count: userRoles.length
      }
    });

    return userRoles;
  } catch (error) {
    handleUserRoleApiErrorAndNotify(error as AxiosError<unknown>, 'FETCH_USER_ROLES_ERROR');
  }
  return [];
};

export const createUserRole = async (newRole: any): Promise<void> => {
  try {
    const apiBaseUrl = endpoints.userRoles?.list || '/api/user-roles';
    const response = await internalApiService.post(apiBaseUrl, newRole);

    // Success notification using object format
    const { notify } = useNotification();
    notify({
      id: `user_role_create_success_${Date.now()}`,
      message: userRoleNotificationMessages.CREATE_USER_ROLE_SUCCESS,
      data: {
        entityType: 'user_role',
        entityId: response.data?.id || 'new',
        action: 'create',
        roleData: newRole,
        responseData: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        operation: 'create_user_role',
        roleType: newRole.type,
        permissionCount: newRole.permissions?.length || 0
      }
    });
  } catch (error) {
    handleUserRoleApiErrorAndNotify(
      error as AxiosError<unknown>, 
      'CREATE_USER_ROLE_ERROR',
      { roleData: newRole }
    );
  }
};

export const updateUserRole = async (roleId: number, updatedRole: any): Promise<void> => {
  try {
    const endpoint = getUserRoleEndpoint(roleId);
    
    if (!endpoint) {
      throw new Error(`Endpoint for user role ${roleId} not found`);
    }

    const response = await internalApiService.put(endpoint, updatedRole);

    // Success notification using object format
    const { notify } = useNotification();
    notify({
      id: `user_role_update_success_${roleId}_${Date.now()}`,
      message: userRoleNotificationMessages.UPDATE_USER_ROLE_SUCCESS,
      data: {
        entityType: 'user_role',
        entityId: roleId.toString(),
        action: 'update',
        roleData: updatedRole,
        responseData: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        operation: 'update_user_role',
        roleId: roleId
      }
    });
  } catch (error) {
    handleUserRoleApiErrorAndNotify(
      error as AxiosError<unknown>, 
      'UPDATE_USER_ROLE_ERROR',
      { roleId, roleData: updatedRole }
    );
  }
};

export const deleteUserRole = async (roleId: number): Promise<void> => {
  try {
    const endpoint = getUserRoleEndpoint(roleId);
    
    if (!endpoint) {
      throw new Error(`Endpoint for user role ${roleId} not found`);
    }

    await internalApiService.delete(endpoint);

    // Success notification using object format
    const { notify } = useNotification();
    notify({
      id: `user_role_delete_success_${roleId}_${Date.now()}`,
      message: userRoleNotificationMessages.DELETE_USER_ROLE_SUCCESS,
      data: {
        entityType: 'user_role',
        entityId: roleId.toString(),
        action: 'delete',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        operation: 'delete_user_role',
        roleId: roleId
      }
    });
  } catch (error) {
    handleUserRoleApiErrorAndNotify(
      error as AxiosError<unknown>, 
      'DELETE_USER_ROLE_ERROR',
      { roleId }
    );
  }
};

Additional user role API functions with consistent notification pattern

export const getUserRoleById = async (roleId: number): Promise<any> => {
  try {
    const endpoint = getUserRoleEndpoint(roleId);
    
    if (!endpoint) {
      throw new Error(`Endpoint for user role ${roleId} not found`);
    }

    const response = await internalApiService.get(endpoint);
    const roleData = response.data;

    // Success notification
    const { notify } = useNotification();
    notify({
      id: `user_role_fetch_success_${roleId}_${Date.now()}`,
      message: userRoleNotificationMessages.GET_USER_ROLE_SUCCESS,
      data: {
        entityType: 'user_role',
        entityId: roleId.toString(),
        action: 'fetch',
        responseData: roleData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        operation: 'get_user_role',
        roleId: roleId
      }
    });

    return roleData;
  } catch (error) {
    handleUserRoleApiErrorAndNotify(
      error as AxiosError<unknown>, 
      'GET_USER_ROLE_ERROR',
      { roleId }
    );
  }
  return null;
};

Add other user role-related actions as needed

Export the error handler if needed elsewhere
export { handleUserRoleApiErrorAndNotify };
