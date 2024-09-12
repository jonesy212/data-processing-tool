import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const { files } = endpoints;

export const getFileType = async (file: string) => {
  try {
    const endpoint = typeof files.getFileType === 'function' ? files.getFileType(file) : `${files.getFileType}/${file}`;
    const response = await axiosInstance.get(endpoint);
    return response.data.fileType; // Adjust as needed based on your API response structure
  } catch (error) {
    throw new Error('Failed to get file type');
  }
};


export const fetchFiles = async () => {
  try {
    const endpoint =
      typeof files.fetchFiles === "function"
        ? files.fetchFiles() : `${files.fetchFiles}/${files}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch files");
  }
};

export const fetchFileAPI = async (fileId: string) => {
  try {
    const endpoint = typeof files.fetchFileAPI === 'function'
      ? files.fetchFileAPI(fileId)
      : `${files.fetchFileAPI}/${fileId}`;
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch file ${fileId}`);
  }
};

export const uploadFileAPI = async (file: any) => {
  try {
    const endpoint =
      typeof files.uploadFileAPI === "function"
        ? files.uploadFileAPI(file)
        : `${files.uploadFileAPI}`;
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(endpoint, formData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to upload file");
  }
};

export const determineFileTypeAPI = async (file: any) => {
  try {
    const endpoint =
      typeof files.determineFileTypeAPI === "function"
        ? files.determineFileTypeAPI(file)
        : `${files.determineFileTypeAPI}`;
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(endpoint, formData);
    return response.data;
  } catch (error) {
    throw new Error("Failed to determine file type");
  }
};
