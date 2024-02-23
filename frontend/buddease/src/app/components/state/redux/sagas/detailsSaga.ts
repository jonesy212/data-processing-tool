// detailsSaga.ts
import { Data } from "@/app/components/models/data/Data";
import { detailsApiService } from "@/app/components/models/data/DetailsService";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { call, put, takeLatest } from "redux-saga/effects";
import { DetailsItem } from "../../stores/DetailsListStore";
import { DetailsListActions } from "../actions/DetailsListActions";

// Worker Saga: Fetch DetailsItem
function* fetchDetailsItemSaga(action: any) {
  try {
    const detailsItemId = action.payload;
    const detailsItem: DetailsItem<Data> = yield call(detailsApiService.fetchDetailsItem, detailsItemId); // Adjust the service method accordingly
    yield put(DetailsListActions.fetchDetailsItemSuccess({ detailsItem }));
  } catch (error) {
    yield put(
      DetailsListActions.fetchDetailsItemFailure({
        error: NOTIFICATION_MESSAGES.Details.FETCH_DETAILS_ITEM_ERROR,
      })
    );
  }
}

// Worker Saga: Update DetailsItem
function* updateDetailsItemSaga(action: any) {
  try {
    const { detailsItemId, detailsItemData } = action.payload;
    const updatedDetailsItem: DetailsItem<Data> = yield call(
      detailsApiService.updateDetailsItem,
      detailsItemId,
      detailsItemData
    ); // Adjust the service method accordingly
    yield put(DetailsListActions.updateDetailsItemSuccess({ detailsItemId,detailsItem: updatedDetailsItem }));
  } catch (error) {
    yield put(
      DetailsListActions.updateDetailsItemFailure({
        error: NOTIFICATION_MESSAGES.Details.UPDATE_DETAILS_ITEM_ERROR,
      })
    );
  }
}


// Worker Saga: Update DetailsItems
function* updateDetailsItemsSaga(action: { type: string, payload: { updatedDetailsItemsData: any } }): Generator<any, void, DetailsItem<Data>[]> {
  try {
    const { updatedDetailsItemsData } = action.payload;
    const response: DetailsItem<Data>[] = yield call(detailsApiService.updateDetailsItems, updatedDetailsItemsData);
    yield put(DetailsListActions.updateDetailsItemsSuccess({ detailsItems: response }));
  } catch (error) {
    // Handle error
    console.error("Error updating details items:", error);

    // You might want to dispatch a failure action to update the state or show a notification
    yield put(
      DetailsListActions.updateDetailsItemsFailure({ error: "Failed to update details items" })
    );
  }
}

// Worker Saga: Handle Update DetailsItem Failure
function* updateDetailsItemFailureSaga(action: any): Generator {
  try {
    // handle failure
    const error = action.payload.error;

    // You might want to dispatch a failure action to update the state or show a notification
    yield put({
      type: "SHOW_NOTIFICATION", // Replace with a valid action type for notifications
      payload: {
        message: `Error updating details item: ${error}`,
        type: "error",
      },
    });
  } catch (error) {
    console.error("Failed to handle update details item failure", error);
  }
}

// Watcher Saga: Watches for the fetch and update details item actions
function* watchDetailsSagas() {
  yield takeLatest(DetailsListActions.fetchDetailsItemRequest.type, fetchDetailsItemSaga);
  yield takeLatest(DetailsListActions.updateDetailsItemRequest.type, updateDetailsItemSaga);
  yield takeLatest(DetailsListActions.updateDetailsItemFailure.type, updateDetailsItemFailureSaga);
  yield takeLatest(DetailsListActions.updateDetailsItemsRequest.type, updateDetailsItemsSaga);
}

// Export the details saga
export function* detailsSagas() {
  yield watchDetailsSagas();
}
