// fileSagas.ts
import { endpoints } from '@/app/api/ApiEndpoints';
// import { archiveFile, batchRemoveFiles, createFileVersion, determineFileType, exportFile, fetchFileVersions, fetchFiles, importFile, markFileAsComplete, receiveFileUpdate, requestAccessToFile, shareFile, startCollaborativeEdit, uploadFile } from '@/app/api/ApiFiles';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { DataFrameActions } from '@/app/components/actions/DataFrameActions';
import { FileActions } from '@/app/components/actions/FileActions';
import useErrorHandling from '@/app/components/hooks/useErrorHandling';
import { Data } from '@/app/components/models/data/Data';
import { DataActions } from '@/app/components/projects/DataAnalysisPhase/DataActions';
import axios, { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchDataFrame, removeFile, updateDataFrame } from '../../../../api/DataframeApi';
import { fetchDataFrameSuccess } from '../slices/DataFrameSlice';
import { updateDataTitle } from '../slices/DataSlice';
const { handleError } = useErrorHandling();

import { default as archiveFile, default as batchRemoveFiles, default as createFileVersion, default as determineFileType, default as exportFile, default as fetchFiles, default as fetchFileVersions, default as importFile, default as markFileAsComplete, default as receiveFileUpdate, default as requestAccessToFile, default as shareFile, default as startCollaborativeEdit, default as uploadFile } from '@/app/api/ApiFiles';


// Import other unused imports

// Define the fileSagasConfig object
const fileSagasConfig = {
  BASE_URL: endpoints.BASE_API_URL,
  headersConfig,
};

// Define UpdateDataTitle function
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

