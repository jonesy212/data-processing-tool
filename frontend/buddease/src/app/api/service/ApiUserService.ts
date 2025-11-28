// ApiUserService.ts
import { UserActions } from "@/app/actions/UserActions";
import internalApiService from '@/app/api/ApiClient';
import { getEndpointUrl } from '@/app/api/endpointConfigurations';
import { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/app/typings/entities/UserEntity';
import { User } from "@/app/users/User";
import { useAuth } from "@/state/context/AuthContext";
import { observable, runInAction } from 'mobx';

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
  fetchUser: handleSuccess((payload: { user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> }) => UserActions.fetchUserSuccess(payload))(
    async (userId: number): Promise<{ user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> }> => {
      try {
        const userEndpoint = getEndpointUrl('users', 'getUser', userId);
        const response = await internalApiService.get(userEndpoint);
        return { user: response.data as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> };
      } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
      }
    }
  ),

  saveUserProfiles: handleSuccess((payload: { profiles: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] }) => UserActions.saveUserProfilesSuccess(payload))(
    async (profiles: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[]): Promise<{ profiles: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] }> => {
      try {
        const createUsersEndpoint = getEndpointUrl('users', 'createUsers');
        const response = await internalApiService.post(createUsersEndpoint, profiles);
        return { profiles: response.data as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] };
      } catch (error) {
        console.error("Error saving user profiles:", error);
      }

      return { profiles: profiles };
    },
  ),

  updateUser: handleSuccess((payload: { user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> }) => UserActions.updateUserSuccess(payload))(
    async (userId: number, updatedUserData: any): Promise<{ user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> }> => {
      try {
        const updateUserEndpoint = getEndpointUrl('users', 'updateUser', userId);
        const response = await internalApiService.put(updateUserEndpoint, updatedUserData);
        return { user: response.data as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> };
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  ),

  fetchUsers: handleSuccess(UserActions.fetchUsersSuccess)(
    async (): Promise<{ users: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] }> => {
      try {
        const listUsersEndpoint = getEndpointUrl('users', 'listUsers');
        const response = await internalApiService.get(listUsersEndpoint);
        return { users: response.data as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] };
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    }
  ),
  
  updateUsers: handleSuccess(UserActions.updateUsersSuccess)(
    async (updatedUsersData: any): Promise<{ users: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] }> => {
      try {
        const updateUsersEndpoint = getEndpointUrl('users', 'updateUsers');
        const response = await internalApiService.put(updateUsersEndpoint, updatedUsersData);
        return { users: response.data as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>[] };
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
          const deleteUsersEndpoint = getEndpointUrl('users', 'deleteUsers');
          const response = await internalApiService.delete(deleteUsersEndpoint, {
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