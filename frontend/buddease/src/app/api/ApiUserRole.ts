// ApiUserRoe.ts
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.userRoles.list;

export const fetchUserRoles = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
};

export const createUserRole = async (newRole: any): Promise<void> => {
  try {
    await axiosInstance.post(API_BASE_URL, newRole);
  } catch (error) {
    console.error('Error creating user role:', error);
    throw error;
  }
};

export const updateUserRole = async (roleId: number, updatedRole: any): Promise<void> => {
  try {
    await axiosInstance.put(endpoints.userRoles.single(roleId), updatedRole);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUserRole = async (roleId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.userRoles.single(roleId));
  } catch (error) {
    console.error('Error deleting user role:', error);
    throw error;
  }
};
