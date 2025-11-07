// ApiUser.ts
import { UserRoleActions } from "@/app/actions/UserRoleActions";
import { createHeaders } from "@/app/api/ApiClient";
import internalApiService from '@/app/api/ApiClient'; // Use internalApiService instead
import { endpoints } from '@/app/api/endpointConfigurations';
import { UserActions } from "@/app/actions/UserActions";
import Logger from "@/app/libraries/logging/Logger";
import { UserRole } from "@/app/models/UserRole";
import { sendNotification } from "@/app/state/redux/slices/UserSlice";
import { User } from "@/app/users/User";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';

import updateUI from '@/app/documents/editing/updateUI';
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

const API_BASE_URL = endpoints.users;

interface AdminUser<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  
extends UserProfile<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  adminPermissions: string[];
  canDeleteProjects: boolean;
}

interface UserProfile<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  name: string;
  email: string;
}

export const fetchUserRequest = (userId: string) => ({
  type: "FETCH_USER_REQUEST",
  payload: userId,
});

const dispatch = useDispatch();
export const { userId } = useParams();
const parsedUserId = Number(userId);

// Helper function to construct URLs without dot-prop
const constructUrl = (basePath: string, ...pathParts: (string | number)[]): string => {
  const cleanParts = pathParts.filter(part => part != null && part !== '');
  return cleanParts.length > 0 ? `${basePath}/${cleanParts.join('/')}` : basePath;
};

class UserService <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  {
  static getCurrentUserId() {
    return parsedUserId;
  }

