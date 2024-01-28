import { useDetailsContext } from "../components/models/data/DetailsContext";
import { DetailsItem } from "../components/state/stores/DetailsListStore";
import { useNotification } from "../components/support/NotificationContext"; // Import the notification context
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.stateGovCities.list;

export const fetchStateGovCities = async (): Promise<DetailsItem[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching state government cities:", error);
    throw error;
  }
};

export const createStateGovCity = async (newCity: DetailsItem) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, newCity);
    // Use notification after creating the city
    useNotification().notify(
      "New city created",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_FETCHING_CITIES,
      new Date(),
      "OperationSuccess"
    );
    return response.data;
  } catch (error) {
    console.error("Error creating state government city:", error);
    throw error;
  }
};

export const removeStateGovCity = async (cityId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.stateGovCities.single(cityId));
    // Use notification after removing the city
    useNotification().notify(
      "City removed",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_REMOVING_CITY,
      new Date(),
      "OperationSuccess"
    );
  } catch (error) {
    console.error("Error removing state government city:", error);
    throw error;
  }
};

export const updateStateGovCity = async (
  cityId: number,
  newData: any
): Promise<DetailsItem> => {
  try {
    const response = await axiosInstance.put(
      endpoints.stateGovCities.single(cityId),
      newData
    );
    // Use notification after updating the city
    useNotification().notify(
      "City updated",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_UPDATING_CITY,
      new Date(),
      "OperationSuccess"
    );
    return response.data;
  } catch (error) {
    console.error("Error updating state government city:", error);
    useNotification().notify(
      "City updated",
      NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_UPDATING_CITY,
      new Date(),
      "OperationSuccess"
    );
    throw error;
  }
    
};

export const addStateGovCity = async (newCity: Omit<DetailsItem, 'id'>) => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, newCity);
  
      if (response.status === 200 || response.status === 201) {
        const createdCity: DetailsItem = response.data;
          const { updateDetailsData } = useDetailsContext();
          

        updateDetailsData((prevData) => [...prevData, createdCity]);
        
          // Use notification after adding the city
          


          useNotification().notify(
            'New city added',
            NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_UPDATING_CITY,
            new Date(),
            "OperationSuccess"
          );
      
        useNotification().notify('New city added',NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_ADDING_NEW_CITY,new Date, 'OperationSuccess');
      } else {
        console.error('Failed to add state government city:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding state government city:', error);
      throw error;
    }
  };
  
// Add other state government city-related actions as needed
