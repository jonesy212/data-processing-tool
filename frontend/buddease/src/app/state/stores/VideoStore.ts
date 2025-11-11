import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import { Label } from '@/app/branding/BrandingSettings';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { BaseData } from '@/app/models/data/Data';
import {
    NotificationTypeEnum,
    useNotification,
} from '@/app/state/context/NotificationContext';
import { Video, VideoData } from '@/app/typings/videoTypes/Video';
import { makeAutoObservable } from "mobx";
import { useEffect, useState } from "react";
 

const LOCAL_STORAGE_KEY = "videoStorePersist";

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
    ...video,  // start with original video properties
    id: video.id,
    isActive: video.isActive,
    video: {} as T, // placeholder, can be assigned dynamically when integrating BaseDataEntity
    label: {} as Label,
    date: new Date(),

    // map core video properties
    videoTitle: video.content,
    videoDescription: video.content,
    videoUrl: video.url,
    thumbnailUrl: video.thumbnailUrl,
    tags: video.tags,
    uploadedBy: video.uploadedBy,

    // flexible metadata and default fields
    currentMeta: video.currentMeta ?? {},
    currentMetadata: video.currentMetadata ?? {},
  };
};

const convertToVideo = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  videoData: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Video => {
  return {
    id: videoData.id,
    url: videoData.videoUrl,
    thumbnailUrl: videoData.thumbnailUrl,
    content: videoData.videoDescription ?? "",
    uploadedBy: videoData.uploadedBy,
    tags: videoData.tags ?? [],
    isActive: videoData.isActive,
    // keep base video fields
    createdAt: videoData.createdAt,
    updatedAt: videoData.updatedAt,
    title: (videoData as any).title ?? videoData.videoTitle,
    description: (videoData as any).description ?? videoData.videoDescription,
    // optional metadata
    currentMeta: videoData.currentMeta,
    currentMetadata: videoData.currentMetadata,
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMeta, setCurrentMeta] = useState<any>(null);
  const [currentMetadata, setCurrentMetadata] = useState<any>(null);
  const [date, setDate] = useState<Date | null>(null);
  const { notify } = useNotification();

  // Load persisted state on mount
  useEffect(() => {
    const persisted = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (persisted) {
      const data = JSON.parse(persisted);
      setVideos(data.videos || {});
      setVideo(data.video || null);
      setCurrentMeta(data.currentMeta || null);
      setCurrentMetadata(data.currentMetadata || null);
      setDate(data.date ? new Date(data.date) : null);
    }
  }, []);

  // Persist changes automatically
  useEffect(() => {
    const persistData = {
      videos,
      video,
      currentMeta,
      currentMetadata,
      date: date?.toISOString() || null,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(persistData));
  }, [videos, video, currentMeta, currentMetadata, date]);

  // Existing setter helpers
  const setCurrentVideoMeta = (meta: any) => setCurrentMeta(meta);
  const setCurrentVideoMetadata = (metadata: any) => setCurrentMetadata(metadata);
  const setCurrentVideoDate = (date: Date) => setDate(date);

  // Existing CRUD / fetch logic
  const getVideoData = (id: string, _video?: Video) => {
    const videoEntry = videos[id]?.find((v) => v.id === id);
    return videoEntry || (_video ? convertToVideoData(_video) : null);
  };

  const getVideosData = async (ids: string[], videoList: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
    try {
      const response = await axiosInstance.get("/videos", {
        params: { ids, videos: videoList.map((v) => v.id) },
      });
      const data = response.data as Record<string, Video[]>;
      const converted: Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
      for (const key in data) {
        converted[key] = convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(data[key][0]);
      }
      return converted;
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
      if (!response.ok) throw new Error("Failed to fetch videos");
      const data = await response.json();
      const videoData = Object.keys(data).reduce((acc, key) => {
        acc[key] = data[key].map((v: Video) =>
          convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(v)
        );
        return acc;
      }, {} as Record<string, VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>);
      setVideos(videoData);
    } catch (error) {
      handleError(error, "fetching videos");
    } finally {
      setIsLoading(false);
    }
  };

  const addVideo = async (videoData: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    const video = convertToVideo(videoData);
    await axiosInstance.post(endpoints.videos.add, video);
    setVideos((prev) => ({ ...prev, [video.id]: [videoData] }));
    notify(null, "Video added successfully", NOTIFICATION_MESSAGES.Video.ADD_VIDEO_SUCCESS, new Date(), NotificationTypeEnum.OPERATION_SUCCESS);
  };

  const updateVideo = async (id: string, updatedVideo: VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    const video = convertToVideo(updatedVideo);
    const videoData = convertToVideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(video);
    setVideos((prev) => ({ ...prev, [id]: [videoData] }));
    await axiosInstance.put(`/videos/${id}`, video);
    notify(null, "Video updated successfully", NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS, new Date(), NotificationTypeEnum.OPERATION_SUCCESS);
  };

  const deleteVideo = async (id: string) => {
    const existingVideo = videos[id]?.[0];
    const video = existingVideo ? convertToVideo(existingVideo) : { id };
    await axiosInstance.delete(endpoints.videos.deleteVideo + id, { data: video });
    setVideos((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    notify(null, `You have successfully deleted the video ${id}`, NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS, new Date(), NotificationTypeEnum.OPERATION_SUCCESS);
  };

  const updateVideoTags = (id: string, tags: string[]) => {
    setVideos((prev) => {
      const updatedVideos = prev[id] ? [...prev[id]] : [];
      const video = updatedVideos.find((v) => v.id === id);
      if (video) video.tags = tags;
      return { ...prev, [id]: updatedVideos };
    });
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(`Error ${action}`, error.message || "Unknown error", "Failed to perform action", new Date(), NotificationTypeEnum.ERROR);
  };

  const store: VideoStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = makeAutoObservable({
    videos,
    isLoading,
    error,
    video,
    currentMeta,
    currentMetadata,
    date,
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