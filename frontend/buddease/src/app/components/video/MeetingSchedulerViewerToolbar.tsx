import React from 'react';

interface MeetingSchedulerViewerToolbarProps {
  title: string;
  onRefresh: () => void;
}

const MeetingSchedulerViewerToolbar: React.FC<MeetingSchedulerViewerToolbarProps> = ({ title, onRefresh }) => {
  return (
    <div className="meeting-scheduler-viewer-toolbar">
      <h2>{title}</h2>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  );
}

export default MeetingSchedulerViewerToolbar;
