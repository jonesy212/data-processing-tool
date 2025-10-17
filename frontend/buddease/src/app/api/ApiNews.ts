// ApiNews.ts
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import { handleApiErrorAndNotify } from '@/app/api/ApiData';
import { useNotification } from '@/app/context/NotificationContext';
import { NotificationType } from "@/context/NotificationContext";
import { AxiosError, AxiosResponse } from 'axios';

const  newsApiBaseURL = endpoints; // Ensure you have this defined in your ApiEndpoints


interface NewsNotificationMessages {
    FetchNewsArticlesErrorId: string;
    FetchNewsArticleByIdErrorId: string;
    PostNewArticleErrorId: string;
    UpdateArticleErrorId: string;
    DeleteArticleErrorId: string;
    [key: string]: string;
  }


  const newsNotificationMessages: NewsNotificationMessages = {
    FetchNewsArticlesErrorId: "An error occurred while fetching news articles. Please try again later.",
    FetchNewsArticleByIdErrorId: "An error occurred while fetching the news article. Please check the article ID and try again.",
    PostNewArticleErrorId: "An error occurred while posting the new article. Please try again later.",
    UpdateArticleErrorId: "An error occurred while updating the article. Please check the article details and try again.",
    DeleteArticleErrorId: "An error occurred while deleting the article. Please try again later.",
  };


// Generic handleNewsApiErrorAndNotify that works with any notification messagesconst handleNewsApiErrorAndNotify = (
const handleNewsApiErrorAndNotify = (
  error: AxiosError<unknown>,
  defaultMessage: string,
  errorId: keyof NewsNotificationMessages
) => {
  handleApiErrorAndNotify(
    error,
    defaultMessage,
    errorId,
    newsNotificationMessages
  );
};



// Fetch News Articles
export const fetchNewsArticles = async (): Promise<any[]> => {
  try {
    const response: AxiosResponse<any[]> = await axiosInstance.get(`${newsApiBaseURL}/articles`);
    return response.data;
  } catch (error) {
    handleNewsApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch news articles',
      'FetchNewsArticlesErrorId' as keyof NewsNotificationMessages
    );
    return [];
  }
};

// Fetch Single News Article by ID
export const fetchNewsArticleById = async (articleId: number): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(`${newsApiBaseURL}/articles/${articleId}`);
    return response.data;
  } catch (error) {
    handleNewsApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch news article by ID',
      'FetchNewsArticleByIdErrorId' as keyof NewsNotificationMessages
    );
    throw error;
  }
};

// Post a New Article
export const postNewArticle = async (newArticle: any): Promise<void> => {
  try {
    await axiosInstance.post(`${newsApiBaseURL}/articles`, newArticle);
  } catch (error) {
    handleNewsApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to post new article',
      'PostNewArticleErrorId' as keyof NewsNotificationMessages
    );
    throw error;
  }
};

// Update an Existing Article
export const updateArticle = async (articleId: number, updatedArticle: any): Promise<void> => {
  try {
    await axiosInstance.put(`${newsApiBaseURL}/articles/${articleId}`, updatedArticle);
  } catch (error) {
    handleNewsApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to update article',
      'UpdateArticleErrorId' as keyof NewsNotificationMessages
    );
    throw error;
  }
};

// Delete an Article
export const deleteArticle = async (articleId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${newsApiBaseURL}/articles/${articleId}`);
  } catch (error) {
    handleNewsApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to delete article',
      'DeleteArticleErrorId' as keyof NewsNotificationMessages
    );
    throw error;
  }
};
