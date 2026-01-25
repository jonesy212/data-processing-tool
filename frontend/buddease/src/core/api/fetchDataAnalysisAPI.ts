// fetchDataAnalysisAPI.ts
dataAnalysisSagas.ts
import { DataAnalysisActions } from "@/core/actions/DataAnalysisActions";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { DataAnalysis } from "@/core/projects/DataAnalysisPhase/DataAnalysis";
import { dataAnalysisService } from "@/core/typings/phases/dataAnalysisTypes";
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { Effect, call, put, takeLatest } from "redux-saga/effects";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchDataAnalysisAPI = () => axios.get('/api/data-analysis');


function* fetchDataAnalysisSaga(): Generator<Effect, void, any> {
  try {
    yield put(DataAnalysisActions.fetchDataAnalysisRequest());
    const response: AxiosResponse<DataAnalysis[]> = yield call(fetchDataAnalysisAPI);
    yield put(DataAnalysisActions.fetchDataAnalysisSuccess({ dataAnalysis: response.data }));
  } catch (error) {
    yield put(
      DataAnalysisActions.fetchDataAnalysisFailure({
        error: NOTIFICATION_MESSAGES.DataAnalysis.FETCH_ERROR,
      })
    );
  }
}

// Implementation for fetchDataAnalysisRequestSaga
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

// Implementation for fetchDataAnalysisSuccessSaga
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

// Other sagas can be added similarly


export const dataAnalysisSagas = [

  takeLatest(DataAnalysisActions.fetchDataAnalysisRequest.type, fetchDataAnalysisSaga),
  takeLatest(DataAnalysisActions.fetchDataAnalysisRequest.type, fetchDataAnalysisRequestSaga),
  takeLatest(DataAnalysisActions.fetchDataAnalysisSuccess.type, fetchDataAnalysisSuccessSaga),
  // Add more sagas as needed for other data analysis actions
];
