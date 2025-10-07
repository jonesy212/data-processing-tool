import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import { useDetailsContext } from "@/app/components/models/data/DetailsContext";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { Data } from '@/app/models/data/Data';
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import { NotificationTypeEnum, useNotification } from "@/context/NotificationContext"; // Import the notification context

const API_BASE_URL = endpoints.stateGovCities.list;

export const fetchStateGovCities = async (): Promise<DetailsItem<Data>[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching state government cities:", error);
    throw error;
  }
};

export const createStateGovCity = async (newCity: DetailsItem<Data>) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, newCity);
    // Use notification after creating the city
    useNotification().notify(
      "New city created",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_FETCHING_CITIES,
      'useNotify',
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    return response.data;
  } catch (error) {
    console.error("Error creating state government city:", error);
    throw error;
  }
};

// Function to remove a state government city
export const removeStateGovCity = async (cityId: number): Promise<void> => {
  try {
    const endpoint = `${API_BASE_URL}/${cityId}`; // Construct the endpoint URL using API_BASE_URL
    await axiosInstance.delete(endpoint);
    // Use notification after removing the city
    useNotification().notify(
      "City removed",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_REMOVING_CITY,
      'useNotifyCity',
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  } catch (error) {
    console.error("Error removing state government city:", error);
    throw error;
  }
};
// Function to update a state government city
export const updateStateGovCity = async (
  cityId: number,
  newData: any
): Promise<DetailsItem<Data>> => {
  try {
    const endpoint = `${API_BASE_URL}/${cityId}`; // Construct the endpoint URL using API_BASE_URL
    const response = await axiosInstance.put(endpoint, newData);
    // Use notification after updating the city
    useNotification().notify(
      "City updated",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_UPDATING_CITY,
      'State government city updated successfully',
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    return response.data;
  } catch (error) {
    console.error("Error updating state government city:", error);
    throw error;
  }
};

// Function to add a state government city
export const addStateGovCity = async (newCity: Omit<DetailsItem<Data>, 'id'>) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, newCity);

    if (response.status === 200 || response.status === 201) {
      const createdCity: DetailsItem<Data> = response.data;
      const { updateDetailsData } = useDetailsContext();

      updateDetailsData((prevData) => [...prevData, createdCity]);

      // Use notification after adding the city
      useNotification().notify(
        'New city added',
        NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_ADDING_NEW_CITY,
        'State government city added successfully',
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } else {
      console.error('Failed to add state government city:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding state government city:', error);
    throw error;
  }
};

  
// Add other state government city-related actions as needed
