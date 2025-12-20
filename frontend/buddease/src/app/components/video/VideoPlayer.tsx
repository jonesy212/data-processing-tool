// VideoPlayer.tsx
// app/features/video/components/VideoPlayer.tsx
import useVideoPlayer from '@/hooks/useVideoPlayer';
import React, { useEffect } from 'react';
import VideoPlayerToolbar from '@/app/components/video/VideoPlayerToolbar';

interface VideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
  onShareScreen?: () => void;
  onSelectScreen?: (screenId: string) => void;
  onToggleDualScreen?: () => void;
  onToggleNotes?: () => void;
  onTagRevisionPoint?: (tag: string) => void;
  onAlertSpaCy?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  autoPlay = false,
  onShareScreen,
  onSelectScreen,
  onToggleDualScreen,
  onToggleNotes,
  onTagRevisionPoint,
  onAlertSpaCy,
}) => {
  const { videoRef, playerState, controls } = useVideoPlayer(videoUrl);

  // Sync video source when url changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl;
      if (autoPlay) {
        controls.play();
      }
    }
  }, [videoUrl, autoPlay, controls]);

  // Use enhanced controls from hook, fallback to props if provided
  const handleShareScreen = onShareScreen || controls.shareScreen;
  const handleSelectScreen = onSelectScreen || controls.selectScreen;
  const handleToggleDualScreen = onToggleDualScreen || controls.toggleDualScreen;
  const handleToggleNotes = onToggleNotes || controls.toggleNotes;
  const handleTagRevisionPoint = onTagRevisionPoint || controls.tagRevisionPoint;
  const handleAlertSpaCy = onAlertSpaCy || controls.alertSpaCy;

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        src={videoUrl}
        className="video-element"
        autoPlay={autoPlay}
        controls={false} // We're using custom controls
      />
      
      <VideoPlayerToolbar
        onPlay={controls.play}
        onPause={controls.pause}
        onRewind={() => controls.rewind(10)}
        onFastForward={() => controls.fastForward(10)}
        onVolumeChange={controls.setVolume}
        onFullScreen={controls.toggleFullscreen}
        onShareScreen={handleShareScreen}
        onSelectScreen={handleSelectScreen}
        onToggleDualScreen={handleToggleDualScreen}
        onToggleNotes={handleToggleNotes}
        onTagRevisionPoint={handleTagRevisionPoint}
        onAlertSpaCy={handleAlertSpaCy}
      />
      
      {/* Enhanced state display */}
      <div className="player-info">
        <span>
          {Math.floor(playerState.currentTime / 60)}:
          {Math.floor(playerState.currentTime % 60).toString().padStart(2, '0')}
        </span>
        <span> / </span>
        <span>
          {Math.floor(playerState.duration / 60)}:
          {Math.floor(playerState.duration % 60).toString().padStart(2, '0')}
        </span>
        
        {/* Show enhanced state when active */}
        {playerState.isDualScreen && <span className="dual-screen-badge">Dual Screen</span>}
        {playerState.areNotesVisible && <span className="notes-badge">Notes On</span>}
        {playerState.revisionTags.length > 0 && (
          <span className="tags-badge">{playerState.revisionTags.length} tags</span>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;