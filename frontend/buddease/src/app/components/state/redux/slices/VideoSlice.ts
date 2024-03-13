// video/VideoSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiManagerState } from "./ApiSlice";
import { Video } from "../../stores/VideoStore";
import { Data } from "@/app/components/models/data/Data";
import { Snapshot } from "../../stores/SnapshotStore";
import { VideoData } from "@/app/components/video/Video";
import { implementThen } from '../../stores/CommonEvent';
import { Comment } from "@/app/components/todos/Todo";
import { WritableDraft } from "../ReducerGenerator";
import { createDraft } from "immer";
import { Channel } from "@/app/components/interfaces/chat/Channel";
import { User } from "@/app/components/users/User";
import { DataAnalysisState } from "@/app/typings/dataAnalysisTypes";
interface VideoState {
  videos: Video[];
  currentVideoId: string | null;
  comments: Comment[];
  watchLater: string[];
  currentlyWatching: string[]; 
  watched: string[];
  subscribedChannels: string[];
  blockedUsers: string[];
  skipped: string[];
}

const initialState: VideoState = {
  videos: [],
  currentVideoId: null,
  comments: [],
  watchLater: [],
  watched: [],
  subscribedChannels: [],
  currentlyWatching: [],
  blockedUsers: []
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
    },

    removeVideoFromPlaylist: (
      state,
      action: PayloadAction<{ id: string, playlistId: string }>) => {
     
      // TODO: Implement this
      const { id, playlistId } = action.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === id);
      if (videoIndex !== -1) {
        state.videos[videoIndex].playlists.splice(
          state.videos[videoIndex].playlists.indexOf(playlistId),
          1
        );
      }
    },

    createVideoPlaylist: (
      state,
      actions: PayloadAction<{ playlistName: string }>) => {
      const { playlistName } = actions.payload;
      state.videos.push({
        id: "new-playlist-id",
        title: playlistName,
        thumbnailUrl: "",
        description: "",
        playlists: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: "",
        status: "scheduled",
        isActive: false,
        phase: null,
        then: implementThen,
        analysisType: "",
        analysisResults: [],
        videoData: {} as WritableDraft<VideoData>,
        content: "",
        watchLater: false,
      });
    },

    deleteVideoPlaylist: (state, actions: PayloadAction<{ playlistId: string }>) => {
      const { playlistId } = actions.payload;
      const playlistIndex = state.videos.findIndex((video) => video.id === playlistId);
      if (playlistIndex !== -1) {
        state.videos.splice(playlistIndex, 1);
      }
    },
    renameVideoPlaylist: (state, actions: PayloadAction<{ playlistId: string, newName: string }>) => {
      const { playlistId, newName } = actions.payload;
      const playlistIndex = state.videos.findIndex((video) => video.id === playlistId);
      if (playlistIndex !== -1) {
        state.videos[playlistIndex].title = newName;
      }
    },

    reorderPlaylistVideos: (state, actions: PayloadAction<{ playlistId: string, newOrder: string[] }>) => {
      const { playlistId, newOrder } = actions.payload;
      const playlistIndex = state.videos.findIndex((video) => video.id === playlistId);
      if (playlistIndex !== -1) {
        state.videos[playlistIndex].playlists = newOrder;
      }
    },


    likeVideo: (state, actions: PayloadAction<{ videoId: string }>) => {
      const { videoId } = actions.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === videoId);
      if (videoIndex !== -1) {
        state.videos[videoIndex].likes.push(videoId);
      }
    },

    dislikeVideo: (state, actions: PayloadAction<{ videoId: string }>) => {
      const { videoId } = actions.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === videoId);
      if (videoIndex !== -1) {
        state.videos[videoIndex].likes.splice(
          state.videos[videoIndex].likes.indexOf(videoId),
          1
        );
      }
    },

    shareVideo: (state, actions: PayloadAction<{ videoId: string }>) => {
      const { videoId } = actions.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === videoId);
      if (videoIndex !== -1) {
        state.videos[videoIndex].shares.push(videoId);
      }
    },



    unshareVideo: (state, actions: PayloadAction<{ videoId: string }>) => {
      const { videoId } = actions.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === videoId);
      if (videoIndex !== -1) {
        state.videos[videoIndex].shares.splice(
          state.videos[videoIndex].shares.indexOf(videoId),
          1
        );
      }
    },

   

    commentOnVideo: (state, action: PayloadAction<{ videoId: string, comment: Comment }>) => {
      const { videoId, comment } = action.payload;
      const videoIndex = state.videos.findIndex((video) => video.id === videoId);
      if (videoIndex !== -1) {
        // Check if state.videos[videoIndex].comments is defined before pushing the comment
        if (Array.isArray(state.videos[videoIndex]?.comments)) {
          // Create a writable draft of the comment object
          const draftComment = createDraft(comment);
          state.videos[videoIndex].comments?.push(draftComment);
        } else {
          // If comments array is undefined or not an array, initialize it with an empty array and push the comment
          state.videos[videoIndex].comments = [comment];
        }
      }
    },
   
   
    deleteVideoComment: (state, action: PayloadAction<{ videoId: string, commentId: string }>) => {
      const { videoId, commentId } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Filter out the comment with the specified commentId
        video.comments = video.comments?.filter(comment => comment.id !== commentId);
      }
    },
    
    editVideoComment: (state, action: PayloadAction<{ videoId: string, commentId: string, updatedComment: string }>) => {
      const { videoId, commentId, updatedComment } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Find the comment with the specified commentId and update its content
        const commentToUpdate = video.comments?.find(comment => comment.id === commentId);
        if (commentToUpdate) {
          commentToUpdate.content = updatedComment;
        }
      }
    },
    
    pinVideoComment: (state, action: PayloadAction<{ videoId: string, commentId: string }>) => {
      const { videoId, commentId } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Find the comment with the specified commentId and set its pinned status to true
        const commentToPin = video.comments?.find(comment => comment.id === commentId);
        if (commentToPin) {
          commentToPin.pinned = true;
        }
      }
    },


    reportVideo: (state, action: PayloadAction<{ videoId: Video['id'], reason: string }>) => {
      const { videoId, reason } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Add the reason for reporting to the video's report array
        video.reports.push(reason);
      }
    },
    
    flagVideoAsInappropriate: (state, action: PayloadAction<{ videoId: string }>) => {
      const { videoId } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Set the inappropriate flag to true for the specified video
        video.inappropriate = true;
      }
    },
    
    addVideoToWatchLater: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      // Check if the video is not already in the watch later list
      if (!state.watchLater.includes(videoId)) {
        // Add the video to the watch later list
        state.watchLater.push(videoId);
      }
    },
    
    removeVideoFromWatchLater: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      // Filter out the video from the watch later list
      state.watchLater = state.watchLater.filter((id: Video['id']) => id !== videoId);
    },


    markVideoAsWatched: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      // Check if the video is not already in the watched list
      if (!state.watched.includes(videoId)) {
        // Add the video to the watched list
        state.watched.push(videoId);
      }
    },


    markVideoAsUnwatched: (state, action: PayloadAction<string>) => {
      const videoId = action.payload;
      // Filter out the video from the watched list
      state.watched = state.watched.filter((id: Video['id']) => id !== videoId);
    },
    


    subscribeToChannel: (state, action: PayloadAction<string>) => {
      const channelId = action.payload;
      // Check if the channel is not already in the subscribed channels list
      if (!state.subscribedChannels.includes(channelId)) {
        // Add the channel to the subscribed channels list
        state.subscribedChannels.push(channelId);
      }
    },


    unsubscribeFromChannel: (state, action: PayloadAction<string>) => {
      const channelId = action.payload;
      // Filter out the channel from the subscribed channels list
      state.subscribedChannels = state.subscribedChannels.filter((id: Channel['id']) => id !== channelId);
    },



    blockUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      // Check if the user is not already in the blocked users list
      if (!state.blockedUsers.includes(userId)) {
        // Add the user to the blocked users list
        state.blockedUsers.push(userId);
      }
    },


    unblockUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      // Filter out the user from the blocked users list
      state.blockedUsers = state.blockedUsers.filter((id: User['id']) => id !== userId);
    },



    transcribeVideo: (state, action: PayloadAction<{ videoId: string, transcript: string }>) => {
      const { videoId, transcript } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Set the transcript for the specified video
        video.transcript = transcript;
      }
    },


    translateVideo: (state, action: PayloadAction<{ videoId: string, translation: string }>) => {
      const { videoId, translation } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Set the translation for the specified video
        video.translation = translation;
      }
    },


