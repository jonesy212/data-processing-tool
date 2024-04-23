// videoSaga.ts
import { videoService } from "@/app/api/ApiVideo";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { VideoActions } from "@/app/components/users/VideoActions";
import { call, put, takeLatest } from "redux-saga/effects";
import { Video } from "../../stores/VideoStore";
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';

const { notify } = useNotification();

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



// Update the sendVideoNotificationSaga function to expect the notification property in the payload
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
function* fetchVideoSaga(action: any) {
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
    notify(
      "Video updated successfully",
      "Fetch Video Success",
      NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    yield put(VideoActions.fetchVideoSuccess({ video }));

  } catch (error) {
    // Handle error if needed
    console.error("Error in fetchVideoSuccessSaga:", error);
    notify(
      "Error trying to fetch video",
      NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
      "Error trying to fetch video",
      new Date(),
      NotificationTypeEnum.OperationError
    )
  }
}

function* updateVideoSuccessSaga( action: ReturnType<typeof VideoActions.updateVideoSuccess> ) {
  try {
    const { id, updatedVideo } = action.payload;
    // Use the 'updatedVideo' variable here if needed
    notify(
      "Sucessfully updated video metadata",
      NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_SUCCESS,
      "Update Video Success",
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
    yield put(VideoActions.updateVideoSuccess({ id, updatedVideo }));
  } catch (error) {
    // Handle error if needed
    console.error("Error in updateVideoSuccessSaga:", error);
    notify(
      "Error in updateVideoSuccessSaga:" + error,
      NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
      "Error trying to update video",
      new Date(),
      NotificationTypeEnum.OperationError
    )
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

function* fetchVideoFailureSaga(response: any) { 
  try {
    const { error } = response.payload;
    // Use the 'error' variable here if needed
    notify(
      NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
      "Error trying to fetch video",
      new Date(),
      NotificationTypeEnum.OperationError
    );
    yield put(VideoActions.fetchVideoFailure({ error }));
  } catch (error) {
    // Handle error if needed
    console.error("Error in fetchVideoFailureSaga:", error);
    notify(
      NOTIFICATION_MESSAGES.Video.FETCH_VIDEO_ERROR,
      "Error trying to fetch video",
      new Date(),
      NotificationTypeEnum.OperationError
    )
  }
}

// Worker Saga: Create Video
function* createVideoSaga(action: any) {
  const video = action.payload;
  try {
    const { title, description } = action.payload;
    const newVideo: Video = yield call(
      videoService.createVideo,
      title,
      description
    ); // Adjust the service method accordingly
    yield put(
      VideoActions.createVideoSuccess({ id: "videoId", video: newVideo })
    );
  } catch (error) {
    yield put(
      VideoActions.createVideoFailure({
        id: "videoId",
        video: video,
        error: NOTIFICATION_MESSAGES.Video.CREATE_VIDEO_ERROR,
      })
    );
  }
}

// Worker Saga: Add Video
function* addVideoSaga(action: any) {
  try {
    const video: Video = action.payload;
    // Implement adding video functionality here
    yield put(VideoActions.addVideo({id: "", video}))
    yield put(VideoActions.addVideoSuccess({ id: "newVideoId", video }));
  } catch (error) {
    yield put(
      VideoActions.addVideoFailure({
        videoId: "newVideoId",
        error: NOTIFICATION_MESSAGES.Video.ADD_VIDEO_ERROR,
      })
    );
  }
}

// Worker Saga: Remove Video
function* removeVideoSaga(action: any) {
  try {
    const videoId: string = action.payload;
    // Implement removing video functionality here
    yield put(VideoActions.removeVideoSuccess({ videoId }));
  } catch (error) {
    yield put(
      VideoActions.removeVideoFailure({
        id: action.payload.id,
        error: NOTIFICATION_MESSAGES.Video.DELETE_VIDEO_ERROR,
      })
    );
  }
}



// Watcher Saga: Watches for the fetch and update video actions
function* watchVideoSagas() {
  // Actions related to deleting, updating metadata, and sending notifications
  yield takeLatest(VideoActions.deleteVideo.type, deleteVideoSaga);
  yield takeLatest(VideoActions.updateMetadata.type, updateMetadataSaga);
  yield takeLatest(VideoActions.createVideo.type, createVideoSaga);
  yield takeLatest(VideoActions.sendVideoNotification.type, sendVideoNotificationSaga);
  yield takeLatest(VideoActions.updateVideoData.type, updateVideoDataSaga);

  // Actions related to fetching, sharing, analyzing, and subscribing/unsubscribing
  yield takeLatest(VideoActions.fetchVideoRequest.type, fetchVideoSaga);
  yield takeLatest(VideoActions.updateVideoRequest.type, updateVideoSaga);
  yield takeLatest(VideoActions.fetchVideoSuccess.type, fetchVideoSuccessSaga);
  yield takeLatest(VideoActions.fetchVideoFailure.type, fetchVideoFailureSaga);
  yield takeLatest(VideoActions.updateVideoSuccess.type, updateVideoSuccessSaga);
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

  // Actions related to video editing and transcription
  yield takeLatest(VideoActions.editVideo.type, editVideoSaga);
  yield takeLatest(VideoActions.transcribeVideo.type, transcribeVideoSaga);

  // Actions related to collaboration sessions and video management
  yield takeLatest(VideoActions.createCollaborationSession.type, createCollaborationSessionSaga);
  yield takeLatest(VideoActions.inviteToCollaborationSession.type, inviteToCollaborationSessionSaga);
  yield takeLatest(VideoActions.joinCollaborationSession.type, joinCollaborationSessionSaga);
  yield takeLatest(VideoActions.manageVideos.type, manageVideosSaga);













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
 
   // Actions related to video editing and transcription
   yield takeLatest(VideoActions.editVideo.type, editVideoSaga);
   yield takeLatest(VideoActions.transcribeVideo.type, transcribeVideoSaga);
 
   // Actions related to collaboration sessions and video management
   yield takeLatest(VideoActions.createCollaborationSession.type, createCollaborationSessionSaga);
   yield takeLatest(VideoActions.inviteToCollaborationSession.type, inviteToCollaborationSessionSaga);
   yield takeLatest(VideoActions.joinCollaborationSession.type, joinCollaborationSessionSaga);
   yield takeLatest(VideoActions.manageVideos.type, manageVideosSaga);
 
   // New actions added here
   yield takeLatest(VideoActions.addVideoTags.type, addVideoTagsSaga);
   yield takeLatest(VideoActions.updateVideoLanguage.type, updateVideoLanguageSaga);
   yield takeLatest(VideoActions.updateVideoCategory.type, updateVideoCategorySaga);
   yield takeLatest(VideoActions.updateVideoResolution.type, updateVideoResolutionSaga);
   yield takeLatest(VideoActions.updateVideoLicense.type, updateVideoLicenseSaga);
   yield takeLatest(VideoActions.updateVideoLocation.type, updateVideoLocationSaga);
   yield takeLatest(VideoActions.updateVideoThumbnail.type, updateVideoThumbnailSaga);
   yield takeLatest(VideoActions.updateVideoTitle.type, updateVideoTitleSaga);
   yield takeLatest(VideoActions.updateVideoDescription.type, updateVideoDescriptionSaga);
   yield takeLatest(VideoActions.createCollaborationSession.type, createCollaborationSessionSaga);
   yield takeLatest(VideoActions.endCollaborationSession.type, endCollaborationSessionSaga);
 

}

// Export the video sagas
export function* videoSagas() {
  yield watchVideoSagas();
}
