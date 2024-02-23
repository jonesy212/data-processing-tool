// video/VideoSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiManagerState } from "./ApiSlice";

interface VideoState {
  videos: Video[];
  currentVideoId: string | null;
}

const initialState: VideoState = {
  videos: [],
  currentVideoId: null,
};

export const useVideoManagerSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<Video[]>) => {
      state.videos = action.payload;
    },
    setCurrentVideoId: (state, action: PayloadAction<string | null>) => {
      state.currentVideoId = action.payload;
    },
    // Additional video-related actions
    updateVideoThumbnail: (
      state,
      action: PayloadAction<{ id: string; newThumbnail: string }>
    ) => {
      const { id, newThumbnail } = action.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === id);
      if (videoIndex !== -1) {
        state.videos[videoIndex].thumbnailUrl = newThumbnail;
      }
    },

    updateVideoTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const { id, newTitle } = action.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === id);
      if (videoIndex !== -1) {
        state.videos[videoIndex].title = newTitle;
      }
    },

    updateVideoDescription: (
      state,
      action: PayloadAction<{ id: string; newDescription: string }>
    ) => {
      const { id, newDescription } = action.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === id);
      if (videoIndex !== -1) {
        state.videos[videoIndex].description = newDescription;
      }
    },

    addVideoToPlaylist: (
      state,
      action: PayloadAction<{ id: string, playlistId: string }>) => { 
      const { id, playlistId } = action.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === id);
      if (videoIndex !== -1) {
        state.videos[videoIndex].playlists.push(playlistId);
      }
    }
    // Add more video-related actions as needed
  },
});

export const {
  // Video Management Actions
  setVideos,
  setCurrentVideoId,
  updateVideoThumbnail,
  updateVideoTitle,
  updateVideoDescription,
  // Playlist Management Actions
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  createVideoPlaylist,
  deleteVideoPlaylist,
  renameVideoPlaylist,
  reorderPlaylistVideos,

  // Engagement and Interaction Actions
  likeVideo,
  dislikeVideo,
  shareVideo,
  commentOnVideo,
  deleteVideoComment,
  editVideoComment,
  pinVideoComment,
  reportVideo,
  flagVideoAsInappropriate,
  // Watch Later and Viewing History Actions
  addVideoToWatchLater,
  removeVideoFromWatchLater,
  markVideoAsWatched,
  markVideoAsUnwatched,
  // Channel Subscription and Blocking Actions
  subscribeToChannel,
  unsubscribeFromChannel,
  blockUser,
  unblockUser,
  // Advanced Video Processing and Features
  transcribeVideo,
  translateVideo,
  analyzeVideoContent,
  extractKeyFrames,
  generateVideoSummary,
  autoGenerateVideoCaptions,
  detectEmotionsInVideo,
  createVideoClips,
  compileVideoHighlights,
  integrateAREffects,
  virtualCollaborationSpaces,
  immersive360DegreeView,
  personalizedVideoRecommendations,
  interactiveVideoPolls,
  gamifiedVideoQuizzes,
  liveStreamVideoSessions,
  AIpoweredVideoEditing,
  blockchainVerifiedVideoAuthenticity,
  timeStampedAnnotations,
  holographicVideoProjection,
  sentimentAnalysisInVideos,
  autoGenerateVideoTrailers,
  predictiveAnalyticsForVideoEngagement,
  adaptiveBitrateStreaming,
  VRbasedVideoConferencing,
} = useVideoManagerSlice.actions;
// Export selector for accessing the API configurations from the state
export const selectApiConfigs = (state: { apiManager: ApiManagerState }) =>
  state.apiManager.apiConfigs;

// Export reducer for the API manager slice

export default useVideoManagerSlice.reducer;
