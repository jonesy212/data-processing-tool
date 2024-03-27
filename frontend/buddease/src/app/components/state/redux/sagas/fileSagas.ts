// fileSagas.ts
import axios, { AxiosResponse } from 'axios';
import { Effect, call, put, takeLatest } from 'redux-saga/effects';
import { Data } from '@/app/components/models/data/Data';
import { deleteDataFrame, fetchDataFrame, setDataFrame, updateDataFrame } from '../../../../api/DataframeApi';
import { addData, removeData, updateDataDescription, updateDataDetails, updateDataStatus, updateDataTitle, fetchDataSuccess } from '../slices/DataSlice';
import { handleError } from '../../utils/errorHandling';
import { useNotification } from '../../hooks/useNotification';
import { endpoints } from '@/app/api/ApiEndpoints';
import  headersConfig  from '@/app/api/headers/HeadersConfig';
import { DataFrameActions } from '@/app/components/actions/DataFrameActions';
import { DataActions } from '@/app/components/projects/DataAnalysisPhase/DataActions';
import { FileActions } from '@/app/components/actions/FileActions';


const fileSagasConfig = {
  BASE_URL: endpoints.BASE_API_URL, // Replace with your actual backend URL
  headersConfig, // Import or define your headers configuration
};


const UpdateDataTitle = async (title: string): Promise<AxiosResponse<Data>> => {
  try {
    const response = await axios.post(
      `${fileSagasConfig.BASE_URL}/data/update_title`,
      { title },
      {
        headers: fileSagasConfig.headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};



function* fetchNewFileData(
  action: ReturnType<typeof fetchDataFrame>
): Generator<any, void, any> {
  try {
    const response = yield call(fetchDataFrame, action);
    const data = response.data;

    // Dispatch success action
    yield put(fetchDataFrameSuccess(data));
  } catch (error) {
    yield call(handleError, error);
  }
}

// Similarly implement other update functions

function* handleUpdateDataTitle(
  action: ReturnType<typeof updateDataTitle>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    // Example usage of dotProp (replace with your actual logic)
    const data = {
      title: "New Title",
    };

    // Dispatch success action
    yield put(FileActions.updateFile({ id:0, newTitle: data.title })); // Use FileActions here
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleFetchFilesRequest(): Generator<any, void, any> {
  try {
    const files = yield call(FileActions); // Call your API to fetch files
    yield put(FileActions.fetchFilesSuccess(files)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleUploadFileRequest(): Generator<any, void, any> {
  try {
    const file = yield call(FileActions.uploadFile); // Call your API to upload file
    yield put(FileActions.uploadFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleBatchRemoveFilesRequest(): Generator<any, void, any> { 
  try {
    const files = yield call(FileActions.batchRemoveFiles); // Call your API to remove files
    yield put(FileActions.batchRemoveFilesSuccess(files)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleStartCollaborativeEdit(
  action: ReturnType<typeof FileActions.startCollaborativeEdit>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.startCollaborativeEdit, payload); // Call your API to start collaborative edit
    yield put(FileActions.startCollaborativeEditSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
    // Use handleError utility function
    FileActions.startCollaborativeEditSuccess
  }
}

function* handleStopCollaborativeEdit(
  action: ReturnType<typeof FileActions.stopCollaborativeEdit>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.stopCollaborativeEdit, payload); // Call your API to stop collaborative edit
    yield put(FileActions.stopCollaborativeEditSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}


function* handleCreateFileVersion(
  action: ReturnType<typeof FileActions.createFileVersion>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.createFileVersion, payload); // Call your API to create file version
    yield put(FileActions.createFileVersionSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error);
    // Use handleError utility function
    FileActions.createFileVersionSuccess
  }
}


function* handleFetchFileVersions(): Generator<any, void, any> {
  try {
    const fileVersions = yield call(FileActions.fetchFileVersions); // Call your API to fetch file versions
    yield put(FileActions.fetchFileVersionsSuccess(fileVersions)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
    // Use handleError utility function
    FileActions.fetchFileVersionsSuccess
  }
}


function* handleShareFile(
  action: ReturnType<typeof FileActions.shareFile>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.shareFile, payload); // Call your API to share file
    yield put(FileActions.shareFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleRequestAccessToFile(
  action: ReturnType<typeof FileActions.requestAccessToFile>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(FileActions.requestAccessToFile, action); // Call your API to request access to file
    const file = yield call(FileActions.requestAccessToFile, payload); // Call your API to request access to file
    yield put(FileActions.requestAccessToFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleReceiveFileUpdate(
  action: ReturnType<typeof FileActions.receiveFileUpdate>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.receiveFileUpdate, payload); // Call your API to receive file update
    yield put(FileActions.receiveFileUpdateSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}



function* handleExportFile(
  action: ReturnType<typeof FileActions.exportFile>
): Generator<any, void, any> { 
  try {
    const { payload } = action;
    const file = yield call(FileActions.exportFile, payload); // Call your API to export file
    yield put(FileActions.exportFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleArchiveFile( 
  action: ReturnType<typeof FileActions.archiveFile>
): Generator<any, void, any> {
  console.log(
    "handleArchiveFile",
    action.payload
)
  try {
    const { payload } = action;
    const file = yield call(FileActions.archiveFile, payload); // Call your API to archive file
    yield put(FileActions.archiveFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}



function* handleDetermineFileType(
  action: ReturnType<typeof FileActions.determineFileType>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.determineFileType, payload); // Call your API to determine file type
    yield put(FileActions.determineFileTypeSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleImportFile(
  action: ReturnType<typeof FileActions.importFile>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(FileActions.importFile, payload); // Call your API to import file
    yield put(FileActions.importFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
  
}

fun




















  
function* handleMarkFileAsCompleteRequest(): Generator<any, void, any> {
  try {
    const file = yield call(FileActions.markFileAsComplete); // Call your API to mark file as complete
    yield put(FileActions.markFileAsCompleteSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

    function* handleRemoveFileRequest(
  action: ReturnType<typeof FileActions.removeFile>
): Generator<any, void, any> {
  try {
    const file = yield call(FileActions.removeFile); // Call your API to remove file
    yield put(FileActions.removeFileSuccess(file)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

function* handleFetchDataFrame(): Generator<any, void, any> {
  try {
    const dataFrame = yield call(fetchDataFrame); // Call your API to fetch data frame
    yield put(DataFrameActions.fetchDataFrameSuccess(dataFrame)); // Dispatch success action
  } catch (error) {
    yield call(handleError, error); // Handle errors using handleError utility function
  }
}

// Add additional sagas for DataFrame actions
function* fileSagas() {
  // File actions
  yield takeLatest(FileActions.updateFile.type, handleUpdateDataTitle);
  yield takeLatest(FileActions.fetchFilesRequest.type, handleFetchFilesRequest);
  yield takeLatest(FileActions.uploadFileRequest.type, handleUploadFileRequest);
  yield takeLatest(FileActions.batchRemoveFilesRequest.type, handleBatchRemoveFilesRequest);
  yield takeLatest(FileActions.markFileAsCompleteRequest.type, handleMarkFileAsCompleteRequest);
  yield takeLatest(FileActions.startCollaborativeEdit.type, handleStartCollaborativeEdit);
  yield takeLatest(FileActions.createFileVersion.type, handleCreateFileVersion);
  yield takeLatest(FileActions.fetchFileVersions.type, handleFetchFileVersions);
  yield takeLatest(FileActions.shareFile.type, handleShareFile);
  yield takeLatest(FileActions.requestAccessToFile.type, handleRequestAccessToFile);
  yield takeLatest(FileActions.receiveFileUpdate.type, handleReceiveFileUpdate);
  yield takeLatest(FileActions.exportFile.type, handleExportFile);
  yield takeLatest(FileActions.archiveFile.type, handleArchiveFile);
  yield takeLatest(FileActions.determineFileType.type, handleDetermineFileType);

  // DataFrame actions
  yield takeLatest(DataActions.updateDataFrame.type, handleUpdateDataFrame);
  yield takeLatest(DataActions.deleteDataFrame.type, handleDeleteDataFrame);
  yield takeLatest(DataActions.updateDataTitle.type, handleUpdateDataTitle);
  yield takeLatest(DataActions.updateDataDescription.type, handleUpdateDataDescription);
  yield takeLatest(DataActions.updateDataStatus.type, handleUpdateDataStatus);
  yield takeLatest(DataActions.updateDataDetails.type, handleUpdateDataDetails);
  yield takeLatest(DataActions.addData.type, handleAddData);
  yield takeLatest(DataActions.removeData.type, handleRemoveData);
  yield takeLatest(DataActions.fetchDataFrame.type, handleFetchDataFrame);
  yield takeLatest(DataActions.setDataFrame.type, handleSetDataFrame);
}

export default fileSagas;
