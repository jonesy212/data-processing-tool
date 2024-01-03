// src/services/teamService.ts

import axios from 'axios';

const API_BASE_URL = '/api/teams'; // Adjust the API endpoint as needed

const teamService = {
  getTeamById: async (teamId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${teamId}`);
      return response.data; // Assuming the server returns the team data in the response
    } catch (error) {
      throw error; // You might want to handle errors more gracefully
    }
  },
};

export default teamService;
