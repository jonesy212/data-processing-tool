// articleApi.ts
import { endpoints } from "@/core/api/endpointConfigurations";
import type { Message } from "@/core/generators/GenerateChatInterfaces";
import type { Sender } from '@/core/components/communications/CommunicationPage';
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import { useNotification } from "@/core/state/context/NotificationContext";
import { addLog } from "@/core/state/redux/slices/LogSlice";
import { useArticleStore } from "@/core/state/stores/ArticleStore";
import type { User } from "@/core/users/User";
import type { AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { createLatestVersion } from '@/core/versions/createLatestVersion';
import { data } from '@/core/snapshots/SnapshotWithCriteria';
import internalApiService, { clientNotificationMessages } from '@/core/api/ApiClient';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { ArticleAttachment, ArticleEntity, ArticleExcludedFields, ArticleIncludedFields, ArticleK, ArticleMeta } from '@/core/typings/entities/ArticleEntity';
import type { Tag } from '@/core/models/tracker/Tag';

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
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
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

const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

const createMessage = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(type: string, content: string): Partial<Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  
  const systemSender = {
    id: "system",
    username: "System",
    tags: [] as string[], // Changed from Tag<T>[] to string[]
    isUserMessage: false,
    tier: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    id: generateUniqueID(),
    senderId: "system",
    sender: systemSender as Sender<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    channel: {
      id: "",
      creatorId: "",
      topics: [],
      messages: [],
      users: [],
    },
    timestamp: new Date().toISOString(),
    content,
  };
};

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
      {
        successMessageId: "CREATE_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
        errorMessageId: "CREATE_ARTICLE_ERROR" as keyof typeof combinedMessages
      }
    );
    
    runInAction(() => {
      addLog(`Created article: ${articleData.title}`);
    });
    
    return response;
  },


  fetchArticleByName: async (articleName: string): Promise<AxiosResponse<ArticleEntity>> => {
    return await internalApiService.get<ArticleEntity>(
      `/api/articles/name/${articleName}`,
      {
        successMessageId: "FETCH_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
        errorMessageId: "FETCH_ARTICLE_ERROR" as keyof typeof combinedMessages
      }
    );
  },


  fetchArticle: async (articleId?: string): Promise<AxiosResponse<ArticleEntity | ArticleEntity[]>> => {
    const url = articleId ? `/api/articles/${articleId}` : "/api/articles";
    return await internalApiService.get<ArticleEntity | ArticleEntity[]>(
      url,
      {
        successMessageId: "FETCH_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
        errorMessageId: "FETCH_ARTICLE_ERROR" as keyof typeof combinedMessages
      }
    );
  },


  updateArticle: async (articleId: string, updatedArticleData: Partial<ArticleEntity>): Promise<AxiosResponse<ArticleEntity>> => {
    const response = await internalApiService.put<ArticleEntity>(
      `/api/articles/${articleId}`,
      updatedArticleData,
      {
        successMessageId: "UPDATE_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
        errorMessageId: "UPDATE_ARTICLE_ERROR" as keyof typeof combinedMessages
      }
    );
    
    runInAction(() => {
      addLog(`Updated article: ${articleId}`);
    });
    
    return response;
  },

  deleteArticle: async (articleId: string): Promise<void> => {
    await internalApiService.delete(
      `/api/articles/${articleId}`,
      {
        successMessageId: "DELETE_ARTICLE_SUCCESS" as keyof typeof combinedMessages,
        errorMessageId: "DELETE_ARTICLE_ERROR" as keyof typeof combinedMessages
      }
    );
    
    runInAction(() => {
      addLog(`Deleted article: ${articleId}`);
    });
  },

  fetchRecentArticles: async (): Promise<AxiosResponse<ArticleEntity[]>> => {
    const response = await internalApiService.get<ArticleEntity[]>(
      "/api/articles/recent",
      {
        successMessageId: "FETCH_RECENT_ARTICLES_SUCCESS" as keyof typeof combinedMessages,
        errorMessageId: "FETCH_RECENT_ARTICLES_ERROR" as keyof typeof combinedMessages
      }
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
export { createMessage }