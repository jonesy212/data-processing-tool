import axios from "axios";

const API_BASE_URL = "/api/data-frame";

export const fetchDataFrame = async (): Promise<any[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data; // Adjust based on your actual response structure
  } catch (error) {
    console.error("Error fetching data frame:", error);
    throw error;
  }
};

export const setDataFrame = async (data: any): Promise<void> => {
  try {
    await axios.post(API_BASE_URL, data);
  } catch (error) {
    console.error("Error setting data frame:", error);
    throw error;
  }
};

export const updateDataFrame = async (updatedData: any): Promise<void> => {
  try {
    await axios.put(API_BASE_URL, updatedData);
  } catch (error) {
    console.error("Error updating data frame:", error);
    throw error;
  }
};

export const deleteDataFrame = async (): Promise<void> => {
  try {
    await axios.delete(API_BASE_URL);
  } catch (error) {
    console.error("Error deleting data frame:", error);
    throw error;
  }
};

const fetchDataFromBackend = async () => { 
  try {
    const response = await axios.get('/api/data');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

const DataFrameAPI = {
  fetchDataFrame,
  setDataFrame,
  updateDataFrame,
  deleteDataFrame,
  fetchDataFromBackend
};

export default DataFrameAPI;
// Add more functions as needed for your specific use cases