  // Update the createUser method to use internalApiService
  createUser = async (newUser: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    try {
      const API_ADD_ENDPOINT = constructUrl(API_BASE_URL as string, 'add');
      
      const response = await internalApiService.post(
        API_ADD_ENDPOINT,
        newUser,
        undefined, // config (optional)
        "CREATE_USER_SUCCESS", // successMessageId
        "CREATE_USER_ERROR"    // errorMessageId
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static fetchUser = async (userId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"], authToken: string) => {
    try {
      const API_SINGLE_ENDPOINT = constructUrl(API_BASE_URL as string, 'single', userId);

      const response = await internalApiService.get(
        API_SINGLE_ENDPOINT,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        },
        "FETCH_USER_SUCCESS", // successMessageId
        "FETCH_USER_ERROR"    // errorMessageId
      );

      UserActions.fetchUserSuccess({ user: response.data });
      sendNotification(`User with ID ${userId} fetched successfully`);
      
      return response.data;
    } catch (error) {
      UserActions.fetchUserFailure({ error: String(error) });
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  static fetchUserbyUserName = async (userName: string) => { 
    try {
      const API_SINGLE_BY_USERNAME_ENDPOINT = constructUrl(API_BASE_URL as string, 'single', 'username', userName);

      const response = await internalApiService.get(
        API_SINGLE_BY_USERNAME_ENDPOINT,
        undefined, // config
        "FETCH_USER_SUCCESS", // successMessageId
        "FETCH_USER_ERROR"    // errorMessageId
      );

      return response.data;
    } catch(error) {
      throw error;
    }
  }

  static fetchUserById = async (userId: string) => {
    try {
      const API_SINGLE_ENDPOINT = constructUrl(API_BASE_URL as string, 'single', userId);
      
      const response = await internalApiService.get(
        API_SINGLE_ENDPOINT,
        undefined, // config
        "FETCH_USER_SUCCESS", // successMessageId
        "FETCH_USER_ERROR"    // errorMessageId
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  fetchUserProfile = async (userId: string) => {
    try {
      const user = await this.fetchUserById(userId);
     
      const userProfile: UserProfile<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        id: user.id,
        name: user.name,
        email: user.email,
        ...user,
      };

      UserActions.fetchUserProfileSuccess({ userProfile });
      sendNotification(`User profile for user with ID ${userId} fetched successfully`);

      return userProfile;
    } catch (error) {
      UserActions.fetchUserProfileFailure({ error: String(error) });
      sendNotification(`Error fetching user profile for user with ID ${userId}: ${error}`);
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  fetchUserById = async (userId: string) => {
    try {
      const API_SINGLE_ENDPOINT = constructUrl(API_BASE_URL as string, 'single', userId);
      
      const response = await internalApiService.get(
        API_SINGLE_ENDPOINT,
        undefined, // config
        "FETCH_USER_SUCCESS", // successMessageId
        "FETCH_USER_ERROR"    // errorMessageId
      );
      
      const user = response.data;
      UserActions.fetchUserByIdSuccess({ user });
      sendNotification(`User with ID ${userId} fetched successfully`);
      return user;
    } catch (error) {
      UserActions.fetchUserByIdFailure({ error: String(error) });
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error("Error fetching user:", error);
      throw error;
    }
  };
  
  fetchUserData = async (
    req: { userId: string },
    res: {
      dispatch: Dispatch<UnknownAction>;
    }
  ) => {
    try {
      const API_LIST_ENDPOINT = constructUrl(API_BASE_URL as string, 'list', req.userId);

      const response = await internalApiService.get(
        API_LIST_ENDPOINT,
        undefined, // config
        "FETCH_USER_DATA_SUCCESS", // successMessageId
        "FETCH_USER_DATA_ERROR"    // errorMessageId
      );
      
      const userData = response.data;
      const userDataAction = UserActions.fetchUserDataSuccess(userData);
      res.dispatch(userDataAction);
      sendNotification(`User with ID ${userData.userId} fetched successfully`);
      return userData;
    } catch (error) {
      const errorAction = UserActions.fetchUserDataFailure({ error: String(error) });
      res.dispatch(errorAction);
      sendNotification(`Error fetching user with ID ${req.userId}: ${error}`);
      console.error("Error fetching user:", error);
      throw error;
    }
  };
    
  updateUser = async (userId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"], updatedUserData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    try {
      const API_UPDATE_ENDPOINT = constructUrl(API_BASE_URL as string, 'update', userId);

      const response = await internalApiService.put(
        API_UPDATE_ENDPOINT,
        updatedUserData,
        undefined, // config
        "UPDATE_USER_SUCCESS", // successMessageId
        "UPDATE_USER_ERROR"    // errorMessageId
      );
      
      const updatedUser = response.data;
      UserActions.updateUserSuccess({ user: updatedUser });
      sendNotification(`User with ID ${userId} updated successfully`);
      return updatedUser;
    } catch (error) {
      UserActions.updateUserFailure({ error: String(error) });
      sendNotification(`Error updating user with ID ${userId}: ${error}`);
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Bulk requests
  fetchUsers = async () => {
    try {
      const API_LIST_ENDPOINT = constructUrl(API_BASE_URL as string, 'list');
      
      const response = await internalApiService.get(
        API_LIST_ENDPOINT,
        undefined, // config
        "FETCH_USERS_SUCCESS", // successMessageId
        "FETCH_USERS_ERROR"    // errorMessageId
      );
      
      const users = response.data;
      UserActions.fetchUsersSuccess({ users });
      sendNotification("Users fetched successfully");
      return users;
    } catch (error) {
      UserActions.fetchUsersFailure({ error: String(error) });
      sendNotification(`Error fetching users: ${error}`);
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  updateUsers = async (updatedUsersData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    try {
      const API_UPDATE_LIST_ENDPOINT = constructUrl(API_BASE_URL as string, 'updateList');

      const response = await internalApiService.put(
        API_UPDATE_LIST_ENDPOINT,
        updatedUsersData,
        undefined, // config
        "UPDATE_USERS_SUCCESS", // successMessageId
        "UPDATE_USERS_ERROR"    // errorMessageId
      );
      
      const updatedUsers = response.data;
      UserActions.updateUsersSuccess({ users: updatedUsers });
      sendNotification("Users updated successfully");
      return updatedUsers;
    } catch (error) {
      UserActions.updateUsersFailure({ error: String(error) });
      sendNotification(`Error updating users: ${error}`);
      console.error("Error updating users:", error);
      throw error;
    }
  };

  deleteUser = async (user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    try {
      const API_REMOVE_ENDPOINT = constructUrl(API_BASE_URL as string, 'remove', user.id);

      const response = await internalApiService.delete(
        API_REMOVE_ENDPOINT,
        undefined, // config
        "DELETE_USER_SUCCESS", // successMessageId
        "DELETE_USER_ERROR"    // errorMessageId
      );
      
      UserActions.deleteUserSuccess(user as unknown as number);
      sendNotification("User deleted successfully");
      return response.data;
    } catch (error) {
      UserActions.deleteUserFailure({ error: String(error) });
      sendNotification(`Error deleting user: ${error}`);
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  deleteUsers = async (userIds: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"][]) => {
    try {
      const API_LIST_ENDPOINT = constructUrl(API_BASE_URL as string, 'list');

      await internalApiService.delete(
        API_LIST_ENDPOINT,
        { data: { userIds } }, // config with data
        "DELETE_USERS_SUCCESS", // successMessageId
        "DELETE_USERS_ERROR"    // errorMessageId
      );
      
      UserActions.deleteUsersSuccess(userIds as number[]);
      sendNotification("Users deleted successfully");
    } catch (error) {
      UserActions.deleteUsersFailure({ error: String(error) });
      sendNotification(`Error deleting users: ${error}`);
      console.error("Error deleting users:", error);
      throw error;
    }
  };

  searchUsers = async (searchQuery: string) => {
    try {
      const API_SEARCH_ENDPOINT = constructUrl(API_BASE_URL as string, 'search');

      const response = await internalApiService.get(
        `${API_SEARCH_ENDPOINT}?query=${searchQuery}`,
        undefined, // config
        "SEARCH_USERS_SUCCESS", // successMessageId
        "SEARCH_USERS_ERROR"    // errorMessageId
      );
      
      const users = response.data;
      UserActions.searchUsersSuccess({ users });
      sendNotification("Users searched successfully");
      return users;
    } catch (error) {
      UserActions.searchUsersFailure({ error: String(error) });
      sendNotification(`Error searching users: ${error}`);
      console.error("Error searching users:", error);
      throw error;
    }
  };

  // Assign role to user
  assignUserRole = async (userId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"], role: string) => {
    try {
      const API_ASSIGN_ROLE_ENDPOINT = constructUrl(API_BASE_URL as string, 'assignRole', userId);

      const response = await internalApiService.put(
        API_ASSIGN_ROLE_ENDPOINT,
        { role },
        undefined, // config
        "ASSIGN_ROLE_SUCCESS", // successMessageId
        "ASSIGN_ROLE_ERROR"    // errorMessageId
      );
      
      const assignedUser = response.data;
      UserRoleActions.assignUserRoleSuccess({ user: assignedUser });
      sendNotification(`Role assigned to user with ID ${userId} successfully`);
      return assignedUser;
    } catch (error) {
      UserRoleActions.assignUserRoleFailure({
        userId: userId as number,
        role: role as unknown as number,
        error: String(error),
      });
      sendNotification(`Error assigning role to user with ID ${userId}: ${error}`);
      console.error("Error assigning role to user:", error);
      throw error;
    }
  };

  // Update user roles in bulk
  updateUserRoles = async (users: {
    userId: string | number;
    role: UserRole;
  }) => {
    try {
      const API_BULK_UPDATE_ROLES_ENDPOINT = constructUrl(API_BASE_URL as string, 'bulkUpdateRoles');

      const response = await internalApiService.put(
        API_BULK_UPDATE_ROLES_ENDPOINT,
        { users },
        undefined, // config
        "UPDATE_ROLES_SUCCESS", // successMessageId
        "UPDATE_ROLES_ERROR"    // errorMessageId
      );
      
      const updatedUsers = response.data;
      updateUI(updatedUsers);
      Logger.log('INFO', 'User roles updated successfully');

      UserRoleActions.updateUserRolesSuccess({ users: updatedUsers });
      sendNotification('User roles updated successfully');
      
      return updatedUsers;
    } catch (error) {
      UserRoleActions.updateUserRolesFailure({ error: String(error) });
      sendNotification(`Error updating user roles: ${error}`);
      console.error('Error updating user roles:', error);
      throw error;
    }
  };

  // Other methods follow the same pattern...
  assignProjectOwner = async (userId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"], projectId: string) => {
    try {
      const API_ASSIGN_PROJECT_OWNER_ENDPOINT = constructUrl(API_BASE_URL as string, 'assignProjectOwner', userId, projectId);

      const response = await internalApiService.put(
        API_ASSIGN_PROJECT_OWNER_ENDPOINT,
        undefined, // data
        undefined, // config
        "ASSIGN_PROJECT_OWNER_SUCCESS", // successMessageId
        "ASSIGN_PROJECT_OWNER_ERROR"    // errorMessageId
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // ... other methods updated similarly
}

export default UserService;
export const userService = new UserService();
export type { AdminUser, UserProfile };