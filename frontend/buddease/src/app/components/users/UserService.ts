// UserService.ts
import axios from "axios";
import { UserActions } from "../users/UserActions";
import { User } from "./User";

const API_BASE_URL = "/api/users";

export const userService = {
  fetchUser: async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`);
      const user = response.data as User;
      // Dispatch the success action
      UserActions.fetchUserSuccess({ user });
      return user;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUserFailure({ error: String(error) });
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  updateUser: async (userId: number, updatedUserData: any) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${userId}`,
        updatedUserData
      );
      const updatedUser = response.data as User;
      // Dispatch the success action
      UserActions.updateUserSuccess({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: String(error) });
      console.error("Error updating user:", error);
      throw error;
    }
  },

  updateUserFailure: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      const user = response.data as User
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: 'Update user failed' });
      return user
    } catch (error) {
      UserActions.fetchUsersFailure({ error: String(error) });
      console.error("Error updating user:", error);
      throw error;
    }
  },


  // buk requests
  fetchUsers: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      const users = response.data as User[];
      // Dispatch the success action
      UserActions.fetchUsersSuccess({ users });
      return users;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUsersFailure({ error: String(error) });
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  updateUsers: async (updatedUsersData: { id: number; newData: any }[]) => {
    try {
      const response = await axios.put(API_BASE_URL, updatedUsersData);
      const updatedUsers = response.data as User[];
      // Dispatch the success action
      UserActions.updateUsersSuccess({ users: updatedUsers });
      return updatedUsers;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUsersFailure({ error: String(error) });
      console.error("Error updating users:", error);
      throw error;
    }
  },

  deleteUsers: async (userIds: number[]) => {
    try {
      await axios.delete(`${API_BASE_URL}`, { data: { userIds } });
      // Dispatch the success action
      UserActions.deleteUsersSuccess(userIds);
    } catch (error) {
      // Dispatch the failure action
      UserActions.deleteUsersFailure({ error: String(error) });
      console.error("Error deleting users:", error);
      throw error;
    }
  },
};