// Define fetchNewFileData saga
function* fetchNewFileData(
  action: ReturnType<typeof fetchDataFrame>
): Generator<any, void, any> {
  try {
    const data = yield call(fetchDataFrame);
    yield put(fetchDataFrameSuccess(data));
  } catch (error: any) {
    const errorMessage = " Error fetching new file data";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}

// Define handleUpdateDataTitle saga
function* handleUpdateDataTitle(action: ReturnType<typeof updateDataTitle>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const data = {
      title: "New Title",
    };
    yield put(FileActions.updateFile({ id: 0, newTitle: data.title }));
  } catch (error: any) {
    const errorMessage = "Error updating data title";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}

// Define handleFetchFilesRequest saga
function* handleFetchFilesRequest(): Generator<any, void, any> {
  try {
    const files = yield call(fetchFiles);
    yield put(FileActions.fetchFilesSuccess(files));
  } catch (error: any) {
    const errorMessage = "Error fetching files";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleUploadFileRequest saga
function* handleUploadFileRequest(): Generator<any, void, any> {
  try {
    const file = yield call(uploadFile);
    yield put(FileActions.uploadFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error uploading file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleBatchRemoveFilesRequest saga
function* handleBatchRemoveFilesRequest(): Generator<any, void, any> {
  try {
    const files = yield call(batchRemoveFiles);
    yield put(FileActions.batchRemoveFilesSuccess(files));
  } catch (error: any) {
    const errorMessage = "Error removing files";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleMarkFileAsCompleteRequest saga
function* handleMarkFileAsCompleteRequest(): Generator<any, void, any> {
  try {
    const file = yield call(markFileAsComplete);
    yield put(FileActions.markFileAsCompleteSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error marking file as complete";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}




// Define handleStartCollaborativeEdit saga
function* handleStartCollaborativeEdit(action: ReturnType<typeof FileActions.startCollaborativeEdit>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(startCollaborativeEdit, payload);
    yield put(FileActions.startCollaborativeEditSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error starting collaborative edit";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleCreateFileVersion saga
function* handleCreateFileVersion(action: ReturnType<typeof FileActions.createFileVersion>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(createFileVersion, payload);
    yield put(FileActions.createFileVersionSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error creating file version";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleFetchFileVersions saga
function* handleFetchFileVersions(): Generator<any, void, any> {
  try {
    const fileVersions = yield call(fetchFileVersions);
    yield put(FileActions.fetchFileVersionsSuccess(fileVersions));
  } catch (error) {
    const errorMessage = "Error fetching access to file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}

// Define handleShareFile saga
function* handleShareFile(action: ReturnType<typeof FileActions.shareFile>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(shareFile, payload);
    yield put(FileActions.shareFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error sharing file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleRequestAccessToFile saga
function* handleRequestAccessToFile(action: ReturnType<typeof FileActions.requestAccessToFile>): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(requestAccessToFile, action);
    const file = yield call(requestAccessToFile, payload);
    yield put(FileActions.requestAccessToFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error requesting access to file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleReceiveFileUpdate saga
function* handleReceiveFileUpdate(action: ReturnType<typeof FileActions.receiveFileUpdate>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(receiveFileUpdate, payload);
    yield put(FileActions.receiveFileUpdateSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error receiving file update";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleExportFile saga
function* handleExportFile(action: ReturnType<typeof FileActions.exportFile>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(exportFile, payload);
    yield put(FileActions.exportFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error exporting file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleArchiveFile saga
function* handleArchiveFile(action: ReturnType<typeof FileActions.archiveFile>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(archiveFile, payload);
    yield put(FileActions.archiveFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error archiving file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleDetermineFileType saga
function* handleDetermineFileType(action: ReturnType<typeof FileActions.determineFileType>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(determineFileType, payload);
    yield put(FileActions.determineFileTypeSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error determining file type";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleImportFile saga
function* handleImportFile(action: ReturnType<typeof FileActions.importFile>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const file = yield call(importFile, payload);
    yield put(FileActions.importFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error importing file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


// Define handleRemoveFileRequest saga
function* handleRemoveFileRequest(action: ReturnType<typeof FileActions.removeFile>): Generator<any, void, any> {
  try {
    const file = yield call(removeFile, action.payload);
    yield put(FileActions.removeFileSuccess(file));
  } catch (error: any) {
    const errorMessage = "Error removing file";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}


function* handleUpdateDataFrame(action: ReturnType<typeof DataFrameActions.updateDataFrame>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const dataFrame = yield call(updateDataFrame, payload);
    yield put(DataFrameActions.updateDataFrameSuccess(dataFrame));
  } catch (error: any) {
    const errorMessage = "Error updating data frame";
    yield handleError(errorMessage, { componentStack: error.stack });
  }
}

function handleDeleteDataFrame


// Define handleFetchDataFrame saga
function* handleFetchDataFrame(): Generator<any, void, any> {
  try {
    const dataFrame = yield call(fetchDataFrame);
    yield put(DataFrameActions.fetchDataFrameSuccess(dataFrame));
  } catch (error: any) {
    const errorMessage = "Error fetching data frame";
    yield handleError(errorMessage, { componentStack: error.stack });
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
  yield takeLatest(FileActions.importFile.type, handleImportFile);
  yield takeLatest(FileActions.removeFile.type, handleRemoveFileRequest);
  yield takeLatest(DataActions().updateDataFrame.type, handleUpdateDataFrame);
  yield takeLatest(DataActions().deleteDataFrame.type, handleDeleteDataFrame);
  yield takeLatest(DataActions().updateDataTitle.type, handleUpdateDataTitle);
  yield takeLatest(DataActions().updateDataDescription.type, handleUpdateDataDescription);
  yield takeLatest(DataActions().updateDataStatus.type, handleUpdateDataStatus);
  yield takeLatest(DataActions().updateDataDetails.type, handleUpdateDataDetails);
  yield takeLatest(DataActions().addData.type, handleAddData);
  yield takeLatest(DataActions().removeData.type, handleRemoveData);
  yield takeLatest(DataActions().fetchDataFrame.type, handleFetchDataFrame);
  yield takeLatest(DataActions().setDataFrame.type, handleSetDataFrame);
}

export default fileSagas;