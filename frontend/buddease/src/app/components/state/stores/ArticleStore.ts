import { createMessage } from "../../utils/createMessage";
// ArticleStore.ts
import { handleApiError } from "@/app/api/ApiLogs";
import axios, { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { NotificationTypeEnum, useNotification } from "../../support/NotificationContext";
import { useState } from "react";
import { Article } from "@/app/pages/blog/Blog";

const API_BASE_URL = "https://api.yourservice.com"; // Replace with your actual API base URL
const axiosInstance = axios.create({ baseURL: API_BASE_URL });

export interface ArticleStore {
  articles: any[];
  isLoading: boolean;
  error: string | null;
  displayArticles: () => Promise<void>;
  createArticle: (articleData: any) => Promise<void>;
  fetchArticleByName: (articleName: string) => Promise<void>;
  fetchArticle: (articleId?: string) => Promise<void>;
  updateArticle: (articleId: string, updatedArticleData: any) => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  setArticles: (articles: any[]) => void;
}

export const useArticleStore = (): ArticleStore => {
  const notificationContext = useNotification();
  const store = observable({
    articles: [] as any[],
    isLoading: false,
    error: null as string | null,

    setArticles(articles: any[]) {
      this.articles = articles;
    },
    
    displayArticles: async (): Promise<void> => {
      store.isLoading = true;
      store.error = null;

      try {
        const response: AxiosResponse = await axiosInstance.get(`${API_BASE_URL}/articles`);
        runInAction(() => {
          store.articles = response.data;
          store.isLoading = false;
        });

        const message = createMessage("success", "Articles were displayed successfully.");
        notificationContext.showSuccessNotification("Articles Displayed", message, undefined, new Date(), NotificationTypeEnum.DisplaySuccess);
    } catch (error) {
        runInAction(() => {
          store.isLoading = false;
          store.error = "Failed to display articles";
        });

        handleApiError(error as AxiosError<unknown>, "Failed to display articles");
      }
    },

    createArticle: async (articleData: any): Promise<void> => {
        try {
          const response: AxiosResponse = await axiosInstance.post(`${API_BASE_URL}/articles`, articleData);
          runInAction(() => {
            store.articles.push(response.data);
          });
      
          const message = createMessage(
            "success",
            `Article "${articleData.title}" was created successfully.`
          );
          notificationContext.showSuccessNotification("Article Created", message);
        } catch (error) {
          handleApiError(
            error as AxiosError<unknown>,
            "Failed to create article"
          );
          throw error;
        }
      },
      

    fetchArticleByName: async (articleName: string): Promise<void> => {
      try {
        const response: AxiosResponse = await axiosInstance.get(`${API_BASE_URL}/${articleName}`);
        runInAction(() => {
          store.articles = [response.data];
        });
      } catch (error) {
        handleApiError(error as AxiosError<unknown>, "Failed to fetch article data");
        throw error;
      }
    },

    fetchArticle: async (articleId?: string): Promise<void> => {
      try {
        const url = articleId ? `${API_BASE_URL}/${articleId}` : `${API_BASE_URL}`;
        const response: AxiosResponse = await axiosInstance.get(url);
        runInAction(() => {
          store.articles = [response.data];
        });
      } catch (error) {
        handleApiError(error as AxiosError<unknown>, "Failed to fetch article data");
        throw error;
      }
    },

    updateArticle: async (articleId: string, updatedArticleData: any): Promise<void> => {
      try {
        const response: AxiosResponse = await axiosInstance.put(`${API_BASE_URL}/${articleId}`, updatedArticleData);
        runInAction(() => {
          const index = store.articles.findIndex(article => article.id === articleId);
          if (index !== -1) {
            store.articles[index] = response.data;
          }
        });

        const message = createMessage("success", `Article with ID "${articleId}" was updated successfully.`);
        notificationContext.showSuccessNotification("Article Updated", message, undefined, new Date, NotificationTypeEnum.ArticleUpdated);
      } catch (error) {
        handleApiError(error as AxiosError<unknown>, "Failed to update article");
        throw error;
      }
    },

    deleteArticle: async (articleId: string): Promise<void> => {
      try {
        await axiosInstance.delete(`${API_BASE_URL}/${articleId}`);
        runInAction(() => {
          store.articles = store.articles.filter(article => article.id !== articleId);
        });

        const message = createMessage("success", `Article with ID "${articleId}" was deleted successfully.`);
        notificationContext.showSuccessNotification("Article Deleted", message);
      } catch (error) {
        handleApiError(error as AxiosError<unknown>, "Failed to delete article");
        throw error;
      }
    },
  });

  return store;
};
