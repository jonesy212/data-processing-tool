// video/VideoSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiManagerState } from "./ApiSlice";
import { Video } from "../../stores/VideoStore";
import { Data } from "@/app/components/models/data/Data";
import { Snapshot } from "../../stores/SnapshotStore";
import { VideoData } from "@/app/components/video/Video";
import { implementThen } from '../../stores/CommonEvent';
import { WritableDraft } from "../ReducerGenerator";
import { createDraft } from "immer";
import { Channel } from "@/app/components/interfaces/chat/Channel";
import { User } from "@/app/components/users/User";
import { DataAnalysisState } from "@/app/typings/dataAnalysisTypes";
import { CustomComment } from "./BlogSlice";






// Define the generateCaptions function
const generateCaptions = (video: any): string[] => {
  // Logic to generate captions for the video
  // Replace this with your actual implementation
  const captions: string[] = ["Caption 1", "Caption 2", "Caption 3"];
  return captions;
};



interface VideoState {
  videos: Video[];
  currentVideoId: string | null;
  comments: (Comment | CustomComment)[];
  watchLater: string[];
  currentlyWatching: string[]; 
  watched: string[];
  subscribedChannels: string[];
  blockedUsers: string[];
  skipped: string[];
  content: VideoData | null;
  pinned: string[];
}

