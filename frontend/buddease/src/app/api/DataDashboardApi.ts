import  axiosInstance from '@/app/api/axiosInstance';
import { DeviceDimensions } from './../components/models/display/DeviceDimensions';
// dataDashboardApi.ts


const BASE_URL = '/api/dataframe'; // Update with your actual API base URL


export const getDataFrameInfo = async (deviceDimensions?: DeviceDimensions) => {
  try {
    const response = await axiosInstance.get(`/api/dataframe/info`, {
      params: {
        width: deviceDimensions?.width,
        height: deviceDimensions?.height,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sortDataFrame = async (
  columns: string[],
  ascending: boolean[],
  deviceDimensions?: DeviceDimensions
) => {
  try {
    const response = await axiosInstance.get(`/api/dataframe/sort`, {
      params: {
        columns,
        ascending,
        width: deviceDimensions?.width,
        height: deviceDimensions?.height,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

