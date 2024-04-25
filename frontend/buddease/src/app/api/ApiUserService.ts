import { endpoints } from '@/app/api/ApiEndpoints';
import dotProp from 'dot-prop';
import { observable, runInAction } from 'mobx';
import { CalendarActions } from '../components/actions/CalendarEventActions';
import { useAuth } from "../components/auth/AuthContext";
import { fetchEventsRequest } from '../components/state/stores/CalendarEvent';
import { User } from "../components/users/User";
import { UserActions } from "../components/users/UserActions";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.users;

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
        const response = await axiosInstance.get(`${API_BASE_URL}/${userId}`);
        return { user: response.data as User };
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
    }
  ),

  saveUserProfiles: handleSuccess((payload: { profiles: User[] }) => UserActions.saveUserProfilesSuccess(payload))(
    async (profiles: User[]): Promise<{  profiles: User[] }> => {
      try {
        const response = await axiosInstance.post(`${API_BASE_URL}`, profiles);
        return { profiles: response.data as User[] };
      } catch (error) {
        console.error("Error saving user profiles:", error);
      }

      return { profiles: profiles };
    },
  ),

  updateUser: handleSuccess((payload: { user: User }) => UserActions.updateUserSuccess(payload))(
    async (userId: number, updatedUserData: any): Promise<{ user: User }> => {
      try {
        const response = await axiosInstance.put(`${API_BASE_URL}/${userId}`, updatedUserData);
        return { user: response.data as User };
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  ),



  fetchEvents: handleSuccess((payload: any) => {CalendarActions.fetchCalendarEventsRequest();})(
    async (): Promise<any> => {
      try {
        const events =  fetchEventsRequest(); // Use the fetchEventsRequest function
        return events;
      } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
    }
  ),

  updateUserFailure: handleFailure(UserActions.updateUserFailure)(
    async (): Promise<void> => {
      try {
        const updateListEndpoint = dotProp.getProperty(API_BASE_URL, 'endpoints.updateList', 'default_endpoint_value');
        if (updateListEndpoint) {
          await axiosInstance.get(updateListEndpoint);
        } else {
          throw new Error('Update list endpoint is undefined');
        }
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  ),
  
  fetchUsers: handleSuccess(UserActions.fetchUsersSuccess)(
    async (): Promise<{ users: User[] }> => {
      try {
        const listEndpoint = dotProp.getProperty(API_BASE_URL, 'list', 'default_endpoint_value');
        if (listEndpoint) {
          const response = await axiosInstance.get(String(listEndpoint));
          return { users: response.data as User[] };
        } else {
          throw new Error('List endpoint is undefined');
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    }
  ),
  
  updateUsers: handleSuccess(UserActions.updateUsersSuccess)(
    async (updatedUsersData: any): Promise<{ users: User[] }> => {
      try {
        const updateListEndpoint = dotProp.getProperty(API_BASE_URL, 'endpoints.updateList', 'default_endpoint_value');
        if (updateListEndpoint) {
          const response = await axiosInstance.put(updateListEndpoint, updatedUsersData);
          return { users: response.data as User[] };
        } else {
          throw new Error('Update list endpoint is undefined');
        }
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
          const response = await axiosInstance.delete(`${API_BASE_URL}`, {
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
