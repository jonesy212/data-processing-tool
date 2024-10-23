import React from "react";
import ToolbarItem from "../documents/ToolbarItem";

interface VideoPlayerToolbarProps {
  onPlay: () => void;
  onPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onVolumeChange: (volume: number) => void;
  onFullScreen: () => void;
  onShareScreen: () => void; // New feature: Share screen
  onSelectScreen: (screenId: string) => void; // New feature: Select screen to share
  onToggleDualScreen: () => void; // New feature: Toggle dual screen mode
  onToggleNotes: () => void; // New feature: Toggle note-taking
  onTagRevisionPoint: (tag: string) => void; // New feature: Tag revision point
  onAlertSpaCy: () => void; // New feature: Alert spaCy integration
}

const VideoPlayerToolbar: React.FC<VideoPlayerToolbarProps> = ({
  onPlay,
  onPause,
  onRewind,
  onFastForward,
  onVolumeChange,
  onFullScreen,
  onShareScreen,
  onSelectScreen,
  onToggleDualScreen,
  onToggleNotes,
  onTagRevisionPoint,
  onAlertSpaCy,
}) => {
  return (
    <div className="video-player-toolbar">
      {/* Existing toolbar items */}
      
      <ToolbarItem id="share-screen" label="Share Screen" onClick={onShareScreen} />
      <ToolbarItem id="select-screen" label="Select Screen" onClick={() => onSelectScreen("screenId")} />
      <ToolbarItem id="toggle-dual-screen" label="Toggle Dual Screen" onClick={onToggleDualScreen} />
      <ToolbarItem id="toggle-notes" label="Toggle Notes" onClick={onToggleNotes} />
      <ToolbarItem id="tag-revision-point" label="Tag Revision Point" onClick={() => onTagRevisionPoint("revisionTag")} />
      <ToolbarItem id="alert-spacy" label="Alert spaCy" onClick={onAlertSpaCy} />
    </div>
  );
};

export default VideoPlayerToolbar;
