// UserService.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { makeAutoObservable } from 'mobx';
import { UserActions } from "../users/UserActions";
import { User } from './User';
import { sendNotification } from "./UserSlice";

const API_BASE_URL = endpoints.users.list;

class UserService {
  constructor() {
    makeAutoObservable(this);
  }


  createUser = async (newUser: User) => { 
    try {
      const response = await axiosInstance.post(API_BASE_URL, newUser);
      UserActions.createUserSuccess({ user: response.data });
      sendNotification(`User ${newUser.name} created successfully`);
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
      const response = await axiosInstance.get(`${API_BASE_URL.single(userId as number)}`);
      UserActions.fetchUserSuccess({ user: response.data });
      // Notify user about successful fetch
      sendNotification(`User with ID ${userId} fetched successfully`);
      return response.data;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUserFailure({ error: String(error) });

      // Notify user about fetch failure
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  updateUser = async (userId: User['id'], updatedUserData: User) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL.update(userId as number)}`, updatedUserData);
      const updatedUser = response.data;
      // Dispatch the success action
      UserActions.updateUserSuccess({ user: updatedUser });

      // Notify user about successful update
      sendNotification(`User with ID ${userId} updated successfully`);

      return updatedUser;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: String(error) });

      sendNotification(`Error updating user with ID ${userId}: ${error}`);
      console.error('Error updating user:', error);
      throw error;
    }
  };

  updateUserFailure = async () => {
    try {
      const response = await axiosInstance.get(API_BASE_URL.list);
      const user = response.data;
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: 'Update user failed' });
      return user;
    } catch (error) {
      UserActions.fetchUsersFailure({ error: String(error) });
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Bulk requests
  fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_BASE_URL.list);
      const users = response.data;
      // Dispatch the success action
      UserActions.fetchUsersSuccess({ users });
      return users;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUsersFailure({ error: String(error) });
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  updateUsers = async (updatedUsersData: User) => {
    try {
      const response = await axiosInstance.put(API_BASE_URL.updateList, updatedUsersData);
      const updatedUsers = response.data;
      // Dispatch the success action
      UserActions.updateUsersSuccess({ users: updatedUsers });
      return updatedUsers;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUsersFailure({ error: String(error) });
      console.error('Error updating users:', error);
      throw error;
    }
  };

  deleteUser = async (user: User) => { 
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL.remove(user.id as number)}`);
      // Dispatch success action
      UserActions.deleteUserSuccess(user as unknown as number);
      return response.data;
    } catch (error) {
      // Dispatch failure action
      UserActions.deleteUserFailure({ error: String(error) });
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  

  deleteUsers = async (userIds: User['id'][]) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL.list}`, { data: { userIds } });
      // Dispatch the success action
      UserActions.deleteUsersSuccess(userIds as User['id'][] as number[]);
    } catch (error) {
      // Dispatch the failure action
      UserActions.deleteUsersFailure({ error: String(error) });
      console.error('Error deleting users:', error);
      throw error;
    }
  };

  searchUsers = async (searchQuery: string) => { 
    try {
      const response = await axiosInstance.get(`${API_BASE_URL.search}?query=${searchQuery}`);
      const users = response.data;
      UserActions.searchUsersSuccess({ users });
      return users;
    } catch (error) {
      UserActions.searchUsersFailure({ error: String(error) });
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
