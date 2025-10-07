import { endpoints } from '@/app/api/endpointConfigurations';
import axiosInstance from '@/app/api/csrfToken';
import { Label } from '@/app/branding/BrandingSettings';
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/context/NotificationContext";
import { BaseData } from '@/app/models/data/Data';
import { VideoData } from "@/app/typings/videoTypes/Video";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
 
export interface Video {
  id: string; 
  content: string;
  watchLater: boolean;
  tags: string[];
  isActive: boolean;
  url: string;

  // Any extra video-specific fields
  resolution?: string;
  duration?: number;
  uploadedBy?: string;
  thumbnailUrl?: string;
  currentMeta?: any;
  currentMetadata?: any;
  [key: string]: any;
}

export interface VideoWrapper<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  videoData: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // use full metadata-rich type
}

export interface VideoStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  isLoading: boolean; // Add isLoading
  error: string | null; // Add error
  videos: Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  fetchVideos: () => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updatedVideo: Video) => void;
  deleteVideo: (id: string) => void;
  getVideoData: (id: string, video: Video) => VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  getVideosData: (ids: string[], videos: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => Promise<Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>;
  updateVideoTags: (id: string, tags: string[]) => void;
  setCurrentVideoMeta: (meta: any) => void; // Add this method
  setCurrentVideoMetadata: (metadata: any) => void; // Add this method
  setCurrentVideoDate: (date: Date) => void; // Add this method
}



const convertToVideoData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  video: Video
): VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    ...video,
    currentMeta: {}, // Provide default values or actual data
    currentMetadata: {},
    date: new Date(),
    label: {} as Label,
    video: {} as T, // Provide default values or actual data
  };
};




const useVideoStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): VideoStore<T, K> => {

  const [videos, setVideos] = useState<Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>>({});
  const [video, setVideo] = useState<VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMeta, setCurrentMeta] = useState<any>(null); 
  const [currentMetadata, setCurrentMetadata] = useState<any>(null); 
  const [date, setDate] = useState<Date | null>(null); 
  const { notify } = useNotification();

  const setCurrentVideoMeta = (meta: any) => {
    setCurrentMeta(meta);
  };
  
  const setCurrentVideoMetadata = (metadata: any) => {
    setCurrentMetadata(metadata);
  };
  
  const setCurrentVideoDate = (date: Date) => {
    setDate(date);
  };


  // Method to get video data by ID
  const getVideoData = (id: string, video: Video): VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
    const videoEntry = videos[id]?.find((v) => v.id === id);
    return videoEntry || null;
  };

  // Method to get videos data by IDs
  const getVideosData = async (
    ids: string[],
    videos: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Promise<Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> => {
    try {
      const response = await axiosInstance.get("/videos", {
        params: {
          ids,
          videos: videos.map((video) => video.id),
        },
      });
      return response.data as Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    } catch (error) {
      handleError(error, "fetching videos data");
      return {};
    }
  };
 
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.videos.list.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();
      const videoData = Object.keys(data).reduce((acc, key) => {
        acc[key] = data[key].map(convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        return acc;
      }, {} as Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>);
      setVideos(videoData);
    } catch (error) {
      handleError(error, "fetching videos");
    } finally {
      setIsLoading(false);
    }
  };

  const addVideo = (video: Video) => {
    const videoData = convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(video);
    setVideos((prevVideos) => ({
      ...prevVideos,
      [String(video.id)]: [videoData], // Convert video.id to a string
    }));
    notify(
      null,
      "Video added successfully",
      NOTIFICATION_MESSAGES.Video.ADD_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    );
  };

  const updateVideo = (id: string, updatedVideo: Video) => {
    const videoData = convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(updatedVideo);
    setVideos((prevVideos) => ({
      ...prevVideos,
      [id]: [videoData],
    }));
    notify(
      null,
      "Video updated successfully",
      NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    );
  };

  const deleteVideo = async (id: string) => {
    setVideos((prevVideos) => {
      const updatedVideos = { ...prevVideos };
      delete updatedVideos[id];
      return updatedVideos;
    });
    const videoId = await axiosInstance.delete(
      endpoints.videos.deleteVideo + id
    );
    notify(
      null,
      `You have successfully deleted the video ${videoId}`,
      NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    ); // Notify success
  };


  const updateVideoTags = (id: string, tags: string[]) => {
    setVideos((prevVideos) => {
      const updatedVideos = [...prevVideos[id]];
      const video = updatedVideos.find((v) => v.id === id);
      if (video) {
        video.tags = tags;
      }
      return { ...prevVideos, [id]: updatedVideos };
    });
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(
      `Error ${action}`,
      error.message || "Unknown error",
      "Failed to perform action",
      new Date(),
      NotificationTypeEnum.ERROR
    );
  };

  const store: VideoStore<T, K> = makeAutoObservable({
    videos,
    isLoading,
    error,
    video, // Include video in the store
    currentMeta, // Include currentMeta in the store
    currentMetadata, // Include currentMetadata in the store
    date, // Include date in the store
    fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    getVideoData,
    getVideosData,
    updateVideoTags,
    setCurrentVideoMeta, 
    setCurrentVideoMetadata, 
    setCurrentVideoDate,
    setVideo,
  });


  return store;
};

export default useVideoStore;
