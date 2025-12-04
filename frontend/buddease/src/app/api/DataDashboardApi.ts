// DataDashboardApi.ts
import { DeviceDimensions } from '@/app/models/display/DeviceDimensions';
import internalApiService from '@/app/api/ApiClient';
import { ClientNotificationMessages } from '@/app/api/ApiClient';
const BASE_URL = '/api/dataframe';

export const getDataFrameInfo = async (deviceDimensions?: DeviceDimensions) => {
  const response = await internalApiService.get(
    `${BASE_URL}/info`,
    {
      config: { 
        params: { 
          width: deviceDimensions?.width, 
          height: deviceDimensions?.height 
        } 
      },
      successMessageId: "FETCH_DATA_FRAME_INFO_SUCCESS" as keyof ClientNotificationMessages,
      errorMessageId: "FETCH_DATA_FRAME_INFO_ERROR" as keyof ClientNotificationMessages,
      notificationData: { deviceDimensions }
    }
  );
  return response.data;
};

export const sortDataFrame = async (
  columns: string[],
  ascending: boolean[],
  deviceDimensions?: DeviceDimensions
) => {
  const response = await internalApiService.get(
    `${BASE_URL}/sort`,
    {
      config: {
        params: {
          columns,
          ascending,
          width: deviceDimensions?.width,
          height: deviceDimensions?.height,
        }
      },
      successMessageId: "SORT_DATA_FRAME_SUCCESS" as keyof ClientNotificationMessages,
      errorMessageId: "SORT_DATA_FRAME_ERROR" as keyof ClientNotificationMessages,
      notificationData: { columns, ascending, deviceDimensions }
    }
  );
  return response.data;
};


// Add more methods following the same pattern
export const filterDataFrame = async (
  filters: any,
  deviceDimensions?: DeviceDimensions
) => {
  const response = await internalApiService.post(
    `${BASE_URL}/filter`,
    { filters }, // data (2nd parameter)
    { // options (3rd parameter)
      config: {
        params: {
          width: deviceDimensions?.width,
          height: deviceDimensions?.height,
        }
      },
      successMessageId: "FILTER_DATA_FRAME_SUCCESS" as keyof ClientNotificationMessages,
      errorMessageId: "FILTER_DATA_FRAME_ERROR" as keyof ClientNotificationMessages,
      notificationData: { filters, deviceDimensions }
    }
  );
  return response.data;
};