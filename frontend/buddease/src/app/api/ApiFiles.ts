import axiosInstance from './axiosInstance';

const API_BASE_URL = '/api/files'; // Adjust according to your API structure



export const getFileType = async (file: string) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${file}/type`);
    return response.data.fileType; // Adjust as needed based on your API response structure
  } catch (error) {
    throw new Error('Failed to get file type');
  }
};
// Example function to fetch files
export const fetchFiles = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    return response.data; // Adjust as needed based on your API response structure
  } catch (error) {
    throw new Error('Failed to fetch files');
  }
};

// Define other file-related functions similarly
export const fetchFileAPI = async (fileId: string) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${fileId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch file ${fileId}`);
  }
};

export const uploadFileAPI = async (file: any) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/upload`, file);
    return response.data;
  } catch (error) {
    throw new Error('Failed to upload file');
  }
};

export const determineFileTypeAPI = async (file: any) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/type`, file);
    return response.data;
  } catch (error) {
    throw new Error('Failed to determine file type');
  }
};
// Define other file operations as needed
