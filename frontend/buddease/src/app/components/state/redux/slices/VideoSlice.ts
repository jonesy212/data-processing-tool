// video/VideoSlice.ts
import { Video } from '@/app/components/video/Video';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoState {
  videos: Video[];
  currentVideoId: string | null;
}

const initialState: VideoState = {
  videos: [],
  currentVideoId: null,
};

const videoManagerSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<Video[]>) => {
      state.videos = action.payload;
    },
    setCurrentVideoId: (state, action: PayloadAction<string | null>) => {
      state.currentVideoId = action.payload;
    },
      // Additional video-related actions
      updateVideoThumbnail: (state, action: PayloadAction<{ id: string, newThumbnail: string }>) => {
        const { id, newThumbnail } = action.payload;
        const videoIndex = state.videos.findIndex(video => video.id === id);
        if (videoIndex !== -1) {
          state.videos[videoIndex].thumbnailUrl = newThumbnail;
        }
      },
      updateVideoTitle: (state, action: PayloadAction<{ id: string, newTitle: string }>) => {
        const { id, newTitle } = action.payload;
        const videoIndex = state.videos.findIndex(video => video.id === id);
        if (videoIndex !== -1) {
          state.videos[videoIndex].title = newTitle;
        }
      },
      updateVideoDescription: (state, action: PayloadAction<{ id: string, newDescription: string }>) => {
        const { id, newDescription } = action.payload;
        const videoIndex = state.videos.findIndex(video => video.id === id);
        if (videoIndex !== -1) {
          state.videos[videoIndex].description = newDescription;
        }
      },
      // Add more video-related actions as needed
    },
  });

export const {
  setVideos,
    setCurrentVideoId,
    updateVideoThumbnail,
  updateVideoTitle,
  updateVideoDescription,
  // Export other video-related actions
} = videoManagerSlice.actions;

export default videoManagerSlice.reducer;
