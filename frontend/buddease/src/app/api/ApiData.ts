import HighlightEvent from '../components/documents/screenFunctionality/HighlightEvent';
import { useDataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.data.list; // Update API base URL

export const fetchData = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data; // Update based on your response structure
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const addData = async (newData: Omit<any, 'id'>, highlight: Omit<HighlightEvent, 'id'>): Promise<void> => {
  try {
    const response = await axiosInstance.post(endpoints.data.addData, newData);

    if (response.status === 200 || response.status === 201) {
      const createdData = response.data;
      const dataStore = useDataStore();
      dataStore.addDataSuccess({ data: createdData });
    } else {
      console.error('Failed to add data:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding data:', error);
  }
};

export const removeData = async (dataId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.data.deleteData(dataId));
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

export const updateData = async (dataId: number, newData: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(endpoints.data.updateData(dataId), newData);
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

export const fetchDataById = async (dataId: number): Promise<any> => {
  try {
    const response = await axiosInstance.get(endpoints.data.single(dataId));
    return response.data;
  } catch (error) {
    console.error('Error fetching data by ID:', error);
    throw error;
  }
};

export const createData = async (newData: any): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.data.addData, newData);
  } catch (error) {
    console.error('Error creating data:', error);
    throw error;
  }
};

export const deleteData = async (dataId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.data.deleteData(dataId));
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};
