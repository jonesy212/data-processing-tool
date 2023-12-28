// src/services/dataAnalysisService.ts

import axios from 'axios';

const API_BASE_URL = 'http://your-backend-api-base-url';

const dataAnalysisService = {
  getDataByProjectId: async (projectId: string) => {
    // Implement this method based on your actual backend API endpoint
    const response = await axios.get(`${API_BASE_URL}/api/data`, {
      headers: { Accept: 'application/vnd.yourapp.v1+json' }, // Example header for version 1
    });
    return response.data;
  },

  getDataProcessingTasks: async (projectId: string) => {
    // Implement this method based on your actual backend API endpoint
    const response = await axios.get(`${API_BASE_URL}/api/export-data`);
    return response.data;
  },

  getDatasets: async (projectId: string) => {
    // Implement this method based on your actual backend API endpoint
    const response = await axios.get(`${API_BASE_URL}/api/user/profile-picture`);
    return response.data;
  },
};

export { dataAnalysisService };
