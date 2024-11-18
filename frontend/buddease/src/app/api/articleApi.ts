// articleApi.ts
import { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { addLog } from "../components/state/redux/slices/LogSlice";
import { useArticleStore } from "../components/state/stores/ArticleStore";
import { useNotification } from "../components/support/NotificationContext";
import { User } from "../components/users/User";
import { Message } from "../generators/GenerateChatInterfaces";
import UniqueIDGenerator from "../generators/GenerateUniqueIds";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.apiConfig;

interface ArticleApiService {
  notificationContext: {
    notify: (title: string, message: string | Message, type: string, content?: any) => void;
  };
  createArticle: (articleData: any) => Promise<AxiosResponse<any, any>>;
  fetchRecentArticles: () => Promise<AxiosResponse>;
  // Add the displayArticles method here
  displayArticles: (articles: any[]) => void;
}

// Example values for the Message object
const generateUniqueID = UniqueIDGenerator.generateMessageID();
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

export const articleApiService: ArticleApiService = observable({
  notificationContext: {
    notify: (
      title: string,
      message: string | Message,
      type: string,
      content?: any
    ) => {
      // Access the notification context
      const notificationContext = useNotification();

      // Check the type of notification and call the appropriate method from the notification context
      switch (type) {
        case "success":
          notificationContext.showSuccessNotification(title, message, content);
          break;
        case "error":
          notificationContext.showErrorNotification(title, message, content);
          break;
        case "info":
          notificationContext.showInfoNotification(title, message, content);
          break;
        default:
          notificationContext.showNotification(title, message, content);
          break;
      }
      console.log(title, message, type);
    },
  },

  
  createArticle: async (articleData: any): Promise<AxiosResponse> => {
    try {
      // Access `getUserApiConfig` directly on `API_BASE_URL`
      const userApiConfig = API_BASE_URL.getUserApiConfig;

      if (!userApiConfig) {
        throw new Error("API configuration for user is missing");
      }

      const response: AxiosResponse = await axiosInstance.post(
        String(userApiConfig),
        articleData
      );
      
      runInAction(() => {
        addLog(`Created article: ${articleData.title}`);
      });

      // Utilize the notification system directly
      const notificationContext = useNotification();
      const message = createMessage(
        "success",
        `Article "${articleData.title}" was created successfully.`
      );

      notificationContext.showSuccessNotification(
        "Article Created",
        {
          ...message,
          id: "article-created",
          sender: undefined,
          senderId: undefined,
        } as Message,
        `Article "${articleData.title}" was created successfully.`,
        articleData
      );

      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create article");
      throw error;
    }
  },

  fetchArticleByName: async (articleName: string): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `${API_BASE_URL}/${articleName}`
      );

      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch article data"
      );
      throw error;
    }
  },

  fetchArticle: async (
    articleId?: string
  ): Promise<AxiosResponse<any, any>> => {
    try {
      // Check if articleId is provided
      const url = articleId
        ? `${API_BASE_URL}/${articleId}`
        : `${API_BASE_URL}`;
      const response: AxiosResponse = await axiosInstance.get(url);
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch article data"
      );
      throw error;
    }
  },

  updateArticle: async (
    articleId: string,
    updatedArticleData: any
  ): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `${API_BASE_URL}/${articleId}`,
        updatedArticleData
      );
      runInAction(() => {
        addLog(`Updated article: ${articleId}`);
      });

      const notificationContext = useNotification();
      const message = createMessage(
        "success",
        `Article with ID "${articleId}" was updated successfully.`
      );
      notificationContext.showSuccessNotification(
        "Article Updated",
        {
          ...message,
          id: "article-updated",
          sender: undefined,
          senderId: undefined,
        } as Message,
        `Article with ID "${articleId}" was updated successfully.`
      );

      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update article");
      throw error;
    }
  },

  deleteArticle: async (articleId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/${articleId}`);
      runInAction(() => {
        addLog(`Deleted article: ${articleId}`);
      });

      const notificationContext = useNotification();
      const message = createMessage(
        "success",
        `Article with ID "${articleId}" was deleted successfully.`
      );
      notificationContext.showSuccessNotification(
        "Article Deleted",
        {
          ...message,
          id: "article-deleted",
          sender: undefined,
          senderId: undefined,
        } as Message,
        `Article with ID "${articleId}" was deleted successfully.`
      );
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete article");
      throw error;
    }
  },

  fetchRecentArticles: async (): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `${API_BASE_URL}/recent-articles`
      );
      runInAction(() => {
        addLog("Fetched recent articles");
      });

      const notificationContext = useNotification();
      const message = createMessage(
        "success",
        "Recent articles were fetched successfully."
      );
      notificationContext.showSuccessNotification(
        "Recent Articles Fetched",
        {
          ...message,
          id: "recent-articles-fetched",
          sender: undefined,
          senderId: undefined,
        } as Message,
        "Recent articles were fetched successfully."
      );

      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to fetch recent articles"
      );
      throw error;
    }
  },
  
  displayArticles: (articles: any[]): void => {
    const store = useArticleStore();
    store.setArticles(articles);
    console.log("Displaying articles:", articles);
    // Add any additional logic to update the UI if necessary
  }
});

// Add more functions for updating, deleting, or any other article-related API requests as needed
