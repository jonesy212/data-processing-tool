import { AxiosError, AxiosResponse } from "axios";
import dotProp from 'dot-prop';
import { observable, runInAction } from "mobx";
import { addLog } from "../components/state/redux/slices/LogSlice";
import { useNotification } from "../components/support/NotificationContext";
import { User } from "../components/users/User";
import { Message } from "../generators/GenerateChatInterfaces";
import UniqueIDGenerator from "../generators/GenerateUniqueIds";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";


const API_BASE_URL = endpoints.apiConfig


const notificationContext = useNotification();

// Example values for the Message object
const generateUniqueID = UniqueIDGenerator.generateMessageID()
const createMessage = (type: string, content: string): Partial<Message> => ({
  id: generateUniqueID,
  senderId: "system",
  sender: {
    username: "System",
    firstName: "System",
    lastName: "User",
    email: "system@example.com",
  } as User,
  channel: {
    id: "",
    creatorId: "",
    topics: [],
    messages: [],
    users: [],
  },
  timestamp: new Date().toISOString(),
  content,
});

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
      // Use optional chaining to safely access nested properties or a default value
      const userApiConfig = API_BASE_URL?.getUserApiConfig || '';

      if (!userApiConfig) {
        throw new Error('API configuration is missing.');
      }

      // Make the POST request to create the blog
      const response: AxiosResponse = await axiosInstance.post(String(userApiConfig), blogData);

      runInAction(() => {
        addLog(`Created blog: ${blogData.title}`);
      });

      // Show a success notification
      const notificationContext = useNotification();
      const message = createMessage(
        'success',
        `Blog "${blogData.title}" was created successfully.`
      );

      notificationContext.showSuccessNotification(
        'Blog Created',
        {
          ...message,
          id: 'blog-created',
          sender: undefined,
          senderId: undefined,
        } as Message,
        `Blog "${blogData.title}" was created successfully.`,
        blogData
      );

      return response.data;
    } catch (error) {
      // Handle any errors that occur during the API call
      handleApiError(error as AxiosError<unknown>, 'Failed to create blog');
      throw error;
    }
  },


  fetchBlogByName: async (blogName: string): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `${API_BASE_URL}/${blogName}`
      );

      return response;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch blog data");
      throw error;
    }
  },

  fetchBlog: async (blogId?: string): Promise<AxiosResponse<any, any>> => {
    try {
      // Check if blogId is provided
      const url = blogId ? `${API_BASE_URL}/${blogId}` : `${API_BASE_URL}`;
      const response: AxiosResponse = await axiosInstance.get(url);
      return response;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch blog data");
      throw error;
    }
  },
  
  updateBlog: async (blogId: string, updatedBlogData: any): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(`${API_BASE_URL}/${blogId}`, updatedBlogData);
      runInAction(() => {
        addLog(`Updated blog: ${blogId}`);
      });

      const notificationContext = useNotification();
      const message = createMessage("success", `Blog with ID "${blogId}" was updated successfully.`);
      notificationContext.showSuccessNotification(
        "Blog Updated",
        { ...message, id: "blog-updated", sender: undefined, senderId: undefined } as Message,
        `Blog with ID "${blogId}" was updated successfully.`,
      );

      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update blog");
      throw error;
    }
  },

  deleteBlog: async (blogId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${blogId}`);
      runInAction(() => {
        addLog(`Deleted blog: ${blogId}`);
      });

      const notificationContext = useNotification();
      const message = createMessage("success", `Blog with ID "${blogId}" was deleted successfully.`);
      notificationContext.showSuccessNotification(
        "Blog Deleted",
        { ...message, id: "blog-deleted", sender: undefined, senderId: undefined } as Message,
        `Blog with ID "${blogId}" was deleted successfully.`,
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete blog");
      throw error;
    }
  },

  // Add more functions for updating, deleting, or any other blog-related API requests as needed
});