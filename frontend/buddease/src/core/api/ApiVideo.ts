ApiVideo.ts
import { VideoActions } from "@/core/actions/VideoActions";
import internalApiService from '@/core/api/ApiClient';
import { endpoints } from "@/core/api/endpointConfigurations";
import type { VideoMetadata } from "@/core/config/StructuredMetadata";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";
import useVideoStore from "@/core/state/stores/VideoStore";
import type { VideoAttachment, VideoEntity, VideoExcludedFields, VideoIncludedFields, VideoK, VideoMeta } from '@/core/typings/entities/VideoEntity';
import { Video, VideoData } from "@/core/typings/videoTypes/Video";
import axios, { AxiosError } from "axios";
import { observable, runInAction } from "mobx";

const API_BASE_URL = endpoints.videos.list;

// Get the notification function
const { notify } = useNotification();

const handleApiError = (
  error: AxiosError<unknown>,
  errorMessage: string
): void => {
  console.error(`API Error: ${errorMessage}`);
  
  // Extract common notification data
  const errorData = {
    originalError: error.message,
    extra: {} as any
  };

  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      
      errorData.extra = {
        errorMessage,
        responseData: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      };
      
      notify({
        id: "ApiErrorResponse",
        message: NOTIFICATION_MESSAGES.Generic.ERROR,
        data: errorData,
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      
      errorData.extra = {
        errorMessage,
        requestDetails: error.request
      };
      
      notify({
        id: "ApiErrorNoResponse",
        message: NOTIFICATION_MESSAGES.Generic.NO_RESPONSE,
        data: errorData,
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    } else {
      console.error("Error details:", error.message);
      
      errorData.extra = { errorMessage };
      
      notify({
        id: "ApiErrorRequest",
        message: NOTIFICATION_MESSAGES.Details.ERROR,
        data: errorData,
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  } else {
    console.error("Non-Axios error:", error);
    
    errorData.extra = {
      errorMessage,
      errorDetails: error
    };
    
    notify({
      id: "NonAxiosError",
      message: NOTIFICATION_MESSAGES.Generic.ERROR,
      data: errorData,
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
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
      notify({
        id: "createVideoSuccess",
        message: NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_SUCCESS,
        data: { 
          entityId: response.data?.id,
          entityType: 'video',
          extra: { 
            title, 
            description,
            videoId: response.data?.id 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to create video");
      notify({
        id: "createVideoError",
        message: NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityType: 'video',
          extra: { 
            title, 
            description,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
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
      notify({
        id: "updateVideoDataSuccess",
        message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video',
          extra: { metadata }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update video");
      notify({
        id: "updateVideoDataError",
        message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { metadata, error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
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
      notify({
        id: "updateVideoSuccess",
        message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video',
          extra: { 
            title, 
            description
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to update video");
      notify({
        id: "updateVideoError",
        message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { 
            title, 
            description,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },

  fetchVideo: async function (id: string): Promise<{ video: Video }> {
    try {
      const response = await internalApiService.get(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "fetchVideoSuccess",
        message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video'
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch video");
      notify({
        id: "fetchVideoError",
        message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
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
      });
      notify({
        id: "fetchVideosByUserSuccess",
        message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEOS_BY_USER_SUCCESS,
        data: { 
          userId,
          entityType: 'video',
          count: videoData.length,
          extra: { userId }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return videoData;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch videos by user ID");
      notify({
        id: "fetchVideosByUserError",
        message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEOS_BY_USER_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          userId,
          entityType: 'video',
          extra: { userId, error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },

  deleteVideo: async function (id: string): Promise<{ video: Video }> {
    try {
      const response = await internalApiService.delete(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "deleteVideoSuccess",
        message: NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video'
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete video");
      notify({
        id: "deleteVideoError",
        message: NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },

  deleteVideoSuccess: async (id: string): Promise<{ video: Video }> => {
    try {
      const response = await internalApiService.delete(`${API_BASE_URL}/${id}`);
      runInAction(() => {
        console.log("Delete response:", response);
        console.log("Response data:", response.data);
        console.log("Video ID to delete:", response.data.id);
        useVideoStore().deleteVideo(response.data.id);
      });
      notify({
        id: "deleteVideoSuccessAction",
        message: NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video',
          extra: { 
            deletedId: response.data.id 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to delete video");
      notify({
        id: "deleteVideoErrorAction",
        message: NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
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
          description: notification || "This is a video notification",
        }
      );
      runInAction(() => {
        // Update state or perform other MobX-related actions
      });
      notify({
        id: "sendVideoNotificationSuccess",
        message: NOTIFICATION_MESSAGES.Video.SEND_VIDEO_NOTIFICATION_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video',
          extra: { notification }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to send video notification"
      );
      notify({
        id: "sendVideoNotificationError",
        message: NOTIFICATION_MESSAGES.Video.SEND_VIDEO_NOTIFICATION_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { 
            notification,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
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
        useVideoStore().updateVideo(id, response.data);
        console.log("Video metadata updated using MobX");
      });
      notify({
        id: "updateVideoMetadataSuccess",
        message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_METADATA_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video',
          extra: { metadata }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: response.data };
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to update video metadata"
      );
      notify({
        id: "updateVideoMetadataError",
        message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_METADATA_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { 
            metadata,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
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
      videoData: {} as VideoData<VideoEntity, VideoK>,
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
      notify({
        id: "addVideoTagsSuccess",
        message: NOTIFICATION_MESSAGES.Video.ADD_VIDEO_TAGS_SUCCESS,
        data: { 
          entityId: id,
          entityType: 'video',
          extra: { newTags }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      return { video: { ...dummyVideo, id, tags: newTags } };
    } catch (error) {
      // Error handling logic
      console.error("Error adding video tags:", error);
      handleApiError(error as AxiosError<unknown>, "Failed to add video tags");
      notify({
        id: "addVideoTagsError",
        message: NOTIFICATION_MESSAGES.Video.ADD_VIDEO_TAGS_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityId: id,
          entityType: 'video',
          extra: { 
            newTags,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      throw error;
    }
  },
});