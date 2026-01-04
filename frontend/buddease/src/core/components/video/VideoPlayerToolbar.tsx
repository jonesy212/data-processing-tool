VideoPlayerToolbar.tsx
import ToolbarItem from "@/core/components/documents/ToolbarItem";
import React from "react";

interface VideoPlayerToolbarProps {
  onPlay: () => void;
  onPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onVolumeChange: (volume: number) => void;
  onFullScreen: () => void;
  onShareScreen: () => void;
  onSelectScreen: (screenId: string) => void;
  onToggleDualScreen: () => void;
  onToggleNotes: () => void;
  onTagRevisionPoint: (tag: string) => void;
  onAlertSpaCy: () => void;
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
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    onPlay();
    setIsPlaying(true);
  };

  const handlePause = () => {
    onPause();
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  return (
    <div className="video-player-toolbar">
      {/* Basic Playback Controls */}
      <ToolbarItem 
        id="play-pause" 
        label={isPlaying ? "Pause" : "Play"} 
        onClick={handleTogglePlay} 
      />
      <ToolbarItem id="rewind" label="Rewind" onClick={onRewind} />
      <ToolbarItem id="fast-forward" label="Fast Forward" onClick={onFastForward} />
      
      {/* Volume Control */}
      <div className="toolbar-volume">
        <label htmlFor="volume">Volume:</label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        />
      </div>
      
      {/* Fullscreen */}
      <ToolbarItem id="fullscreen" label="Full Screen" onClick={onFullScreen} />
      
      {/* Advanced Features - Your original items */}
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