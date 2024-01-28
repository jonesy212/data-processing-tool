// ApiPhases.ts
import axiosInstance from './axiosInstance';
import { endpoints } from '@/app/api/ApiEndpoints';

const API_BASE_URL = endpoints.phases.list;

export const fetchPhases = async (): Promise<Phase[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching phases:', error);
    throw error;
  }
};

export const addPhase = async (newPhase: Omit<Phase, 'id'>) => {
  try {
    const response = await axiosInstance.post(endpoints.phases.add, newPhase);

    if (response.status === 200 || response.status === 201) {
      const createdPhase: Phase = response.data;
      // Handle the created phase as needed
    } else {
      console.error('Failed to add phase:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding phase:', error);
    throw error;
  }
};

export const removePhase = async (phaseId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.phases.single(phaseId));
    // Handle successful removal
  } catch (error) {
    console.error('Error removing phase:', error);
    throw error;
  }
};

export const updatePhase = async (phaseId: number, updatedPhase: Partial<Phase>): Promise<Phase> => {
  try {
    const response = await axiosInstance.put(endpoints.phases.single(phaseId), updatedPhase);
    return response.data;
  } catch (error) {
    console.error('Error updating phase:', error);
    throw error;
  }
};

export const bulkAssignPhases = async (phaseIds: number[], teamId: number): Promise<void> => {
  try {
    const response = await axiosInstance.post(endpoints.phases.bulkAssign, { phaseIds, teamId });

    if (response.status === 200) {
      // Handle successful bulk assignment
    } else {
      console.error('Failed to bulk assign phases:', response.statusText);
    }
  } catch (error) {
    console.error('Error in bulk assigning phases:', error);
    throw error;
  }
};

// Define the Phase type based on your application's requirements
interface Phase {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  // Add other properties as needed
}
