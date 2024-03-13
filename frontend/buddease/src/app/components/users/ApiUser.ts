// ApiUser.ts
import { createHeaders } from "@/app/api/ApiClient";
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import dotProp from 'dot-prop';
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { User } from './User';
import { UserActions } from "./UserActions";
import { sendNotification } from "./UserSlice";
// Other imports remain unchanged

const API_BASE_URL = dotProp.getProperty(endpoints, 'users');

export const fetchUserRequest = (userId: string) => ({
  type: 'FETCH_USER_REQUEST',
  payload: userId,
});

const dispatch = useDispatch();

// Dispatching the action
const { userId } = useParams(); // Extract userId from URL params

// Convert userId to a number
const parsedUserId = Number(userId);
// Calling API_BASE_URL.single to get the URL string
const url: string | undefined = dotProp.getProperty(API_BASE_URL, 'single', [parsedUserId]) as string | undefined;

// Dispatching the action with the correct userId
dispatch(UserActions.fetchUserRequest({ userId: parsedUserId }));



class UserService {
  // Constructor remains unchanged

  createUser = async (newUser: User) => {
    try {
      const API_ADD_ENDPOINT = dotProp.getProperty(API_BASE_URL, 'add') as string;
      if (!API_ADD_ENDPOINT) {
        throw new Error('Add endpoint not found');
      }

      // Call createHeaders function to get the headers configuration
      const headers = createHeaders();

      const response = await axiosInstance.post(API_ADD_ENDPOINT, newUser, {
        headers: headers, // Pass headers configuration in the request
      });
      UserActions.createUserSuccess({ user: response.data });
      sendNotification(`User ${newUser.username} created successfully`);
      return response.data;
    } catch (error) {
      UserActions.createUserFailure({ error: String(error) });
      sendNotification(`Error creating user: ${error}`);
      console.error('Error creating user:', error);
      throw error;
    }
  }


