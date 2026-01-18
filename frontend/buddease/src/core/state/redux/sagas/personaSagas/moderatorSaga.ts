// moderatorSaga.ts
import { ModeratorActions } from "@/core/actions/ModeratorActions";
import { moderatorApiService } from "@/core/components/models/ModeratorService";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { call, put, takeLatest } from "redux-saga/effects";

// Worker Saga: Moderate Content
function* moderateContentSaga(action: any) {
  try {
    const contentData = action.payload;
    yield call(moderatorApiService.moderateContent, contentData); // Adjust the service method accordingly
    yield put(ModeratorActions.moderateContentSuccess());
  } catch (error) {
    yield put(
      ModeratorActions.moderateContentFailure({
        error: NOTIFICATION_MESSAGES.Moderator.MODERATE_CONTENT_ERROR,
      })
    );
  }
}

// Worker Saga: Review Project Listings
function* reviewProjectListingsSaga(action: any) {
  try {
    const listingsData = action.payload;
    yield call(moderatorApiService.reviewProjectListings, listingsData); // Adjust the service method accordingly
    yield put(ModeratorActions.reviewProjectListingsSuccess());
  } catch (error) {
    yield put(
      ModeratorActions.reviewProjectListingsFailure({
        error: NOTIFICATION_MESSAGES.Moderator.REVIEW_PROJECT_LISTINGS_ERROR,
      })
    );
  }
}

// Watcher Saga: Watches for the moderate content and review project listings actions
function* watchModeratorSaga() {
  yield takeLatest(ModeratorActions.moderateContentRequest.type, moderateContentSaga);
  yield takeLatest(ModeratorActions.reviewProjectListingsRequest.type, reviewProjectListingsSaga);
}

// Export the moderator saga
export function* moderatorSaga() {
  yield watchModeratorSaga();
}
