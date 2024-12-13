import FileData from '@/app/components/models/data/FileData';
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



export const getFileDetails = async (fileId: string): Promise<FileData<any>> => {
  try {
    const response = await fetchFileAPI(fileId); // Call the API to fetch the file details
    return response; // Assuming the response contains the file data
  } catch (error) {
    throw new Error(`Failed to fetch details for file ID ${fileId}`);
  }
};


export const fetchFolderContentsAPI = async (folderId: string) => {
  const apiBaseUrl = process.env.BASE_URL || "https://api.example.com";
  const endpoint = `${apiBaseUrl}/folders/${folderId}/contents`; // Adjust this URL based on your API structure

  try {
    const response = await axiosInstance.get(endpoint);
    return response.data; // Return the data, which should include files and subfolders
  } catch (error) {
    throw new Error(`Failed to fetch contents for folder ${folderId}`);
  }
};
