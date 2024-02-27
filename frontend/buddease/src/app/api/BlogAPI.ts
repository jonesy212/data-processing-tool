import { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { addLog } from "../components/state/redux/slices/LogSlice";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
const API_BASE_URL = endpoints.apiConfig

export const blogApiService = observable({
  fetchBlog: async (blogId: string): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(`${API_BASE_URL}/${blogId}`);
      // Example of handling response data
      // const blogData = response.data;
      // Further processing of blogData
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch blog data"
      );
      throw error;
    }
  },

  createBlog: async (blogData: any): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(API_BASE_URL.getUserApiConfig, blogData);
      runInAction(() => {
        addLog(`Created blog: ${blogData.title}`);
      });
      // Example of handling response data
      // const createdBlog = response.data;
      // Further processing of createdBlog
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to create blog"
      );
      throw error;
    }
  },

  // Add more functions for updating, deleting, or any other blog-related API requests as needed
});
