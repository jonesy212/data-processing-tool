import axiosInstance from './axiosInstance';
import { createHeaders } from './ApiClient';
import { handleApiError } from './ApiLogs';
import { NestedEndpoints, endpoints } from './ApiEndpoints';
import headersConfig, { HeadersConfig } from './headers/HeadersConfig';
import dotProp from 'dot-prop';

const API_BASE_URL = dotProp.getProperty(endpoints, 'phases.base');

interface Phase {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  // Add other properties as needed
}
const url = dotProp.getProperty(endpoints, 'phases.add');
const urlString: string = typeof url === 'string' ? url : '';

class PhaseApiService {
  private headers: typeof headersConfig;

  constructor() {
    this.headers = createHeaders();
  }

  private async requestHandler<T extends Phase>(
    request: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      handleApiError(error as Error, errorMessage);
      throw error;
    }
  }

  async fetchPhases(): Promise<Phase[]> {
    const url = `${API_BASE_URL}`;
    try {
      const response = await axiosInstance.get<Phase[]>(url, { headers: this.headers });
      return response.data;
    } catch (error) {
      const errorMessage = 'Error fetching phases';
      return this.requestHandler<Phase[] & Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
  }
  
  async addPhase(newPhase: Omit<Phase, 'id'>): Promise<Phase> {
    const urlString: string = typeof url === 'string' ? url : '';
    try {
      const response = await axiosInstance.post<Phase>(urlString, newPhase, { headers: this.headers });
      return response.data;
    } catch (error) {
      const errorMessage = 'Error adding phase';
      return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
  }
  

  async removePhase(phaseId: number): Promise<Phase> {
    const url = dotProp.getProperty(endpoints, `phases.single.${phaseId}`);
    
    if (!url) {
      const errorMessage = 'URL for removing phase not found';
      throw new Error(errorMessage);
    }
    
    const errorMessage = 'Error removing phase';
    try {
      await axiosInstance.delete(url, { headers: this.headers });
    } catch (error) {
      return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
    return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
  }



  async updatePhase(phaseId: number, updatedPhase: Partial<Phase>): Promise<Phase> {
    const url = dotProp.getProperty(endpoints, `phases.single.${phaseId}`);
    const errorMessage = 'Error updating phase';
    
    if (!url) {
      throw new Error('URL for updating phase not found');
    }
  
    try {
      const response = await axiosInstance.put<Phase>(url, updatedPhase, { headers: this.headers });
      return response.data as Phase; // Ensure response.data is of type Phase
    } catch (error) {
      return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
  }
  

  
  async bulkAssignPhases(phaseIds: number[], teamId: number): Promise<Phase> {
    const rawUrl = dotProp.getProperty(endpoints, 'phases.bulkAssign');
    const url: string = typeof rawUrl === 'string' ? rawUrl : '';
  
    const errorMessage = 'Error bulk assigning phases';
    
    if (!url) {
      throw new Error('URL for bulk assigning phases not found');
    }
  
    try {
      await axiosInstance.post(url, { phaseIds, teamId }, { headers: this.headers });
    } catch (error) {
      return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
    return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
  }
  
  

  // Additional phase API methods can be added here...
}

const phaseApiService = new PhaseApiService();
export default phaseApiService;
