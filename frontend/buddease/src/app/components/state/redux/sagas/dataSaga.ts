import { Data } from "@/app/components/models/data/Data";
import { DataActions } from "@/app/components/projects/DataAnalysisPhase/DataActions";
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, takeLatest } from "redux-saga/effects";
import {
  deleteDataFrame,
  fetchDataFrame,
  setDataFrame,
  updateDataFrame,
} from "../../../../api/DataframeApi";
import {
  addData,
  removeData,
  updateDataDescription,
  updateDataDetails,
  updateDataStatus,
  updateDataTitle,
} from "../slices/DataSlice";

const BASE_URL = "http://your-backend-url/api"; // Replace with your actual backend URL

const UpdateDataTitle = async (title: string): Promise<AxiosResponse<Data>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/data/update_title`,
      { title },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    // Handle error if needed
    throw error;
  }
};

const UpdateDataDescription = async (description: string): Promise<void> => {
  try {
    // Similar logic for other API calls
  } catch (error) {
    // Handle error if needed
    throw error;
  }
};

const UpdateDataStatus = async (
  status: "pending" | "inProgress" | "completed"
): Promise<void> => {
  try {
    // Similar logic for other API calls
  } catch (error) {
    // Handle error if needed
    throw error;
  }
};

const UpdateDataDetails = async (
  dataId: string,
  updatedDetails: Partial<any>
): Promise<void> => {
  try {
    // Similar logic for other API calls
  } catch (error) {
    // Handle error if needed
    throw error;
  }
};

const AddData = async (id: string, title: string): Promise<void> => {
  try {
    // Similar logic for other API calls
  } catch (error) {
    // Handle error if needed
    throw error;
  }
};

const RemoveData = async (dataId: string): Promise<void> => {
  try {
    // Similar logic for other API calls
  } catch (error) {
    // Handle error if needed
    throw error;
  }
};

function* handleUpdateDataTitle(
  action: ReturnType<typeof updateDataTitle>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    // Call the function to perform the API call
    yield call(UpdateDataTitle, payload);

    // Replace this with your API call using axios
    const response: AxiosResponse<Data> = yield call(() =>
      axios.post("api/data", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    yield put(
      DataActions.updateDataTitleSuccess({
        id: response.data.id as number,
        title: response.data.title as string,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

function* handleUpdateDataDescription(
  action: ReturnType<typeof updateDataDescription>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(UpdateDataDescription, payload);
  } catch (error) {
    // Handle error if needed
  }
}

function* handleUpdateDataStatus(
  action: ReturnType<typeof updateDataStatus>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(UpdateDataStatus, payload);
  } catch (error) {
    // Handle error if needed
  }
}

function* handleUpdateDataDetails(
  action: ReturnType<typeof updateDataDetails>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(UpdateDataDetails, payload.dataId, payload.updatedDetails);
  } catch (error) {
    // Handle error if needed
  }
}

function* handleAddData(
  action: ReturnType<typeof addData>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(AddData, payload.id, payload.title);
  } catch (error) {
    // Handle error if needed
  }
}

function* handleRemoveData(
  action: ReturnType<typeof removeData>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(RemoveData, payload);
  } catch (error) {
    // Handle error if needed
  }
}

const fetchDataFrameFailure = (error: any, type: any) => ({
  type: type, // Provide a valid action type here
  error: error, // Pass the error as part of the action payload
});

function* handleFetchDataFrame(): Generator<any, void, any> {
  try {
    // Call the API to fetch the data frame
    const dataFrame = yield call(fetchDataFrame);

    // Dispatch an action to store or process the fetched dataFrame if needed
    yield put(fetchDataFrameSuccess(dataFrame));
  } catch (error) {
    // Dispatch an action to handle the error
    yield put(fetchDataFrameFailure(error, "Error fetching data frame"));
  }
}

function* handleSetDataFrame(action: any): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(setDataFrame, payload);
    // Dispatch an action to indicate success if needed
  } catch (error) {
    // Handle error if needed
  }
}

const fetchDataFrameSuccess = (dataFrame: any) => ({
  type: "FETCH_DATA_FRAME_SUCCESS",
  payload: dataFrame,
});

// Similar functions for update and delete operations
function* handleUpdateDataFrame(action: any): Generator<Effect, void, any> {
  try {
    const { payload } = action;

    // Dispatch an action to indicate success if needed
    yield call(updateDataFrame, payload);
  } catch (error) {
    // Handle error if needed
  }
}

function* handleDeleteDataFrame(): Generator<Effect, void, any> {
  try {
    yield call(deleteDataFrame);
    // Dispatch an action to indicate success if needed
  } catch (error) {
    // Handle error if needed
  }
}

function* watchDataActions() {
  yield takeLatest(DataActions.updateDataTitle.type, handleUpdateDataTitle);
  yield takeLatest(
    DataActions.updateDataDescription.type,
    handleUpdateDataDescription
  );
  yield takeLatest(DataActions.updateDataStatus.type, handleUpdateDataStatus);
  yield takeLatest(DataActions.updateDataDetails.type, handleUpdateDataDetails);
  yield takeLatest(DataActions.addData.type, handleAddData);
  yield takeLatest(DataActions.removeData.type, handleRemoveData);

  // Add watchers for DataFrame actions
  yield takeLatest(DataActions.updateDataFrame.type, handleUpdateDataFrame);
  yield takeLatest(DataActions.deleteDataFrame.type, handleDeleteDataFrame);
  yield takeLatest(DataActions.updateDataTitle.type, handleUpdateDataTitle);
  yield takeLatest(
    DataActions.updateDataDescription.type,
    handleUpdateDataDescription
  );
  yield takeLatest(DataActions.updateDataStatus.type, handleUpdateDataStatus);
  yield takeLatest(DataActions.updateDataDetails.type, handleUpdateDataDetails);
  yield takeLatest(DataActions.addData.type, handleAddData);
  yield takeLatest(DataActions.removeData.type, handleRemoveData);
  yield takeLatest(DataActions.fetchDataFrame.type, handleFetchDataFrame);
  yield takeLatest(DataActions.setDataFrame.type, handleSetDataFrame);
}

export function* dataSagas() {
  yield watchDataActions();
}
