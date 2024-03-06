import { endpoints } from "@/app/api/ApiEndpoints";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext"; // Import useNotification
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data, DataDetails } from "../../models/data/Data";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import axiosInstance from "../../security/csrfToken";

export interface Video extends Data, DataDetails {
  id: string;
  title: string;
  description: string;
  // Add more properties from Data and DataDetails as needed
}

export interface VideoStore {
  videos: Record<string, Video>;
  fetchVideos: () => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updatedVideo: Video) => void;
  deleteVideo: (id: string) => void;
  updateVideoTags: (id: string, newTags: string[]) => void;
  clipVideo: (id: string, startTime: number, endTime: number) => void;
  loopVideo: (id: string, startTime: number, endTime: number) => void;
  editVideo: (id: string, edits: any) => void; // 'edits' can be an object containing editing instructions
  // Add more methods as needed
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


  const { exec } = require('child_process');

  const clipVideo = (id: string, startTime: , endTime) => {
    const inputPath = `videos/${id}.mp4`; // Assuming videos are stored in a 'videos' directory
    const outputPath = `clipped_videos/${id}_clipped.mp4`; // Output path for the clipped video
  
    const command = `ffmpeg -i ${inputPath} -ss ${startTime} -to ${endTime} -c:v copy -c:a copy ${outputPath}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error clipping video:', error);
        return;
      }
      console.log(`Video ${id} clipped from ${startTime} to ${endTime}`);
    });
  };
  
  const loopVideo = (id, startTime, endTime) => {
    const inputPath = `videos/${id}.mp4`; // Assuming videos are stored in a 'videos' directory
    const outputPath = `looped_videos/${id}_looped.mp4`; // Output path for the looped video
  
    const command = `ffmpeg -i ${inputPath} -ss ${startTime} -to ${endTime} -c copy -map 0:v -map 0:a -shortest ${outputPath}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error looping video:', error);
        return;
      }
      console.log(`Video ${id} looped from ${startTime} to ${endTime}`);
    });
  };
  
  const editVideo = (id, edits) => {
    // Perform video editing based on the provided edits using ffmpeg or other video editing libraries
    console.log(`Video ${id} edited with the following instructions:`, edits);
  };
  
  module.exports = {
    clipVideo,
    loopVideo,
    editVideo,
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

  const updateVideoTags = async (id: string, tags: string[]) => {
    try {
      const response = await fetch(endpoints.videos.updateVideoTags.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          tags,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update video tags");
      }
      const data = await response.json();
      updateVideo(id, data);
    } catch (error) {
      handleError(error, "updating video tags");
    } finally {
      setIsLoading(false);
    }
  };


  const store: VideoStore = makeAutoObservable({
    videos,
    isLoading,
    error,
    fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    updateVideoTags,
    clipVideo,
    loopVideo,
    editVideo,
  });
  return store;
};

export default useVideoStore;
