// articleApi.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { addLog } from "@/app/state/redux/slices/LogSlice";
import { useArticleStore } from "@/app/state/stores/ArticleStore";
import { User } from "@/app/users/User";
import { useNotification } from "@/state/context/NotificationContext";
import { AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ArticleAttachment, ArticleEntity, ArticleExcludedFields, ArticleIncludedFields, ArticleK, ArticleMeta } from '@/app/typings/entities/ArticleEntity';
import internalApiService, { clientNotificationMessages } from './ApiClient';

const API_BASE_URL = endpoints.apiConfig;



// Define article-specific notification messages
const articleNotificationMessages = {
  CREATE_ARTICLE_SUCCESS: "Article created successfully",
  CREATE_ARTICLE_ERROR: "Failed to create article",
  FETCH_ARTICLE_SUCCESS: "Article fetched successfully", 
  FETCH_ARTICLE_ERROR: "Failed to fetch article",
  UPDATE_ARTICLE_SUCCESS: "Article updated successfully",
  UPDATE_ARTICLE_ERROR: "Failed to update article",
  DELETE_ARTICLE_SUCCESS: "Article deleted successfully",
  DELETE_ARTICLE_ERROR: "Failed to delete article",
  FETCH_RECENT_ARTICLES_SUCCESS: "Recent articles fetched successfully",
  FETCH_RECENT_ARTICLES_ERROR: "Failed to fetch recent articles"
};

// Combine with existing client messages
const combinedMessages = {
  ...clientNotificationMessages,
  ...articleNotificationMessages
};


interface ArticleApiService<
  T extends ArticleEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends ArticleAttachment = ArticleAttachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  notificationContext: {
    notify: (title: string, message: string | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, content?: any) => void;
  };
  createArticle: (articleData: T) => Promise<AxiosResponse<T>>;
  fetchArticleByName: (articleName: string) => Promise<AxiosResponse<T>>;
  fetchArticle: (articleId?: string) => Promise<AxiosResponse<T | T[]>>;
  updateArticle: (articleId: string, updatedArticleData: Partial<T>) => Promise<AxiosResponse<T>>;
  deleteArticle: (articleId: string) => Promise<void>;
  fetchRecentArticles: () => Promise<AxiosResponse<T[]>>;
  displayArticles: (articles: T[]) => void;
}

// Example values for the Message object
const generateUniqueID = UniqueIDGenerator.generateMessageID();

const createMessage = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(type: string, content: string): Partial<Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => ({
  id: generateUniqueID,
  senderId: "system",
  sender: {
    username: "System",
    firstName: "System",
    lastName: "User",
    email: "system@example.com",
    isUserMessage: false,
    tier: "",
    isAuthorized: true,
    uploadQuota: 0,
    hasQuota: false,
    processingTasks: [],
    activityStatus: "",
    persona: null,
    friends: [],
    blockedUsers: [],
    activityLog: [],
    tags: [], 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(), 
} as User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
    isUserMessage: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  },
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

export const articleApiService: ArticleApiService<ArticleEntity, ArticleK, ArticleMeta, ArticleAttachment, ArticleIncludedFields, ArticleExcludedFields> = observable({
  notificationContext: {
    notify: (
      title: string,
      message: string | Message<ArticleEntity, ArticleK, ArticleMeta, ArticleAttachment, ArticleIncludedFields, ArticleExcludedFields>,
      type: string,
      content?: any
    ) => {
      // Access the notification context
      const notificationContext = useNotification<ArticleEntity, ArticleK, ArticleMeta, ArticleAttachment, ArticleIncludedFields, ArticleExcludedFields>();
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

  
  createArticle: async (articleData: ArticleEntity): Promise<AxiosResponse<ArticleEntity>> => {
    const response = await internalApiService.post<ArticleEntity>(
      "/api/articles",
      articleData,
      undefined, // config (optional)
      "CREATE_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
      "CREATE_ARTICLE_ERROR" as keyof typeof combinedMessages
    );
    
    runInAction(() => {
      addLog(`Created article: ${articleData.title}`);
    });
    
    return response;
  },

  fetchArticleByName: async (articleName: string): Promise<AxiosResponse<ArticleEntity>> => {
    return await internalApiService.get<ArticleEntity>(
      `/api/articles/name/${articleName}`,
      undefined, // config
      "FETCH_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
      "FETCH_ARTICLE_ERROR" as keyof typeof combinedMessages
    );
  },

  fetchArticle: async (articleId?: string): Promise<AxiosResponse<ArticleEntity | ArticleEntity[]>> => {
    const url = articleId ? `/api/articles/${articleId}` : "/api/articles";
    return await internalApiService.get<ArticleEntity | ArticleEntity[]>(
      url,
      undefined,
      "FETCH_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
      "FETCH_ARTICLE_ERROR" as keyof typeof combinedMessages
    );
  },

  updateArticle: async (articleId: string, updatedArticleData: Partial<ArticleEntity>): Promise<AxiosResponse<ArticleEntity>> => {
    const response = await internalApiService.put<ArticleEntity>(
      `/api/articles/${articleId}`,
      updatedArticleData,
      undefined,
      "UPDATE_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
      "UPDATE_ARTICLE_ERROR" as keyof typeof combinedMessages
    );
    
    runInAction(() => {
      addLog(`Updated article: ${articleId}`);
    });
    
    return response;
  },

  deleteArticle: async (articleId: string): Promise<void> => {
    await internalApiService.delete(
      `/api/articles/${articleId}`,
      undefined,
      "DELETE_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
      "DELETE_ARTICLE_ERROR" as keyof typeof combinedMessages
    );
    
    runInAction(() => {
      addLog(`Deleted article: ${articleId}`);
    });
  },

  fetchRecentArticles: async (): Promise<AxiosResponse<ArticleEntity[]>> => {
    const response = await internalApiService.get<ArticleEntity[]>(
      "/api/articles/recent",
      undefined,
      "FETCH_RECENT_ARTICLES_SUCCESS" as keyof typeof combinedMessages,
      "FETCH_RECENT_ARTICLES_ERROR" as keyof typeof combinedMessages
    );
    
    runInAction(() => {
      addLog("Fetched recent articles");
    });
    
    return response;
  },
  
  displayArticles: (articles: ArticleEntity[]): void => {
    const store = useArticleStore();
    store.setArticles(articles);
    console.log("Displaying articles:", articles.map(a => a.title));
  }
});

// Add more functions for updating, deleting, or any other article-related API requests as needed
