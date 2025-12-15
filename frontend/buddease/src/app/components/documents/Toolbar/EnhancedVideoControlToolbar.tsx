// EnhancedVideoControlToolbar.tsx
import { ToolbarActions } from '@/app/actions/ToolbarActions';
import { handleApiError } from '@/app/api/ApiLogs';
import { RootState } from '@/app/state/redux/slices/RootSlice';
import { User } from '@/app/users/User';
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import ParticipantData from '@/app/hooks/dataHooks/RealtimeUpdatesComponent';
import { useNotification } from '@/app/state/context/NotificationContext';
import { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';

const EnhancedVideoControlToolbar = () => {
  const dispatch = useDispatch();
  const { notify } = useNotification();
  
  // Retrieve state from Redux store using useSelector
  const isVideoRecordingEnabled = useSelector((state: RootState) => state.toolbarManager.videoRecordingEnabled);
  const isVideoStreamingEnabled = useSelector((state: RootState) => state.toolbarManager.videoStreamingEnabled);
  const isQualitySettingsEnabled = useSelector((state: RootState) => state.toolbarManager.qualitySettingsEnabled);
  const isScreenSharingEnabled = useSelector((state: RootState) => state.toolbarManager.screenSharingEnabled);
  const isParticipantManagementEnabled = useSelector((state: RootState) => state.toolbarManager.participantManagementEnabled);

  // Function to handle video recording
  const handleVideoRecording = () => {
    if (isVideoRecordingEnabled) {
      // Dispatch actions to disable video recording
      dispatch(ToolbarActions.disableVideoRecording());
      dispatch(
        ToolbarActions.toggleFeature({
          feature: "videoRecording",
          isEnabled: false,
          userId: {} as User,
        })
      );
      notify({
        id: "videoRecordingDisabled",
        message: NOTIFICATION_MESSAGES.Video.DISABLE_VIDEO_SUCCESS || "Video recording disabled successfully",
        data: {
          entityType: 'video',
          extra: { feature: 'videoRecording', enabled: false }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } else {
      // Dispatch actions to enable video recording
      dispatch(ToolbarActions.enableVideoRecording());
      dispatch(
        ToolbarActions.toggleFeature({
          feature: "videoRecording",
          isEnabled: true,
          userId: {} as User,
        })
      );
      notify({
        id: "videoRecordingEnabled",
        message: NOTIFICATION_MESSAGES.Video.ENABLE_VIDEO_SUCCESS || "Video recording enabled successfully",
        data: {
          entityType: 'video',
          extra: { feature: 'videoRecording', enabled: true }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    }
  };

  // Function to handle video streaming
  const handleVideoStreaming = () => {
    if (isVideoStreamingEnabled) {
      // Video streaming feature is already enabled, so we need to disable it
      dispatch(ToolbarActions.disableVideoStreaming());
      dispatch(ToolbarActions.toggleFeature({ feature: 'videoStreaming', isEnabled: false, userId: {} as User }));
      
      notify({
        id: "videoStreamingDisabled",
        message: "Video streaming disabled successfully",
        data: {
          entityType: 'video',
          extra: { feature: 'videoStreaming', enabled: false }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } else {
      // Video streaming feature is not enabled, so we need to enable it
      dispatch(ToolbarActions.enableVideoStreaming());
      dispatch(ToolbarActions.toggleFeature({ feature: 'videoStreaming', isEnabled: true, userId: {} as User}));
      
      notify({
        id: "videoStreamingEnabled",
        message: "Video streaming enabled successfully",
        data: {
          entityType: 'video',
          extra: { feature: 'videoStreaming', enabled: true }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    }
  };

  // Function to handle quality settings
  const handleQualitySettings = () => {
    if (isQualitySettingsEnabled) {
      // Quality settings feature is already enabled, so we need to disable it
      dispatch(ToolbarActions.disableQualitySettings());
      dispatch(ToolbarActions.toggleFeature({ feature: 'qualitySettings', isEnabled: false, userId: {} as User }));
      
      notify({
        id: "qualitySettingsDisabled",
        message: "Quality settings disabled",
        data: {
          entityType: 'video',
          extra: { feature: 'qualitySettings', enabled: false }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'info' as const
      });
    } else {
      // Quality settings feature is not enabled, so we need to enable it
      dispatch(ToolbarActions.enableQualitySettings());
      dispatch(ToolbarActions.toggleFeature({ feature: 'qualitySettings', isEnabled: true, userId: {} as User}));
      
      notify({
        id: "qualitySettingsEnabled",
        message: "Quality settings enabled",
        data: {
          entityType: 'video',
          extra: { feature: 'qualitySettings', enabled: true }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'info' as const
      });
    }
  };

  // Function to handle screen sharing
  const handleScreenSharing = () => {
    if (isScreenSharingEnabled) {
      // Screen sharing feature is already enabled, so we need to stop screen sharing
      dispatch(ToolbarActions.stopScreenSharing());
      dispatch(ToolbarActions.toggleFeature({ feature: 'screenSharing', isEnabled: false, userId: {} as User }));
      
      notify({
        id: "screenSharingStopped",
        message: "Screen sharing stopped",
        data: {
          entityType: 'video',
          extra: { feature: 'screenSharing', enabled: false }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } else {
      // Screen sharing feature is not enabled, so we need to start screen sharing
      dispatch(ToolbarActions.startScreenSharing());
      dispatch(ToolbarActions.toggleFeature({ feature: 'screenSharing', isEnabled: true, userId: {} as User }));
      
      notify({
        id: "screenSharingStarted",
        message: "Screen sharing started",
        data: {
          entityType: 'video',
          extra: { feature: 'screenSharing', enabled: true }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    }
  };

  // Function to handle participant management
  const handleParticipantManagement = async () => {
    try {
      if (isParticipantManagementEnabled) {
        // Participant management feature is already enabled, so we can display a modal or perform other actions
        dispatch(ToolbarActions.showParticipantManagementModal(true));
        
        notify({
          id: "participantManagementModalShown",
          message: "Participant management modal opened",
          data: {
            entityType: 'participant',
            extra: { modalOpened: true }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: 'info' as const
        });
      } else {
        // Participant management feature is not enabled, so we need to enable it
        dispatch(ToolbarActions.toggleFeature({ feature: 'participantManagement', isEnabled: true, userId: {} as User }));

        // Fetch participant data before proceeding with participant management actions
        const participantData = dispatch(ToolbarActions.fetchParticipantData({ userId: {} as User, participantData: {} as typeof ParticipantData }));
        
        // Use the fetched participant data as needed
        console.log('Participant data:', participantData);
        
        notify({
          id: "participantManagementEnabled",
          message: NOTIFICATION_MESSAGES.Video.PARTICIPANT_MANAGEMENT_SUCCESS || "Participant management enabled",
          data: {
            entityType: 'participant',
            extra: { feature: 'participantManagement', enabled: true }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: 'success' as const
        });
      }
    } catch (error) {
      // Handle errors gracefully
      handleApiError(error as AxiosError<unknown>, 'Error handling participant management:');
      
      notify({
        id: "participantManagementError",
        message: NOTIFICATION_MESSAGES.Video.PARTICIPANT_MANAGEMENT_ERROR || "Error handling participant management",
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          entityType: 'participant',
          extra: { error }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error' as const
      });
    }
  };

  return (
    <div className="enhanced-video-control-useToolbarManager">
      <button onClick={handleVideoRecording}>Record Video</button>
      <button onClick={handleVideoStreaming}>Stream Video</button>
      <button onClick={handleQualitySettings}>Quality Settings</button>
      <button onClick={handleScreenSharing}>Screen Sharing</button>
      <button onClick={handleParticipantManagement}>Manage Participants</button>
    </div>
  );
};

export default EnhancedVideoControlToolbar;