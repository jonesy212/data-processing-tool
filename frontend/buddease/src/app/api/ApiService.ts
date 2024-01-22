import axios from "axios";
import { observable, runInAction } from 'mobx';
import { useAuth } from "../components/auth/AuthContext";
import { User } from "../components/users/User";
import { UserActions } from "../components/users/UserActions";

const API_BASE_URL = "/api/users";

const handleSuccess = <T>(action: (payload: T) => void) => async (
  request: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T> => {
  try {
    const data = await request(...args);
    runInAction(() => {
      action({ ...data });
    });
    return data;
  } catch (error) {
    const errorMessage = String(error);
    console.error(`Error: ${errorMessage}`);
    throw error;
  }
};

const handleFailure = (action: (payload: { error: string }) => void) => async (
  request: (...args: any[]) => Promise<void>,
  ...args: any[]
): Promise<void> => {
  try {
    await request(...args);
  } catch (error) {
    const errorMessage = String(error);
    console.error(`Error: ${errorMessage}`);
    runInAction(() => {
      action({ error: errorMessage });
    });
    throw error;
  }
};

export const userApiService = observable({
  fetchUser: handleSuccess((payload: { user: User }) => UserActions.fetchUserSuccess(payload))(
    async (userId: number): Promise<{ user: User }> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${userId}`);
        return { user: response.data as User };
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
    }
  ),

  updateUser: handleSuccess((payload: { user: User }) => UserActions.updateUserSuccess(payload))(
    async (userId: number, updatedUserData: any): Promise<{ user: User }> => {
      try {
        const response = await axios.put(`${API_BASE_URL}/${userId}`, updatedUserData);
        return { user: response.data as User };
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  ),

  updateUserFailure: handleFailure(UserActions.updateUserFailure)(
    async (): Promise<void> => {
      try {
        await axios.get(API_BASE_URL);
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  ),

  fetchUsers: handleSuccess(UserActions.fetchUsersSuccess)(
    async (): Promise<{ users: User[] }> => {
      try {
        const response = await axios.get(API_BASE_URL);
        return { users: response.data as User[] };
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    }
  ),

  updateUsers: handleSuccess(UserActions.updateUsersSuccess)(
    async (updatedUsersData: any): Promise<{ users: User[] }> => {
      try {
        const response = await axios.put(API_BASE_URL, updatedUsersData);
        return { users: response.data as User[] };
      } catch (error) {
        console.error("Error updating users:", error);
        throw error;
      }
    }
  ),

  deleteUsers: handleFailure(UserActions.deleteUsersFailure)(
    async (userIds: number[]): Promise<void> => {
      try {
        if (useAuth() && useAuth().state.isAuthenticated) {
          const response = await axios.delete(`${API_BASE_URL}`, {
            data: { userIds },
          });
          runInAction(() => {
            UserActions.deleteUsersSuccess(userIds);
          });
        }
      } catch (error) {
        console.error("Error deleting users:", error);
        throw error;
      }
    }
  ),
});

// todo connect the root sagas as where api Servicer first looks to connect the natural language processor
