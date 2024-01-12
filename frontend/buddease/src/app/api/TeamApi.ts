import axios from 'axios';
import { Team } from '../components/models/teams/Team';

const API_BASE_URL = '/api/teams'; // Replace with your actual API endpoint

export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const addTeam = async (newTeam: Team): Promise<void> => {
  try {
    const response = await axios.post(API_BASE_URL, newTeam);
    return response.data;
  } catch (error) {
    console.error('Error adding team:', error);
    throw error;
  }
};

export const removeTeam = async (teamId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${teamId}`);
  } catch (error) {
    console.error('Error removing team:', error);
    throw error;
  }
};

export const updateTeam = async (teamId: number, newTeam: Team): Promise<void> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${teamId}`, newTeam);
    return response.data;
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const fetchTeam = async (teamId: number): Promise<void> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${teamId}`);
    return response.data.team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createTeam = async (newTeam: Team): Promise<void> => {
  try {
    await axios.post(API_BASE_URL, newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const deleteTeam = async (teamId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${teamId}`);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

// Add more functions as needed for your specific use cases
