// ApiVideo.ts
import { VideoActions } from "@/app/actions/VideoActions";
import internalApiService from '@/app/api/ApiClient';
import { endpoints } from "@/app/api/endpointConfigurations";
import { VideoMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from "@/app/documents/attachment/Attachment";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationTypeEnum, useNotification } from '@/app/state/context/NotificationContext';
import useVideoStore from "@/app/state/stores/VideoStore";
import { VideoAttachment, VideoEntity, VideoExcludedFields, VideoIncludedFields, VideoK, VideoMeta } from '@/app/typings/entities/VideoEntity';
import { Video, VideoData } from "@/app/typings/videoTypes/Video";
import axios, { AxiosError } from "axios";
import { observable, runInAction } from "mobx";
import { Partial } from "react-spring";

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
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        errorMessage,
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.NO_RESPONSE,
        errorMessage,
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
    } else {
      console.error("Error details:", error.message);
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Details.ERROR,
        errorMessage,
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
    }
  } else {
    console.error("Non-Axios error:", error);
    notify(
      "ErrorId",
      NOTIFICATION_MESSAGES.Generic.ERROR,
      errorMessage,
      new Date(),
      NotificationTypeEnum.OPERATION_ERROR
    );
  }
};


export const videoService = observable({
  createVideo: async (
    title: string,
    description: string
  ): Promise<{ video: Video }> => {
    try {
      const response = await internalApiService.post(`${API_BASE_URL}`, {
        title,
        description,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        "createVideo",
        "CreateVideoSuccessId",
        NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_SUCCESS,
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create video");
      notify(
        "CreateVideoErrorId",
        NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },


  updateVideoData: async (
    id: string,
    metadata: VideoMetadata<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields>
  ): Promise<{ video: Video }> => {
    try {
      const response = await internalApiService.put(`${API_BASE_URL}/${id}`, {
        metadata,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions
        useVideoStore().updateVideo(id, response.data); // Update the video in the VideoStore
      });
      notify(
        "UpdateVideoDataSuccessId",
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update video");
      notify(
        "UpdateVideoDataErrorId",
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
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
      const response = await internalApiService.put(`${API_BASE_URL}/${id}`, {
        title,
        description,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        "UpdateVideoSuccessId",
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update video");
      notify(
        "UpdateVideoErrorId",
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },

  fetchVideo: async function (id: string): Promise<{ video: Video }> {
    try {
      const response = internalApiService.get(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        "FetchVideoSuccessId",
        NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: (await response).data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch video");
      notify(
        "FetchVideoErrorId",
        NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },

  fetchVideoByUserId: async function (userId: string): Promise<Video[]> {
    try {
      const response = await internalApiService.get(
        `${API_BASE_URL}/user/${userId}`
      );
      const videoData: Video[] = response.data;
      runInAction(() => {
        // Update state or perform other MobX-related actions
        VideoActions.setVideos(videoData);
        // Update state or perform other MobX-related actions
      });
      return videoData;
    } catch (error) {
      // Handle error
      throw error;
    }
  },
  

  deleteVideo: async function (id: string): Promise<{ video: Video }> {
    try {
      const response = await internalApiService.delete(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify(
        "DeleteVideoSuccessId",
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete video");
      notify(
        "DeleteVideoErrorId",
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },

  deleteVideoSuccess: async (id: string): Promise<{ video: Video }> => {
    try {
      const response = await internalApiService.delete(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
        console.log(response);
        console.log(response.data);
        console.log(response.data.id);
        useVideoStore().deleteVideo(response.data.id);
      });
      notify(
        "DeleteVideoSuccessId",
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete video");
      notify(
        "DeleteVideoErrorId",
        NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },


  sendVideoNotification: async (
    id: string,
    notification: string
  ): Promise<{ video: Video }> => {
    try {
      const response = await internalApiService.post(
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
        "SendVideoNotificationSuccessId",
        NOTIFICATION_MESSAGES.Video.SEND_VIDEO_NOTIFICATION_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to send video notification"
      );
      notify(
        "SendVideoNotificationErrorId",
        NOTIFICATION_MESSAGES.Video.SEND_VIDEO_NOTIFICATION_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },

  updateVideoMetadata: async (
    id: string,
    metadata: VideoMetadata<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields>
  ): Promise<{ video: Video }> => {
    try {
      const response = await internalApiService.put(
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
        "UpdateVideoMetadataSuccessId",
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_METADATA_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
      return { video: response.data };
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update video metadata"
      );
      notify(
        "UpdateVideoMetadataErrorId",
        NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_METADATA_ERROR,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_ERROR
      );
      throw error;
    }
  },

  addVideoTags: async (
    id: string,
    newTags: string[]
  ): Promise<{ video: Video }> => {
    // Create a dummy video object with default values for missing properties
    const dummyVideo: Video & Partial<Attachment> = {
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
      videoData: {} as VideoData<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields>,
      title: "",
      description: "",
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 0,
      playlists: [],
      status: "pending",
      isActive: false,
      content: "",
      watchLater: false,
    };

    try {
      const response = await internalApiService.put(`${API_BASE_URL}/${id}/tags`, {
        tags: newTags,
      });
      runInAction(() => {
        // Update state or perform other MobX-related actions here
        useVideoStore().updateVideoTags(id, newTags); // Update video tags in the VideoStore
      });
      notify(
        "AddVideoTagsSuccessId",
        NOTIFICATION_MESSAGES.Video.ADD_VIDEO_TAGS_SUCCESS,
        {},
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
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