  fetchUser = async (userId: User['id']) => {
    try {
      const API_SINGLE_ENDPOINT = dotProp.getProperty(API_BASE_URL, 'single', [Number(userId)]) as string;
      if (!API_SINGLE_ENDPOINT) {
        throw new Error('Single endpoint not found');
      }
      const response = await axiosInstance.get(API_SINGLE_ENDPOINT);
      UserActions.fetchUserSuccess({ user: response.data });
      sendNotification(`User with ID ${userId} fetched successfully`);
      return response.data;
    } catch (error) {
      UserActions.fetchUserFailure({ error: String(error) });
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  fetchUserById = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`${dotProp.getProperty(API_BASE_URL, 'single', [Number(userId)])}`);
      const user = response.data;
      // Dispatch the success action
      UserActions.fetchUserByIdSuccess({ user });
      sendNotification(`User with ID ${userId} fetched successfully`);
      return user;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUserByIdFailure({ error: String(error) });
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  fetchUserByIdSuccess = async () => {
    try {
      const API_LIST_ENDPOINT = dotProp.getProperty(API_BASE_URL, 'list') as string;
      if (!API_LIST_ENDPOINT) {
        throw new Error('List endpoint not found');
      }
  
      const response = await axiosInstance.get(API_LIST_ENDPOINT);
      const user = response.data;
      // Dispatch the success action
      UserActions.fetchUserByIdSuccess({ user: user.id });
      sendNotification(`User with ID ${user} fetched successfully`);
      return user;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUserByIdFailure({ error: String(error) });
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error('Error fetching user:', error);
      throw error;
    }
  }
  

  updateUser = async (userId: User['id'], updatedUserData: User) => {
    try {
      const response = await axiosInstance.put(`${dotProp.getProperty(API_BASE_URL, 'update', [userId as number])}`, updatedUserData);
      const updatedUser = response.data;
      UserActions.updateUserSuccess({ user: updatedUser });
      sendNotification(`User with ID ${userId} updated successfully`);
      return updatedUser;
    } catch (error) {
      UserActions.updateUserFailure({ error: String(error) });
      sendNotification(`Error updating user with ID ${userId}: ${error}`);
      console.error('Error updating user:', error);
      throw error;
    }
  };

  updateUserFailure = async () => {
    try {
      const API_LIST_ENDPOINT = dotProp.getProperty(API_BASE_URL, 'list') as string;
      if (!API_LIST_ENDPOINT) {
        throw new Error('List endpoint not found');
      }
  
      const response = await axiosInstance.get(API_LIST_ENDPOINT);
      const user = response.data;
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: 'Update user failed' });
      sendNotification('Failed to update user');
      return user;
    } catch (error) {
      UserActions.fetchUsersFailure({ error: String(error) });
      sendNotification(`Error updating user: ${error}`);
      console.error('Error updating user:', error);
      throw error;
    }
  };
  // Bulk requests
  fetchUsers = async () => {
    try {
      const listEndpoint = dotProp.getProperty(API_BASE_URL, 'list') as string;
      if (!listEndpoint) {
        throw new Error('List endpoint not found');
      }
      const response = await axiosInstance.get(listEndpoint);
      const users = response.data;
      // Dispatch the success action
      UserActions.fetchUsersSuccess({ users });
      sendNotification('Users fetched successfully');
      return users;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUsersFailure({ error: String(error) });
      sendNotification(`Error fetching users: ${error}`);
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  updateUsers = async (updatedUsersData: User) => {
    try {
      const updateListEndpoint = dotProp.getProperty(API_BASE_URL, 'updateList') as string;
      if (!updateListEndpoint) {
        throw new Error('Update list endpoint not found');
      }
      const response = await axiosInstance.put(updateListEndpoint, updatedUsersData);
      const updatedUsers = response.data;
      // Dispatch the success action
      UserActions.updateUsersSuccess({ users: updatedUsers });
      sendNotification('Users updated successfully');
      return updatedUsers;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUsersFailure({ error: String(error) });
      sendNotification(`Error updating users: ${error}`);
      console.error('Error updating users:', error);
      throw error;
    }
  };

  deleteUser = async (user: User) => {
    try {
      const removeEndpoint = dotProp.getProperty(API_BASE_URL, 'remove', [user.id as number]) as string;
      if (!removeEndpoint) {
        throw new Error('Remove endpoint not found');
      }
      const response = await axiosInstance.delete(removeEndpoint);
      // Dispatch success action
      UserActions.deleteUserSuccess(user as unknown as number);
      sendNotification('User deleted successfully');
      return response.data;
    } catch (error) {
      // Dispatch failure action
      UserActions.deleteUserFailure({ error: String(error) });
      sendNotification(`Error deleting user: ${error}`);
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  deleteUsers = async (userIds: User['id'][]) => {
    try {
      const listEndpoint = dotProp.getProperty(API_BASE_URL, 'list') as string;
      if (!listEndpoint) {
        throw new Error('List endpoint not found');
      }
      await axiosInstance.delete(listEndpoint, { data: { userIds } });
      // Dispatch the success action
      UserActions.deleteUsersSuccess(userIds as User['id'][] as number[]);
      sendNotification('Users deleted successfully');
    } catch (error) {
      // Dispatch the failure action
      UserActions.deleteUsersFailure({ error: String(error) });
      sendNotification(`Error deleting users: ${error}`);
      console.error('Error deleting users:', error);
      throw error;
    }
  };

  searchUsers = async (searchQuery: string) => {
    try {
      const searchEndpoint = dotProp.getProperty(API_BASE_URL, 'search') as string;
      if (!searchEndpoint) {
        throw new Error('Search endpoint not found');
      }
      const response = await axiosInstance.get(`${searchEndpoint}?query=${searchQuery}`);
      const users = response.data;
      UserActions.searchUsersSuccess({ users });
      sendNotification('Users searched successfully');
      return users;
    } catch (error) {
      UserActions.searchUsersFailure({ error: String(error) });
      sendNotification(`Error searching users: ${error}`);
      console.error('Error searching users:', error);
      throw error;
    }
  };

  updateUserRole = async (userId: User['id'], role: User['role']) => {
    try {
      const updateRoleEndpoint = dotProp.getProperty(API_BASE_URL, 'updateRole', [userId as number]) as string;
      if (!updateRoleEndpoint) {
        throw new Error('Update role endpoint not found');
      }
      const response = await axiosInstance.put(updateRoleEndpoint, { role });
      const updatedUser = response.data;
      UserActions.updateUserRoleSuccess({ user: updatedUser });
      sendNotification(`User with ID ${userId} updated successfully`);
      return updatedUser;
    } catch (error) {
      UserActions.updateUserRoleFailure({ error: String(error) });
      sendNotification(`Error updating user with ID ${userId}: ${error}`);
      console.error('Error updating user:', error);
      throw error;
    }
  };
}

const userService = new UserService();
export default userService;
