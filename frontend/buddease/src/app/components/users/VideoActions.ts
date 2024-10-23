import { createAction } from "@reduxjs/toolkit";
import { Video } from "../state/stores/VideoStore";
import { VideoData } from "../video/Video";
import { VideoOptions } from "../communications/chat/ChatSettingsModal";

export const VideoActions = {
  // General Video Actions
  createVideo: createAction<{ id: string, updatedVideo: Video }>("createVideo"),
  updateVideo: createAction<{ id: string; title: string, description: string, newData: VideoData }>("updateVideo"),
  deleteVideo: createAction<{id: string}>("deleteVideo"),
  fetchVideoByUserId: createAction<{ userId: string }>("fetchVideoByUserId"),
  setVideos: createAction<Video[]>("setVideos"),
  addVideoTags: createAction<{ id: string, tags: string[] }>("addVideoTags"),
  removeVideoTags: createAction<{ id: string, tags: string[] }>("removeVideoTags"),
  // Video Metadata Actions
  createVideoSuccess: createAction<{id: string, video: Video }>("createVideoSuccess"),
  createVideoFailure: createAction<{ id: string, error: string, video: Video }>("createVideoFailure"),
  
  updateMetadata: createAction<{ id: string; newMetadata: any }>(
    "updateMetadata"
  ),

  showOptionsMenu: createAction<{id: string, options: VideoOptions[]}>("showOptionsMenu"),
  
  // Notification Actions
  sendVideoNotification: createAction<{ id: string; notification: string }>("sendVideoNotification"),
  // Data Actions
  updateVideoData: createAction<{ id: string; newData: any }>(
    "updateVideoData"
  ),
  // Pagination Actions
  fetchVideoSuccess: createAction<{ video: any }>("fetchVideoSuccess"),
  fetchVideoFailure: createAction<{ error: string }>("fetchVideoFailure"),
  fetchVideoRequest: createAction("fetchVideoRequest"),
  
  // Collaboration Actions
  shareVideo: createAction<{ id: string; recipients: string[] }>("shareVideo"),
  // Analytics Actions
  analyzeVideo: createAction<string>("analyzeVideo"),
  // Recommendation Actions
  recommendVideo: createAction<{ id: string; recommendations: string[] }>(
    "recommendVideo"
  ),



  getSelectedVideoOptions: createAction<VideoOptions[]>("getSelectedVideoOptions"),
  // Subscription Actions
  subscribeToVideo: createAction<string>("subscribeToVideo"),
  unsubscribeFromVideo: createAction<string>("unsubscribeFromVideo"),

  // Additional Video Management Actions
  updateVideoThumbnail: createAction<{ id: string; newThumbnail: string }>(
    "updateVideoThumbnail"
  ),
  updateVideoTitle: createAction<{ id: string; newTitle: string }>(
    "updateVideoTitle"
  ),
  updateVideoDescription: createAction<{ id: string; newDescription: string }>(
    "updateVideoDescription"
  ),
  updateVideoTags: createAction<{ id: string; newTags: string[] }>(
    "updateVideoTags"
  ),
  updateVideoLanguage: createAction<{ id: string; newLanguage: string }>(
    "updateVideoLanguage"
  ),
  
  updateVideoCategory: createAction<{ id: string; newCategory: string }>(
    "updateVideoCategory"
  ),
  updateVideoResolution: createAction<{ id: string; newResolution: string }>(
    "updateVideoResolution"
  ),
  updateVideoLicense: createAction<{ id: string; newLicense: string }>(
    "updateVideoLicense"
  ),
  updateVideoLocation: createAction<{ id: string; newLocation: string }>(
    "updateVideoLocation"
  ),


  updateVideoSuccess: createAction<{ id: string; updatedVideo: Video }>(
    "updateVideoSuccess"
  ),

  
  addVideo: createAction<{ id: string, video : Video }>("addVideoSuccess"),
  addVideoSuccess: createAction<{ id: string, video: Video }>("addVideoSuccess"),

  sendVideoNotificationSuccess: createAction<{ id: string }>("sendVideoNotificationSuccess"),
  sendVideoNotificationFailure: createAction<{ id: string, error: string }>("sendVideoNotificationFailure"),

  addVideoFailure: createAction<{ videoId: string, error: string }>("addVideoFailure"),
  removeVideoSuccess: createAction<{ videoId: string }>("removeVideoSuccess"),
  removeVideoFailure: createAction<{ id: string, error: string }>("removeVideoFailure"),
  updateVideoFailure: createAction<{ id: string, error: string }>("updateVideoFailure"),  
  updateVideoRequest: createAction("updateVideoRequest"),
  // Add more actions as needed
};
