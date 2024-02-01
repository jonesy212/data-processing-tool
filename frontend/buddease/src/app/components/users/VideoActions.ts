import { createAction } from "@reduxjs/toolkit";

export const VideoActions = {
  // General Video Actions
  updateVideo: createAction<{ id: string; newData: any }>("updateVideo"),
  deleteVideo: createAction<string>("deleteVideo"),
  // Video Metadata Actions
  updateMetadata: createAction<{ id: string; newMetadata: any }>(
    "updateMetadata"
  ),
  // Notification Actions
  sendVideoNotification: createAction<string>("sendVideoNotification"),
  // Data Actions
  updateVideoData: createAction<{ id: string; newData: any }>(
    "updateVideoData"
  ),
  // Pagination Actions
  fetchVideoSuccess: createAction<{ video: any }>("fetchVideoSuccess"),
  fetchVideoFailure: createAction<{ error: string }>("fetchVideoFailure"),
  fetchVideoRequest: createAction("fetchVideoRequest"),

  // Additional Actions Based on App Type
  // Collaboration Actions
  shareVideo: createAction<{ id: string; recipients: string[] }>("shareVideo"),
  // Analytics Actions
  analyzeVideo: createAction<string>("analyzeVideo"),
  // Recommendation Actions
  recommendVideo: createAction<{ id: string; recommendations: string[] }>(
    "recommendVideo"
  ),
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
  // Add more actions as needed
};
