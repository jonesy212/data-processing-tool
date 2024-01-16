import axios from "axios";
import { useAuth } from "../components/auth/AuthContext";
import { User } from "../components/users/User";
import { UserActions } from "../components/users/UserActions";

const API_BASE_URL = "/api/users";

const handleSuccess =
  <T>(action: (payload: T) => void) =>
  async (request: () => Promise<T>): Promise<T> => {
    try {
      const data = await request();
      action({ ...data });
      return data;
    } catch (error) {
      const errorMessage = String(error);
      console.error(`Error: ${errorMessage}`);
      throw error;
    }
  };

const handleFailure =
  (action: (payload: { error: string }) => void) =>
  async (request: () => Promise<any>): Promise<void> => {
    try {
      await request();
    } catch (error) {
      const errorMessage = String(error);
      console.error(`Error: ${errorMessage}`);
      action({ error: errorMessage });
      throw error;
    }
  };

export const userService = {
  fetchUser: handleSuccess(UserActions.fetchUserSuccess)(
    async (): Promise<{ user: User }> => {
      const response = await axios.get(`${API_BASE_URL}/${userId}`);
      return response.data as User;
    }
  ),

  updateUser: handleSuccess(UserActions.updateUserSuccess)(
      async (userId: number, updatedUserData: any): Promise<{ user: User }> => {
          try {
          const response = await axios.put(
            `${API_BASE_URL}/${userId}`,
            updatedUserData
          );
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
      const response = await axios.get(API_BASE_URL);
      return { users: response.data as User[] };
    }
  ),

  updateUsers: handleSuccess(UserActions.updateUsersSuccess)(
    async (): Promise<{ users: User[] }> => {
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
    async (): Promise<void> => {
      try {
          if (useAuth() && useAuth().state.isAuthenticated) {
            const userIds = await useMana
          const response = await axios.delete(`${API_BASE_URL}`, {
            data: { userIds },
          });
          await axios.delete(`${API_BASE_URL}`, { data: { userIds } });
          UserActions.deleteUsersSuccess(userIds);
        }
      } catch (error) {
        console.error("Error deleting users:", error);
        throw error;
      }
    }
  ),
};
