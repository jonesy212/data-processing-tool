import { AxiosError, AxiosResponse } from "axios";
import dotProp from 'dot-prop';
import { observable, runInAction } from "mobx";
import { addLog } from "../components/state/redux/slices/LogSlice";
import { useNotification } from "../components/support/NotificationContext";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";


const API_BASE_URL = endpoints.apiConfig


export const blogApiService = observable({
  notificationContext: {
    notify: (title: string, message: string, type: string) => {
      // Implement notification logic here
      // Reuse existing notify method from notificationContext
      
      console.log(title, message, type);
    }
  },

  createBlog: async (blogData: any): Promise<AxiosResponse> => {
    try {
      const userApiConfig = dotProp.getProperty(API_BASE_URL, "getUserApiConfig");
      const response: AxiosResponse = await axiosInstance.post(String(userApiConfig), blogData);
      runInAction(() => {
        addLog(`Created blog: ${blogData.title}`);
      });

      // Show success notification using notificationContext
      const notificationContext = useNotification();
      notificationContext.showSuccessNotification(
        "Blog Created",
        `Blog "${blogData.title}" was created successfully.`,
        "success"
      );

      return response.data; // Return the created blog data
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to create blog"
      );
      throw error;
    }
  },

  fetchBlog: async (blogId: string): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(`${API_BASE_URL}/${blogId}`);
      // Example of handling response data
      const blogData = response.data;
      // Further processing of blogData
      return blogData;

    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch blog data"
      );
      throw error;
    }
  },



  // Additional properties and functions
  updateBlog: async (blogId: string, updatedBlogData: any): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(`${API_BASE_URL}/${blogId}`, updatedBlogData);
      runInAction(() => {
        addLog(`Updated blog: ${blogId}`);
      });

      // Show success notification using notificationContext
      const notificationContext = useNotification();
      notificationContext.showSuccessNotification(
        "Blog Updated",
        `Blog with ID "${blogId}" was updated successfully.`,
        "success"
      );

      return response.data; // Return the updated blog data
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update blog"
      );
      throw error;
    }
  },

  deleteBlog: async (blogId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${blogId}`);
      runInAction(() => {
        addLog(`Deleted blog: ${blogId}`);
      });

      // Show success notification using notificationContext
      const notificationContext = useNotification();
      notificationContext.showSuccessNotification(
        "Blog Deleted",
        `Blog with ID "${blogId}" was deleted successfully.`,
        "success"
      );
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to delete blog"
      );
      throw error;
    }
  },

  // Add more functions for updating, deleting, or any other blog-related API requests as needed
});