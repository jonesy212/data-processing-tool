// ApiTeam.ts
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';
const API_BASE_URL = endpoints.teams.list;
export const fetchTeams = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const createTeam = async (newTeam: any): Promise<void> => {
  try {
    await axiosInstance.post(API_BASE_URL, newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeam = async (teamId: number, updatedTeam: any): Promise<void> => {
  try {
    await axiosInstance.put(`${API_BASE_URL}/${teamId}`, updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const deleteTeam = async (teamId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/${teamId}`);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};
