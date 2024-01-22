// UserService.ts
import axiosInstance from "@/app/api/axiosInstance";
import { makeAutoObservable } from 'mobx';
import { UserActions } from "../users/UserActions";
import { User } from './User';

const API_BASE_URL = '/api/users';

class UserService {
  constructor() {
    makeAutoObservable(this);
  }

  fetchUser = async (userId: User['id']) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/${userId}`);
      UserActions.fetchUserSuccess({ user: response.data });
      return response.data;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUserFailure({ error: String(error) });
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  updateUser = async (userId: User['id'], updatedUserData: User) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${userId}`, updatedUserData);
      const updatedUser = response.data;
      // Dispatch the success action
      UserActions.updateUserSuccess({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: String(error) });
      console.error('Error updating user:', error);
      throw error;
    }
  };

  updateUserFailure = async () => {
    try {
      const response = await axiosInstance.get(API_BASE_URL);
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
      const response = await axiosInstance.get(API_BASE_URL);
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
      const response = await axiosInstance.put(API_BASE_URL, updatedUsersData);
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

  deleteUsers = async (userIds: User['id'][]) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}`, { data: { userIds } });
      // Dispatch the success action
      UserActions.deleteUsersSuccess(userIds as User['id'][] as number[]);
    } catch (error) {
      // Dispatch the failure action
      UserActions.deleteUsersFailure({ error: String(error) });
      console.error('Error deleting users:', error);
      throw error;
    }
  };
}

const userService = new UserService();
export default userService;
