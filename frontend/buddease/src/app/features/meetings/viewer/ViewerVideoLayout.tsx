// ViewerVideoLayout.tsx

import VideoAPI from '@/app/api/videos/VideoAPI';
import VideoViewer from '@/app/state/redux/sagas/VideoViewer';
import { Video } from '@/app/typings/videoTypes/Video';
import React, { useEffect, useState } from 'react';

const ViewerVideoLayout: React.FC = () => {
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

  // useEffect hook to fetch videos when the component mounts
  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div>
      <h2>Viewer Video Layout</h2>
      {/* Component to view videos */}
      <VideoViewer videos={videos} />
    </div>
  );
};

export default ViewerVideoLayout;
