// VideoManagementUI.tsx
import React from 'react';
import MarkerComponent from './MarkerComponent';
import MarkerTimeline from './MarkerTimeline';
import PlaybackControls from './PlaybackControls';
import RewindButton from './RewindButton';
import VideoPlayer from './VideoPlayer';

const VideoManagementUI: React.FC = () => {
  return (
    <div>
      <VideoPlayer />
      <PlaybackControls />
      <RewindButton />
      <MarkerComponent />
      <MarkerTimeline />
    </div>
  );
};

export default VideoManagementUI;
