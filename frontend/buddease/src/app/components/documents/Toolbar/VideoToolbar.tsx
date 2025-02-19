// VideoToolbar.tsx
import React from 'react';

interface VideoToolbarProps {
  onRecord: () => void;
  onUpload: () => void;
  onEdit: () => void;
  onManage: () => void;
}

const VideoToolbar: React.FC<VideoToolbarProps> = ({ onRecord, onUpload, onEdit, onManage }) => {
  return (
    <div className="video-toolbar">
      <button onClick={onRecord}>Record Video</button>
      <button onClick={onUpload}>Upload Video</button>
      <button onClick={onEdit}>Edit Video</button>
      <button onClick={onManage}>Manage Videos</button>
    </div>
  );
};

export default VideoToolbar;
