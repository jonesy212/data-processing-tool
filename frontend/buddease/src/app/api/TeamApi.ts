import { Team } from '../components/models/teams/Team';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';





export const fetchTeams = async (): Promise<Team[]> => {
  try {
    const response = await axiosInstance.get(endpoints.teams.list); // Use the list endpoint
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};


export const getTeamMembersFromAPI = async (): Promise<Team[]> => {
  try {
    // Call the fetchTeams function from teamApi to get team members
    const teamMembers = await fetchTeams();
    return teamMembers;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

export const addTeam = async (newTeam: Team): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.teams.add, newTeam); // Use the add endpoint
  } catch (error) {
    console.error('Error adding team:', error);
    throw error;
  }
};

export const removeTeam = async (teamId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.teams.remove(teamId)); // Use the remove endpoint with teamId
  } catch (error) {
    console.error('Error removing team:', error);
    throw error;
  }
};

export const updateTeam = async (teamId: number, newTeam: Team): Promise<void> => {
  try {
    await axiosInstance.put(endpoints.teams.update(teamId), newTeam); // Use the update endpoint with teamId
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const fetchTeam = async (teamId: number): Promise<void> => {
  try {
    const response = await axiosInstance.get(endpoints.teams.single(teamId)); // Use the single endpoint with teamId
    return response.data.team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createTeam = async (newTeam: Team): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.teams.add, newTeam); // Use the add endpoint
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeams = async (updatedTeams: Team[]): Promise<void> => { 
  try {
    const teamIds = updatedTeams.map(team => team.id);
    await axiosInstance.put(endpoints.teams.updateTeams(teamIds), updatedTeams);
  } catch (error) {
    console.error('Error updating teams:', error);
    throw error;
  }
}

export const deleteTeam = async (teamId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.teams.remove(teamId)); // Use the remove endpoint with teamId
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};


