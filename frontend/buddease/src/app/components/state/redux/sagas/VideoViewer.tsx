// VideoViewer.tsx

import React from 'react';

interface VideoViewerProps {
  videoUrl: string;
}

const VideoViewer: React.FC<VideoViewerProps> = ({ videoUrl }) => {
  return (
    <div className="video-viewer">
      <h2>Video Viewer</h2>
      <div className="video-container">
        <video controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoViewer;