const initialState: VideoState = {
  videos: [],
  currentVideoId: null,
  comments: [],
  watchLater: [],
  watched: [],
  subscribedChannels: [],
  currentlyWatching: [],
  blockedUsers: [],
  skipped: [],
  content: null,
  pinned: []
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
   
   
    deleteVideoComment: (state, action: PayloadAction<{ videoId: string, commentId: WritableDraft<string> }>) => {
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

    integrateAREffects: {
      reducer: (state, action: PayloadAction<{ videoId: string, effects: string[] }>) => {
        const { videoId, effects } = action.payload;
        // Find the video with the given videoId and integrate AR effects
        state.videos = state.videos.map(video => {
          if (video.id === videoId) {
            // Create a copy of the video object to avoid mutating the original state
            const updatedVideo = { ...video };
            // Logic to integrate AR effects into the video
            updatedVideo.effects = `AREffects integrated into the video with the following effects: ${effects.join(', ')}.`;
            return updatedVideo;
          }
          return video;
        });
      },
      prepare: (videoId: string, effects: string[]) => ({
        payload: { videoId, effects }
      })
    },

    virtualCollaborationSpaces: (state, action: PayloadAction<{ videoId: string, spaces: string[] }>) => {
      // Extract videoId and spaces from the action payload
      const { videoId, spaces } = action.payload;
  
      // Find the video with the given videoId in the state
      const video = state.videos.find(video => video.id === videoId);
  
      // Check if the video with the given videoId exists
      if (video) {
        // Integrate virtual collaboration spaces into the video
        // Concatenate the spaces array into a string with comma separation
        const integratedSpaces = spaces.join(', ');
  
        // Update the video object with the integrated virtual collaboration spaces
        video.spaces = `Virtual collaboration spaces integrated into the video with the following spaces: ${integratedSpaces}.`;
      }
    },

    // Function to integrate virtual collaboration spaces into a video
    integrateVirtualCollaborationSpaces: (
      state,
      action: PayloadAction<{ videos: Video[], videoId: string, spaces: string[] }>
    ): WritableDraft<VideoState> => {
      // Extract necessary data from the action payload
      const { videos, videoId, spaces } = action.payload;

      // Find the video with the specified videoId in the videos array
      const videoToUpdate = videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate virtual collaboration spaces into the video
        videoToUpdate.spaces = `Virtual collaboration spaces integrated into the video with the following spaces: ${spaces.join(', ')}.`;
      }

      // Return the updated state
      return state;
    },



    // Function to integrate an immersive 360 degree view into a video
    immersive360DegreeView: (
      state,
      action: PayloadAction<{ videoId: string, view: string }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, view } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate the immersive 360 degree view into the video
        videoToUpdate.view = `Immersive 360 degree view integrated into the video with the following view: ${view}.`;
      }
    },


    // Function to integrate personalized video recommendations into a video
    personalizedVideoRecommendations: (
      state,
      action: PayloadAction<{ videoId: string, recommendations: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, recommendations } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate personalized video recommendations into the video
        videoToUpdate.recommendations = `Personalized video recommendations integrated into the video with the following recommendations: ${recommendations.join(', ')}.`;
      }
    },


    // Function to integrate interactive video polls into a video
    interactiveVideoPolls: (
      state,
      action: PayloadAction<{ videoId: string, polls: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, polls } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate interactive video polls into the video
        videoToUpdate.polls = `Interactive video polls integrated into the video with the following polls: ${polls.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },


    // Function to integrate gamified video quizzes into a video
    gamifiedVideoQuizzes: (
      state,
      action: PayloadAction<{ videoId: string, quizzes: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, quizzes } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate gamified video quizzes into the video
        videoToUpdate.quizzes = `Gamified video quizzes integrated into the video with the following quizzes: ${quizzes.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },



    // Function to integrate live stream video sessions into a video
    liveStreamVideoSessions: (
      state,
      action: PayloadAction<{ videoId: string, sessions: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, sessions } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate live stream video sessions into the video
        videoToUpdate.sessions = `Live stream video sessions integrated into the video with the following sessions: ${sessions.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },



    // Function to integrate AI-powered video editing into a video
    AIpoweredVideoEditing: (
      state,
      action: PayloadAction<{ videoId: string, editing: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, editing } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate AI-powered video editing into the video
        videoToUpdate.editing = `AI powered video editing integrated into the video with the following editing: ${editing.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },


    blockchainVerifiedVideoAuthenticity(state, action: PayloadAction<{ videoId: string, authenticity: string[] }>) {
      const { videoId, authenticity } = action.payload;
      const video = state.videos.find(video => video.id === videoId);
      if (video) {
        // Logic to integrate blockchain verified video authenticity into the video with the given videoId
        video.authenticity = `Blockchain verified video authenticity integrated into the video with the following authenticity: ${authenticity.join(', ')}.`;
      }
    },


    // Function to integrate time-stamped annotations into a video
    timeStampedAnnotations: (
      state,
      action: PayloadAction<{ videoId: string, annotations: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, annotations } = action.payload;

      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);

      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate time-stamped annotations into the video
        videoToUpdate.annotations = `Time stamped annotations integrated into the video with the following annotations: ${annotations.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },


    holographicVideoProjection: (
      state,
      action: PayloadAction<{ videoId: string, projection: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, projection } = action.payload;
      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);
      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate holographic video projection into the video
        videoToUpdate.projection = `Holographic video projection integrated into the video with the following projection: ${projection.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },

    sentimentAnalysisInVideos: (
      state,
      action: PayloadAction<{ videoId: string, sentiment: string[] }>
    ): void => {
      // Extract necessary data from the action payload
      const { videoId, sentiment } = action.payload;
      // Find the video with the specified videoId in the state
      const videoToUpdate = state.videos.find(video => video.id === videoId);
      // Check if the video with the given videoId exists
      if (videoToUpdate) {
        // Integrate sentiment analysis into the video
        videoToUpdate.sentiment = `Sentiment analysis integrated into the video with the following sentiment: ${sentiment.join(', ')}.`;
      } else {
        // Log a message if the video with the given videoId is not found
        console.log("Video not found");
      }
    },

    autoGenerateVideoTrailers: (
      state,
      action: PayloadAction<{ videoId: string, trailer: string[] }>
    ): VideoState => {
      const { videoId, trailer } = action.payload;
      // Find the video with the given videoId
      const updatedVideos = state.videos.map(video => {
        if (video.id === videoId) {
          // Create a copy of the video object to avoid mutating the original state
          const updatedVideo = { ...video };
          // Logic to integrate auto-generated video trailers into the video
          updatedVideo.trailer = `Auto-generated video trailers integrated into the video with the following trailer: ${trailer.join(', ')}.`;
          return updatedVideo;
        }
        return video;
      });
      return { ...state, videos: updatedVideos };
    },
    
    predictiveAnalyticsForVideoEngagement: (
      state,
      action: PayloadAction<{ videoId: string, engagement: string[] }>
    ): VideoState => {
      const { videoId, engagement } = action.payload;
      // Find the video with the given videoId
      const updatedVideos = state.videos.map(video => {
        if (video.id === videoId) {
          // Create a copy of the video object to avoid mutating the original state
          const updatedVideo = { ...video };
          // Logic to integrate predictive analytics for video engagement into the video
          updatedVideo.engagement = `Predictive analytics for video engagement integrated into the video with the following engagement: ${engagement.join(', ')}.`;
          return updatedVideo;
        }
        return video;
      });
      return { ...state, videos: updatedVideos };
    },
    
    adaptiveBitrateStreaming: (
      state,
      action: PayloadAction<{ videoId: string, streaming: string[] }>
    ): VideoState => {
      const { videoId, streaming } = action.payload;
      // Find the video with the given videoId
      const updatedVideos = state.videos.map(video => {
        if (video.id === videoId) {
          // Create a copy of the video object to avoid mutating the original state
          const updatedVideo = { ...video };
          // Logic to integrate adaptive bitrate streaming into the video
          updatedVideo.streaming = `Adaptive bitrate streaming integrated into the video with the following streaming: ${streaming.join(', ')}.`;
          return updatedVideo;
        }
        return video;
      });
      return { ...state, videos: updatedVideos };
    },
    

    VRbasedVideoConferencing: (
      state,
      action: PayloadAction<{ videoId: string, conferencing: string[] }>
    ): VideoState => {
    
      const { videoId, conferencing } = action.payload;
      // Find the video with the given videoId
      const updatedVideos = state.videos.map(video => {
        if (video.id === videoId) {
          // Create a copy of the video object to avoid mutating the original state
          const updatedVideo = { ...video };
          // Logic to integrate VR-based video conferencing into the video
          updatedVideo.conferencing = `VR-based video conferencing integrated into the video with the following conferencing: ${conferencing.join(', ')}.`;
          return updatedVideo;
        }
        return video;
      });
      
      // Return the updated state
      return { ...state, videos: updatedVideos };
    },    
  }

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

  // Advanced Video Processing and Features
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
