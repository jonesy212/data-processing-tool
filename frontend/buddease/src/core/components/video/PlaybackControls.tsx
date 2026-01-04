PlaybackControls.tsx

import React from 'react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onVolumeChange: (volume: number) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  volume,
  onPlay,
  onPause,
  onRewind,
  onFastForward,
  onVolumeChange
}) => {
  return (
    <div className="playback-controls">
      <button onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      <button onClick={onRewind}>Rewind</button>
      <button onClick={onFastForward}>Fast Forward</button>

      <div className="volume-control">
        <label>Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default PlaybackControls;
