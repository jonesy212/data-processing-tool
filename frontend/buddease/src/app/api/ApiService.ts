import { observable, runInAction } from 'mobx';
import { useAuth } from "../components/auth/AuthContext";
import { CalendarActions } from '../components/calendar/CalendarActions';
import { fetchEventsRequest } from '../components/state/stores/CalendarEvent';
import { User } from "../components/users/User";
import { UserActions } from "../components/users/UserActions";
import { endpoints } from './ApiEndpoints';
import axiosInstance from "./axiosInstance";
import { endpoints } from '@/app/api/ApiEndpoints';

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
        await axiosInstance.get(API_BASE_URL.endpoints.updateList);
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  ),

  fetchUsers: handleSuccess(UserActions.fetchUsersSuccess)(
    async (): Promise<{ users: User[] }> => {
      try {
        const response = await axiosInstance.get(API_BASE_URL.list);
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
        const response = await axiosInstance.put(API_BASE_URL.updateList, updatedUsersData);
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
