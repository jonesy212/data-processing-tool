// HostVideoLayout.tsx

import React, { useState } from 'react';
import VideoAPI from './VideoAPI';
import VideoViewer from './VideoViewer';
import { Video } from './types';

const HostVideoLayout: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  // Function to fetch videos from the API
  const fetchVideos = async () => {
    try {
      const fetchedVideos = await VideoAPI.getVideos();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Function to add a new video
  const addVideo = async (newVideo: Video) => {
    try {
      await VideoAPI.addVideo(newVideo);
      // After adding the video, fetch the updated list of videos
      fetchVideos();
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  // Function to delete a video
  const deleteVideo = async (videoId: string) => {
    try {
      await VideoAPI.deleteVideo(videoId);
      // After deleting the video, fetch the updated list of videos
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  return (
    <div>
      <h2>Host Video Layout</h2>
      {/* Component to view videos */}
      <VideoViewer videos={videos} onDeleteVideo={deleteVideo} />

      {/* Component for video configuration */}
      <VideoConfiguration onAddVideo={addVideo} />
    </div>
  );
};

export default HostVideoLayout;
