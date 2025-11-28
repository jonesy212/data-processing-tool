// DataDashboardApi.ts
// dataDashboardApi.ts
import { DeviceDimensions } from '@/components/models/display/DeviceDimensions';
import internalApiService from '@/app/api/ApiClient';

const BASE_URL = '/api/dataframe';

export const getDataFrameInfo = async (deviceDimensions?: DeviceDimensions) => {
  const response = await internalApiService.get(
    `${BASE_URL}/info`,
    { 
      params: { 
        width: deviceDimensions?.width, 
        height: deviceDimensions?.height 
      } 
    },
    "FETCH_DATA_FRAME_INFO_SUCCESS" as keyof ClientNotificationMessages,
    "FETCH_DATA_FRAME_INFO_ERROR" as keyof ClientNotificationMessages,
    { deviceDimensions }
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
      params: {
        columns,
        ascending,
        width: deviceDimensions?.width,
        height: deviceDimensions?.height,
      }
    },
    "SORT_DATA_FRAME_SUCCESS" as keyof ClientNotificationMessages,
    "SORT_DATA_FRAME_ERROR" as keyof ClientNotificationMessages,
    { columns, ascending, deviceDimensions }
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
    { filters },
    {
      params: {
        width: deviceDimensions?.width,
        height: deviceDimensions?.height,
      }
    },
    "FILTER_DATA_FRAME_SUCCESS" as keyof ClientNotificationMessages,
    "FILTER_DATA_FRAME_ERROR" as keyof ClientNotificationMessages,
    { filters, deviceDimensions }
  );
  return response.data;
};