// ApiUser.ts
import { UserRoleActions } from "@/app/actions/UserRoleActions";
import { createHeaders } from "@/app/api/ApiClient";
import internalApiService from '@/app/api/ApiClient'; // Use internalApiService instead
import { endpoints } from '@/app/api/endpointConfigurations';
import { UserActions } from "@/app/actions/UserActions";
import Logger from "@/app/logging/Logger";
import { UserRole } from "@/app/models/UserRole";
import { sendNotification } from "@/app/state/redux/slices/UserSlice";
import { User } from "@/app/users/User";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { buildUrl } from '@/utils/urlBuilder'; 

import { Attachment } from '@/app/documents/attachment/Attachment';

import updateUI from '@/app/documents/editing/updateUI';
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

const userEndpoints = endpoints.users;

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

export const { userId } = useParams();
const parsedUserId = Number(userId);


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

  // Update the createUser method to use buildUrl
  createUser = async (newUser: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    try {
      const url = buildUrl(userEndpoints.add);
      
      const response = await internalApiService.post(
        url,
        newUser,
        undefined,
        "CREATE_USER_SUCCESS",
        "CREATE_USER_ERROR"
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  static fetchUser = async (userId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"], authToken: string) => {
    try {
      const url = buildUrl(userEndpoints.single, { userId: Number(userId) });

      const response = await internalApiService.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        },
        "FETCH_USER_SUCCESS",
        "FETCH_USER_ERROR"
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
      const url = buildUrl(userEndpoints.singleByUsername, { username: userName });

      const response = await internalApiService.get(
        url,
        undefined,
        "FETCH_USER_SUCCESS",
        "FETCH_USER_ERROR"
      );

      return response.data;
    } catch(error) {
      throw error;
    }
  }

  static fetchUserById = async (userId: string) => {
    try {
      const url = buildUrl(userEndpoints.single, { userId: Number(userId) });
      
      const response = await internalApiService.get(
        url,
        undefined,
        "FETCH_USER_SUCCESS",
        "FETCH_USER_ERROR"
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
      const url = buildUrl(userEndpoints.single, { userId: Number(userId) });
      
      const response = await internalApiService.get(
        url,
        undefined,
        "FETCH_USER_SUCCESS",
        "FETCH_USER_ERROR"
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
      const url = buildUrl(userEndpoints.list, { userId: req.userId });

      const response = await internalApiService.get(
        url,
        undefined,
        "FETCH_USER_DATA_SUCCESS",
        "FETCH_USER_DATA_ERROR"
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
      const url = buildUrl(userEndpoints.update, { userId: Number(userId) });

      const response = await internalApiService.put(
        url,
        updatedUserData,
        undefined,
        "UPDATE_USER_SUCCESS",
        "UPDATE_USER_ERROR"
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
      const url = buildUrl(userEndpoints.list);
      
      const response = await internalApiService.get(
        url,
        undefined,
        "FETCH_USERS_SUCCESS",
        "FETCH_USERS_ERROR"
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
      const url = buildUrl(userEndpoints.updateList);

      const response = await internalApiService.put(
        url,
        updatedUsersData,
        undefined,
        "UPDATE_USERS_SUCCESS",
        "UPDATE_USERS_ERROR"
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
      const url = buildUrl(userEndpoints.remove, { userId: Number(user.id) });

      const response = await internalApiService.delete(
        url,
        undefined,
        "DELETE_USER_SUCCESS",
        "DELETE_USER_ERROR"
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
      const url = buildUrl(userEndpoints.list);

      await internalApiService.delete(
        url,
        { data: { userIds: userIds.map(id => Number(id)) } },
        "DELETE_USERS_SUCCESS",
        "DELETE_USERS_ERROR"
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
      const url = buildUrl(userEndpoints.search, { query: searchQuery });

      const response = await internalApiService.get(
        url,
        undefined,
        "SEARCH_USERS_SUCCESS",
        "SEARCH_USERS_ERROR"
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
      const url = buildUrl(userEndpoints.assignRole, { userId: Number(userId) });

      const response = await internalApiService.put(
        url,
        { role },
        undefined,
        "ASSIGN_ROLE_SUCCESS",
        "ASSIGN_ROLE_ERROR"
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
      const url = buildUrl(userEndpoints.bulkUpdateRoles);

      const response = await internalApiService.put(
        url,
        { users },
        undefined,
        "UPDATE_ROLES_SUCCESS",
        "UPDATE_ROLES_ERROR"
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
      const url = buildUrl(userEndpoints.assignProjectOwner, { 
        userId: Number(userId), 
        projectId 
      });

      const response = await internalApiService.put(
        url,
        undefined,
        undefined,
        "ASSIGN_PROJECT_OWNER_SUCCESS",
        "ASSIGN_PROJECT_OWNER_ERROR"
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

