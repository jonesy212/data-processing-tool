import { endpoints } from "@/app/api/ApiEndpoints";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext"; // Import useNotification
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import { Progress } from "../../models/tracker/ProgresBar";
import axiosInstance from "../../security/csrfToken";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

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
  const clipVideo = (id: string, startTime: number, endTime: number) => {
    const inputPath = `videos/${id}.mp4`; // Assuming videos are stored in a 'videos' directory
    const outputPath = `clipped_videos/${id}_clipped.mp4`; // Output path for the clipped video
  
    const command = `ffmpeg -i ${inputPath} -ss ${startTime} -to ${endTime} -c:v copy -c:a copy ${outputPath}`;
  
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('Error clipping video:', error);
        return;
      }
      console.log('Clip video stdout:', stdout); // Output from the clipping process
      console.error('Clip video stderr:', stderr); // Error messages from the clipping process
      console.log(`Video ${id} clipped from ${startTime} to ${endTime}`);
    });
  };
  

  const loopVideo = (id: string, startTime: number, endTime: number) => {
    const inputPath = `videos/${id}.mp4`; // Assuming videos are stored in a 'videos' directory
    const outputPath = `looped_videos/${id}_looped.mp4`; // Output path for the looped video
  
    const command = `ffmpeg -i ${inputPath} -ss ${startTime} -to ${endTime} -c copy -map 0:v -map 0:a -shortest ${outputPath}`;
  
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('Error looping video:', error);
        return;
      }
      console.log('Loop video stdout:', stdout); // Output from the looping process
      console.error('Loop video stderr:', stderr); // Error messages from the looping process
      console.log(`Video ${id} looped from ${startTime} to ${endTime}`);
    });
  };



  
  const editVideo = (id: string, edits: any) => {
    // Assuming 'videos' is a state variable holding the videos
    const inputPath = `videos/${id}.mp4`; // Input path for the video
    const outputPath = `edited_videos/${id}_edited.mp4`; // Output path for the edited video
  
    // Construct the ffmpeg command based on the provided edits
    // Example: Apply filters, add text overlay, adjust brightness/contrast, etc.
    let command = `ffmpeg -i ${inputPath}`;
  
    // Apply edits (customize this part based on the provided edits)
    // Example: Adding a text overlay
    if (edits.textOverlay) {
      const { text, x, y } = edits.textOverlay;
      command += ` -vf "drawtext=text='${text}':x=${x}:y=${y}:fontsize=24:fontcolor=white"`;
    }
  
    // Add more edit options as needed
  
    command += ` ${outputPath}`;
  
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('Error editing video:', error);
        return;
      }
      console.log('Edit video stdout:', stdout); // Output from the editing process
      console.error('Edit video stderr:', stderr); // Error messages from the editing process
      console.log(`Video ${id} edited with the following instructions:`, edits);
    });
  };
  
  
  const moveClip = async (id: string, startTime: number, endTime: number) => { 
    const videoId = await axiosInstance.patch(endpoints.videos.moveClip + id, {
      startTime,
      endTime,
    });
    notify(
      "moveClipSuccess",
      `You have successfully moved the clip ${videoId}`,
      NOTIFICATION_MESSAGES.Video.MOVE_CLIP_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  }

  const snapClipsTogether = async (id: string) => { 
    const videoId = await axiosInstance.patch(endpoints.videos.snapClipsTogether + id);
    notify(
      "snapClipsTogetherSuccess",
      `You have successfully snapped the clips together ${videoId}`,
      NOTIFICATION_MESSAGES.Video.SNAP_CLIPS_TOGETHER_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  }

  const renderVideoClips = async (id: string) => { 
    const videoId = await axiosInstance.patch(endpoints.videos.renderVideoClips + id);
    notify(
      "renderVideoClipsSuccess",
      `You have successfully rendered the video clips ${videoId}`,
      NOTIFICATION_MESSAGES.Video.RENDER_VIDEO_CLIPS_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  }

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
    moveClip,
    snapClipsTogether,
    renderVideoClips,



  });
  return store;
};

export default useVideoStore;





// The inputPath variable represents the input path for the video to be edited.
// The outputPath variable represents the output path for the edited video.
// The edits parameter contains instructions for the video editing process, such as adding text overlay, applying filters, adjusting brightness/contrast, etc.
// The ffmpeg command is constructed based on the provided edits and executed using the exec function.
// The stdout and stderr streams produced by the exec function are captured and logged to the console.