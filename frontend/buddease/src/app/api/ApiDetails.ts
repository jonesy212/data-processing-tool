import { useDetailsContext } from '../components/models/data/DetailsContext';
import { DetailsItem } from '../components/state/stores/DetailsListStore';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.details.list;  // Assuming you have a 'list' endpoint in ApiEndpoints

export const fetchDetails = async (): Promise<DetailsItem[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;  // Assuming your API returns an array of DetailsItem
  } catch (error) {
    console.error('Error fetching details:', error);
    throw error;
  }
};

export const createdDetails = async (newDetails: DetailsItem) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, newDetails);

    return response.data;
  } catch (error) {
    console.error('Error creating details:', error);
    throw error;
  }
}

export const addDetails = async (newDetails: Omit<DetailsItem, 'id'>) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, newDetails);

    if (response.status === 200 || response.status === 201) {
      const createdDetails: DetailsItem = response.data;
      const { updateDetailsData } = useDetailsContext();
      updateDetailsData((prevData) => [...prevData, createdDetails]);
    } else {
      console.error('Failed to add details:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding details:', error);
    throw error;
  }
};

export const removeDetails = async (detailsId: string): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.details.single(detailsId));
  } catch (error) {
    console.error('Error removing details:', error);
    throw error;
  }
};

export const updateDetails = async (detailsId: string, newData: any): Promise<DetailsItem> => {
  try {
    const response = await axiosInstance.put(endpoints.details.single(detailsId), newData);
    return response.data;  // Assuming your API returns the updated DetailsItem
  } catch (error) {
    console.error('Error updating details:', error);
    throw error;
  }
};

// Add other details-related actions as needed
