import { createHeaders } from './ApiClient';
import { endpoints } from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';
import { Phase } from '../components/phases/Phase';

const API_BASE_URL = endpoints?.phases?.base ?? '';

const url = endpoints?.phases?.add ?? '';
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
    try {
      const response = await axiosInstance.get<Phase[]>(`${API_BASE_URL}`, { headers: this.headers });
      return response.data;
    } catch (error) {
      const errorMessage = 'Error fetching phases';
      return this.requestHandler<Phase[] & Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
  }
  
  async addPhase(newPhase: Omit<Phase, 'id'>): Promise<Phase> {
    try {
      const response = await axiosInstance.post<Phase>(urlString, newPhase, { headers: this.headers });
      return response.data;
    } catch (error) {
      const errorMessage = 'Error adding phase';
      return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
  }
  async removePhase(phaseId: number): Promise<Phase> {
    const url =
      typeof endpoints?.phases?.single === "function"
        ? endpoints.phases.single(phaseId)
        : "";
  
    if (!url) {
      const errorMessage = "URL for removing phase not found";
      throw new Error(errorMessage);
    }
  
    const errorMessage = "Error removing phase";
    try {
      await axiosInstance.delete(url, { headers: this.headers });
      throw new Error(errorMessage);
    } catch (error) {
      return this.requestHandler<Phase>(
        () => Promise.reject(errorMessage),
        errorMessage
      );
    }
  }


  async getPhaseName(phaseName: string): Promise<Phase> {
    try {
      // Construct the URL for fetching phase data by name
      const url = `${API_BASE_URL}/phases?name=${encodeURIComponent(phaseName)}`;
  
      // Make a GET request to fetch phase data
      const response = await axiosInstance.get<Phase>(url, { headers: this.headers });
  
      // Return the phase data from the response
      return response.data;
    } catch (error) {
      // Handle any errors that occur during the request
      const errorMessage = 'Error fetching phase by name';
      return this.requestHandler<Phase>(() => Promise.reject(errorMessage), errorMessage);
    }
  }
  
  async updatePhase(
    phaseId: number,
    updatedPhase: Partial<Phase>
  ): Promise<Phase> {
    const url =
      (endpoints?.phases?.single as Record<number, string>)?.[phaseId] ?? "";
    const errorMessage = "Error updating phase";

    if (!url) {
      throw new Error("URL for updating phase not found");
    }

    try {
      const response = await axiosInstance.put<Phase>(url, updatedPhase, {
        headers: this.headers,
      });
      return response.data as Phase;
    } catch (error) {
      return this.requestHandler<Phase>(
        () => Promise.reject(errorMessage),
        errorMessage
      );
    }
  }
  
  async bulkAssignPhases(phaseIds: number[], teamId: number): Promise<Phase> {
    const url =
      typeof endpoints?.phases?.bulkAssign === "string"
        ? endpoints.phases.bulkAssign
        : "";

    const errorMessage = "Error bulk assigning phases";

    if (!url) {
      throw new Error("URL for bulk assigning phases not found");
    }

    try {
      await axiosInstance.post(
        url,
        { phaseIds, teamId },
        { headers: this.headers }
      );
    } catch (error) {
      return this.requestHandler<Phase>(
        () => Promise.reject(errorMessage),
        errorMessage
      );
    }
    return this.requestHandler<Phase>(
      () => Promise.reject(errorMessage),
      errorMessage
    );
  }
  
  // Additional phase API methods can be added here...
}

const phaseApiService = new PhaseApiService();
export default phaseApiService;
