// videoSagas.ts
// videoSaga.ts
import { videoService } from "@/app/api/ApiVideo";
import { VideoActions } from "@/app/actions/VideoActions";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { useNotification } from "@/app/state/context/NotificationContext";
import { select } from "@/app/state/redux/sagas/UndoRedoSaga";
import { Video } from '@/app/typings/videoTypes/Video';
import { call, put, takeLatest } from "redux-saga/effects";
import { AxiosError, AxiosResponse } from 'axios';
import { RootState } from "@/app/state/redux/slices/RootSlice";

const { notify } = useNotification();

// Helper function for conference success notifications
const notifyConferenceSuccess = (conferenceId: string | null, message: string, actionType: string, extra: any = {}) => {
  notify({
    id: `conference_${actionType}_success_${conferenceId || 'new'}_${Date.now()}`,
    message,
    data: {
      entityId: conferenceId,
      entityType: 'conference',
      extra: {
        conferenceId,
        action: actionType,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_SUCCESS,
    level: 'success' as const
  });
};

// Helper function for conference error notifications
const notifyConferenceError = (error: any, message: string, conferenceId: string | null, actionType: string, extra: any = {}) => {
  notify({
    id: `conference_${actionType}_error_${conferenceId || 'unknown'}_${Date.now()}`,
    message,
    data: {
      originalError: error?.message || 'Unknown error',
      entityId: conferenceId,
      entityType: 'conference',
      extra: {
        conferenceId,
        action: actionType,
        error,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
}


const notifyVideoSuccess = (videoId: string, message: string, actionType: string, extra: any = {}) => {
  notify({
    id: `video_${actionType}_success_${videoId}_${Date.now()}`,
    message,
    data: {
      entityId: videoId,
      entityType: 'video',
      extra: {
        videoId,
        action: actionType,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_SUCCESS,
    level: 'success' as const
  });
};

// Helper function for error notifications
const notifyVideoError = (error: any, message: string, videoId: string, actionType: string, extra: any = {}) => {
  notify({
    id: `video_${actionType}_error_${videoId}_${Date.now()}`,
    message,
    data: {
      originalError: error?.message || 'Unknown error',
      entityId: videoId,
      entityType: 'video',
      extra: {
        videoId,
        action: actionType,
        error,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
};


// Helper function for message success notifications
const notifyMessageSuccess = (
  messageId: string | null, 
  actionType: string, 
  extra: any = {}
) => {
  const defaultMessage = actionType === 'send' 
    ? 'Message sent successfully' 
    : 'Messages retrieved successfully';
  
  notify({
    id: `message_${actionType}_success_${messageId || 'batch'}_${Date.now()}`,
    message: defaultMessage,
    data: {
      entityId: messageId,
      entityType: 'message',
      extra: {
        messageId,
        action: actionType,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_SUCCESS,
    level: 'success' as const
  });
};

// Helper function for message error notifications
const notifyMessageError = (
  error: any, 
  actionType: string, 
  messageId: string | null, 
  extra: any = {}
) => {
  const defaultMessage = actionType === 'send' 
    ? 'Failed to send message' 
    : 'Failed to retrieve messages';
  
  notify({
    id: `message_${actionType}_error_${messageId || 'unknown'}_${Date.now()}`,
    message: defaultMessage,
    data: {
      originalError: error?.message || 'Unknown error',
      entityId: messageId,
      entityType: 'message',
      extra: {
        messageId,
        action: actionType,
        error,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
};



const notifyAnnotationSuccess = (
  annotationId: string | null, 
  actionType: string, 
  extra: any = {}
) => {
  const defaultMessage = actionType === 'add' 
    ? 'Annotation added successfully' 
    : 'Annotations retrieved successfully';
  
  notify({
    id: `annotation_${actionType}_success_${annotationId || 'batch'}_${Date.now()}`,
    message: defaultMessage,
    data: {
      entityId: annotationId,
      entityType: 'annotation',
      extra: {
        annotationId,
        action: actionType,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_SUCCESS,
    level: 'success' as const
  });
};

// Helper function for annotation error notifications
const notifyAnnotationError = (
  error: any, 
  actionType: string, 
  annotationId: string | null, 
  extra: any = {}
) => {
  const defaultMessage = actionType === 'add' 
    ? 'Failed to add annotation' 
    : 'Failed to retrieve annotations';
  
  notify({
    id: `annotation_${actionType}_error_${annotationId || 'unknown'}_${Date.now()}`,
    message: defaultMessage,
    data: {
      originalError: error?.message || 'Unknown error',
      entityId: annotationId,
      entityType: 'annotation',
      extra: {
        annotationId,
        action: actionType,
        error,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
};


const notifyPlaybackSuccess = (
  videoId: string | null, 
  actionType: string, 
  extra: any = {}
) => {
  const defaultMessage = actionType === 'speed' 
    ? 'Playback speed updated' 
    : 'Frame navigation successful';
  
  notify({
    id: `playback_${actionType}_success_${videoId || 'unknown'}_${Date.now()}`,
    message: defaultMessage,
    data: {
      entityId: videoId,
      entityType: 'video',
      extra: {
        videoId,
        action: actionType,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_SUCCESS,
    level: 'success' as const
  });
};

// Helper function for playback error notifications
const notifyPlaybackError = (
  error: any, 
  actionType: string, 
  videoId: string | null, 
  extra: any = {}
) => {
  const defaultMessage = actionType === 'speed' 
    ? 'Failed to update playback speed' 
    : 'Failed to navigate frame';
  
  notify({
    id: `playback_${actionType}_error_${videoId || 'unknown'}_${Date.now()}`,
    message: defaultMessage,
    data: {
      originalError: error?.message || 'Unknown error',
      entityId: videoId,
      entityType: 'video',
      extra: {
        videoId,
        action: actionType,
        error,
        ...extra
      }
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
};


function* analyzeVideoSaga(action: ReturnType<typeof VideoActions.analyzeVideo>): Generator<any, void, any> {
  try {
    const { videoId, analysisType } = action.payload;
    
    console.log(`Starting video analysis for video ${videoId}, type: ${analysisType}`);
    
    // Call the analysis API
    const analysisResult: any = yield call(VideoAnalysisAPI.analyzeVideo, videoId, analysisType);
    
    // Dispatch success action
    yield put(VideoActions.analyzeVideoSuccess({
      videoId,
      analysisResult,
      analysisType
    }));
    
    // Show success notification
    notifyVideoSuccess(
      videoId,
      NOTIFICATION_MESSAGES.Video.ANALYZE_VIDEO_SUCCESS || `Video analysis completed successfully`,
      'analyze',
      {
        analysisType,
        analysisMetrics: analysisResult.metrics,
        duration: analysisResult.duration
      }
    );
    
    console.log(`Video analysis completed for video ${videoId}`);
    
  } catch (error: any) {
    console.error("Error in analyzeVideoSaga:", error);
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.ANALYZE_VIDEO_ERROR || "Failed to analyze video",
      action.payload.videoId,
      'analyze',
      {
        analysisType: action.payload.analysisType
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.analyzeVideoFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Analysis failed'
    }));
  }
}



function* createConferenceSaga(action: ReturnType<typeof ConferenceActions.createConference>): Generator<any, void, any> {
  try {
    const { title, description, scheduledTime, duration, maxParticipants, settings } = action.payload;
    
    console.log(`Creating new conference: ${title}`);
    
    // Get current user from state
    const state: RootState = yield select();
    const currentUser = state.auth.user;
    
    if (!currentUser?.id) {
      throw new Error('User must be authenticated to create a conference');
    }
    
    // Prepare conference data
    const conferenceData = {
      title,
      description,
      scheduledTime,
      duration: duration || 60, // Default 60 minutes
      maxParticipants: maxParticipants || 100,
      hostId: currentUser.id,
      hostName: currentUser.name || currentUser.email,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      settings: {
        recordingEnabled: settings?.recordingEnabled || false,
        chatEnabled: settings?.chatEnabled || true,
        screenSharingEnabled: settings?.screenSharingEnabled || true,
        waitingRoomEnabled: settings?.waitingRoomEnabled || false,
        autoRecord: settings?.autoRecord || false,
        muteOnEntry: settings?.muteOnEntry || true,
        ...settings
      }
    };
    
    // Call API to create conference
    const createdConference: any = yield call(ConferenceAPI.create, conferenceData);
    
    // Generate host join link
    const joinLink: any = yield call(ConferenceAPI.generateJoinLink, createdConference.id, {
      role: 'host',
      userId: currentUser.id,
      expiresIn: '7d' // Link valid for 7 days
    });
    
    // Generate participant join link
    const participantLink: any = yield call(ConferenceAPI.generateJoinLink, createdConference.id, {
      role: 'participant',
      expiresIn: '7d'
    });
    
    // Dispatch success action
    yield put(ConferenceActions.createConferenceSuccess({
      conference: createdConference,
      hostLink: joinLink,
      participantLink,
      hostId: currentUser.id
    }));
    
    // Show success notification
    notifyConferenceSuccess(
      createdConference.id,
      NOTIFICATION_MESSAGES.Conference.CREATE_SUCCESS || `Conference "${title}" created successfully`,
      'create',
      {
        conferenceTitle: title,
        conferenceId: createdConference.id,
        hostId: currentUser.id,
        hostName: currentUser.name,
        scheduledTime: scheduledTime,
        duration: duration || 60,
        maxParticipants: maxParticipants || 100,
        hasHostLink: !!joinLink,
        hasParticipantLink: !!participantLink,
        settings: conferenceData.settings
      }
    );
    
    console.log(`Conference created: ${createdConference.id} - ${title}`);
    
    // Optional: Schedule reminder notification
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();
    const hoursUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursUntil > 0 && hoursUntil <= 24) {
      notify({
        id: `conferenceReminder_${createdConference.id}_${Date.now()}`,
        message: `Conference "${title}" starts in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
        data: {
          entityId: createdConference.id,
          entityType: 'conference',
          extra: {
            conferenceId: createdConference.id,
            conferenceTitle: title,
            scheduledTime,
            hoursUntil,
            reminderType: 'creation'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
  } catch (error: any) {
    console.error("Error in createConferenceSaga:", error);
    
    // Show error notification
    notifyConferenceError(
      error,
      NOTIFICATION_MESSAGES.Conference.CREATE_ERROR || "Failed to create conference",
      null,
      'create',
      {
        conferenceTitle: action.payload.title,
        scheduledTime: action.payload.scheduledTime,
        errorCode: (error as AxiosError)?.response?.status,
        validationErrors: (error as AxiosError)?.response?.data?.errors,
        isAuthError: error.response?.status === 401 || error.response?.status === 403
      }
    );
    
    // Dispatch failure action
    yield put(ConferenceActions.createConferenceFailure({
      error: error.message || 'Failed to create conference',
      conferenceTitle: action.payload.title
    }));
  }
}

// Join Conference Saga
function* joinConferenceSaga(action: ReturnType<typeof ConferenceActions.joinConference>): Generator<any, void, any> {
  try {
    const { conferenceId, joinToken, userDisplayName } = action.payload;
    
    console.log(`Joining conference: ${conferenceId}`);
    
    // Get current user from state
    const state: RootState = yield select();
    const currentUser = state.auth.user;
    
    // Get conference details
    const conference: any = yield call(ConferenceAPI.getById, conferenceId);
    
    if (!conference) {
      throw new Error('Conference not found');
    }
    
    // Check conference status
    if (conference.status === 'ended' || conference.status === 'cancelled') {
      throw new Error(`Conference has been ${conference.status}`);
    }
    
    // Check if conference has started
    const now = new Date();
    const scheduledTime = new Date(conference.scheduledTime);
    
    if (now < scheduledTime && conference.settings?.waitingRoomEnabled) {
      // User is early, place in waiting room
      notify({
        id: `conferenceWaitingRoom_${conferenceId}_${Date.now()}`,
        message: `Conference starts at ${scheduledTime.toLocaleTimeString()}. You've been placed in the waiting room.`,
        data: {
          entityId: conferenceId,
          entityType: 'conference',
          extra: {
            conferenceId,
            conferenceTitle: conference.title,
            scheduledTime: conference.scheduledTime,
            currentTime: now.toISOString(),
            inWaitingRoom: true,
            minutesUntil: Math.ceil((scheduledTime.getTime() - now.getTime()) / (1000 * 60))
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    // Prepare join data
    const joinData = {
      conferenceId,
      userId: currentUser?.id || `guest_${Date.now()}`,
      userDisplayName: userDisplayName || currentUser?.name || 'Guest User',
      userEmail: currentUser?.email,
      joinToken,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      timestamp: new Date().toISOString()
    };
    
    // Join the conference
    const joinResponse: any = yield call(ConferenceAPI.join, joinData);
    
    const { connectionDetails, sessionId, permissions, iceServers } = joinResponse;
    
    // Dispatch success action
    yield put(ConferenceActions.joinConferenceSuccess({
      conferenceId,
      conferenceDetails: conference,
      connectionDetails,
      sessionId,
      permissions,
      iceServers,
      userInfo: {
        id: joinData.userId,
        displayName: joinData.userDisplayName,
        isHost: conference.hostId === joinData.userId,
        isGuest: !currentUser?.id
      }
    }));
    
    // Show success notification
    notifyConferenceSuccess(
      conferenceId,
      NOTIFICATION_MESSAGES.Conference.JOIN_SUCCESS || `Joined conference "${conference.title}"`,
      'join',
      {
        conferenceTitle: conference.title,
        conferenceId,
        userId: joinData.userId,
        userDisplayName: joinData.userDisplayName,
        sessionId,
        isHost: conference.hostId === joinData.userId,
        isGuest: !currentUser?.id,
        connectionQuality: connectionDetails?.quality || 'unknown',
        permissions: {
          canSpeak: permissions?.canSpeak || false,
          canShareScreen: permissions?.canShareScreen || false,
          canChat: permissions?.canChat || false
        },
        currentParticipants: joinResponse.currentParticipants || 0
      }
    );
    
    console.log(`Joined conference ${conferenceId} as ${joinData.userDisplayName} (session: ${sessionId})`);
    
  } catch (error: any) {
    console.error("Error in joinConferenceSaga:", error);
    
    const isInvalidToken = error.message?.includes('token') || error.message?.includes('invalid') || error.response?.status === 401;
    const isConferenceEnded = error.message?.includes('ended') || error.message?.includes('cancelled');
    
    // Show appropriate error message
    let errorMessage = NOTIFICATION_MESSAGES.Conference.JOIN_ERROR || "Failed to join conference";
    if (isInvalidToken) {
      errorMessage = "Invalid or expired join link";
    } else if (isConferenceEnded) {
      errorMessage = "Conference has ended or was cancelled";
    }
    
    // Show error notification
    notifyConferenceError(
      error,
      errorMessage,
      action.payload.conferenceId,
      'join',
      {
        conferenceId: action.payload.conferenceId,
        hasToken: !!action.payload.joinToken,
        isInvalidToken,
        isConferenceEnded,
        errorCode: (error as AxiosError)?.response?.status,
        isFull: error.response?.status === 429 || error.message?.includes('full')
      }
    );
    
    // Dispatch failure action
    yield put(ConferenceActions.joinConferenceFailure({
      conferenceId: action.payload.conferenceId,
      error: error.message || 'Failed to join conference',
      isInvalidToken,
      isConferenceEnded
    }));
  }
}

// End Conference Saga
function* endConferenceSaga(action: ReturnType<typeof ConferenceActions.endConference>): Generator<any, void, any> {
  try {
    const { conferenceId, endReason } = action.payload;
    
    console.log(`Ending conference: ${conferenceId}`);
    
    // Get current user from state
    const state: RootState = yield select();
    const currentUser = state.auth.user;
    
    // Get conference details
    const conference: any = yield call(ConferenceAPI.getById, conferenceId);
    
    if (!conference) {
      throw new Error('Conference not found');
    }
    
    // Check if user has permission to end conference
    const isHost = conference.hostId === currentUser?.id;
    const isAdmin = currentUser?.roles?.includes('admin');
    
    if (!isHost && !isAdmin) {
      throw new Error('Only host or admin can end the conference');
    }
    
    // Get conference statistics before ending
    const statistics: any = yield call(ConferenceAPI.getStatistics, conferenceId);
    
    // Prepare end data
    const endData = {
      conferenceId,
      endedBy: currentUser?.id,
      endedByName: currentUser?.name || 'System',
      endReason: endReason || (isHost ? 'Host ended the conference' : 'Admin ended the conference'),
      endTime: new Date().toISOString(),
      statistics: {
        totalParticipants: statistics?.totalParticipants || 0,
        peakParticipants: statistics?.peakParticipants || 0,
        averageDuration: statistics?.averageDuration || 0,
        totalDuration: new Date().getTime() - new Date(conference.createdAt).getTime()
      }
    };
    
    // End the conference
    const endResponse: any = yield call(ConferenceAPI.end, endData);
    
    const { endedConference, recordings, chatLogs } = endResponse;
    
    // Dispatch success action
    yield put(ConferenceActions.endConferenceSuccess({
      conferenceId,
      endedConference,
      statistics: endData.statistics,
      recordings,
      chatLogs,
      endedBy: currentUser?.id,
      endReason: endData.endReason
    }));
    
    // Calculate actual duration
    const startTime = new Date(conference.createdAt);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    // Show success notification
    notifyConferenceSuccess(
      conferenceId,
      NOTIFICATION_MESSAGES.Conference.END_SUCCESS || `Conference "${conference.title}" ended successfully`,
      'end',
      {
        conferenceTitle: conference.title,
        conferenceId,
        endedBy: currentUser?.name || 'Host',
        endReason: endData.endReason,
        duration: `${durationMinutes} minutes`,
        totalParticipants: statistics?.totalParticipants || 0,
        peakParticipants: statistics?.peakParticipants || 0,
        recordingsCount: recordings?.length || 0,
        hasChatLogs: !!chatLogs,
        isHostAction: isHost,
        isAdminAction: isAdmin
      }
    );
    
    // Notify about recordings if any
    if (recordings?.length > 0) {
      notify({
        id: `conferenceRecordings_${conferenceId}_${Date.now()}`,
        message: `${recordings.length} recording${recordings.length !== 1 ? 's' : ''} saved from the conference`,
        data: {
          entityId: conferenceId,
          entityType: 'conference',
          extra: {
            conferenceId,
            conferenceTitle: conference.title,
            recordingsCount: recordings.length,
            recordingLinks: recordings.map((r: any) => r.url),
            processingStatus: recordings[0]?.status || 'processing'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    console.log(`Conference ${conferenceId} ended. Duration: ${durationMinutes}min, Participants: ${statistics?.totalParticipants || 0}`);
    
  } catch (error: any) {
    console.error("Error in endConferenceSaga:", error);
    
    // Determine error type
    const isPermissionError = error.message?.includes('permission') || error.message?.includes('host') || error.message?.includes('admin');
    const isNotFound = error.response?.status === 404;
    
    // Show error notification
    notifyConferenceError(
      error,
      isPermissionError 
        ? "You don't have permission to end this conference" 
        : NOTIFICATION_MESSAGES.Conference.END_ERROR || "Failed to end conference",
      action.payload.conferenceId,
      'end',
      {
        conferenceId: action.payload.conferenceId,
        endReason: action.payload.endReason,
        isPermissionError,
        isNotFound,
        errorCode: (error as AxiosError)?.response?.status
      }
    );
    
    // Dispatch failure action
    yield put(ConferenceActions.endConferenceFailure({
      conferenceId: action.payload.conferenceId,
      error: error.message || 'Failed to end conference',
      isPermissionError,
      isNotFound
    }));
  }
}


function* sendMessagesSaga(
  action: ReturnType<typeof VideoActions.sendMessages>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      message, 
      senderId, 
      senderName, 
      messageType = 'text',
      metadata = {},
      replyTo = null 
    } = action.payload;
    
    console.log(`[MessageSaga] Sending message to video ${videoId}`);
    
    // Get current user from Redux state for validation
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to send messages');
    }
    
    // Validate sender matches current user (unless system message)
    const isSystemMessage = senderId === 'system' || senderId === 'admin';
    if (!isSystemMessage && senderId !== currentUser.id) {
      throw new Error('Cannot send messages as another user');
    }
    
    // Validate message content
    if (!message?.trim()) {
      throw new Error('Message content cannot be empty');
    }
    
    // Prepare message data
    const messageData = {
      videoId,
      content: message.trim(),
      senderId: isSystemMessage ? senderId : currentUser.id,
      senderName: senderName || currentUser.name || currentUser.email || 'Anonymous',
      senderAvatar: currentUser.avatar,
      messageType, // 'text', 'image', 'link', 'system', 'announcement'
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      },
      replyTo,
      status: 'sent',
      readBy: [currentUser.id]
    };
    
    // Call API to send message
    const sentMessage: any = yield call(MessageAPI.sendMessage, messageData);
    
    // Dispatch success action
    yield put(VideoActions.sendMessagesSuccess({
      videoId,
      message: sentMessage,
      senderId: messageData.senderId,
      timestamp: new Date().toISOString()
    }));
    
    // Show success notification (only for non-system messages)
    if (!isSystemMessage) {
      notifyMessageSuccess(
        sentMessage.id,
        'send',
        {
          videoId,
          messagePreview: message.length > 50 ? `${message.substring(0, 50)}...` : message,
          senderName: messageData.senderName,
          messageType,
          hasReply: !!replyTo,
          recipientCount: sentMessage.recipients?.length || 1
        }
      );
    }
    
    console.log(`[MessageSaga] Message sent: ${sentMessage.id}`);
    
  } catch (error: any) {
    console.error('[MessageSaga] Error sending message:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isValidationError = error.response?.status === 400;
    const isRateLimit = error.response?.status === 429;
    
    // Show error notification
    notifyMessageError(
      error,
      'send',
      null,
      {
        videoId: action.payload.videoId,
        senderId: action.payload.senderId,
        messageType: action.payload.messageType,
        errorType: isAuthError ? 'auth' : 
                   isValidationError ? 'validation' : 
                   isRateLimit ? 'rate_limit' : 'unknown',
        errorCode: error.response?.status
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.sendMessagesFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to send message',
      isAuthError,
      isValidationError,
      isRateLimit
    }));
  }
}

// Retrieve Messages Saga
function* retrieveMessagesSaga(
  action: ReturnType<typeof VideoActions.retrieveMessages>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      limit = 50, 
      before = null, 
      after = null,
      includeDeleted = false 
    } = action.payload;
    
    console.log(`[MessageSaga] Retrieving messages for video ${videoId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to retrieve messages');
    }
    
    // Fetch messages from API
    const messagesResponse: any = yield call(MessageAPI.getMessages, {
      videoId,
      limit,
      before,
      after,
      includeDeleted,
      userId: currentUser.id // For read status tracking
    });
    
    const { messages, hasMore, total, cursor } = messagesResponse;
    
    // Mark messages as read for current user
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter((msg: any) => !msg.readBy?.includes(currentUser.id))
        .map((msg: any) => msg.id);
      
      if (unreadMessageIds.length > 0) {
        yield call(MessageAPI.markAsRead, {
          messageIds: unreadMessageIds,
          userId: currentUser.id,
          videoId
        });
      }
    }
    
    // Dispatch success action
    yield put(VideoActions.retrieveMessagesSuccess({
      videoId,
      messages,
      hasMore,
      total,
      cursor,
      retrievedAt: new Date().toISOString(),
      userId: currentUser.id
    }));
    
    // Show success notification only if retrieving new/unread messages
    const unreadCount = messages.filter((msg: any) => 
      !msg.readBy?.includes(currentUser.id)
    ).length;
    
    if (unreadCount > 0) {
      notify({
        id: `new_messages_${videoId}_${Date.now()}`,
        message: `${unreadCount} new message${unreadCount !== 1 ? 's' : ''}`,
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            unreadCount,
            totalMessages: messages.length,
            hasMore,
            action: 'retrieve'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    // Also show general success notification for first load
    if (!before && !after && messages.length > 0) {
      notifyMessageSuccess(
        null,
        'retrieve',
        {
          videoId,
          messageCount: messages.length,
          hasMore,
          unreadCount,
          firstMessageTime: messages[0]?.timestamp,
          lastMessageTime: messages[messages.length - 1]?.timestamp
        }
      );
    }
    
    console.log(`[MessageSaga] Retrieved ${messages.length} messages for video ${videoId}`);
    
  } catch (error: any) {
    console.error('[MessageSaga] Error retrieving messages:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isNotFound = error.response?.status === 404;
    
    // Show error notification
    notifyMessageError(
      error,
      'retrieve',
      null,
      {
        videoId: action.payload.videoId,
        errorType: isAuthError ? 'auth' : isNotFound ? 'not_found' : 'unknown',
        errorCode: error.response?.status,
        limit: action.payload.limit
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.retrieveMessagesFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to retrieve messages',
      isAuthError,
      isNotFound
    }));
  }
}

// Add Annotations Saga
function* addAnnotationsSaga(
  action: ReturnType<typeof VideoActions.addAnnotations>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      timestamp, 
      annotationType, 
      content, 
      metadata = {},
      position = {},
      color = '#3B82F6',
      visibility = 'public'
    } = action.payload;
    
    console.log(`[AnnotationSaga] Adding annotation to video ${videoId} at ${timestamp}s`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to add annotations');
    }
    
    // Validate annotation content
    if (!content?.trim()) {
      throw new Error('Annotation content cannot be empty');
    }
    
    if (timestamp < 0) {
      throw new Error('Annotation timestamp cannot be negative');
    }
    
    // Validate annotation type
    const validTypes = ['note', 'highlight', 'question', 'comment', 'correction', 'timestamp'];
    if (!validTypes.includes(annotationType)) {
      throw new Error(`Invalid annotation type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    // Prepare annotation data
    const annotationData = {
      videoId,
      timestamp: Math.round(timestamp * 1000) / 1000, // Round to 3 decimal places
      annotationType,
      content: content.trim(),
      createdBy: currentUser.id,
      createdByName: currentUser.name || currentUser.email || 'Anonymous',
      createdAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        color,
        visibility
      },
      position: {
        x: position.x || 0.5, // Normalized position (0-1)
        y: position.y || 0.5,
        width: position.width || 0.3,
        height: position.height || 0.2,
        ...position
      },
      status: 'active',
      likes: 0,
      replies: []
    };
    
    // Call API to add annotation
    const addedAnnotation: any = yield call(AnnotationAPI.addAnnotation, annotationData);
    
    // Dispatch success action
    yield put(VideoActions.addAnnotationsSuccess({
      videoId,
      annotation: addedAnnotation,
      timestamp: new Date().toISOString()
    }));
    
    // Show success notification
    notifyAnnotationSuccess(
      addedAnnotation.id,
      'add',
      {
        videoId,
        annotationType,
        timestamp: annotationData.timestamp,
        contentPreview: content.length > 30 ? `${content.substring(0, 30)}...` : content,
        createdBy: currentUser.name,
        color,
        visibility,
        position: annotationData.position
      }
    );
    
    console.log(`[AnnotationSaga] Annotation added: ${addedAnnotation.id}`);
    
  } catch (error: any) {
    console.error('[AnnotationSaga] Error adding annotation:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isValidationError = error.response?.status === 400;
    const isConflict = error.response?.status === 409;
    
    // Show error notification
    notifyAnnotationError(
      error,
      'add',
      null,
      {
        videoId: action.payload.videoId,
        timestamp: action.payload.timestamp,
        annotationType: action.payload.annotationType,
        errorType: isAuthError ? 'auth' : 
                   isValidationError ? 'validation' : 
                   isConflict ? 'conflict' : 'unknown',
        errorCode: error.response?.status,
        errorDetails: error.response?.data?.errors
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.addAnnotationsFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to add annotation',
      isAuthError,
      isValidationError,
      isConflict
    }));
  }
}

// Retrieve Annotations Saga
function* retrieveAnnotationsSaga(
  action: ReturnType<typeof VideoActions.retrieveAnnotations>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      filter = {}, 
      sortBy = 'timestamp',
      sortOrder = 'asc',
      limit = 100,
      offset = 0 
    } = action.payload;
    
    console.log(`[AnnotationSaga] Retrieving annotations for video ${videoId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to retrieve annotations');
    }
    
    // Build query parameters
    const queryParams = {
      videoId,
      filter: {
        ...filter,
        // Only show public annotations or user's own private annotations
        $or: [
          { 'metadata.visibility': 'public' },
          { 'metadata.visibility': 'private', createdBy: currentUser.id }
        ]
      },
      sortBy,
      sortOrder,
      limit,
      offset,
      includeReplies: true,
      includeStats: true
    };
    
    // Fetch annotations from API
    const annotationsResponse: any = yield call(AnnotationAPI.getAnnotations, queryParams);
    
    const { 
      annotations, 
      total, 
      hasMore, 
      stats,
      userAnnotations = 0 
    } = annotationsResponse;
    
    // Group annotations by timestamp for easier display
    const groupedAnnotations = annotations.reduce((groups: any, annotation: any) => {
      const timeGroup = Math.floor(annotation.timestamp);
      if (!groups[timeGroup]) {
        groups[timeGroup] = [];
      }
      groups[timeGroup].push(annotation);
      return groups;
    }, {});
    
    // Dispatch success action
    yield put(VideoActions.retrieveAnnotationsSuccess({
      videoId,
      annotations,
      groupedAnnotations,
      total,
      hasMore,
      stats: {
        ...stats,
        userAnnotations,
        totalAnnotations: total,
        annotationsByType: stats?.annotationsByType || {}
      },
      filter,
      sortBy,
      sortOrder,
      retrievedAt: new Date().toISOString()
    }));
    
    // Show success notification with stats
    notifyAnnotationSuccess(
      null,
      'retrieve',
      {
        videoId,
        annotationCount: annotations.length,
        totalAnnotations: total,
        hasMore,
        userAnnotations,
        annotationsByType: stats?.annotationsByType,
        timeRange: annotations.length > 0 
          ? `${annotations[0].timestamp}s - ${annotations[annotations.length - 1].timestamp}s`
          : 'No annotations',
        filterApplied: Object.keys(filter).length > 0
      }
    );
    
    // Show additional notification if user has many annotations
    if (userAnnotations > 0) {
      notify({
        id: `user_annotations_summary_${videoId}_${Date.now()}`,
        message: `You have ${userAnnotations} annotation${userAnnotations !== 1 ? 's' : ''} on this video`,
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            userAnnotations,
            userAnnotationTypes: stats?.userAnnotationsByType || {}
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    console.log(`[AnnotationSaga] Retrieved ${annotations.length} annotations for video ${videoId}`);
    
  } catch (error: any) {
    console.error('[AnnotationSaga] Error retrieving annotations:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isNotFound = error.response?.status === 404;
    
    // Show error notification
    notifyAnnotationError(
      error,
      'retrieve',
      null,
      {
        videoId: action.payload.videoId,
        errorType: isAuthError ? 'auth' : isNotFound ? 'not_found' : 'unknown',
        errorCode: error.response?.status,
        filter: action.payload.filter,
        limit: action.payload.limit
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.retrieveAnnotationsFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to retrieve annotations',
      isAuthError,
      isNotFound
    }));
  }
}


// Control Playback Speed Saga
function* controlPlaybackSpeedSaga(
  action: ReturnType<typeof VideoActions.controlPlaybackSpeed>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      speed, 
      userId,
      preservePitch = true,
      gradualChange = false 
    } = action.payload;
    
    console.log(`[PlaybackSaga] Setting playback speed for video ${videoId} to ${speed}x`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to control playback');
    }
    
    // Validate speed value
    const validSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const closestSpeed = validSpeeds.reduce((prev, curr) => {
      return Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev;
    });
    
    if (Math.abs(closestSpeed - speed) > 0.1) {
      throw new Error(`Speed ${speed}x is not supported. Use one of: ${validSpeeds.join(', ')}`);
    }
    
    // Get current video state
    const videoState = state.video?.currentVideo;
    if (!videoState || videoState.id !== videoId) {
      throw new Error('Video not loaded or not playing');
    }
    
    // Check if video is in a state that allows speed changes
    if (videoState.status !== 'playing' && videoState.status !== 'paused') {
      throw new Error('Cannot change playback speed when video is not playing or paused');
    }
    
    // Prepare playback speed data
    const speedData = {
      videoId,
      speed: closestSpeed,
      userId: userId || currentUser.id,
      previousSpeed: videoState.playbackSpeed || 1,
      timestamp: new Date().toISOString(),
      currentTime: videoState.currentTime || 0,
      duration: videoState.duration || 0,
      options: {
        preservePitch,
        gradualChange,
        audioOnly: videoState.playbackMode === 'audio'
      },
      metadata: {
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        networkType: (navigator as any).connection?.effectiveType || 'unknown'
      }
    };
    
    // Call API to update playback speed (if syncing with backend)
    const response: any = yield call(PlaybackAPI.updatePlaybackSpeed, speedData);
    
    // Dispatch success action
    yield put(VideoActions.controlPlaybackSpeedSuccess({
      videoId,
      speed: closestSpeed,
      previousSpeed: speedData.previousSpeed,
      updatedAt: new Date().toISOString(),
      syncId: response?.syncId
    }));
    
    // Update local state immediately
    yield put(VideoActions.updatePlaybackState({
      videoId,
      playbackSpeed: closestSpeed,
      lastSpeedChange: new Date().toISOString()
    }));
    
    // Show success notification with speed info
    notifyPlaybackSuccess(
      videoId,
      'speed',
      {
        videoId,
        speed: closestSpeed,
        previousSpeed: speedData.previousSpeed,
        speedChange: closestSpeed - speedData.previousSpeed,
        preservePitch,
        gradualChange,
        currentTime: speedData.currentTime,
        percentageComplete: speedData.duration > 0 
          ? Math.round((speedData.currentTime / speedData.duration) * 100) 
          : 0,
        networkType: speedData.metadata.networkType
      }
    );
    
    // Show additional notification for extreme speed changes
    if (Math.abs(closestSpeed - speedData.previousSpeed) >= 1) {
      notify({
        id: `playback_speed_extreme_${videoId}_${Date.now()}`,
        message: `Speed changed from ${speedData.previousSpeed}x to ${closestSpeed}x`,
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            oldSpeed: speedData.previousSpeed,
            newSpeed: closestSpeed,
            speedChange: closestSpeed - speedData.previousSpeed,
            isSpeedUp: closestSpeed > speedData.previousSpeed,
            percentageChange: Math.round(((closestSpeed / speedData.previousSpeed) - 1) * 100)
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    console.log(`[PlaybackSaga] Playback speed updated to ${closestSpeed}x for video ${videoId}`);
    
  } catch (error: any) {
    console.error('[PlaybackSaga] Error controlling playback speed:', error);
    
    // Determine error type
    const isValidationError = error.message?.includes('not supported') || error.message?.includes('cannot');
    const isNetworkError = !error.response && error.message?.includes('Network');
    const isVideoNotLoaded = error.message?.includes('not loaded');
    
    // Show error notification
    notifyPlaybackError(
      error,
      'speed',
      action.payload.videoId,
      {
        videoId: action.payload.videoId,
        requestedSpeed: action.payload.speed,
        errorType: isValidationError ? 'validation' : 
                   isNetworkError ? 'network' : 
                   isVideoNotLoaded ? 'video_state' : 'unknown',
        errorCode: error.response?.status,
        errorMessage: error.message
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.controlPlaybackSpeedFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to update playback speed',
      requestedSpeed: action.payload.speed,
      isValidationError,
      isNetworkError
    }));
  }
}

// Control Playback Frame Saga
function* controlPlaybackFrameSaga(
  action: ReturnType<typeof VideoActions.controlPlaybackFrame>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      frameAction, 
      targetFrame = null,
      userId,
      precise = false 
    } = action.payload;
    
    console.log(`[PlaybackSaga] Frame control for video ${videoId}: ${frameAction}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required for frame control');
    }
    
    // Get current video state
    const videoState = state.video?.currentVideo;
    if (!videoState || videoState.id !== videoId) {
      throw new Error('Video not loaded');
    }
    
    // Validate frame action
    const validActions = ['next', 'previous', 'jump', 'first', 'last', 'keyframe'];
    if (!validActions.includes(frameAction)) {
      throw new Error(`Invalid frame action: ${frameAction}. Must be one of: ${validActions.join(', ')}`);
    }
    
    // Calculate target time based on frame action
    let targetTime = videoState.currentTime || 0;
    const frameRate = videoState.frameRate || 30; // Default 30fps
    const frameDuration = 1 / frameRate;
    
    switch (frameAction) {
      case 'next':
        targetTime += frameDuration;
        break;
      case 'previous':
        targetTime = Math.max(0, targetTime - frameDuration);
        break;
      case 'jump':
        if (targetFrame === null || targetFrame < 0) {
          throw new Error('Target frame is required for jump action');
        }
        targetTime = targetFrame / frameRate;
        break;
      case 'first':
        targetTime = 0;
        break;
      case 'last':
        targetTime = videoState.duration || 0;
        break;
      case 'keyframe':
        // Find nearest keyframe
        const keyframes = videoState.keyframes || [];
        if (keyframes.length === 0) {
          throw new Error('No keyframes available for this video');
        }
        const currentFrame = Math.round(targetTime * frameRate);
        const nearestKeyframe = keyframes.reduce((prev, curr) => {
          return Math.abs(curr - currentFrame) < Math.abs(prev - currentFrame) ? curr : prev;
        });
        targetTime = nearestKeyframe / frameRate;
        break;
    }
    
    // Ensure target time is within video bounds
    targetTime = Math.max(0, Math.min(targetTime, videoState.duration || Infinity));
    
    // Prepare frame navigation data
    const frameData = {
      videoId,
      frameAction,
      targetFrame: targetFrame || Math.round(targetTime * frameRate),
      targetTime,
      currentTime: videoState.currentTime || 0,
      userId: userId || currentUser.id,
      timestamp: new Date().toISOString(),
      frameRate,
      duration: videoState.duration || 0,
      options: {
        precise,
        seekMode: frameAction === 'keyframe' ? 'exact' : 'nearest',
        preservePlaybackState: videoState.status === 'playing'
      },
      metadata: {
        userAgent: navigator.userAgent,
        currentFrame: Math.round((videoState.currentTime || 0) * frameRate),
        totalFrames: videoState.duration ? Math.round(videoState.duration * frameRate) : 0
      }
    };
    
    // Call API for frame navigation (if syncing with backend)
    const response: any = yield call(PlaybackAPI.navigateFrame, frameData);
    
    // Dispatch success action
    yield put(VideoActions.controlPlaybackFrameSuccess({
      videoId,
      frameAction,
      targetTime,
      targetFrame: frameData.targetFrame,
      previousTime: frameData.currentTime,
      updatedAt: new Date().toISOString(),
      syncId: response?.syncId,
      isKeyframe: frameAction === 'keyframe'
    }));
    
    // Update local state immediately
    yield put(VideoActions.updatePlaybackState({
      videoId,
      currentTime: targetTime,
      lastFrameChange: new Date().toISOString(),
      frameAction
    }));
    
    // Show success notification with frame info
    notifyPlaybackSuccess(
      videoId,
      'frame',
      {
        videoId,
        frameAction,
        targetTime: parseFloat(targetTime.toFixed(3)),
        previousTime: parseFloat(frameData.currentTime.toFixed(3)),
        timeDifference: parseFloat((targetTime - frameData.currentTime).toFixed(3)),
        targetFrame: frameData.targetFrame,
        currentFrame: frameData.metadata.currentFrame,
        frameRate,
        isKeyframe: frameAction === 'keyframe',
        precise,
        percentageComplete: frameData.duration > 0 
          ? Math.round((targetTime / frameData.duration) * 100) 
          : 0
      }
    );
    
    // Show additional info for large jumps
    const timeJump = Math.abs(targetTime - frameData.currentTime);
    if (timeJump > 5) { // More than 5 seconds
      notify({
        id: `playback_frame_jump_${videoId}_${Date.now()}`,
        message: `Jumped ${timeJump.toFixed(1)} seconds in video`,
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            timeJump: parseFloat(timeJump.toFixed(1)),
            fromTime: parseFloat(frameData.currentTime.toFixed(1)),
            toTime: parseFloat(targetTime.toFixed(1)),
            frameAction,
            framesSkipped: Math.abs(frameData.targetFrame - frameData.metadata.currentFrame)
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    console.log(`[PlaybackSaga] Frame navigation: ${frameAction} to ${targetTime}s (frame ${frameData.targetFrame})`);
    
  } catch (error: any) {
    console.error('[PlaybackSaga] Error controlling playback frame:', error);
    
    // Determine error type
    const isValidationError = error.message?.includes('Invalid') || error.message?.includes('required');
    const isVideoNotLoaded = error.message?.includes('not loaded');
    const isOutOfBounds = error.message?.includes('bounds') || error.message?.includes('keyframes');
    
    // Show error notification
    notifyPlaybackError(
      error,
      'frame',
      action.payload.videoId,
      {
        videoId: action.payload.videoId,
        frameAction: action.payload.frameAction,
        targetFrame: action.payload.targetFrame,
        errorType: isValidationError ? 'validation' : 
                   isVideoNotLoaded ? 'video_state' : 
                   isOutOfBounds ? 'bounds' : 'unknown',
        errorCode: error.response?.status,
        errorMessage: error.message
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.controlPlaybackFrameFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to navigate frame',
      frameAction: action.payload.frameAction,
      isValidationError,
      isOutOfBounds
    }));
  }
}



function* startLiveSessionSaga(
  action: ReturnType<typeof VideoActions.startLiveSession>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      sessionTitle, 
      description, 
      settings = {},
      scheduledStartTime = null
    } = action.payload;
    
    console.log(`[LiveSessionSaga] Starting live session for video ${videoId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to start live session');
    }
    
    // Fetch video details
    const video: any = yield call(VideoAPI.fetchVideoById, videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }
    
    // Check if video is in a valid state for live streaming
    if (video.status === 'live') {
      throw new Error('Video is already in live session');
    }
    
    if (video.status === 'processing' || video.status === 'uploading') {
      throw new Error('Video is still processing, cannot start live session');
    }
    
    // Prepare live session data
    const liveSessionData = {
      videoId,
      sessionTitle: sessionTitle || video.title || `Live Stream ${new Date().toLocaleDateString()}`,
      description: description || video.description || '',
      hostId: currentUser.id,
      hostName: currentUser.name || currentUser.email || 'Unknown Host',
      scheduledStartTime: scheduledStartTime || new Date().toISOString(),
      actualStartTime: new Date().toISOString(),
      status: 'starting' as const,
      settings: {
        chatEnabled: settings.chatEnabled !== false, // Default true
        recordingEnabled: settings.recordingEnabled || false,
        allowReactions: settings.allowReactions || true,
        moderatedChat: settings.moderatedChat || false,
        maxViewers: settings.maxViewers || 1000,
        qualityOptions: settings.qualityOptions || ['auto', '720p', '1080p'],
        ...settings
      },
      metadata: {
        startedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        streamKey: `stream_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      statistics: {
        currentViewers: 0,
        peakViewers: 0,
        totalViewers: 0,
        messagesSent: 0,
        reactionsSent: 0
      }
    };
    
    // Call API to start live session
    const liveSession: any = yield call(LiveSessionAPI.startLiveSession, liveSessionData);
    
    // Get stream URL and connection details
    const streamDetails: any = yield call(LiveSessionAPI.getStreamDetails, liveSession.id);
    
    // Dispatch success action
    yield put(VideoActions.startLiveSessionSuccess({
      videoId,
      liveSession: {
        ...liveSession,
        streamUrl: streamDetails.streamUrl,
        rtmpUrl: streamDetails.rtmpUrl,
        streamKey: streamDetails.streamKey,
        ingestServer: streamDetails.ingestServer,
        playbackUrl: streamDetails.playbackUrl
      },
      hostId: currentUser.id
    }));
    
    // Update video status to live
    yield put(VideoActions.updateVideoSuccess({
      id: videoId,
      updatedVideo: {
        ...video,
        status: 'live',
        liveSessionId: liveSession.id
      }
    }));
    
    // Show success notification
    notify({
      id: `live_session_started_${liveSession.id}_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.START_LIVE_SESSION_SUCCESS || 
               `Live session "${liveSessionData.sessionTitle}" started successfully`,
      data: {
        entityId: liveSession.id,
        entityType: 'live_session',
        extra: {
          videoId,
          liveSessionId: liveSession.id,
          sessionTitle: liveSessionData.sessionTitle,
          streamUrl: streamDetails.streamUrl,
          playbackUrl: streamDetails.playbackUrl,
          hostId: currentUser.id,
          hostName: currentUser.name,
          scheduledStartTime: liveSessionData.scheduledStartTime
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    // Show stream key notification (important for host)
    notify({
      id: `live_stream_key_${liveSession.id}_${Date.now()}`,
      message: `Stream Key: ${streamDetails.streamKey}`,
      data: {
        entityId: liveSession.id,
        entityType: 'live_session',
        extra: {
          videoId,
          liveSessionId: liveSession.id,
          streamKey: streamDetails.streamKey,
          rtmpUrl: streamDetails.rtmpUrl,
          ingestServer: streamDetails.ingestServer,
          isStreamKey: true
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
    
    console.log(`[LiveSessionSaga] Live session started: ${liveSession.id} for video ${videoId}`);
    
  } catch (error: any) {
    console.error('[LiveSessionSaga] Error starting live session:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isVideoError = error.message?.includes('Video') || error.message?.includes('not found');
    const isStateError = error.message?.includes('already') || error.message?.includes('processing');
    
    // Show error notification
    notify({
      id: `live_session_start_error_${Date.now()}`,
      message: isAuthError 
        ? 'Authentication required to start live session'
        : NOTIFICATION_MESSAGES.Video.START_LIVE_SESSION_ERROR || 'Failed to start live session',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.videoId,
        entityType: 'video',
        extra: {
          videoId: action.payload.videoId,
          errorType: isAuthError ? 'auth' : 
                     isVideoError ? 'video_not_found' : 
                     isStateError ? 'invalid_state' : 'unknown',
          errorCode: error.response?.status,
          sessionTitle: action.payload.sessionTitle
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.startLiveSessionFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to start live session',
      isAuthError,
      isVideoError,
      isStateError
    }));
  }
}

// End Live Session Saga
function* endLiveSessionSaga(
  action: ReturnType<typeof VideoActions.endLiveSession>
): Generator<any, void, any> {
  try {
    const { 
      videoId, 
      liveSessionId,
      endReason = 'Host ended the session'
    } = action.payload;
    
    console.log(`[LiveSessionSaga] Ending live session ${liveSessionId} for video ${videoId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to end live session');
    }
    
    // Fetch live session details
    const liveSession: any = yield call(LiveSessionAPI.getLiveSession, liveSessionId);
    
    if (!liveSession) {
      throw new Error('Live session not found');
    }
    
    // Check permissions
    const isHost = liveSession.hostId === currentUser.id;
    const isAdmin = currentUser.roles?.includes('admin');
    
    if (!isHost && !isAdmin) {
      throw new Error('Only host or admin can end the live session');
    }
    
    // Check if session is already ended
    if (liveSession.status === 'ended') {
      throw new Error('Live session has already ended');
    }
    
    if (liveSession.status === 'cancelled') {
      throw new Error('Live session was cancelled');
    }
    
    // Get session statistics
    const statistics: any = yield call(LiveSessionAPI.getSessionStatistics, liveSessionId);
    
    // Prepare end data
    const endData = {
      liveSessionId,
      endedBy: currentUser.id,
      endedByName: currentUser.name || currentUser.email || 'Unknown',
      endReason,
      endTime: new Date().toISOString(),
      statistics: {
        ...statistics,
        duration: Math.round((new Date().getTime() - new Date(liveSession.actualStartTime).getTime()) / 1000)
      }
    };
    
    // End live session
    const endedSession: any = yield call(LiveSessionAPI.endLiveSession, endData);
    
    // Fetch video details
    const video: any = yield call(VideoAPI.fetchVideoById, videoId);
    
    // Dispatch success action
    yield put(VideoActions.endLiveSessionSuccess({
      videoId,
      liveSessionId,
      endedSession,
      statistics: endData.statistics,
      endedBy: currentUser.id,
      recordings: endedSession.recordings || []
    }));
    
    // Update video status
    yield put(VideoActions.updateVideoSuccess({
      id: videoId,
      updatedVideo: {
        ...video,
        status: 'completed',
        liveSessionId: null
      }
    }));
    
    // Calculate duration for display
    const startTime = new Date(liveSession.actualStartTime);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    
    // Show success notification
    notify({
      id: `live_session_ended_${liveSessionId}_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.END_LIVE_SESSION_SUCCESS || 
               `Live session "${liveSession.sessionTitle}" ended successfully`,
      data: {
        entityId: liveSessionId,
        entityType: 'live_session',
        extra: {
          videoId,
          liveSessionId,
          sessionTitle: liveSession.sessionTitle,
          duration: `${durationMinutes} minutes (${durationSeconds} seconds)`,
          peakViewers: statistics.peakViewers || 0,
          totalViewers: statistics.totalViewers || 0,
          messagesSent: statistics.messagesSent || 0,
          endedBy: currentUser.name,
          endReason,
          hasRecordings: (endedSession.recordings?.length || 0) > 0
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    // Notify about recordings if any
    if (endedSession.recordings?.length > 0) {
      notify({
        id: `live_session_recordings_${liveSessionId}_${Date.now()}`,
        message: `${endedSession.recordings.length} recording${endedSession.recordings.length !== 1 ? 's' : ''} saved from the live session`,
        data: {
          entityId: liveSessionId,
          entityType: 'live_session',
          extra: {
            videoId,
            liveSessionId,
            recordingsCount: endedSession.recordings.length,
            recordingLinks: endedSession.recordings.map((r: any) => r.url),
            processingStatus: endedSession.recordings[0]?.status || 'processing'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    console.log(`[LiveSessionSaga] Live session ended: ${liveSessionId}, duration: ${durationSeconds}s`);
    
  } catch (error: any) {
    console.error('[LiveSessionSaga] Error ending live session:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isPermissionError = error.message?.includes('permission') || 
                              error.message?.includes('host') || 
                              error.message?.includes('admin');
    const isNotFound = error.response?.status === 404;
    const isAlreadyEnded = error.message?.includes('already ended') || 
                           error.message?.includes('cancelled');
    
    // Show error notification
    notify({
      id: `live_session_end_error_${Date.now()}`,
      message: isPermissionError 
        ? 'You do not have permission to end this live session'
        : isAlreadyEnded
        ? 'Live session has already ended'
        : NOTIFICATION_MESSAGES.Video.END_LIVE_SESSION_ERROR || 'Failed to end live session',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.liveSessionId,
        entityType: 'live_session',
        extra: {
          videoId: action.payload.videoId,
          liveSessionId: action.payload.liveSessionId,
          errorType: isPermissionError ? 'permission' : 
                     isAlreadyEnded ? 'already_ended' : 
                     isNotFound ? 'not_found' : 
                     isAuthError ? 'auth' : 'unknown',
          errorCode: error.response?.status,
          endReason: action.payload.endReason
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.endLiveSessionFailure({
      videoId: action.payload.videoId,
      liveSessionId: action.payload.liveSessionId,
      error: error.message || 'Failed to end live session',
      isAuthError,
      isPermissionError,
      isNotFound,
      isAlreadyEnded
    }));
  }
}

// Check Live Session Status Saga
function* checkLiveSessionStatusSaga(
  action: ReturnType<typeof VideoActions.checkLiveSessionStatus>
): Generator<any, void, any> {
  try {
    const { videoId, liveSessionId, checkViewerCount = false } = action.payload;
    
    console.log(`[LiveSessionSaga] Checking status for live session ${liveSessionId}`);
    
    // Get current user from Redux state for viewer count if needed
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    // Fetch live session status
    const sessionStatus: any = yield call(LiveSessionAPI.getSessionStatus, liveSessionId);
    
    if (!sessionStatus) {
      throw new Error('Live session not found');
    }
    
    // Fetch additional statistics if requested
    let statistics = null;
    let viewerCount = null;
    
    if (checkViewerCount) {
      statistics = yield call(LiveSessionAPI.getSessionStatistics, liveSessionId);
      viewerCount = statistics?.currentViewers || 0;
      
      // If user is authenticated, update their viewer status
      if (currentUser?.id) {
        yield call(LiveSessionAPI.updateViewerStatus, {
          liveSessionId,
          userId: currentUser.id,
          isActive: true,
          lastActive: new Date().toISOString()
        });
      }
    }
    
    // Determine session health
    const now = new Date();
    const lastActivity = new Date(sessionStatus.lastActivity || sessionStatus.actualStartTime);
    const minutesSinceLastActivity = Math.round((now.getTime() - lastActivity.getTime()) / (1000 * 60));
    
    const healthStatus = minutesSinceLastActivity > 5 ? 'inactive' : 
                         minutesSinceLastActivity > 2 ? 'warning' : 'healthy';
    
    // Dispatch success action
    yield put(VideoActions.checkLiveSessionStatusSuccess({
      videoId,
      liveSessionId,
      status: sessionStatus.status,
      healthStatus,
      viewerCount,
      statistics: statistics || {},
      lastActivity: sessionStatus.lastActivity,
      checkedAt: new Date().toISOString(),
      sessionTitle: sessionStatus.sessionTitle
    }));
    
    // Show notification for inactive sessions
    if (healthStatus === 'inactive' && sessionStatus.status === 'live') {
      notify({
        id: `live_session_inactive_${liveSessionId}_${Date.now()}`,
        message: `Live session "${sessionStatus.sessionTitle}" appears to be inactive`,
        data: {
          entityId: liveSessionId,
          entityType: 'live_session',
          extra: {
            videoId,
            liveSessionId,
            sessionTitle: sessionStatus.sessionTitle,
            minutesInactive: minutesSinceLastActivity,
            lastActivity: sessionStatus.lastActivity,
            healthStatus
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.WARNING,
        level: 'warning' as const
      });
    }
    
    // Log status check result
    console.log(`[LiveSessionSaga] Status checked for ${liveSessionId}: ${sessionStatus.status}, health: ${healthStatus}, viewers: ${viewerCount || 'N/A'}`);
    
  } catch (error: any) {
    console.error('[LiveSessionSaga] Error checking live session status:', error);
    
    // Determine error type
    const isNotFound = error.response?.status === 404;
    const isNetworkError = !error.response && error.message?.includes('Network');
    
    // Only show error notification for critical errors (not for simple not found)
    if (!isNotFound) {
      notify({
        id: `live_session_status_error_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Video.CHECK_LIVE_SESSION_STATUS_ERROR || 
                 'Failed to check live session status',
        data: {
          originalError: error.message || 'Unknown error',
          entityId: action.payload.liveSessionId,
          entityType: 'live_session',
          extra: {
            videoId: action.payload.videoId,
            liveSessionId: action.payload.liveSessionId,
            errorType: isNetworkError ? 'network' : 'unknown',
            errorCode: error.response?.status
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
    
    // Dispatch failure action
    yield put(VideoActions.checkLiveSessionStatusFailure({
      videoId: action.payload.videoId,
      liveSessionId: action.payload.liveSessionId,
      error: error.message || 'Failed to check live session status',
      isNotFound,
      isNetworkError
    }));
  }
}


// Edit Video Saga
function* editVideoSaga(
  action: ReturnType<typeof VideoActions.editVideo>
): Generator<any, void, any> {
  try {
    const {
      videoId,
      edits,
      editType = 'general',
      saveAsNewVersion = false,
      qualityPreset = 'auto',
      metadata = {}
    } = action.payload;
    
    console.log(`[EditVideoSaga] Starting video edit for video ${videoId}, edit type: ${editType}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    const currentVideo = state.video?.currentVideo;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to edit video');
    }
    
    if (!currentVideo || currentVideo.id !== videoId) {
      throw new Error('Video not loaded or not found');
    }
    
    // Validate edit parameters based on edit type
    const validEditTypes = ['trim', 'crop', 'rotate', 'merge', 'add_text', 'add_audio', 'filters', 'speed', 'general'];
    if (!validEditTypes.includes(editType)) {
      throw new Error(`Invalid edit type. Must be one of: ${validEditTypes.join(', ')}`);
    }
    
    // Prepare edit data
    const editData = {
      videoId,
      originalVideoUrl: currentVideo.url,
      originalVideoMetadata: currentVideo.metadata || {},
      edits: {
        ...edits,
        type: editType,
        appliedAt: new Date().toISOString(),
        appliedBy: currentUser.id,
        appliedByName: currentUser.name || currentUser.email || 'Unknown Editor'
      },
      options: {
        saveAsNewVersion,
        qualityPreset,
        preserveOriginal: saveAsNewVersion,
        generateThumbnail: true,
        generatePreview: true,
        notifyOnComplete: true,
        ...metadata
      },
      metadata: {
        userAgent: navigator.userAgent,
        deviceInfo: {
          isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          platform: navigator.platform
        },
        timestamp: new Date().toISOString(),
        editSessionId: `edit_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
    
    // Validate specific edit types
    switch (editType) {
      case 'trim':
        if (!edits.startTime || !edits.endTime) {
          throw new Error('Trim edits require startTime and endTime');
        }
        if (edits.startTime >= edits.endTime) {
          throw new Error('Start time must be before end time');
        }
        if (edits.endTime > (currentVideo.duration || 0)) {
          throw new Error('End time exceeds video duration');
        }
        break;
        
      case 'crop':
        if (!edits.cropArea || !edits.cropArea.width || !edits.cropArea.height) {
          throw new Error('Crop edits require cropArea with width and height');
        }
        break;
        
      case 'add_text':
        if (!edits.text || !edits.text.content) {
          throw new Error('Text overlay requires text content');
        }
        break;
    }
    
    // Show processing notification
    notify({
      id: `video_edit_started_${videoId}_${Date.now()}`,
      message: 'Video editing in progress...',
      data: {
        entityId: videoId,
        entityType: 'video',
        extra: {
          videoId,
          videoTitle: currentVideo.title,
          editType,
          editSessionId: editData.metadata.editSessionId,
          status: 'processing',
          estimatedTime: '1-2 minutes' // Could be dynamic based on edit complexity
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
    
    // Call API to edit video
    const editResponse: any = yield call(VideoEditAPI.editVideo, editData);
    
    const { editedVideo, editJobId, processingStatus, estimatedCompletionTime } = editResponse;
    
    // Dispatch success action
    yield put(VideoActions.editVideoSuccess({
      videoId,
      editedVideo: saveAsNewVersion ? editedVideo : {
        ...currentVideo,
        url: editedVideo.url,
        thumbnailUrl: editedVideo.thumbnailUrl,
        previewUrl: editedVideo.previewUrl,
        duration: editedVideo.duration,
        metadata: {
          ...currentVideo.metadata,
          lastEditedAt: new Date().toISOString(),
          lastEditedBy: currentUser.id,
          editHistory: [
            ...(currentVideo.metadata?.editHistory || []),
            {
              editType,
              editSessionId: editData.metadata.editSessionId,
              editedAt: new Date().toISOString(),
              editedBy: currentUser.id,
              changes: edits,
              jobId: editJobId
            }
          ]
        }
      },
      editType,
      editJobId,
      saveAsNewVersion,
      newVideoId: saveAsNewVersion ? editedVideo.id : null
    }));
    
    // Show success notification
    notify({
      id: `video_edit_completed_${videoId}_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.EDIT_VIDEO_SUCCESS || 
               `Video "${currentVideo.title}" edited successfully`,
      data: {
        entityId: videoId,
        entityType: 'video',
        extra: {
          videoId,
          videoTitle: currentVideo.title,
          editType,
          editSessionId: editData.metadata.editSessionId,
          editJobId,
          status: processingStatus || 'completed',
          saveAsNewVersion,
          newVideoId: saveAsNewVersion ? editedVideo.id : null,
          editedVideoUrl: editedVideo.url,
          processingTime: estimatedCompletionTime ? 
            `${Math.round((new Date(estimatedCompletionTime).getTime() - new Date().getTime()) / 1000 / 60)} minutes` : 
            'unknown',
          qualityPreset,
          appliedBy: currentUser.name
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    // If saved as new version, show additional notification
    if (saveAsNewVersion && editedVideo.id !== videoId) {
      notify({
        id: `video_new_version_${editedVideo.id}_${Date.now()}`,
        message: `New version created: "${editedVideo.title}"`,
        data: {
          entityId: editedVideo.id,
          entityType: 'video',
          extra: {
            originalVideoId: videoId,
            newVideoId: editedVideo.id,
            videoTitle: editedVideo.title,
            editType,
            basedOnVersion: currentVideo.version || '1.0',
            newVersion: editedVideo.version || '2.0'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    }
    
    console.log(`[EditVideoSaga] Video edit completed for ${videoId}, edit type: ${editType}, job: ${editJobId}`);
    
  } catch (error: any) {
    console.error('[EditVideoSaga] Error editing video:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isValidationError = error.response?.status === 400 || error.message?.includes('Invalid') || error.message?.includes('required');
    const isVideoNotFound = error.message?.includes('not found') || error.response?.status === 404;
    const isProcessingError = error.message?.includes('processing') || error.message?.includes('busy');
    
    // Show error notification
    notify({
      id: `video_edit_error_${Date.now()}`,
      message: isValidationError
        ? 'Invalid edit parameters'
        : isVideoNotFound
        ? 'Video not found or not loaded'
        : isProcessingError
        ? 'Video is currently processing, please try again later'
        : NOTIFICATION_MESSAGES.Video.EDIT_VIDEO_ERROR || 'Failed to edit video',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.videoId,
        entityType: 'video',
        extra: {
          videoId: action.payload.videoId,
          editType: action.payload.editType,
          errorType: isAuthError ? 'auth' : 
                     isValidationError ? 'validation' : 
                     isVideoNotFound ? 'not_found' : 
                     isProcessingError ? 'processing' : 'unknown',
          errorCode: error.response?.status,
          errorDetails: error.response?.data?.errors || error.message
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.editVideoFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to edit video',
      editType: action.payload.editType,
      isAuthError,
      isValidationError,
      isVideoNotFound,
      isProcessingError
    }));
  }
}

// Transcribe Video Saga
function* transcribeVideoSaga(
  action: ReturnType<typeof VideoActions.transcribeVideo>
): Generator<any, void, any> {
  try {
    const {
      videoId,
      language = 'auto',
      transcriptionType = 'standard',
      speakerDiarization = false,
      timestamps = true,
      punctuation = true,
      customVocabulary = [],
      callbackUrl = null
    } = action.payload;
    
    console.log(`[TranscribeVideoSaga] Starting transcription for video ${videoId}, language: ${language}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    const currentVideo = state.video?.currentVideo;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to transcribe video');
    }
    
    if (!currentVideo || currentVideo.id !== videoId) {
      throw new Error('Video not loaded or not found');
    }
    
    // Check if video already has transcription
    if (currentVideo.transcription && currentVideo.transcription.status === 'completed') {
      notify({
        id: `video_already_transcribed_${videoId}_${Date.now()}`,
        message: 'This video already has a transcription',
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            videoTitle: currentVideo.title,
            existingTranscriptionId: currentVideo.transcription.id,
            transcriptionLanguage: currentVideo.transcription.language,
            transcribedAt: currentVideo.transcription.createdAt
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
      
      // Still dispatch success with existing transcription
      yield put(VideoActions.transcribeVideoSuccess({
        videoId,
        transcription: currentVideo.transcription,
        isExisting: true
      }));
      
      return;
    }
    
    // Validate transcription type
    const validTranscriptionTypes = ['standard', 'premium', 'medical', 'legal', 'technical'];
    if (!validTranscriptionTypes.includes(transcriptionType)) {
      throw new Error(`Invalid transcription type. Must be one of: ${validTranscriptionTypes.join(', ')}`);
    }
    
    // Validate language
    const validLanguages = ['auto', 'en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ru', 'ar', 'hi'];
    if (!validLanguages.includes(language)) {
      throw new Error(`Unsupported language. Must be one of: ${validLanguages.join(', ')}`);
    }
    
    // Prepare transcription data
    const transcriptionData = {
      videoId,
      videoUrl: currentVideo.url,
      videoDuration: currentVideo.duration,
      videoLanguage: currentVideo.metadata?.language || 'unknown',
      options: {
        language,
        transcriptionType,
        speakerDiarization,
        includeTimestamps: timestamps,
        includePunctuation: punctuation,
        customVocabulary: customVocabulary.length > 0 ? customVocabulary : undefined,
        callbackUrl,
        notifyOnComplete: true,
        generateSubtitles: true,
        confidenceThreshold: 0.8
      },
      metadata: {
        requestedBy: currentUser.id,
        requestedByName: currentUser.name || currentUser.email || 'Unknown User',
        requestedAt: new Date().toISOString(),
        videoTitle: currentVideo.title,
        videoDuration: currentVideo.duration,
        estimatedCost: transcriptionType === 'premium' ? '2.00' : 
                      transcriptionType === 'medical' ? '5.00' : 
                      transcriptionType === 'legal' ? '5.00' : '0.00', // Free for standard
        estimatedProcessingTime: Math.max(30, Math.ceil((currentVideo.duration || 300) / 60)) // At least 30 seconds
      }
    };
    
    // Show processing notification with estimated time
    const estimatedMinutes = Math.ceil(transcriptionData.metadata.estimatedProcessingTime / 60);
    notify({
      id: `video_transcription_started_${videoId}_${Date.now()}`,
      message: `Transcription started for "${currentVideo.title}" (estimated: ${estimatedMinutes} min)`,
      data: {
        entityId: videoId,
        entityType: 'video',
        extra: {
          videoId,
          videoTitle: currentVideo.title,
          videoDuration: currentVideo.duration,
          language,
          transcriptionType,
          speakerDiarization,
          status: 'processing',
          estimatedCompletionTime: `${estimatedMinutes} minutes`,
          jobType: 'transcription',
          requestedBy: currentUser.name
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
    
    // Call API to transcribe video
    const transcriptionResponse: any = yield call(TranscriptionAPI.transcribeVideo, transcriptionData);
    
    const { transcriptionId, jobId, status, estimatedCompletion } = transcriptionResponse;
    
    // Dispatch success action (initial - processing will continue)
    yield put(VideoActions.transcribeVideoSuccess({
      videoId,
      transcription: {
        id: transcriptionId,
        videoId,
        status: 'processing',
        language,
        transcriptionType,
        speakerDiarization,
        jobId,
        createdAt: new Date().toISOString(),
        estimatedCompletion,
        progress: 0
      },
      jobId,
      isExisting: false
    }));
    
    // Start polling for transcription status if we have a job ID
    if (jobId) {
      yield put(VideoActions.checkTranscriptionStatus({
        videoId,
        transcriptionId,
        jobId
      }));
    }
    
    // Show initial success notification
    notify({
      id: `video_transcription_accepted_${videoId}_${Date.now()}`,
      message: `Transcription request accepted for "${currentVideo.title}"`,
      data: {
        entityId: videoId,
        entityType: 'video',
        extra: {
          videoId,
          videoTitle: currentVideo.title,
          transcriptionId,
          jobId,
          language,
          transcriptionType,
          status: 'accepted',
          estimatedCompletion,
          speakerDiarization,
          includesSubtitles: true
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    console.log(`[TranscribeVideoSaga] Transcription started for ${videoId}, job: ${jobId}, estimated: ${estimatedCompletion}`);
    
  } catch (error: any) {
    console.error('[TranscribeVideoSaga] Error transcribing video:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isQuotaError = error.response?.status === 429 || error.message?.includes('quota');
    const isPaymentError = error.response?.status === 402 || error.message?.includes('payment');
    const isValidationError = error.response?.status === 400 || error.message?.includes('Invalid');
    const isVideoError = error.message?.includes('not found') || error.response?.status === 404;
    const isAudioError = error.message?.includes('audio') || error.message?.includes('silent');
    
    // Show error notification
    notify({
      id: `video_transcription_error_${Date.now()}`,
      message: isQuotaError
        ? 'Transcription quota exceeded. Please upgrade your plan or try again later.'
        : isPaymentError
        ? 'Payment required for premium transcription features.'
        : isAudioError
        ? 'Video has no audio track or is silent.'
        : isValidationError
        ? 'Invalid transcription parameters.'
        : NOTIFICATION_MESSAGES.Video.TRANSCRIBE_VIDEO_ERROR || 'Failed to transcribe video',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.videoId,
        entityType: 'video',
        extra: {
          videoId: action.payload.videoId,
          language: action.payload.language,
          transcriptionType: action.payload.transcriptionType,
          errorType: isAuthError ? 'auth' : 
                     isQuotaError ? 'quota' : 
                     isPaymentError ? 'payment' : 
                     isValidationError ? 'validation' : 
                     isVideoError ? 'video_not_found' : 
                     isAudioError ? 'no_audio' : 'unknown',
          errorCode: error.response?.status,
          errorDetails: error.response?.data?.errors || error.message
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.transcribeVideoFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to transcribe video',
      language: action.payload.language,
      transcriptionType: action.payload.transcriptionType,
      isAuthError,
      isQuotaError,
      isPaymentError,
      isValidationError,
      isVideoError,
      isAudioError
    }));
  }
}


// Create Collaboration Session Saga
function* createCollaborationSessionSaga(
  action: ReturnType<typeof VideoActions.createCollaborationSession>
): Generator<any, void, any> {
  try {
    const {
      videoId,
      sessionTitle,
      description,
      participants = [],
      permissions = {},
      settings = {},
      scheduledTime = null,
      duration = 60
    } = action.payload;
    
    console.log(`[CollaborationSaga] Creating collaboration session for video ${videoId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    const currentVideo = state.video?.currentVideo;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to create collaboration session');
    }
    
    if (!currentVideo || currentVideo.id !== videoId) {
      throw new Error('Video not loaded or not found');
    }
    
    // Check if video is in a valid state for collaboration
    if (currentVideo.status === 'processing' || currentVideo.status === 'uploading') {
      throw new Error('Video is still processing, cannot start collaboration');
    }
    
    // Check if there's already an active collaboration session for this video
    if (currentVideo.collaborationSession && currentVideo.collaborationSession.status === 'active') {
      notify({
        id: `collaboration_already_exists_${videoId}_${Date.now()}`,
        message: 'An active collaboration session already exists for this video',
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            existingSessionId: currentVideo.collaborationSession.id,
            hostId: currentVideo.collaborationSession.hostId,
            createdAt: currentVideo.collaborationSession.createdAt
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
      
      // Dispatch success with existing session
      yield put(VideoActions.createCollaborationSessionSuccess({
        videoId,
        collaborationSession: currentVideo.collaborationSession,
        isExisting: true
      }));
      
      return;
    }
    
    // Validate permissions structure
    const defaultPermissions = {
      canEdit: true,
      canComment: true,
      canAnnotate: true,
      canShare: true,
      canInvite: false,
      canDownload: false,
      canExport: false
    };
    
    // Prepare collaboration session data
    const collaborationData = {
      videoId,
      sessionTitle: sessionTitle || `Collaboration on "${currentVideo.title}"`,
      description: description || `Collaborative review session for ${currentVideo.title}`,
      hostId: currentUser.id,
      hostName: currentUser.name || currentUser.email || 'Unknown Host',
      createdBy: currentUser.id,
      status: 'active' as const,
      participants: [
        {
          userId: currentUser.id,
          userName: currentUser.name || currentUser.email || 'Host',
          userEmail: currentUser.email,
          role: 'host',
          joinedAt: new Date().toISOString(),
          permissions: { ...defaultPermissions, canInvite: true, canExport: true }
        },
        ...participants.map((p: any) => ({
          userId: p.userId,
          userName: p.userName || p.userEmail || 'Participant',
          userEmail: p.userEmail,
          role: p.role || 'participant',
          permissions: { ...defaultPermissions, ...(p.permissions || {}) },
          invitedAt: new Date().toISOString(),
          status: 'invited'
        }))
      ],
      permissions: {
        ...defaultPermissions,
        ...permissions
      },
      settings: {
        recordingEnabled: settings.recordingEnabled || false,
        chatEnabled: settings.chatEnabled !== false, // Default true
        annotationTools: settings.annotationTools || ['pointer', 'draw', 'text', 'highlight'],
        maxParticipants: settings.maxParticipants || 20,
        autoSaveInterval: settings.autoSaveInterval || 30000, // 30 seconds
        versionControl: settings.versionControl || true,
        allowGuestAccess: settings.allowGuestAccess || false,
        requireApproval: settings.requireApproval || false,
        ...settings
      },
      metadata: {
        createdAt: new Date().toISOString(),
        videoTitle: currentVideo.title,
        videoDuration: currentVideo.duration,
        videoUrl: currentVideo.url,
        scheduledTime: scheduledTime || new Date().toISOString(),
        scheduledDuration: duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sessionId: `collab_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      statistics: {
        activeParticipants: 1, // Host is active
        totalParticipants: participants.length + 1,
        annotationsCount: 0,
        commentsCount: 0,
        versionsCount: 1
      }
    };
    
    // Call API to create collaboration session
    const collaborationSession: any = yield call(CollaborationAPI.createSession, collaborationData);
    
    // Generate join links
    const hostLink: string = yield call(
      CollaborationAPI.generateJoinLink,
      collaborationSession.id,
      { role: 'host', userId: currentUser.id }
    );
    
    const participantLink: string = yield call(
      CollaborationAPI.generateJoinLink,
      collaborationSession.id,
      { role: 'participant' }
    );
    
    // Dispatch success action
    yield put(VideoActions.createCollaborationSessionSuccess({
      videoId,
      collaborationSession: {
        ...collaborationSession,
        hostLink,
        participantLink
      },
      isExisting: false
    }));
    
    // Update video with collaboration session reference
    yield put(VideoActions.updateVideoSuccess({
      id: videoId,
      updatedVideo: {
        ...currentVideo,
        collaborationSession: {
          id: collaborationSession.id,
          status: 'active',
          hostId: currentUser.id,
          participantCount: 1
        }
      }
    }));
    
    // Show success notification
    notify({
      id: `collaboration_session_created_${collaborationSession.id}_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.CREATE_COLLABORATION_SESSION_SUCCESS || 
               `Collaboration session "${collaborationData.sessionTitle}" created successfully`,
      data: {
        entityId: collaborationSession.id,
        entityType: 'collaboration_session',
        extra: {
          videoId,
          sessionId: collaborationSession.id,
          sessionTitle: collaborationData.sessionTitle,
          hostId: currentUser.id,
          hostName: currentUser.name,
          participantCount: collaborationData.statistics.totalParticipants,
          hostLink,
          participantLink,
          permissions: collaborationData.permissions,
          scheduledTime: collaborationData.metadata.scheduledTime,
          settings: collaborationData.settings
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    // Notify invited participants
    if (participants.length > 0) {
      participants.forEach((participant: any) => {
        notify({
          id: `collaboration_invite_sent_${participant.userId}_${Date.now()}`,
          message: `Invitation sent to ${participant.userName || participant.userEmail}`,
          data: {
            entityId: collaborationSession.id,
            entityType: 'collaboration_session',
            extra: {
              sessionId: collaborationSession.id,
              sessionTitle: collaborationData.sessionTitle,
              inviteeId: participant.userId,
              inviteeName: participant.userName,
              inviteeEmail: participant.userEmail,
              role: participant.role,
              permissions: participant.permissions,
              joinLink: participantLink,
              sentAt: new Date().toISOString()
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.INFO,
          level: 'info' as const
        });
      });
    }
    
    console.log(`[CollaborationSaga] Collaboration session created: ${collaborationSession.id} for video ${videoId}`);
    
  } catch (error: any) {
    console.error('[CollaborationSaga] Error creating collaboration session:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isVideoError = error.message?.includes('Video') || error.message?.includes('not found');
    const isStateError = error.message?.includes('processing') || error.message?.includes('uploading');
    const isQuotaError = error.response?.status === 429 || error.message?.includes('quota');
    
    // Show error notification
    notify({
      id: `collaboration_session_create_error_${Date.now()}`,
      message: isAuthError
        ? 'Authentication required to create collaboration session'
        : isQuotaError
        ? 'Collaboration session quota exceeded. Please upgrade your plan.'
        : isStateError
        ? 'Video is still processing, please wait and try again'
        : NOTIFICATION_MESSAGES.Video.CREATE_COLLABORATION_SESSION_ERROR || 'Failed to create collaboration session',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.videoId,
        entityType: 'video',
        extra: {
          videoId: action.payload.videoId,
          sessionTitle: action.payload.sessionTitle,
          errorType: isAuthError ? 'auth' : 
                     isQuotaError ? 'quota' : 
                     isVideoError ? 'video_not_found' : 
                     isStateError ? 'invalid_state' : 'unknown',
          errorCode: error.response?.status,
          participantCount: action.payload.participants?.length || 0
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.createCollaborationSessionFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to create collaboration session',
      isAuthError,
      isVideoError,
      isStateError,
      isQuotaError
    }));
  }
}

// Invite to Collaboration Session Saga
function* inviteToCollaborationSessionSaga(
  action: ReturnType<typeof VideoActions.inviteToCollaborationSession>
): Generator<any, void, any> {
  try {
    const {
      sessionId,
      videoId,
      invitees,
      invitationMessage = '',
      role = 'participant',
      permissions = {}
    } = action.payload;
    
    console.log(`[CollaborationSaga] Inviting ${invitees.length} users to collaboration session ${sessionId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    const currentVideo = state.video?.currentVideo;
    const collaborationSession = state.collaboration?.sessions?.[sessionId];
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to invite users');
    }
    
    if (!collaborationSession) {
      throw new Error('Collaboration session not found');
    }
    
    // Check if current user has permission to invite
    const isHost = collaborationSession.hostId === currentUser.id;
    const isAdmin = currentUser.roles?.includes('admin');
    const canInvite = collaborationSession.permissions?.canInvite || false;
    
    if (!isHost && !isAdmin && !canInvite) {
      throw new Error('You do not have permission to invite users to this session');
    }
    
    // Check session status
    if (collaborationSession.status !== 'active') {
      throw new Error(`Cannot invite users to a session that is ${collaborationSession.status}`);
    }
    
    // Check participant limit
    const currentParticipants = collaborationSession.participants?.length || 0;
    const maxParticipants = collaborationSession.settings?.maxParticipants || 20;
    
    if (currentParticipants + invitees.length > maxParticipants) {
      throw new Error(`Cannot invite ${invitees.length} users. Session limit is ${maxParticipants} participants.`);
    }
    
    // Prepare invitation data
    const invitationData = {
      sessionId,
      videoId,
      invitedBy: currentUser.id,
      invitedByName: currentUser.name || currentUser.email || 'Unknown User',
      invitedAt: new Date().toISOString(),
      invitees: invitees.map((invitee: any) => ({
        userId: invitee.userId,
        userEmail: invitee.userEmail,
        userName: invitee.userName || invitee.userEmail,
        role,
        permissions: {
          canEdit: invitee.permissions?.canEdit || permissions.canEdit || false,
          canComment: invitee.permissions?.canComment || permissions.canComment || true,
          canAnnotate: invitee.permissions?.canAnnotate || permissions.canAnnotate || true,
          canShare: invitee.permissions?.canShare || permissions.canShare || false,
          canInvite: invitee.permissions?.canInvite || permissions.canInvite || false,
          canDownload: invitee.permissions?.canDownload || permissions.canDownload || false,
          canExport: invitee.permissions?.canExport || permissions.canExport || false,
          ...invitee.permissions,
          ...permissions
        },
        invitationMessage,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }))
    };
    
    // Generate unique join links for each invitee
    const invitationsWithLinks = await Promise.all(
      invitationData.invitees.map(async (invitee: any) => {
        const joinLink = yield call(
          CollaborationAPI.generateJoinLink,
          sessionId,
          { 
            role: invitee.role,
            userId: invitee.userId,
            email: invitee.userEmail,
            expiresIn: '7d'
          }
        );
        
        return {
          ...invitee,
          joinLink,
          invitationId: `invite_${sessionId}_${invitee.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      })
    );
    
    // Call API to send invitations
    const invitationResponse: any = yield call(CollaborationAPI.sendInvitations, {
      ...invitationData,
      invitees: invitationsWithLinks
    });
    
    // Dispatch success action
    yield put(VideoActions.inviteToCollaborationSessionSuccess({
      sessionId,
      videoId,
      invitations: invitationResponse.invitations,
      invitedBy: currentUser.id,
      inviteeCount: invitees.length
    }));
    
    // Update collaboration session with new invitees
    yield put(VideoActions.updateCollaborationSession({
      sessionId,
      updates: {
        participants: [
          ...(collaborationSession.participants || []),
          ...invitationsWithLinks.map((invitee: any) => ({
            userId: invitee.userId,
            userName: invitee.userName,
            userEmail: invitee.userEmail,
            role: invitee.role,
            permissions: invitee.permissions,
            invitedAt: new Date().toISOString(),
            status: 'invited'
          }))
        ],
        statistics: {
          ...collaborationSession.statistics,
          totalParticipants: currentParticipants + invitees.length
        }
      }
    }));
    
    // Show success notification
    notify({
      id: `collaboration_invitations_sent_${sessionId}_${Date.now()}`,
      message: `Invitations sent to ${invitees.length} user${invitees.length !== 1 ? 's' : ''}`,
      data: {
        entityId: sessionId,
        entityType: 'collaboration_session',
        extra: {
          sessionId,
          videoId,
          sessionTitle: collaborationSession.sessionTitle,
          invitedBy: currentUser.name,
          inviteeCount: invitees.length,
          invitationIds: invitationResponse.invitations.map((inv: any) => inv.id),
          role,
          hasCustomMessage: !!invitationMessage
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    // Send individual notifications for each invitee
    invitationsWithLinks.forEach((invitee: any) => {
      notify({
        id: `collaboration_invite_${invitee.invitationId}_${Date.now()}`,
        message: `${invitee.userName} has been invited to the collaboration session`,
        data: {
          entityId: sessionId,
          entityType: 'collaboration_session',
          extra: {
            sessionId,
            videoId,
            sessionTitle: collaborationSession.sessionTitle,
            inviteeId: invitee.userId,
            inviteeName: invitee.userName,
            inviteeEmail: invitee.userEmail,
            role: invitee.role,
            joinLink: invitee.joinLink,
            invitationId: invitee.invitationId,
            expiresAt: invitee.expiresAt,
            permissions: invitee.permissions
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
    });
    
    console.log(`[CollaborationSaga] Invitations sent for session ${sessionId} to ${invitees.length} users`);
    
  } catch (error: any) {
    console.error('[CollaborationSaga] Error inviting to collaboration session:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isPermissionError = error.message?.includes('permission') || error.message?.includes('cannot invite');
    const isSessionError = error.message?.includes('session') || error.response?.status === 404;
    const isLimitError = error.message?.includes('limit') || error.message?.includes('full');
    
    // Show error notification
    notify({
      id: `collaboration_invite_error_${Date.now()}`,
      message: isPermissionError
        ? 'You do not have permission to invite users to this session'
        : isLimitError
        ? 'Session participant limit reached'
        : isSessionError
        ? 'Collaboration session not found or inactive'
        : NOTIFICATION_MESSAGES.Video.INVITE_TO_COLLABORATION_SESSION_ERROR || 'Failed to send invitations',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.sessionId,
        entityType: 'collaboration_session',
        extra: {
          sessionId: action.payload.sessionId,
          videoId: action.payload.videoId,
          errorType: isAuthError ? 'auth' : 
                     isPermissionError ? 'permission' : 
                     isSessionError ? 'session_not_found' : 
                     isLimitError ? 'limit_exceeded' : 'unknown',
          errorCode: error.response?.status,
          inviteeCount: action.payload.invitees?.length || 0
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.inviteToCollaborationSessionFailure({
      sessionId: action.payload.sessionId,
      videoId: action.payload.videoId,
      error: error.message || 'Failed to invite users',
      isAuthError,
      isPermissionError,
      isSessionError,
      isLimitError
    }));
  }
}

// Join Collaboration Session Saga
function* joinCollaborationSessionSaga(
  action: ReturnType<typeof VideoActions.joinCollaborationSession>
): Generator<any, void, any> {
  try {
    const {
      sessionId,
      videoId,
      joinToken,
      userDisplayName,
      userEmail
    } = action.payload;
    
    console.log(`[CollaborationSaga] Joining collaboration session ${sessionId}`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    // Fetch collaboration session details
    const collaborationSession: any = yield call(CollaborationAPI.getSession, sessionId);
    
    if (!collaborationSession) {
      throw new Error('Collaboration session not found');
    }
    
    // Check session status
    if (collaborationSession.status !== 'active') {
      throw new Error(`Cannot join a session that is ${collaborationSession.status}`);
    }
    
    // Check if user is already in the session
    const existingParticipant = collaborationSession.participants?.find(
      (p: any) => p.userId === (currentUser?.id || `guest_${userEmail}`)
    );
    
    if (existingParticipant && existingParticipant.status === 'active') {
      notify({
        id: `already_in_session_${sessionId}_${Date.now()}`,
        message: 'You are already in this collaboration session',
        data: {
          entityId: sessionId,
          entityType: 'collaboration_session',
          extra: {
            sessionId,
            videoId,
            sessionTitle: collaborationSession.sessionTitle,
            participantId: existingParticipant.userId,
            role: existingParticipant.role,
            joinedAt: existingParticipant.joinedAt
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });
      
      // Dispatch success with existing participation
      yield put(VideoActions.joinCollaborationSessionSuccess({
        sessionId,
        videoId,
        collaborationSession,
        participantInfo: existingParticipant,
        isRejoin: true
      }));
      
      return;
    }
    
    // Validate join token if required
    if (collaborationSession.settings?.requireApproval && !joinToken) {
      throw new Error('Join token required for this session');
    }
    
    if (joinToken) {
      const isValidToken: boolean = yield call(CollaborationAPI.validateJoinToken, sessionId, joinToken);
      if (!isValidToken) {
        throw new Error('Invalid or expired join token');
      }
    }
    
    // Check participant limit
    const activeParticipants = collaborationSession.participants?.filter(
      (p: any) => p.status === 'active'
    ).length || 0;
    const maxParticipants = collaborationSession.settings?.maxParticipants || 20;
    
    if (activeParticipants >= maxParticipants) {
      throw new Error('Collaboration session is full');
    }
    
    // Prepare join data
    const joinData = {
      sessionId,
      videoId,
      userId: currentUser?.id || `guest_${Date.now()}`,
      userDisplayName: userDisplayName || currentUser?.name || userEmail || 'Guest User',
      userEmail: userEmail || currentUser?.email,
      joinToken,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      joinedAt: new Date().toISOString(),
      permissions: existingParticipant?.permissions || {
        canEdit: false,
        canComment: true,
        canAnnotate: true,
        canShare: false,
        canInvite: false,
        canDownload: false,
        canExport: false
      }
    };
    
    // Call API to join session
    const joinResponse: any = yield call(CollaborationAPI.joinSession, joinData);
    
    const { connectionDetails, sessionData, participantId } = joinResponse;
    
    // Determine user role
    let role = 'participant';
    if (collaborationSession.hostId === joinData.userId) {
      role = 'host';
    } else if (existingParticipant) {
      role = existingParticipant.role;
    }
    
    // Prepare participant info
    const participantInfo = {
      userId: joinData.userId,
      userName: joinData.userDisplayName,
      userEmail: joinData.userEmail,
      role,
      permissions: joinData.permissions,
      joinedAt: joinData.joinedAt,
      status: 'active',
      lastActive: new Date().toISOString(),
      deviceInfo: joinData.deviceInfo
    };
    
    // Dispatch success action
    yield put(VideoActions.joinCollaborationSessionSuccess({
      sessionId,
      videoId,
      collaborationSession: {
        ...collaborationSession,
        ...sessionData
      },
      participantInfo,
      connectionDetails,
      isRejoin: !!existingParticipant
    }));
    
    // Update session participants
    yield put(VideoActions.updateCollaborationSession({
      sessionId,
      updates: {
        participants: [
          ...(collaborationSession.participants || []).filter((p: any) => p.userId !== joinData.userId),
          participantInfo
        ],
        statistics: {
          ...collaborationSession.statistics,
          activeParticipants: activeParticipants + 1
        }
      }
    }));
    
    // Show success notification
    notify({
      id: `collaboration_joined_${sessionId}_${participantId}_${Date.now()}`,
      message: `Joined collaboration session "${collaborationSession.sessionTitle}"`,
      data: {
        entityId: sessionId,
        entityType: 'collaboration_session',
        extra: {
          sessionId,
          videoId,
          sessionTitle: collaborationSession.sessionTitle,
          participantId: joinData.userId,
          participantName: joinData.userDisplayName,
          role,
          isHost: role === 'host',
          isGuest: !currentUser?.id,
          activeParticipants: activeParticipants + 1,
          totalParticipants: (collaborationSession.participants?.length || 0) + 1,
          permissions: joinData.permissions,
          joinedAt: joinData.joinedAt,
          isRejoin: !!existingParticipant
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    // Notify other participants about new join (except for rejoins)
    if (!existingParticipant) {
      notify({
        id: `collaboration_participant_joined_${sessionId}_${Date.now()}`,
        message: `${joinData.userDisplayName} joined the collaboration session`,
        data: {
          entityId: sessionId,
          entityType: 'collaboration_session',
          extra: {
            sessionId,
            videoId,
            sessionTitle: collaborationSession.sessionTitle,
            newParticipantId: joinData.userId,
            newParticipantName: joinData.userDisplayName,
            role,
            currentActiveParticipants: activeParticipants + 1,
            joinedAt: joinData.joinedAt
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const,
        broadcast: true // Flag to broadcast to other participants
      });
    }
    
    console.log(`[CollaborationSaga] Joined collaboration session ${sessionId} as ${joinData.userDisplayName} (${role})`);
    
  } catch (error: any) {
    console.error('[CollaborationSaga] Error joining collaboration session:', error);
    
    // Determine error type
    const isInvalidToken = error.message?.includes('token') || error.response?.status === 401;
    const isSessionFull = error.message?.includes('full') || error.response?.status === 429;
    const isSessionEnded = error.message?.includes('ended') || error.message?.includes('inactive');
    const isSessionNotFound = error.response?.status === 404;
    
    // Show error notification
    notify({
      id: `collaboration_join_error_${Date.now()}`,
      message: isInvalidToken
        ? 'Invalid or expired join link'
        : isSessionFull
        ? 'Collaboration session is full'
        : isSessionEnded
        ? 'Collaboration session has ended or is inactive'
        : isSessionNotFound
        ? 'Collaboration session not found'
        : NOTIFICATION_MESSAGES.Video.JOIN_COLLABORATION_SESSION_ERROR || 'Failed to join collaboration session',
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.sessionId,
        entityType: 'collaboration_session',
        extra: {
          sessionId: action.payload.sessionId,
          videoId: action.payload.videoId,
          errorType: isInvalidToken ? 'invalid_token' : 
                     isSessionFull ? 'session_full' : 
                     isSessionEnded ? 'session_ended' : 
                     isSessionNotFound ? 'not_found' : 'unknown',
          errorCode: error.response?.status,
          hasToken: !!action.payload.joinToken
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.joinCollaborationSessionFailure({
      sessionId: action.payload.sessionId,
      videoId: action.payload.videoId,
      error: error.message || 'Failed to join collaboration session',
      isInvalidToken,
      isSessionFull,
      isSessionEnded,
      isSessionNotFound
    }));
  }
}

// Manage Videos Saga
function* manageVideosSaga(
  action: ReturnType<typeof VideoActions.manageVideos>
): Generator<any, void, any> {
  try {
    const {
      operation,
      videoIds,
      bulkMetadata = {},
      filters = {},
      destinationFolderId = null,
      actionType = 'update'
    } = action.payload;
    
    console.log(`[ManageVideosSaga] Managing videos: ${operation} for ${videoIds.length} videos`);
    
    // Get current user from Redux state
    const state: RootState = yield select();
    const currentUser = state.auth?.user;
    
    if (!currentUser?.id) {
      throw new Error('Authentication required to manage videos');
    }
    
    // Check user permissions for bulk operations
    if (videoIds.length > 10 && !currentUser.roles?.includes('admin')) {
      throw new Error('Bulk operations limited to 10 videos for non-admin users');
    }
    
    // Validate operation
    const validOperations = ['archive', 'unarchive', 'delete', 'move', 'update', 'changePrivacy', 'addTags', 'removeTags', 'changeCategory'];
    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation. Must be one of: ${validOperations.join(', ')}`);
    }
    
    // Prepare management data based on operation
    let managementData: any = {
      operation,
      videoIds,
      performedBy: currentUser.id,
      performedByName: currentUser.name || currentUser.email || 'System',
      performedAt: new Date().toISOString(),
      actionType
    };
    
    switch (operation) {
      case 'archive':
        managementData = {
          ...managementData,
          metadata: {
            archivedAt: new Date().toISOString(),
            archivedBy: currentUser.id,
            reason: bulkMetadata.reason || 'User requested archiving'
          }
        };
        break;
        
      case 'unarchive':
        managementData = {
          ...managementData,
          metadata: {
            unarchivedAt: new Date().toISOString(),
            unarchivedBy: currentUser.id
          }
        };
        break;
        
      case 'delete':
        if (!bulkMetadata.confirmationToken) {
          throw new Error('Confirmation token required for delete operation');
        }
        managementData = {
          ...managementData,
          metadata: {
            deletedAt: new Date().toISOString(),
            deletedBy: currentUser.id,
            reason: bulkMetadata.reason || 'User requested deletion',
            permanent: bulkMetadata.permanent || false,
            confirmationToken: bulkMetadata.confirmationToken
          }
        };
        break;
        
      case 'move':
        if (!destinationFolderId) {
          throw new Error('Destination folder ID required for move operation');
        }
        managementData = {
          ...managementData,
          destinationFolderId,
          metadata: {
            movedAt: new Date().toISOString(),
            movedBy: currentUser.id,
            sourceFolderId: bulkMetadata.sourceFolderId,
            destinationFolderId
          }
        };
        break;
        
      case 'update':
        if (Object.keys(bulkMetadata).length === 0) {
          throw new Error('Metadata required for update operation');
        }
        managementData = {
          ...managementData,
          updates: bulkMetadata,
          metadata: {
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.id,
            fieldsUpdated: Object.keys(bulkMetadata)
          }
        };
        break;
        
      case 'changePrivacy':
        if (!bulkMetadata.privacyLevel) {
          throw new Error('Privacy level required for changePrivacy operation');
        }
        managementData = {
          ...managementData,
          privacyLevel: bulkMetadata.privacyLevel,
          metadata: {
            changedAt: new Date().toISOString(),
            changedBy: currentUser.id,
            oldPrivacy: bulkMetadata.oldPrivacy,
            newPrivacy: bulkMetadata.privacyLevel
          }
        };
        break;
        
      case 'addTags':
      case 'removeTags':
        if (!bulkMetadata.tags || !Array.isArray(bulkMetadata.tags)) {
          throw new Error('Tags array required for tag operations');
        }
        managementData = {
          ...managementData,
          tags: bulkMetadata.tags,
          metadata: {
            operation: operation === 'addTags' ? 'tags_added' : 'tags_removed',
            performedAt: new Date().toISOString(),
            performedBy: currentUser.id,
            tags: bulkMetadata.tags
          }
        };
        break;
        
      case 'changeCategory':
        if (!bulkMetadata.categoryId) {
          throw new Error('Category ID required for changeCategory operation');
        }
        managementData = {
          ...managementData,
          categoryId: bulkMetadata.categoryId,
          metadata: {
            changedAt: new Date().toISOString(),
            changedBy: currentUser.id,
            oldCategoryId: bulkMetadata.oldCategoryId,
            newCategoryId: bulkMetadata.categoryId
          }
        };
        break;
    }
    
    // Call API to perform bulk operation
    const managementResponse: any = yield call(VideoManagementAPI.bulkManageVideos, managementData);
    
    const { results, successCount, failureCount, totalProcessed, failedItems } = managementResponse;
    
    // Dispatch success action
    yield put(VideoActions.manageVideosSuccess({
      operation,
      videoIds,
      results,
      successCount,
      failureCount,
      totalProcessed,
      performedBy: currentUser.id
    }));
    
    // Update Redux state for successful operations
    if (successCount > 0) {
      switch (operation) {
        case 'archive':
        case 'unarchive':
        case 'delete':
          // Remove or update videos in state
          yield put(VideoActions.bulkUpdateVideos({
            videoIds: results.successful.map((r: any) => r.videoId),
            updates: {
              status: operation === 'archive' ? 'archived' : 
                     operation === 'unarchive' ? 'active' : 
                     'deleted'
            }
          }));
          break;
          
        case 'update':
          // Update video metadata in state
          results.successful.forEach((result: any) => {
            yield put(VideoActions.updateVideoSuccess({
              id: result.videoId,
              updatedVideo: result.updatedVideo
            }));
          });
          break;
          
        case 'move':
          // Update video folder references in state
          yield put(VideoActions.bulkUpdateVideos({
            videoIds: results.successful.map((r: any) => r.videoId),
            updates: {
              folderId: destinationFolderId
            }
          }));
          break;
      }
    }
    
    // Show success notification with summary
    notify({
      id: `video_management_${operation}_${Date.now()}`,
      message: `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation completed: ${successCount} successful, ${failureCount} failed`,
      data: {
        entityType: 'video_batch',
        extra: {
          operation,
          successCount,
          failureCount,
          totalProcessed,
          performedBy: currentUser.name,
          performedAt: new Date().toISOString(),
          failedItems: failedItems || [],
          operationDetails: managementData.metadata,
          isBulkOperation: true
        }
      },
      timestamp: new Date(),
      type: failureCount > 0 ? NotificationTypeEnum.WARNING : NotificationTypeEnum.OPERATION_SUCCESS,
      level: failureCount > 0 ? 'warning' : 'success' as const
    });
    
    // Show detailed notification for failed items if any
    if (failureCount > 0 && failedItems && failedItems.length > 0) {
      notify({
        id: `video_management_failures_${Date.now()}`,
        message: `${failureCount} operation${failureCount !== 1 ? 's' : ''} failed`,
        data: {
          entityType: 'video_batch',
          extra: {
            operation,
            failureCount,
            failedItems: failedItems.map((item: any) => ({
              videoId: item.videoId,
              error: item.error,
              reason: item.reason
            })),
            canRetry: true
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        level: 'error' as const
      });
    }
    
    console.log(`[ManageVideosSaga] ${operation} completed: ${successCount}/${videoIds.length} videos processed`);
    
  } catch (error: any) {
    console.error('[ManageVideosSaga] Error managing videos:', error);
    
    // Determine error type
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isValidationError = error.response?.status === 400 || error.message?.includes('Invalid');
    const isQuotaError = error.response?.status === 429 || error.message?.includes('quota');
    const isPermissionError = error.message?.includes('permission') || error.message?.includes('admin');
    
    // Show error notification
    notify({
      id: `video_management_error_${Date.now()}`,
      message: isAuthError
        ? 'Authentication required for bulk operations'
        : isPermissionError
        ? 'You do not have permission to perform this bulk operation'
        : isQuotaError
        ? 'Bulk operation quota exceeded. Please try again later.'
        : isValidationError
        ? 'Invalid operation parameters'
        : NOTIFICATION_MESSAGES.Video.MANAGE_VIDEOS_ERROR || 'Failed to manage videos',
      data: {
        originalError: error.message || 'Unknown error',
        entityType: 'video_batch',
        extra: {
          operation: action.payload.operation,
          videoCount: action.payload.videoIds?.length || 0,
          errorType: isAuthError ? 'auth' : 
                     isPermissionError ? 'permission' : 
                     isQuotaError ? 'quota' : 
                     isValidationError ? 'validation' : 'unknown',
          errorCode: error.response?.status,
          errorDetails: error.response?.data?.errors || error.message
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Dispatch failure action
    yield put(VideoActions.manageVideosFailure({
      operation: action.payload.operation,
      videoIds: action.payload.videoIds,
      error: error.message || 'Failed to manage videos',
      isAuthError,
      isValidationError,
      isQuotaError,
      isPermissionError
    }));
  }
}

// Check Transcription Status Saga (optional helper saga)
function* checkTranscriptionStatusSaga(
  action: ReturnType<typeof VideoActions.checkTranscriptionStatus>
): Generator<any, void, any> {
  try {
    const { videoId, transcriptionId, jobId } = action.payload;
    
    console.log(`[TranscribeVideoSaga] Checking transcription status for job ${jobId}`);
    
    // Call API to check status
    const statusResponse: any = yield call(TranscriptionAPI.getTranscriptionStatus, jobId);
    
    const { status, progress, estimatedTimeRemaining, result } = statusResponse;
    
    // Dispatch status update
    yield put(VideoActions.updateTranscriptionStatus({
      videoId,
      transcriptionId,
      status,
      progress,
      estimatedTimeRemaining,
      result: status === 'completed' ? result : null
    }));
    
    // If completed, show success notification with results
    if (status === 'completed' && result) {
      notify({
        id: `video_transcription_completed_${videoId}_${Date.now()}`,
        message: `Transcription completed for video`,
        data: {
          entityId: videoId,
          entityType: 'video',
          extra: {
            videoId,
            transcriptionId,
            jobId,
            status: 'completed',
            wordCount: result.wordCount || 0,
            duration: result.duration || 0,
            language: result.language || 'unknown',
            confidence: result.confidence || 0,
            speakerCount: result.speakerCount || 1,
            hasSubtitles: !!result.subtitlesUrl,
            downloadUrl: result.downloadUrl
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
      // Update video with transcription result
      yield put(VideoActions.updateVideoSuccess({
        id: videoId,
        updatedVideo: {
          transcription: {
            id: transcriptionId,
            ...result,
            status: 'completed',
            completedAt: new Date().toISOString()
          }
        }
      }));
    }
    
    // If still processing, schedule another check
    if (status === 'processing' && progress < 100) {
      // Wait before checking again (exponential backoff)
      const delay = Math.min(30000, 5000 * Math.pow(1.5, 3)); // Max 30 seconds
      yield delay(delay);
      yield put(VideoActions.checkTranscriptionStatus({
        videoId,
        transcriptionId,
        jobId
      }));
    }
    
    console.log(`[TranscribeVideoSaga] Transcription status: ${status}, progress: ${progress}%`);
    
  } catch (error: any) {
    console.error('[TranscribeVideoSaga] Error checking transcription status:', error);
    
    // Only log error, don't show notification to avoid spam during polling
    console.log(`Failed to check transcription status: ${error.message}`);
  }
}



// Recommend Video Saga
function* recommendVideoSaga(action: ReturnType<typeof VideoActions.recommendVideo>): Generator<any, void, any> {
  try {
    const { videoId, userId, recommendationContext } = action.payload;
    
    console.log(`Generating recommendations for video ${videoId}, user: ${userId}`);
    
    // Call the recommendation API
    const recommendations: any = yield call(VideoRecommendationAPI.getRecommendations, {
      videoId,
      userId,
      context: recommendationContext
    });
    
    // Dispatch success action
    yield put(VideoActions.recommendVideoSuccess({
      videoId,
      userId,
      recommendations,
      recommendationContext
    }));
    
    // Show success notification
    notifyVideoSuccess(
      videoId,
      NOTIFICATION_MESSAGES.Video.RECOMMEND_VIDEO_SUCCESS || `Recommendations generated successfully`,
      'recommend',
      {
        userId,
        recommendationCount: recommendations.length,
        recommendationContext
      }
    );
    
    console.log(`Recommendations generated for video ${videoId}, count: ${recommendations.length}`);
    
  } catch (error: any) {
    console.error("Error in recommendVideoSaga:", error);
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.RECOMMEND_VIDEO_ERROR || "Failed to generate recommendations",
      action.payload.videoId,
      'recommend',
      {
        userId: action.payload.userId
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.recommendVideoFailure({
      videoId: action.payload.videoId,
      userId: action.payload.userId,
      error: error.message || 'Recommendation generation failed'
    }));
  }
}

// Subscribe to Video Saga
function* subscribeToVideoSaga(action: ReturnType<typeof VideoActions.subscribeToVideo>): Generator<any, void, any> {
  try {
    const { videoId, userId, subscriptionType } = action.payload;
    
    console.log(`Subscribing user ${userId} to video ${videoId}, type: ${subscriptionType}`);
    
    // Call the subscription API
    const subscription: any = yield call(VideoSubscriptionAPI.subscribeToVideo, {
      videoId,
      userId,
      subscriptionType
    });
    
    // Dispatch success action
    yield put(VideoActions.subscribeToVideoSuccess({
      videoId,
      userId,
      subscription,
      subscriptionType
    }));
    
    // Show success notification
    notifyVideoSuccess(
      videoId,
      NOTIFICATION_MESSAGES.Video.SUBSCRIBE_VIDEO_SUCCESS || `Successfully subscribed to video`,
      'subscribe',
      {
        userId,
        subscriptionType,
        subscriptionId: subscription.id
      }
    );
    
    console.log(`User ${userId} subscribed to video ${videoId}`);
    
  } catch (error: any) {
    console.error("Error in subscribeToVideoSaga:", error);
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.SUBSCRIBE_VIDEO_ERROR || "Failed to subscribe to video",
      action.payload.videoId,
      'subscribe',
      {
        userId: action.payload.userId,
        subscriptionType: action.payload.subscriptionType
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.subscribeToVideoFailure({
      videoId: action.payload.videoId,
      userId: action.payload.userId,
      error: error.message || 'Subscription failed'
    }));
  }
}

// Unsubscribe from Video Saga
function* unsubscribeFromVideoSaga(action: ReturnType<typeof VideoActions.unsubscribeFromVideo>): Generator<any, void, any> {
  try {
    const { videoId, userId, subscriptionId } = action.payload;
    
    console.log(`Unsubscribing user ${userId} from video ${videoId}`);
    
    // Call the unsubscription API
    const result: any = yield call(VideoSubscriptionAPI.unsubscribeFromVideo, {
      videoId,
      userId,
      subscriptionId
    });
    
    // Dispatch success action
    yield put(VideoActions.unsubscribeFromVideoSuccess({
      videoId,
      userId,
      subscriptionId,
      result
    }));
    
    // Show success notification
    notifyVideoSuccess(
      videoId,
      NOTIFICATION_MESSAGES.Video.UNSUBSCRIBE_VIDEO_SUCCESS || `Successfully unsubscribed from video`,
      'unsubscribe',
      {
        userId,
        subscriptionId
      }
    );
    
    console.log(`User ${userId} unsubscribed from video ${videoId}`);
    
  } catch (error: any) {
    console.error("Error in unsubscribeFromVideoSaga:", error);
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.UNSUBSCRIBE_VIDEO_ERROR || "Failed to unsubscribe from video",
      action.payload.videoId,
      'unsubscribe',
      {
        userId: action.payload.userId,
        subscriptionId: action.payload.subscriptionId
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.unsubscribeFromVideoFailure({
      videoId: action.payload.videoId,
      userId: action.payload.userId,
      error: error.message || 'Unsubscription failed'
    }));
  }
}





// Fetch All Videos Saga
function* fetchAllVideosSaga(action: ReturnType<typeof VideoActions.fetchAllVideos>): Generator<any, void, any> {
  try {
    const { filters, page, limit } = action.payload || {};
    
    console.log(`Fetching all videos with filters:`, filters);
    
    // Call the API to fetch all videos
    const response: any = yield call(VideoAPI.fetchAllVideos, { filters, page, limit });
    
    const { videos, total, page: currentPage, totalPages } = response;
    
    // Dispatch success action
    yield put(VideoActions.fetchAllVideosSuccess({
      videos,
      total,
      page: currentPage,
      totalPages,
      filters
    }));
    
    // Show success notification
    notifyVideoSuccess(
      null, // No specific video ID for batch fetch
      NOTIFICATION_MESSAGES.Video.FETCH_ALL_VIDEOS_SUCCESS || `Successfully fetched ${videos.length} videos`,
      'fetchAll',
      {
        totalVideos: total,
        videosFetched: videos.length,
        page: currentPage,
        totalPages,
        hasFilters: !!filters
      }
    );
    
    console.log(`Fetched ${videos.length} videos (page ${currentPage}/${totalPages})`);
    
  } catch (error: any) {
    console.error("Error in fetchAllVideosSaga:", error);
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.FETCH_ALL_VIDEOS_ERROR || "Failed to fetch videos",
      null,
      'fetchAll',
      {
        filters: action.payload?.filters,
        page: action.payload?.page
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.fetchAllVideosFailure({
      error: error.message || 'Failed to fetch videos',
      filters: action.payload?.filters
    }));
  }
}


function* fetchAllVideosSaga(action: ReturnType<typeof VideoActions.fetchAllVideos>): Generator<any, void, any> {
  try {
    const { filters, page, limit } = action.payload || {};
    
    console.log(`Fetching all videos with filters:`, filters);
    
    // Call the API to fetch all videos
    const response: any = yield call(VideoAPI.fetchAllVideos, { filters, page, limit });
    
    const { videos, total, page: currentPage, totalPages } = response;
    
    // Dispatch success action
    yield put(VideoActions.fetchAllVideosSuccess({
      videos,
      total,
      page: currentPage,
      totalPages,
      filters
    }));
    
    // Show success notification
    notifyVideoSuccess(
      null, // No specific video ID for batch fetch
      NOTIFICATION_MESSAGES.Video.FETCH_ALL_VIDEOS_SUCCESS || `Successfully fetched ${videos.length} videos`,
      'fetchAll',
      {
        totalVideos: total,
        videosFetched: videos.length,
        page: currentPage,
        totalPages,
        hasFilters: !!filters
      }
    );
    
    console.log(`Fetched ${videos.length} videos (page ${currentPage}/${totalPages})`);
    
  } catch (error: any) {
    console.error("Error in fetchAllVideosSaga:", error);
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.FETCH_ALL_VIDEOS_ERROR || "Failed to fetch videos",
      null,
      'fetchAll',
      {
        filters: action.payload?.filters,
        page: action.payload?.page
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.fetchAllVideosFailure({
      error: error.message || 'Failed to fetch videos',
      filters: action.payload?.filters
    }));
  }
}

// Upload Video Saga
function* uploadVideoSaga(action: ReturnType<typeof VideoActions.uploadVideo>): Generator<any, void, any> {
  try {
    const { videoFile, metadata, onProgress } = action.payload;
    
    console.log(`Starting video upload: ${videoFile.name}, size: ${videoFile.size} bytes`);
    
    // Call the upload API with progress callback
    const uploadResponse: any = yield call(VideoAPI.uploadVideo, videoFile, metadata, (progressEvent: any) => {
      // Handle progress updates if callback provided
      if (onProgress && typeof onProgress === 'function') {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    });
    
    const { video, uploadId } = uploadResponse;
    
    // Dispatch success action
    yield put(VideoActions.uploadVideoSuccess({
      video,
      uploadId,
      metadata
    }));
    
    // Show success notification
    notifyVideoSuccess(
      video.id,
      NOTIFICATION_MESSAGES.Video.UPLOAD_VIDEO_SUCCESS || `Video "${video.title}" uploaded successfully`,
      'upload',
      {
        videoTitle: video.title,
        videoSize: videoFile.size,
        videoDuration: video.duration,
        uploadId,
        metadata
      }
    );
    
    console.log(`Video uploaded successfully: ${video.id} - ${video.title}`);
    
  } catch (error: any) {
    console.error("Error in uploadVideoSaga:", error);
    
    const videoName = action.payload.videoFile?.name || 'Unknown video';
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.UPLOAD_VIDEO_ERROR || `Failed to upload "${videoName}"`,
      null,
      'upload',
      {
        videoName,
        fileSize: action.payload.videoFile?.size,
        errorCode: (error as AxiosError)?.response?.status,
        errorDetails: (error as AxiosError)?.response?.data
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.uploadVideoFailure({
      error: error.message || 'Upload failed',
      videoName: action.payload.videoFile?.name,
      uploadId: action.payload.metadata?.uploadId
    }));
  }
}

// Fetch Single Video Saga
function* fetchSingleVideoSaga(action: ReturnType<typeof VideoActions.fetchSingleVideo>): Generator<any, void, any> {
  try {
    const { videoId, includeDetails } = action.payload;
    
    console.log(`Fetching single video: ${videoId}, includeDetails: ${includeDetails}`);
    
    // Call the API to fetch single video
    const video: any = yield call(VideoAPI.fetchVideoById, videoId, { includeDetails });
    
    // Dispatch success action
    yield put(VideoActions.fetchSingleVideoSuccess({
      video,
      includeDetails
    }));
    
    // Show success notification
    notifyVideoSuccess(
      videoId,
      NOTIFICATION_MESSAGES.Video.FETCH_SINGLE_VIDEO_SUCCESS || `Video "${video.title}" loaded successfully`,
      'fetchSingle',
      {
        videoTitle: video.title,
        videoStatus: video.status,
        includeDetails,
        hasThumbnail: !!video.thumbnailUrl,
        hasMetadata: !!video.metadata
      }
    );
    
    console.log(`Video fetched successfully: ${videoId} - ${video.title}`);
    
  } catch (error: any) {
    console.error("Error in fetchSingleVideoSaga:", error);
    
    // Determine if it's a 404 (video not found) error
    const isNotFound = (error as AxiosError)?.response?.status === 404;
    const errorMessage = isNotFound 
      ? NOTIFICATION_MESSAGES.Video.VIDEO_NOT_FOUND || "Video not found"
      : NOTIFICATION_MESSAGES.Video.FETCH_SINGLE_VIDEO_ERROR || "Failed to fetch video";
    
    // Show error notification
    notifyVideoError(
      error,
      errorMessage,
      action.payload.videoId,
      'fetchSingle',
      {
        videoId: action.payload.videoId,
        includeDetails: action.payload.includeDetails,
        isNotFound,
        errorCode: (error as AxiosError)?.response?.status
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.fetchSingleVideoFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to fetch video',
      isNotFound
    }));
  }
}


// Upload Video Saga
function* uploadVideoSaga(action: ReturnType<typeof VideoActions.uploadVideo>): Generator<any, void, any> {
  try {
    const { videoFile, metadata, onProgress } = action.payload;
    
    console.log(`Starting video upload: ${videoFile.name}, size: ${videoFile.size} bytes`);
    
    // Call the upload API with progress callback
    const uploadResponse: any = yield call(VideoAPI.uploadVideo, videoFile, metadata, (progressEvent: any) => {
      // Handle progress updates if callback provided
      if (onProgress && typeof onProgress === 'function') {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    });
    
    const { video, uploadId } = uploadResponse;
    
    // Dispatch success action
    yield put(VideoActions.uploadVideoSuccess({
      video,
      uploadId,
      metadata
    }));
    
    // Show success notification
    notifyVideoSuccess(
      video.id,
      NOTIFICATION_MESSAGES.Video.UPLOAD_VIDEO_SUCCESS || `Video "${video.title}" uploaded successfully`,
      'upload',
      {
        videoTitle: video.title,
        videoSize: videoFile.size,
        videoDuration: video.duration,
        uploadId,
        metadata
      }
    );
    
    console.log(`Video uploaded successfully: ${video.id} - ${video.title}`);
    
  } catch (error: any) {
    console.error("Error in uploadVideoSaga:", error);
    
    const videoName = action.payload.videoFile?.name || 'Unknown video';
    
    // Show error notification
    notifyVideoError(
      error,
      NOTIFICATION_MESSAGES.Video.UPLOAD_VIDEO_ERROR || `Failed to upload "${videoName}"`,
      null,
      'upload',
      {
        videoName,
        fileSize: action.payload.videoFile?.size,
        errorCode: (error as AxiosError)?.response?.status,
        errorDetails: (error as AxiosError)?.response?.data
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.uploadVideoFailure({
      error: error.message || 'Upload failed',
      videoName: action.payload.videoFile?.name,
      uploadId: action.payload.metadata?.uploadId
    }));
  }
}

// Fetch Single Video Saga
function* fetchSingleVideoSaga(action: ReturnType<typeof VideoActions.fetchSingleVideo>): Generator<any, void, any> {
  try {
    const { videoId, includeDetails } = action.payload;
    
    console.log(`Fetching single video: ${videoId}, includeDetails: ${includeDetails}`);
    
    // Call the API to fetch single video
    const video: any = yield call(VideoAPI.fetchVideoById, videoId, { includeDetails });
    
    // Dispatch success action
    yield put(VideoActions.fetchSingleVideoSuccess({
      video,
      includeDetails
    }));
    
    // Show success notification
    notifyVideoSuccess(
      videoId,
      NOTIFICATION_MESSAGES.Video.FETCH_SINGLE_VIDEO_SUCCESS || `Video "${video.title}" loaded successfully`,
      'fetchSingle',
      {
        videoTitle: video.title,
        videoStatus: video.status,
        includeDetails,
        hasThumbnail: !!video.thumbnailUrl,
        hasMetadata: !!video.metadata
      }
    );
    
    console.log(`Video fetched successfully: ${videoId} - ${video.title}`);
    
  } catch (error: any) {
    console.error("Error in fetchSingleVideoSaga:", error);
    
    // Determine if it's a 404 (video not found) error
    const isNotFound = (error as AxiosError)?.response?.status === 404;
    const errorMessage = isNotFound 
      ? NOTIFICATION_MESSAGES.Video.VIDEO_NOT_FOUND || "Video not found"
      : NOTIFICATION_MESSAGES.Video.FETCH_SINGLE_VIDEO_ERROR || "Failed to fetch video";
    
    // Show error notification
    notifyVideoError(
      error,
      errorMessage,
      action.payload.videoId,
      'fetchSingle',
      {
        videoId: action.payload.videoId,
        includeDetails: action.payload.includeDetails,
        isNotFound,
        errorCode: (error as AxiosError)?.response?.status
      }
    );
    
    // Dispatch failure action
    yield put(VideoActions.fetchSingleVideoFailure({
      videoId: action.payload.videoId,
      error: error.message || 'Failed to fetch video',
      isNotFound
    }));
  }
}

function* deleteVideoSaga(action: ReturnType<typeof VideoActions.deleteVideo>) {
  try {
    const videoId = action.payload;
    yield call(videoService.deleteVideo, videoId.id);
    yield put(VideoActions.removeVideoSuccess({ videoId: "videoId" }));
  } catch (error) {
    yield put(
      VideoActions.removeVideoFailure({
        id: "videoId",
        error: NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
      })
    );
  }
}

function* updateMetadataSaga(
  action: ReturnType<typeof VideoActions.updateMetadata>
) {
  try {
    const { id, newMetadata } = action.payload;
    const updatedVideo: Video = yield call(
      videoService.updateVideoMetadata,
      id,
      newMetadata
    );
    yield put(VideoActions.updateVideoSuccess({ id, updatedVideo }));
  } catch (error) {
    yield put(
      VideoActions.updateVideoFailure({
        id: "videoId",
        error: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
      })
    );
  }
}


function* sendVideoNotificationSaga(
  action: ReturnType<typeof VideoActions.sendVideoNotification>): Generator<any,void, any> {
  const { id, notification } = action.payload; // Destructure id and notification from action payload
  try {
    // Call videoService.sendVideoNotification with both id and notification parameters
    const response = yield call(videoService.sendVideoNotification, id, notification);
    yield put(VideoActions.sendVideoNotificationSuccess(response));
  } catch (error) {
    yield put(
      VideoActions.sendVideoNotificationFailure({
        id: "videoId",
        error: NOTIFICATION_MESSAGES.Video.SEND_NOTIFICATION_ERROR,
      })
    );
  }
}

function* updateVideoDataSaga(action: ReturnType<typeof VideoActions.updateVideoData>) { 
  try {
    const { id, newData } = action.payload;
    const updatedVideo: Video = yield call(
      videoService.updateVideoData,
      id,
      newData
    );
    yield put(VideoActions.updateVideoSuccess({ id, updatedVideo }));
  } catch (error) {
    yield put(
      VideoActions.updateVideoFailure({
        id: "videoId",
        error: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
      })
    );
  }
}



// Worker Saga: Fetch Video
function* fetchVideoSaga(action: ReturnType<typeof VideoActions.fetchVideoRequest>) {
  try {
    const videoId = action.payload; // TypeScript now knows payload is a string
    const video: Video = yield call(videoService.fetchVideo, videoId);
    yield put(VideoActions.fetchVideoSuccess({ video }));
  } catch (error: any) {
    yield put(
      VideoActions.fetchVideoFailure({
        error: error.message || NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
      })
    );
  }
}


// Worker Saga: Update Video
function* updateVideoSaga(
  action: ReturnType<typeof VideoActions.updateVideo>
): Generator<any, void, any> {
  try {
    const { id, title, description } = action.payload;
    const updatedVideo: Video = yield call(
      videoService.updateVideo,
      id,
      title,
      description
    );
    yield put(VideoActions.updateVideoSuccess({ id, updatedVideo }));
  } catch (error) {
    yield put(
      VideoActions.updateVideoFailure({
        id: action.payload.id,
        error: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
      })
    );
  }
}





// Worker Saga: Fetch Video Success
function* fetchVideoSuccessSaga(
  action: ReturnType<typeof VideoActions.fetchVideoSuccess>
): Generator<any, void, any> { 
  try {
    const { video } = action.payload;
    // Use the 'video' variable here if needed
    
    notify({
      id: `fetchVideoSuccess_${video.id || Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_SUCCESS || "Video fetched successfully",
      data: {
        entityId: video.id,
        entityType: 'video',
        extra: {
          videoId: video.id,
          videoTitle: video.title,
          action: 'fetch'
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    yield put(VideoActions.fetchVideoSuccess({ video }));

  } catch (error: any) {
    // Handle error if needed
    console.error("Error in fetchVideoSuccessSaga:", error);
    
    notify({
      id: `fetchVideoSagaError_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR || "Error trying to fetch video",
      data: {
        originalError: error.message || 'Unknown error',
        entityType: 'video',
        extra: {
          error,
          action: 'fetch',
          saga: 'fetchVideoSuccessSaga'
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
  }
}

function* updateVideoSuccessSaga(
  action: ReturnType<typeof VideoActions.updateVideoSuccess>
): Generator<any, void, any> {
  try {
    const { id, updatedVideo } = action.payload;
    // Use the 'updatedVideo' variable here if needed
    
    notify({
      id: `updateVideoSuccess_${id || Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS || "Successfully updated video metadata",
      data: {
        entityId: id,
        entityType: 'video',
        extra: {
          videoId: id,
          videoTitle: updatedVideo?.title,
          updates: updatedVideo,
          action: 'update'
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    yield put(VideoActions.updateVideoSuccess({ id, updatedVideo }));
    
  } catch (error: any) {
    // Handle error if needed
    console.error("Error in updateVideoSuccessSaga:", error);
    
    notify({
      id: `updateVideoSagaError_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR || "Error trying to update video",
      data: {
        originalError: error.message || 'Unknown error',
        entityId: action.payload.id,
        entityType: 'video',
        extra: {
          error,
          videoId: action.payload.id,
          action: 'update',
          saga: 'updateVideoSuccessSaga'
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
  }
}

function* shareVideoSaga(action: ReturnType<typeof VideoActions.shareVideo>) {
  try {
    const videoId = action.payload;
    const video: Video = yield call(videoService.fetchVideo, videoId); // Adjust the service method accordingly
    yield put(VideoActions.fetchVideoSuccess({ video }));
  } catch (error) {
    yield put(
      VideoActions.fetchVideoFailure({
        error: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
      })
    );
  }
 }

function* fetchVideoFailureSaga(response: any): Generator<any, void, any> { 
  try {
    const { error } = response.payload;
    // Use the 'error' variable here if needed
    
    notify({
      id: `fetchVideoFailure_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR || "Error trying to fetch video",
      data: {
        originalError: error?.message || 'Unknown fetch error',
        entityType: 'video',
        extra: {
          error,
          action: 'fetch',
          saga: 'fetchVideoFailureSaga'
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    yield put(VideoActions.fetchVideoFailure({ error }));
    
  } catch (error: any) {
    // Handle error if needed
    console.error("Error in fetchVideoFailureSaga:", error);
    
    notify({
      id: `fetchVideoFailureSagaError_${Date.now()}`,
      message: NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR || "Error in fetch video failure saga",
      data: {
        originalError: error.message || 'Unknown error',
        entityType: 'video',
        extra: {
          error,
          saga: 'fetchVideoFailureSaga',
          originalError: response.payload?.error
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
  }
}

// Worker Saga: Create Video
function* createVideoSaga(action: ReturnType<typeof VideoActions.createVideo>) {
  try {
    const { title, description } = action.payload;
    const newVideo: Video = yield call(
      videoService.createVideo,
      title,
      description
    );
    yield put(
      VideoActions.createVideoSuccess({ 
        id: newVideo.id, // Use actual ID from response
        video: newVideo 
      })
    );
  } catch (error: any) {
    yield put(
      VideoActions.createVideoFailure({
        id: "videoId", // Consider passing a proper ID here
        video: action.payload, // Pass the original video data
        error: error.message || NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_ERROR,
      })
    );
  }
}

// Worker Saga: Add Video
function* addVideoSaga(action: ReturnType<typeof VideoActions.addVideo>) {
  try {
    const { id, video } = action.payload; // Destructure properly
    // Implement adding video functionality here
    // Call actual service method instead of just dispatching
    const addedVideo: Video = yield call(videoService.addVideo, video);
    
    yield put(VideoActions.addVideoSuccess({ 
      id: addedVideo.id, // Use actual ID
      video: addedVideo 
    }));
  } catch (error: any) {
    yield put(
      VideoActions.addVideoFailure({
        videoId: action.payload.id || "newVideoId",
        error: error.message || NOTIFICATION_MESSAGES.Video.ADD_VIDEO_ERROR,
      })
    );
  }
}

// Worker Saga: Remove Video
function* removeVideoSaga(action: ReturnType<typeof VideoActions.removeVideo>) {
  try {
    const { videoId } = action.payload; // Assuming payload has videoId property
    // Call service to actually remove video
    yield call(videoService.removeVideo, videoId);
    
    yield put(VideoActions.removeVideoSuccess({ videoId }));
  } catch (error: any) {
    yield put(
      VideoActions.removeVideoFailure({
        id: action.payload.videoId,
        error: error.message || NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
      })
    );
  }
}



// Watcher Saga: Watches for the fetch and update video actions
function* watchVideoSagas() {
// Actions related to deleting, updating metadata, and sending notifications
yield takeLatest(VideoActions.deleteVideo.type, deleteVideoSaga);
yield takeLatest(VideoActions.updateMetadata.type, updateMetadataSaga);
yield takeLatest(VideoActions.sendVideoNotification.type, sendVideoNotificationSaga);
yield takeLatest(VideoActions.updateVideoData.type, updateVideoDataSaga);

// Actions related to fetching, sharing, analyzing, and subscribing/unsubscribing
yield takeLatest(VideoActions.fetchVideoRequest.type, fetchVideoSaga);
yield takeLatest(VideoActions.updateVideoRequest.type, updateVideoSaga);
yield takeLatest(VideoActions.fetchVideoSuccess.type, fetchVideoSuccessSaga);
yield takeLatest(VideoActions.fetchVideoFailure.type, fetchVideoFailureSaga);
yield takeLatest(VideoActions.shareVideo.type, shareVideoSaga);
yield takeLatest(VideoActions.analyzeVideo.type, analyzeVideoSaga);
yield takeLatest(VideoActions.recommendVideo.type, recommendVideoSaga);
yield takeLatest(VideoActions.subscribeToVideo.type, subscribeToVideoSaga);
yield takeLatest(VideoActions.unsubscribeFromVideo.type, unsubscribeFromVideoSaga);

// Actions related to fetching all videos, uploading, fetching single video, adding, and removing
yield takeLatest(VideoActions.fetchAllVideos.type, fetchAllVideosSaga);
yield takeLatest(VideoActions.uploadVideo.type, uploadVideoSaga);
yield takeLatest(VideoActions.fetchSingleVideo.type, fetchSingleVideoSaga);
yield takeLatest(VideoActions.addVideo.type, addVideoSaga);
yield takeLatest(VideoActions.removeVideo.type, removeVideoSaga);
yield takeLatest(VideoActions.updateVideo.type, updateVideoSaga);

// Actions related to conference management
yield takeLatest(VideoActions.createConference.type, createConferenceSaga);
yield takeLatest(VideoActions.joinConference.type, joinConferenceSaga);
yield takeLatest(VideoActions.endConference.type, endConferenceSaga);

// Actions related to message handling
yield takeLatest(VideoActions.sendMessages.type, sendMessagesSaga);
yield takeLatest(VideoActions.retrieveMessages.type, retrieveMessagesSaga);

// Actions related to annotations
yield takeLatest(VideoActions.addAnnotations.type, addAnnotationsSaga);
yield takeLatest(VideoActions.retrieveAnnotations.type, retrieveAnnotationsSaga);

// Actions related to playback control
yield takeLatest(VideoActions.controlPlaybackSpeed.type, controlPlaybackSpeedSaga);
yield takeLatest(VideoActions.controlPlaybackFrame.type, controlPlaybackFrameSaga);

// Actions related to live sessions
yield takeLatest(VideoActions.startLiveSession.type, startLiveSessionSaga);
yield takeLatest(VideoActions.endLiveSession.type, endLiveSessionSaga);
yield takeLatest(VideoActions.checkLiveSessionStatus.type, checkLiveSessionStatusSaga);
 
}

// Export the video sagas
export function* videoSagas() {
  yield watchVideoSagas();
}
