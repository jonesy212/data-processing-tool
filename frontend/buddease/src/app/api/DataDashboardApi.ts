// dataDashboardApi.ts
import axios from 'axios';

const BASE_URL = '/api/dataframe'; // Update with your actual API base URL

export const getDataFrameInfo = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/info`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sortDataFrame = async (columns: string[], ascending: boolean[]) => {
  try {
    const response = await axios.get(`${BASE_URL}/sort`, {
      params: { columns, ascending },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