// Fixing the types for analyzeVideoContent and extractKeyFrames reducers
    analyzeVideoContent: (state, action: PayloadAction<{ videoId: string, analysis: string }>) => {
      const { videoId, analysis } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Set the analysis for the specified video
        video.analysis = analysis;
      }
    },




    extractKeyFrames: (state, action: PayloadAction<{ videoId: string, keyFrames: string[] }>) => {
  const { videoId, keyFrames } = action.payload;
  const video = state.videos.find(video => video.id === videoId);
  if (video) {
    video.keyFrames = keyFrames;
  }
},

generateVideoSummary: (state, action: PayloadAction<{ videoId: string, videos: Video[] }>) => {
  const { videoId, videos } = action.payload;
  const video = videos.find(video => video.id === videoId);
  if (video) {
    video.summary = `Summary for video "${video.title}" generated.`;
  }
},

autoGenerateVideoCaptions: (state, action: PayloadAction<{ videoId: string }>) => {
  const { videoId } = action.payload;
  const video = state.videos.find(video => video.id === videoId);
  if (video) {
    // Logic to automatically generate captions for the video with the given videoId
    const generatedCaptions = generateCaptions(video); // Replace generateCaptions with your actual logic
    video.captions = generatedCaptions;
  }
},




detectEmotionsInVideo: (state, action: PayloadAction<{ videoId: string }>) => {
  const { videoId } = action.payload;
  const video = state.videos.find(video => video.id === videoId);
  if (video) {
    // Logic to detect emotions in the video with the given videoId
    video.emotions = "Emotions detected.";
  }
},

createVideoClips: (state, action: PayloadAction<{ videoId: string, startTime: number, endTime: number }>) => {
  const { videoId, startTime, endTime } = action.payload;
  const video = state.videos.find(video => video.id === videoId);
  if (video) {
    // Logic to create video clips from the video with the given videoId, startTime, and endTime
    video.clips = `Video clips created from ${startTime} to ${endTime}.`;
  }
},

compileVideoHighlights: (state, action: PayloadAction<{ videoId: string, highlightTimes: number[] }>) => {
  const { videoId, highlightTimes } = action.payload;
  const video = state.videos.find(video => video.id === videoId);
  if (video) {
    // Logic to compile video highlights from the video with the given videoId and highlightTimes
    video.highlights = `Video highlights compiled at ${highlightTimes.join(', ')}.`;
  }
},




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
  unshareVideo,
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
