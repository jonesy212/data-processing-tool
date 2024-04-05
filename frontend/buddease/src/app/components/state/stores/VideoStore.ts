import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext"; // Import useNotification
import { AxiosError } from "axios";
import axiosInstance from "../../security/csrfToken";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { VideoData } from "../../video/Video";
import { endpoints } from "@/app/api/ApiEndpoints";
import { handleApiErrorAndNotify } from "@/app/api/ApiData";

export interface Video extends Data {
  id: string;
  title: string;
  description: string;
  content: string;
  watchLater: boolean;
  tags: string[];
  isActive: boolean;
  // Add more properties from Data and DataDetails as needed
}

export interface VideoStore {
  videos: Record<string, Video>;
  fetchVideos: () => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updatedVideo: Video) => void;
  deleteVideo: (id: string) => void;
}

const useVideoStore = (): VideoStore => {
  const [videos, setVideos] = useState<Record<string, Video>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.videos.list.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      handleError(error, "fetching videos");
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoData = (id: string, video: Video): VideoData => {
    if (video && video.videoData) {
      return video.videoData;
    }
    return {} as VideoData;
  };
  
  const getVideosData = async (ids: string[]): Promise<Record<string, VideoData>> => {
    try {
      const response = await axiosInstance.get('/videos', {
        params: {
          ids,
        },
      });
  
      // Assuming the response data structure is an object where keys are video IDs
      return response.data as Record<string, VideoData>;
    } catch (error) {
      handleApiErrorAndNotify(
        error as AxiosError<unknown, any>,
        'getVideosData',
        NOTIFICATION_MESSAGES.Api.GET_VIDEOS_DATA_ERROR
      );
      // Return an empty object if there's an error
      return {};
    }
  };

  const addVideo = (video: Video) => {
    setVideos((prevVideos) => ({
      ...prevVideos,
      [video.id]: video,
    }));
    notify(
      "addVideoSuccess",
      "Video added successfully",
      NOTIFICATION_MESSAGES.Video.ADD_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  };

  const updateVideo = (id: string, updatedVideo: Video) => {
    setVideos((prevVideos) => ({
      ...prevVideos,
      [id]: updatedVideo,
    }));
    notify(
      "updateVideoSuccess",
      "Video updated successfully",
      NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  };

  const deleteVideo = async (id: string) => {
    setVideos((prevVideos) => {
      const updatedVideos = { ...prevVideos };
      delete updatedVideos[id];
      return updatedVideos;
    });
    const videoId = await axiosInstance.delete(endpoints.videos.deleteVideo + id);
    notify(
      "deletedVideoSuccess",
      `You have successfully deleted the video ${videoId}`,
      NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(
      `Error ${action}`,
      error.message || "Unknown error",
      "Failed to perform action",
      new Date(),
      NotificationTypeEnum.Error
    );
  };

  const store: VideoStore = makeAutoObservable({
    videos,
    fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo,
  });

  return store;
};

export default useVideoStore;
