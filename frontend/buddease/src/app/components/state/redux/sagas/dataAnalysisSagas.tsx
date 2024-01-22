// dataAnalysisSagas.ts
import DataFrameAPI from "@/app/api/DataframeApi";
import { DataAnalysis } from "@/app/components/projects/DataAnalysisPhase/DataAnalysis";
import { DataAnalysisActions } from "@/app/components/projects/DataAnalysisPhase/DataAnalysisActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { dataAnalysisService } from "@/app/components/typings/dataAnalysisTypes";
import { AxiosResponse } from "axios";
import { Effect, call, put, takeLatest } from "redux-saga/effects";

function* fetchDataAnalysisSaga(): Generator<Effect, void, any> {
  try {
    yield put(DataAnalysisActions.fetchDataAnalysisRequest());
    const response: AxiosResponse<any> = yield call(DataFrameAPI.fetchDataFromBackend);
    yield put(DataAnalysisActions.fetchDataAnalysisSuccess({ dataAnalysis: response.data }));
  } catch (error) {
    yield put(
      DataAnalysisActions.fetchDataAnalysisFailure({
        error: NOTIFICATION_MESSAGES.DataAnalysis.FETCH_ERROR,
      })
    );
  }
}

function* fetchDataAnalysisRequestSaga(): Generator<Effect, void, any> {
  try {
    yield put(DataAnalysisActions.fetchDataAnalysisRequest());

    // Use data analysis service to fetch data analysis results
    const dataAnalysisResults: DataAnalysis[] = yield call(dataAnalysisService.fetchDataAnalysis);

    yield put(DataAnalysisActions.fetchDataAnalysisSuccess({ dataAnalysis: dataAnalysisResults }));
  } catch (error) {
    yield put(DataAnalysisActions.fetchDataAnalysisFailure({ error: String(error) }));
  }
}

function* fetchDataAnalysisSuccessSaga(
  action: ReturnType<typeof DataAnalysisActions.fetchDataAnalysisSuccess>
): Generator<Effect, void, any> {
  try {
    // Implement the logic to handle the fetchDataAnalysisSuccess action
    const { dataAnalysis } = action.payload;

    // For example, you might want to update the state with the fetched data analysis results
    yield put({
      type: 'UPDATE_DATA_ANALYSIS_ACTION_TYPE', // Replace with your actual action type for updating data analysis results
      payload: { dataAnalysis },
    });

    // For now, let's just log the success
    console.log('Fetch Data Analysis Success:', dataAnalysis);
  } catch (error) {
    // Handle errors if necessary
    console.error('Error in fetchDataAnalysisSuccessSaga:', error);
  }
}

export function* watchDataAnalysisSagas() {
  yield takeLatest(DataAnalysisActions.fetchDataAnalysisRequest.type, fetchDataAnalysisSaga);
  yield takeLatest(DataAnalysisActions.fetchDataAnalysisRequest.type, fetchDataAnalysisRequestSaga);
  yield takeLatest(DataAnalysisActions.fetchDataAnalysisSuccess.type, fetchDataAnalysisSuccessSaga);
  // Add more sagas as needed for other data analysis actions
}

export function* dataAnalysisSagas() {
  yield watchDataAnalysisSagas();
}