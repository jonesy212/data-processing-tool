// app/features/video/hooks/useVideoPlayer.ts
import { NotificationTypeEnum, useNotification } from '@/app/context/NotificationContext';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { useCallback, useRef, useState } from 'react';

interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isBuffering: boolean;
  error: string | null;
  // Enhanced state
  isDualScreen: boolean;
  areNotesVisible: boolean;
  revisionTags: string[];
  selectedScreenId: string | null;
}

interface VideoPlayerControls {
  // Basic controls
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  rewind: (seconds?: number) => void;
  fastForward: (seconds?: number) => void;
  togglePlay: () => void;
  
  // NEW: Enhanced controls for your toolbar features
  shareScreen: () => void;
  selectScreen: (screenId: string) => void;
  toggleDualScreen: () => void;
  toggleNotes: () => void;
  tagRevisionPoint: (tag: string) => void;
  alertSpaCy: () => void;
}

export const useVideoPlayer = (videoUrl?: string) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isFullscreen: false,
    isBuffering: false,
    error: null,
    // NEW: Enhanced state initialization
    isDualScreen: false,
    areNotesVisible: false,
    revisionTags: [],
    selectedScreenId: null,
  });

  const { notify } = useNotification();

  // NEW: Enhanced control implementations
  const shareScreen = useCallback(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(stream => {
          // Handle screen sharing stream
          console.log('Screen sharing started');
          notify(
            "Screen Sharing",
            "Screen sharing activated",
            NOTIFICATION_MESSAGES.Video.SCREEN_SHARE_STARTED,
            new Date(),
            NotificationTypeEnum.INFO
          );
        })
        .catch(error => {
          console.error('Error sharing screen:', error);
          notify(
            "Screen Share Error",
            error.message,
            NOTIFICATION_MESSAGES.Video.SCREEN_SHARE_ERROR,
            new Date(),
            NotificationTypeEnum.ERROR
          );
        });
    }
  }, [notify]);

  const selectScreen = useCallback((screenId: string) => {
    setPlayerState(prev => ({ ...prev, selectedScreenId: screenId }));
    console.log('Selected screen:', screenId);
    notify(
      "Screen Selected",
      `Screen ${screenId} selected`,
      NOTIFICATION_MESSAGES.Video.SCREEN_SELECTED,
      new Date(),
      NotificationTypeEnum.INFO
    );
  }, [notify]);

  const toggleDualScreen = useCallback(() => {
    setPlayerState(prev => ({ 
      ...prev, 
      isDualScreen: !prev.isDualScreen 
    }));
    notify(
      "Dual Screen",
      `Dual screen ${!playerState.isDualScreen ? 'enabled' : 'disabled'}`,
      NOTIFICATION_MESSAGES.Video.DUAL_SCREEN_TOGGLED,
      new Date(),
      NotificationTypeEnum.INFO
    );
  }, [playerState.isDualScreen, notify]);

  const toggleNotes = useCallback(() => {
    setPlayerState(prev => ({ 
      ...prev, 
      areNotesVisible: !prev.areNotesVisible 
    }));
    notify(
      "Notes",
      `Notes ${!playerState.areNotesVisible ? 'shown' : 'hidden'}`,
      NOTIFICATION_MESSAGES.Video.NOTES_TOGGLED,
      new Date(),
      NotificationTypeEnum.INFO
    );
  }, [playerState.areNotesVisible, notify]);

  const tagRevisionPoint = useCallback((tag: string) => {
    setPlayerState(prev => ({
      ...prev,
      revisionTags: [...prev.revisionTags, `${tag}-${Math.floor(prev.currentTime)}`]
    }));
    notify(
      "Revision Tag",
      `Tagged at ${Math.floor(playerState.currentTime)}s: ${tag}`,
      NOTIFICATION_MESSAGES.Video.REVISION_TAGGED,
      new Date(),
      NotificationTypeEnum.INFO
    );
  }, [playerState.currentTime, notify]);

  const alertSpaCy = useCallback(() => {
    // Integration with spaCy for NLP processing
    console.log('Alerting spaCy for NLP processing');
    notify(
      "spaCy Alert",
      "NLP processing triggered",
      NOTIFICATION_MESSAGES.Video.SPACY_ALERTED,
      new Date(),
      NotificationTypeEnum.INFO
    );
    
    // You can add actual spaCy integration here
    // Example: processVideoTranscriptWithSpacy(videoRef.current);
  }, [notify]);

  // ... keep all your existing basic controls (play, pause, seek, etc.)

  const controls: VideoPlayerControls = {
    // Basic controls (your existing ones)
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    rewind,
    fastForward,
    togglePlay,
    
    // NEW: Enhanced controls
    shareScreen,
    selectScreen,
    toggleDualScreen,
    toggleNotes,
    tagRevisionPoint,
    alertSpaCy,
  };

  return {
    videoRef,
    playerState,
    controls,
  };
};

export default useVideoPlayer;