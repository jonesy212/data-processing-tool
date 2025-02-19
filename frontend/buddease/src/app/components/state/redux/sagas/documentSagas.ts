// documentSagas.ts
import headersConfig from "@/app/api/headers/HeadersConfig";
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { DocumentStatus } from "@/app/components/documents/types";
import { DocumentActions } from "@/app/tokens/DocumentActions";
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, takeLatest } from "redux-saga/effects";

const BASE_URL = "http://your-backend-url/api"; // Replace with your actual backend URL

const updateDocumentTitle = async (
  title: string
): Promise<AxiosResponse<DocumentData>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/documents/update_title`,
      { title },
      {
        headers: headersConfig, // Use headersConfig for authorization
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

function* handleUpdateDocumentTitle(
  action: ReturnType<typeof DocumentActions.updateDocumentTitle>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(updateDocumentTitle, payload.title); // Pass payload.title instead of payload
    yield put(
      DocumentActions.updateDocumentTitleSuccess({
        id: payload.id,
        title: payload.title,
      })
    );

    const response: AxiosResponse<DocumentData> = yield call(() =>
      axios.post(`${BASE_URL}/documents`, payload, {
        headers: headersConfig, // Use headersConfig for authorization
      })
    );
      response.data;

    // Additional code here...
  } catch (error) {
      // Handle error if needed
      yield put(DocumentActions.updateDocumentTitleFailure({error: "Was not abe to update title, please try again."}));
    // Handle error if needed
  }
}

const deleteDocument = async (
  id: number
): Promise<AxiosResponse<DocumentData>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/documents/delete`,
      { id },
      {
        headers: headersConfig, // Use headersConfig for authorization
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addDocument = async (
  id: number,
  title: string
): Promise<AxiosResponse<DocumentData>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/documents/add`,
      { id, title },
      {
        headers: headersConfig, // Use headersConfig for authorization
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

const dataAnalysis = async (payload: {
  id: number;
  status: string;
}): Promise<AxiosResponse<DocumentData>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/documents/analysis`,
      payload,
      {
        headers: headersConfig, // Use headersConfig for authorization
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

function* handleDeleteDocument(
  action: ReturnType<typeof DocumentActions.deleteDocument>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield call(deleteDocument, payload);
  } catch (error) {
    // Handle error if needed
  }
}

function* handleUpdateDocumentDetails(
  action: ReturnType<typeof DocumentActions.updateDocumentDetails>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    if (payload && payload.title) {
      const response: AxiosResponse<DocumentData> = yield call(
        { context: null, fn: updateDocumentTitle },
        payload.title
      );
      yield put(
        DocumentActions.updateDocumentTitleSuccess({
          id: response.data.id as number,
          title: response.data.title,
        })
      );
    }
  } catch (error) {
    // Handle error if needed
  }
}

function* handleFetchDocuments(
  action: ReturnType<typeof DocumentActions.fetchDocumentsRequest>
): Generator<any, void, AxiosResponse<DocumentData[]>> {
  try {
    const { payload } = action;
    const response: AxiosResponse<DocumentData[]> = yield call(() =>
      axios.post("api/documents", payload, {
        headers: headersConfig, // Use headersConfig for authorization
      })
    );
    yield put(
      DocumentActions.fetchDocumentsSuccess({
        documents: response.data,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

function* handleSelectDocument(
  action: ReturnType<typeof DocumentActions.selectDocument>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield put(
      DocumentActions.selectDocumentSuccess({
        id: payload,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

function* handleCommunication(
  action: ReturnType<typeof DocumentActions.communication>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield put(
      DocumentActions.communicationSuccess({
        id: payload.id,
        status: "" as DocumentStatus,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

function* handleCollaboration(
  action: ReturnType<typeof DocumentActions.collaboration>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    yield put(
      DocumentActions.collaborationSuccess({
        id: payload.id,
        userId: payload.userId,
        status: "" as DocumentStatus,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

function* handleProjectManagement(
  action: ReturnType<typeof DocumentActions.projectManagement>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    const response = yield call(dataAnalysis, payload);
    yield put(
      DocumentActions.projectManagementSuccess({
        id: payload.id,
        status: "" as DocumentStatus,
      })
    );
    // Dispatch the success action with the provided payload
    yield put(
      DocumentActions.fetchDocumentsRequest({
        id: payload.id,
        status: payload.status, // Use payload status directly
      })
    );
    // Dispatch the success action with the provided payload
    yield put(
      DocumentActions.fetchDocumentsSuccess({
        documents: response.data,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

function* handleDataAnalysis(
  action: ReturnType<typeof DocumentActions.dataAnalysis>
): Generator<any, void, any> {
  try {
    const { payload } = action;
    const response: AxiosResponse<DocumentData> = yield call(
      dataAnalysis,
      payload
    );

    // Dispatch the success action with the provided payload
    yield put(
      DocumentActions.dataAnalysisSuccess({
        id: payload.id,
        status: payload.status, // Use payload status directly
      })
    );
    // Dispatch the success action with the provided payload
    yield put(
      DocumentActions.fetchDocumentsRequest({
        id: payload.id,
        status: payload.status, // Use payload status directly
      })
    );

    // Dispatch the success action with the provided payload
    yield put(DocumentActions.selectDocument(response.data.id));
  } catch (error) {
    // Handle error if needed
  }
}

function* handleAddDocument(
  action: ReturnType<typeof DocumentActions.addDocument>
): Generator<Effect, void, any> {
  try {
    const { payload } = action;
    const response: AxiosResponse<DocumentData> = yield call(
      { context: null, fn: addDocument },
      payload.id,
      payload.title
    );
    yield put(
      DocumentActions.addDocumentSuccess({
        id: response.data.id as number,
        title: response.data.title,
      })
    );
  } catch (error) {
    // Handle error if needed
  }
}

// Define other document-related sagas similarly

function* watchDocumentActions() {
  yield takeLatest(
    DocumentActions.updateDocumentTitle.type,
    handleUpdateDocumentTitle
  );
  yield takeLatest(DocumentActions.deleteDocument.type, handleDeleteDocument);

  yield takeLatest(DocumentActions.addDocument.type, handleAddDocument);
  yield takeLatest(
    DocumentActions.updateDocumentDetails.type,
    handleUpdateDocumentDetails
  );
  yield takeLatest(
    DocumentActions.fetchDocumentsRequest.type,
    handleFetchDocuments
  );
  yield takeLatest(DocumentActions.selectDocument.type, handleSelectDocument);
  yield takeLatest(DocumentActions.communication.type, handleCommunication); // Example: Action for communication
  yield takeLatest(DocumentActions.collaboration.type, handleCollaboration); // Example: Action for collaboration
  yield takeLatest(
    DocumentActions.projectManagement.type,
    handleProjectManagement
  ); // Example: Action for project management
  yield takeLatest(DocumentActions.dataAnalysis.type, handleDataAnalysis); // Example: Action for data analysis
  // Add more watchers for other document actions here
}

export function* documentSagas() {
  yield watchDocumentActions();
}
