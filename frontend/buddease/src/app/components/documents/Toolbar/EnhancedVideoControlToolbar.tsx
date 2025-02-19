// EnhancedVideoControlToolbar.tsx
import { handleApiError } from '@/app/api/ApiLogs';
import ParticipantData from '@/app/components/hooks/dataHooks/RealtimeUpdatesComponent';
import { User } from '@/app/components/users/User';
import { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { ToolbarActions } from '../../actions/ToolbarActions';
import { RootState } from '../../state/redux/slices/RootSlice';
import { NotificationTypeEnum, useNotification } from '../../support/NotificationContext';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import React from 'react';


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
      notify(
        "features enabled",
        "Video recording disabled successfully",
        NOTIFICATION_MESSAGES.Video.DISABLE_VIDEO_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess,
        // NotificationType.Success
      );
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
      notify(
        "features enabled",
        "Video recording enabled successfully",
        NOTIFICATION_MESSAGES.Video.ENABLE_VIDEO_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationError,
      );
    }
  };

// Function to handle video streaming
const handleVideoStreaming = () => {
  // Check if video streaming feature is enabled

  if (isVideoStreamingEnabled) {
    // Video streaming feature is already enabled, so we need to disable it
    // Implement logic to disable video streaming feature, such as stopping the streaming process
    dispatch(ToolbarActions.disableVideoStreaming());

    // Additionally, we can update the feature state to reflect that video streaming is now disabled
    dispatch(ToolbarActions.toggleFeature({ feature: 'videoStreaming', isEnabled: false, userId: {} as User }));
  } else {
    // Video streaming feature is not enabled, so we need to enable it
    // Implement logic to enable video streaming feature, such as starting the streaming process
    dispatch(ToolbarActions.enableVideoStreaming());

    // Additionally, we can update the feature state to reflect that video streaming is now enabled
    dispatch(ToolbarActions.toggleFeature({ feature: 'videoStreaming', isEnabled: true, userId: {} as User}));
  }
};


// Function to handle quality settings
const handleQualitySettings = () => {
  // Check if quality settings feature is enabled

  if (isQualitySettingsEnabled) {
    // Quality settings feature is already enabled, so we need to disable it
    // Implement logic to disable quality settings feature, such as closing settings menu
    dispatch(ToolbarActions.disableQualitySettings());

    // Additionally, we can update the feature state to reflect that quality settings is now disabled
    dispatch(ToolbarActions.toggleFeature({ feature: 'qualitySettings', isEnabled: false,  userId: {} as User }));
  } else {
    // Quality settings feature is not enabled, so we need to enable it
    // Implement logic to enable quality settings feature, such as opening settings menu
    dispatch(ToolbarActions.enableQualitySettings());

    // Additionally, we can update the feature state to reflect that quality settings is now enabled
    dispatch(ToolbarActions.toggleFeature({ feature: 'qualitySettings', isEnabled: true , userId: {} as User}));
  }
};

// Function to handle screen sharing
const handleScreenSharing = () => {
  // Check if screen sharing feature is enabled

  if (isScreenSharingEnabled) {
    // Screen sharing feature is already enabled, so we need to stop screen sharing
    // Implement logic to stop screen sharing, such as stopping media stream or closing screen sharing session
    dispatch(ToolbarActions.stopScreenSharing());

    // Additionally, we can update the feature state to reflect that screen sharing is now disabled
    dispatch(ToolbarActions.toggleFeature({ feature: 'screenSharing', isEnabled: false, userId: {} as User  }));
  } else {
    // Screen sharing feature is not enabled, so we need to start screen sharing
    // Implement logic to start screen sharing, such as capturing screen or initiating screen sharing session
    dispatch(ToolbarActions.startScreenSharing());

    // Additionally, we can update the feature state to reflect that screen sharing is now enabled
    dispatch(ToolbarActions.toggleFeature({ feature: 'screenSharing', isEnabled: true, userId: {} as User }));
  }
};

// Function to handle participant management
const handleParticipantManagement = async () => {
  const dispatch = useDispatch();
  try {
    if (isParticipantManagementEnabled) {
      // Participant management feature is already enabled, so we can display a modal or perform other actions
      // For example, display a modal for participant management
      dispatch(ToolbarActions.showParticipantManagementModal(true));
    } else {
      // Participant management feature is not enabled, so we need to enable it
      dispatch(ToolbarActions.toggleFeature({ feature: 'participantManagement', isEnabled: true, userId: {} as User }))

      // Fetch participant data before proceeding with participant management actions
      const participantData = dispatch(ToolbarActions.fetchParticipantData({ userId: {} as User, participantData: {} as typeof ParticipantData }));
      // Pass userId to fetchParticipantData
  
       // Use the fetched participant data as needed
       console.log('Participant data:', participantData);
   
      // Additional logic based on fetched participant data, if needed
    }
  } catch (error) {
    // Handle errors gracefully
    handleApiError(error as AxiosError<unknown>, 'Error handling participant management:');
    // Optionally, dispatch an action to display an error message to the user
    notify(
      "Participants could not be managed",
      'Error handling participant management:',
      NOTIFICATION_MESSAGES.Video.PARTICIPANT_MANAGEMENT_ERROR,
      new Date(),
     NotificationTypeEnum.Error)    // Optionally, dispatch an action to display an error message to the user
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
