// src/services/dataAnalysisService.ts
import { DataAnalysis } from '@/app/components/projects/DataAnalysisPhase/DataAnalysis';
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://mybusiness-services.api';
class DataAnalysisService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  
  async fetchDataAnalysis(): Promise<DataAnalysis[]> {
    return axios.get<DataAnalysis[]>(`${this.baseUrl}/data-analysis`)
      .then((response: AxiosResponse<DataAnalysis[]>) => response.data)
      .catch((error) => {
        // Handle error if needed
        console.error("Error fetching data analysis:", error);
        throw error; // Rethrow the error to be caught by the caller
      });
  }

  async getDataByProjectId(projectId: string): Promise<any> {
    // Implement this method based on your actual backend API endpoint
    return axios.get(`${API_BASE_URL}/api/data-by-project/${projectId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching data by project ID:", error);
        throw error;
      });
  }

  async postDataAnalysis(dataAnalysis: DataAnalysis): Promise<DataAnalysis> {
    // Implement this method based on your actual backend API endpoint
    return axios.post(`${API_BASE_URL}/api/data-analysis`, dataAnalysis)
      .then((response: AxiosResponse<DataAnalysis>) => response.data)
      .catch((error) => {
        console.error("Error posting data analysis:", error);
        throw error;
      });
  }

  async updateDataAnalysis(dataAnalysis: DataAnalysis): Promise<DataAnalysis> {
    // Implement this method based on your actual backend API endpoint
    return axios.put(`${API_BASE_URL}/api/data-analysis/${dataAnalysis.id}`, dataAnalysis)
      .then((response: AxiosResponse<DataAnalysis>) => response.data)
      .catch((error) => {
        console.error("Error updating data analysis:", error);
        throw error;
      });
  }

  async deleteDataAnalysis(dataAnalysisId: number): Promise<void> {
    // Implement this method based on your actual backend API endpoint
    return axios.delete(`${API_BASE_URL}/api/data-analysis/${dataAnalysisId}`)
      .then(() => {})
      .catch((error) => {
        console.error("Error deleting data analysis:", error);
        throw error;
      });
  }


  async getDataProcessingTasks(projectId: string): Promise<void> {
    // Implement this method based on your actual backend API endpoint
    const response = await axios.get(`${API_BASE_URL}/api/export-data`);
    try {
      projectId = response.data.projectId;

    } catch(error) {
      console.error("Error fetching data processing tasks:", error);
     }
    return response.data;
  }

  async getDatasets(projectId: string):  Promise<void> {
    // Implement this method based on your actual backend API endpoint
    const response = await axios.get(`${API_BASE_URL}/api/user/datasets/${projectId}`);
    return response.data;
  }

}

const dataAnalysisService = new DataAnalysisService(API_BASE_URL);


export default DataAnalysisService;
export { dataAnalysisService };
