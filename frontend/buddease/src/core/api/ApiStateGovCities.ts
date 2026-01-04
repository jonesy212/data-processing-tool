ApiStateGovCities.ts
import axiosInstance from "@/core/api/csrfToken";
import { endpoints } from "@/core/api/endpointConfigurations";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { Data } from '@/core/models/data/Data';
import { useDetailsContext } from "@/core/models/data/DetailsContext";
import { useNotification } from "@/core/state/context/NotificationContext";
import { DetailsItem } from "@/core/state/stores/DetailsListStore";

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
    
    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `city_create_success_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_FETCHING_CITIES || "City created successfully",
      data: {
        entityType: 'state_gov_city',
        entityId: response.data?.id || 'new',
        action: 'create',
        cityData: newCity,
        responseData: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Error creating state government city:", error);
    
    // Error notification
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = "Failed to create city";
    if (axiosError.response?.status === 400) {
      userMessage = "Invalid city data provided";
    } else if (axiosError.response?.status === 409) {
      userMessage = "City already exists";
    } else if (axiosError.response?.status === 403) {
      userMessage = "You don't have permission to create cities";
    }
    
    notify({
      id: `city_create_error_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'state_gov_city',
        action: 'create',
        cityData: newCity,
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    throw error;
  }
};

Function to remove a state government city
export const removeStateGovCity = async (cityId: number): Promise<void> => {
  try {
    const endpoint = `${API_BASE_URL}/${cityId}`;
    await axiosInstance.delete(endpoint);
    
    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `city_remove_success_${cityId}_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_REMOVING_CITY || "City removed successfully",
      data: {
        entityType: 'state_gov_city',
        entityId: cityId.toString(),
        action: 'remove',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error removing state government city:", error);
    
    // Error notification
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = "Failed to remove city";
    if (axiosError.response?.status === 404) {
      userMessage = "City not found";
    } else if (axiosError.response?.status === 403) {
      userMessage = "You don't have permission to remove this city";
    } else if (axiosError.response?.status === 409) {
      userMessage = "Cannot remove city due to dependencies";
    }
    
    notify({
      id: `city_remove_error_${cityId}_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'state_gov_city',
        entityId: cityId.toString(),
        action: 'remove',
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    throw error;
  }
};

Function to update a state government city
export const updateStateGovCity = async (
  cityId: number,
  newData: any
): Promise<DetailsItem<Data>> => {
  try {
    const endpoint = `${API_BASE_URL}/${cityId}`;
    const response = await axiosInstance.put(endpoint, newData);
    
    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `city_update_success_${cityId}_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_UPDATING_CITY || "City updated successfully",
      data: {
        entityType: 'state_gov_city',
        entityId: cityId.toString(),
        action: 'update',
        newData: newData,
        responseData: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Error updating state government city:", error);
    
    // Error notification
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = "Failed to update city";
    if (axiosError.response?.status === 400) {
      userMessage = "Invalid city update data";
    } else if (axiosError.response?.status === 404) {
      userMessage = "City not found";
    } else if (axiosError.response?.status === 403) {
      userMessage = "You don't have permission to update this city";
    }
    
    notify({
      id: `city_update_error_${cityId}_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'state_gov_city',
        entityId: cityId.toString(),
        action: 'update',
        newData: newData,
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    throw error;
  }
};

Function to add a state government city
export const addStateGovCity = async (newCity: Omit<DetailsItem<Data>, 'id'>) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, newCity);

    if (response.status === 200 || response.status === 201) {
      const createdCity: DetailsItem<Data> = response.data;
      const { updateDetailsData } = useDetailsContext();

      updateDetailsData((prevData) => [...prevData, createdCity]);

      // Success notification using consistent object format
      const { notify } = useNotification();
      notify({
        id: `city_add_success_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.StateGovCities.SUCCESS_ADDING_NEW_CITY || "City added successfully",
        data: {
          entityType: 'state_gov_city',
          entityId: createdCity.id?.toString() || 'new',
          action: 'add',
          cityData: newCity,
          responseData: createdCity,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
      return createdCity;
    } else {
      console.error('Failed to add state government city:', response.statusText);
      
      // Error notification for non-2xx status
      const { notify } = useNotification();
      notify({
        id: `city_add_error_${Date.now()}`,
        message: `Failed to add city (Status: ${response.status})`,
        data: {
          entityType: 'state_gov_city',
          action: 'add',
          cityData: newCity,
          statusCode: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      
      throw new Error(`Failed to add city: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error adding state government city:', error);
    
    // Error notification for caught errors
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = "Failed to add city";
    if (axiosError.response?.status === 400) {
      userMessage = "Invalid city data";
    } else if (axiosError.response?.status === 409) {
      userMessage = "City already exists";
    }
    
    notify({
      id: `city_add_error_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'state_gov_city',
        action: 'add',
        cityData: newCity,
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    throw error;
  }
};

Optional: Create a reusable error handler for city operations
const handleCityApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string,
  additionalData?: any
) => {
  const { notify } = useNotification();
  const userFriendlyMessage = errorMessage;
  
  notify({
    id: `city_error_${errorMessageId}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'state_gov_city',
      ...additionalData,
      originalError: error.message,
      statusCode: error.response?.status,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
};
  
Add other state government city-related actions as needed
