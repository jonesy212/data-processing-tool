// useVideoPlayer.ts
// app/features/video/hooks/useVideoPlayer.ts
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";
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
          notify({
            id: "screenShareStarted",
            message: NOTIFICATION_MESSAGES.Video.SCREEN_SHARE_STARTED,
            data: {
              extra: {
                operation: "Screen sharing",
                status: "started",
                timestamp: new Date().toISOString()
              }
            },
            timestamp: new Date(),
            type: NotificationTypeEnum.INFO,
            level: 'info'
          });
        })
        .catch(error => {
          console.error('Error sharing screen:', error);
          notify({
            id: "screenShareError",
            message: NOTIFICATION_MESSAGES.Video.SCREEN_SHARE_ERROR,
            data: {
              originalError: error.message,
              extra: {
                errorMessage: "Failed to start screen sharing",
                operation: "Screen sharing",
                status: "error"
              }
            },
            timestamp: new Date(),
            type: NotificationTypeEnum.ERROR,
            level: 'error'
          });
        });
    }
  }, [notify]);

  const selectScreen = useCallback((screenId: string) => {
    setPlayerState(prev => ({ ...prev, selectedScreenId: screenId }));
    console.log('Selected screen:', screenId);
    notify({
      id: "screenSelected",
      message: NOTIFICATION_MESSAGES.Video.SCREEN_SELECTED,
      data: {
        extra: {
          operation: "Screen selection",
          screenId,
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info'
    });
  }, [notify]);

  const toggleDualScreen = useCallback(() => {
    const newDualScreenState = !playerState.isDualScreen;
    setPlayerState(prev => ({ 
      ...prev, 
      isDualScreen: newDualScreenState 
    }));
    notify({
      id: "dualScreenToggled",
      message: NOTIFICATION_MESSAGES.Video.DUAL_SCREEN_TOGGLED,
      data: {
        extra: {
          operation: "Toggle dual screen",
          isDualScreen: newDualScreenState,
          status: newDualScreenState ? 'enabled' : 'disabled',
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info'
    });
  }, [playerState.isDualScreen, notify]);

  const toggleNotes = useCallback(() => {
    const newNotesVisibleState = !playerState.areNotesVisible;
    setPlayerState(prev => ({ 
      ...prev, 
      areNotesVisible: newNotesVisibleState 
    }));
    notify({
      id: "notesToggled",
      message: NOTIFICATION_MESSAGES.Video.NOTES_TOGGLED,
      data: {
        extra: {
          operation: "Toggle notes",
          areNotesVisible: newNotesVisibleState,
          status: newNotesVisibleState ? 'shown' : 'hidden',
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info'
    });
  }, [playerState.areNotesVisible, notify]);

  const tagRevisionPoint = useCallback((tag: string) => {
    const timestamp = Math.floor(playerState.currentTime);
    setPlayerState(prev => ({
      ...prev,
      revisionTags: [...prev.revisionTags, `${tag}-${timestamp}`]
    }));
    notify({
      id: "revisionTagged",
      message: NOTIFICATION_MESSAGES.Video.REVISION_TAGGED,
      data: {
        extra: {
          operation: "Tag revision point",
          tag,
          timestampSeconds: timestamp,
          formattedTime: `${timestamp}s`,
          fullTag: `${tag}-${timestamp}`,
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info'
    });
  }, [playerState.currentTime, notify]);

  const alertSpaCy = useCallback(() => {
    // Integration with spaCy for NLP processing
    console.log('Alerting spaCy for NLP processing');
    notify({
      id: "spacyAlerted",
      message: NOTIFICATION_MESSAGES.Video.SPACY_ALERTED,
      data: {
        extra: {
          operation: "SpaCy NLP processing",
          action: "triggered",
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info'
    });
    
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