// ApiVideo.ts
import { useNotification } from "@/app/components/support/NotificationContext";
import axios, { AxiosError } from "axios";
import { observable, runInAction } from "mobx";
import useVideoStore from "../components/state/stores/VideoStore";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { VideoMetadata } from "../configs/StructureMetadata";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.videos.list;

const { notify } = useNotification(); // Destructure notify from useNotification

const handleApiError = (
  error: AxiosError<unknown>,
  errorMessage: string
): void => {
  console.error(`API Error: ${errorMessage}`);
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      notify(
        NOTIFICATION_MESSAGES.Generic.ERROR,
        errorMessage,
        new Date(),
        "OperationError"
      );
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      notify(
        NOTIFICATION_MESSAGES.Generic.NO_RESPONSE,
        errorMessage,
        new Date(),
        "OperationError"
      );
    } else {
      console.error("Error details:", error.message);
      notify(
        NOTIFICATION_MESSAGES.Details.ERROR,
        errorMessage,
        new Date(),
        "OperationSuccess"
      );
    }
  } else {
    console.error("Non-Axios error:", error);
    notify(
      NOTIFICATION_MESSAGES.Generic.ERROR,
      errorMessage,
      new Date(),
      "OperationError"
    );
  }
};

export const videoService = observable({
  createVideo: async (
    title: string,
    description: string
  ): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.post(API_BASE_URL, {
        title,
        description,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_SUCCESS,
        "Create Video Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create video");
      notify(
        NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_ERROR,
        "Create Video Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  updateVideoData: async (
    id: string,
    metadata: VideoMetadata
  ): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, {
        metadata,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions
        useVideoStore().updateVideo(id, response.data); // Update the video in the VideoStore
      });
      notify(
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
        "Update Video Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update video");
      notify(
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
        "Update Video Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  updateVideo: async (
    id: string,
    title: string,
    description: string
  ): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, {
        title,
        description,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
        "Update Video Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update video");
      notify(
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
        "Update Video Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  fetchVideo: async function (id: string): Promise<{ video: Video }> {
    try {
      const response = axiosInstance.get(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_SUCCESS,
        "Fetch Video Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: (await response).data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch video");
      notify(
        NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
        "Fetch Video Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  deleteVideo: async function (id: string): Promise<{ video: Video }> {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
        "Delete Video Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete video");
      notify(
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
        "Delete Video Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  deleteVideoSuccess: async (id: string): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
        console.log(response);
        console.log(response.data);
        console.log(response.data.id);
        useVideoStore().deleteVideo(response.data.id);
      });
      notify(
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
        "Delete Video Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete video");
      notify(
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
        "Delete Video Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  sendVideoNotification: async (
    id: string,
    notification: string
  ): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/notification`,
        {
          title: "Video Notification",
          description: "This is a video notification",
        }
      );
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        NOTIFICATION_MESSAGES.Video.SEND_VIDEO_NOTIFICATION_SUCCESS,
        "Send Video Notification Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to send video notification"
      );
      notify(
        NOTIFICATION_MESSAGES.Video.SEND_VIDEO_NOTIFICATION_ERROR,
        "Send Video Notification Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  updateVideoMetadata: async (
    id: string,
    metadata: VideoMetadata
  ): Promise<{ video: Video }> => {
    try {
      const response = await axiosInstance.put(
        `${API_BASE_URL}/${id}/metadata`,
        metadata
      );
      runInAction(() => {
        // Perform state updates or other MobX-related actions here
        // For example:
        useVideoStore().updateVideo(id, response.data);
        console.log("State updated using MobX");
      });
      notify(
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_METADATA_SUCCESS,
        "Update Video Metadata Success",
        new Date(),
        "OperationSuccess"
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update video metadata"
      );
      notify(
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_METADATA_ERROR,
        "Update Video Metadata Error",
        new Date(),
        "OperationError"
      );
      throw error;
    }
  },

  addVideoTags: async (
    id: string,
    newTags: string[]
  ): Promise<{ video: Video }> => {
    // Create a dummy video object with default values for missing properties
    const dummyVideo: Video = {
      id: id,
      tags: newTags,
      url: "", // Add default value for url
      thumbnailUrl: "", // Add default value for thumbnailUrl
      duration: 0, // Add default value for duration
      uploadedBy: "",
      viewsCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      uploadDate: new Date(),
      category: "",
      resolution: "",
      aspectRatio: "",
      language: "",
      subtitles: false,
      closedCaptions: false,
      license: "",
      isLive: false,
      channel: "",
      channelId: "",
      isLicensedContent: false,
      isFamilyFriendly: false,
      isEmbeddable: false,
      isDownloadable: false,
      videoData: {} as VideoData,
      title: "",
      description: "",
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 0,
      playlists: [],
    };

    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}/tags`, {
        tags: newTags,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions here
        useVideoStore().updateVideoTags(id, newTags); // Update video tags in the VideoStore
      });
      notify(
        NOTIFICATION_MESSAGES.Video.ADD_VIDEO_TAGS_SUCCESS,
        "Add Video Tags Success",
        new Date(),
        "OperationSuccess"
      );

      return { video: { ...dummyVideo, id, tags: newTags } };
    } catch (error) {
      // Error handling logic
      console.error("Error setting theme:", error);
    }
    // Return an empty video object as a fallback
    return { video: { ...dummyVideo } };
  },
});
