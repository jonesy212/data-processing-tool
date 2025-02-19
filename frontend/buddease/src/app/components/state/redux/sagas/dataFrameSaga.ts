// dataFrameSaga.ts
import DataFrameAPI from "@/app/api/DataframeApi";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  DataFrameResponse,
  addDataFrame,
  fetchDataFrameFailure,
  fetchDataFrameRequest,
  fetchDataFrameSuccess,
  removeDataFrame,
} from "../slices/DataFrameSlice";

// Worker Saga: Fetch DataFrame
function* fetchDataFrameSaga() {
  try {
    const dataFrames: DataFrameResponse[][] = yield call(
      DataFrameAPI.fetchDataFrames // Adjust the service method accordingly
    );
    yield put(fetchDataFrameSuccess({ dataFrames }));
  } catch (error) {
    yield put(
      fetchDataFrameFailure({ error: "Failed to fetch data frames" }) // Provide an appropriate error message
    );
  }
}

// Worker Saga: Add DataFrame
function* addDataFrameSaga(action: { payload: { id: string; title: string } }) {
  try {
    const { id, title } = action.payload;
    // Call the service method to add the data frame (if applicable)
    // DataFrameAPI.addDataFrame({ id, title });
    // Alternatively, dispatch an action to update the state with the new data frame
    yield put(addDataFrame({ id, title }));
  } catch (error) {
    // Handle error
    console.error("Error adding data frame:", error);
  }
}

// Worker Saga: Remove DataFrame
function* removeDataFrameSaga(action: { payload: string }) {
  try {
    const dataFrameId = action.payload;
    // Call the service method to remove the data frame (if applicable)
    // DataFrameAPI.removeDataFrame(dataFrameId);
    // Alternatively, dispatch an action to update the state by removing the data frame
    yield put(removeDataFrame(dataFrameId));
  } catch (error) {
    // Handle error
    console.error("Error removing data frame:", error);
  }
}

// Watcher Saga: Watches for fetch, add, and remove data frame actions
export function* watchDataFrameSagas() {
  yield takeLatest(fetchDataFrameRequest.type, fetchDataFrameSaga);
  yield takeLatest(addDataFrame.type, addDataFrameSaga);
  yield takeLatest(removeDataFrame.type, removeDataFrameSaga);
}
