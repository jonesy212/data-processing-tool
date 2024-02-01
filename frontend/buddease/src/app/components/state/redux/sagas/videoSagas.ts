// videoSaga.ts
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { Video } from "@/app/components/video/Video";
import { VideoActions } from "@/app/components/video/VideoActions";
import videoService from "@/app/services/videoService";
import { call, put, takeLatest } from "redux-saga/effects";

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
function* updateVideoSaga(action: any) {
  try {
    const { videoId, videoData } = action.payload;
    const updatedVideo: Video = yield call(
      videoService.updateVideo,
      videoId,
      videoData
    ); // Adjust the service method accordingly
    yield put(VideoActions.updateVideoSuccess({ video: updatedVideo }));
  } catch (error) {
    yield put(
      VideoActions.updateVideoFailure({
        error: NOTIFICATION_MESSAGES.Video.UPDATE_VIDEO_ERROR,
      })
    );
  }
}



// Worker Saga: Create Video
function* createVideoSaga(action: any) {
    try {
      const { title, description } = action.payload;
      const newVideo: Video = yield call(
        videoService.createVideo,
        title,
        description
      ); // Adjust the service method accordingly
      yield put(VideoActions.createVideoSuccess({ video: newVideo }));
    } catch (error) {
      yield put(
        VideoActions.createVideoFailure({
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
      yield put(VideoActions.addVideoSuccess({ video }));
    } catch (error) {
      yield put(
        VideoActions.addVideoFailure({
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
          error: NOTIFICATION_MESSAGES.Video.REMOVE_VIDEO_ERROR,
        })
      );
    }

// Watcher Saga: Watches for the fetch and update video actions
function* watchVideoSagas() {
  yield takeLatest(VideoActions.fetchVideoRequest.type, fetchVideoSaga);
  yield takeLatest(VideoActions.updateVideoRequest.type, updateVideoSaga);
}

// Export the video sagas
export function* videoSagas() {
  yield watchVideoSagas();
}
