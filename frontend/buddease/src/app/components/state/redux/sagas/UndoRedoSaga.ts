// UndoRedoSagas.ts
import { showErrorMessage, showToast } from "@/app/components/models/display/ShowToast";
import { PayloadAction } from "@reduxjs/toolkit";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { addToHistory, redo, undo } from "../slices/UndoRedoSlice";

// Import the Message type from your application
import { UndoRedoActions } from "@/app/components/actions/UndoRedoActions";
import { authToken } from "@/app/components/auth/authToken";
import Logger from "@/app/components/logging/Logger";
import userService from "@/app/components/users/ApiUser";
import { useSecureUserId } from "@/app/components/utils/useSecureUserId";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Partial } from "react-spring";
import { RootState } from "../slices/RootSlice";


// Define the HistoryItem interface
interface HistoryItem {
  id: string; // Unique identifier for the history item
  timestamp: number; // Timestamp indicating when the history item was created
  action: string; // Description of the action performed
  // Add more properties as needed
}

// BranchingHistoryPayload.ts
export interface BranchingHistoryPayload {
  branchName: string; // Name of the branch
  startPoint: string; // ID of the history item where the branching starts
}



// Action Types
const REDO_REQUEST = 'REDO_REQUEST';
const REDO_SUCCESS = 'REDO_SUCCESS';
const REDO_FAILURE = 'REDO_FAILURE';
const LIMIT_HISTORY_SIZE_REQUEST = 'LIMIT_HISTORY_SIZE_REQUEST';
const LIMIT_HISTORY_SIZE_SUCCESS = 'LIMIT_HISTORY_SIZE_SUCCESS';
const LIMIT_HISTORY_SIZE_FAILURE = 'LIMIT_HISTORY_SIZE_FAILURE';


// Action Creators
export const redoRequest = () => ({ type: REDO_REQUEST });
export const redoSuccess = () => ({ type: REDO_SUCCESS });
export const redoFailure = (error: any) => ({ type: REDO_FAILURE, payload: error });

export const selectHistory = (state: RootState): HistoryItem[] => state.historyManager.history;


export function* select<T>(
  selector: (state: RootState) => T
): Generator<any, void, unknown> {
  yield select(selector);
}


async function handleUndoRedo(action: PayloadAction<any>): Promise<void> {
  const userId = useSecureUserId()
  const user = await userService.fetchUser(String(userId), authToken);
  try {
      const { payload } = action;

      const generateMessageId: string = UniqueIDGenerator.generateMessageID();
      const message: Partial<Message> = {
          id: generateMessageId,
          content: "Undo action completed successfully"
      };

      // Perform undo or redo based on the payload
      if (payload === "undo") {
          // Dispatch action to add to history
           put(addToHistory(message));
          // Dispatch action to perform undo
           put(undo(0));
          // Show a toast message indicating successful undo action
          if (message.id) {
              await showToast(message as Message);
          } else {
              console.error("Message ID is undefined");
          }
          // Log the undo action
          Logger.logUserActivity("Undo", String(userId)); // Assuming you have the userId available

      } else if (payload === "redo") {
          // Dispatch action to add to history
          await put(addToHistory(message));
          // Dispatch action to perform redo
          await put(redo(0));
          // Show a toast message indicating successful redo action
          if (message.id) {
              await showToast(message as Message);
          } else {
              console.error("Message ID is undefined");
          }
          // Log the redo action
          Logger.logUserActivity("Redo", String(userId)); // Assuming you have the userId available

      } else {
          // If the payload is neither "undo" nor "redo", show an error message
          await call(showErrorMessage, "Invalid action provided");
      }
  } catch (error: any) {
      // Show an error message using the showErrorMessage function
      await call(showErrorMessage, `An error occurred: ${error.message}`);
  }
}


// Handle the undo action
function* handleUndo(_action: PayloadAction<void>): Generator {
  try {
    yield put(UndoRedoActions.undo());
  } catch (error) {
    console.error("Failed to perform undo operation", error);
  }
}


// Handle the clear history action
export function* handleClearHistory() {
  try {
    // Dispatch an action to initiate the clear history operation
    yield put({ type: "CLEAR_HISTORY_REQUEST" }); // Assuming you have an action type for initiating the clear history operation

    // Call the worker saga to perform the clear history operation
    yield call(performClearHistoryOperation); // Assuming you have a worker saga named performClearHistoryOperation

    // Dispatch an action to indicate successful completion of the clear history operation
    yield put({ type: "CLEAR_HISTORY_SUCCESS" }); // Assuming you have an action type for indicating success
  } catch (error: any) {
    // Dispatch an action to indicate failure in clearing the history
    yield put({ type: "CLEAR_HISTORY_FAILURE", payload: error.message }); // Assuming you have an action type for indicating failure and a payload for error message
  }
}



// Worker Saga: Handle the merge histories action
export function* handleMergeHistories(action: PayloadAction<{ targetHistory: HistoryItem[]; sourceHistory: HistoryItem[] }>): Generator {
  try {
    // Extract targetHistory and sourceHistory from the payload
    const { targetHistory, sourceHistory } = action.payload;

    // Here you would implement the logic to merge the histories
    // For example, you might concatenate the sourceHistory array to the targetHistory array
    const mergedHistory: HistoryItem[] = targetHistory.concat(sourceHistory);

    // Dispatch an action to indicate successful merging of histories
    yield put(UndoRedoActions.mergeHistoriesSuccess(mergedHistory));
  } catch (error: any) {
    // If an error occurs, dispatch an action to indicate failure
    yield put(UndoRedoActions.mergeHistoriesFailure(error.message));
  }
}


// Worker Saga: Performs the clear history operation
export function* performClearHistoryOperation(): Generator {
  try {
    yield put(UndoRedoActions.clearHistoryRequest());
    // Implement the logic to clear the history here
    yield put(UndoRedoActions.clearHistorySuccess());
  } catch (error: any) {
    console.error("Error occurred while clearing history:", error);
    yield put(UndoRedoActions.clearHistoryFailure(error.message));
  }
}

  // Handle the redo action

// Reducer function for handling the redo action
export function* handleRedo(action: any): Generator {
  try {
    // Implement the logic to perform redo operation here
    // For example, you can revert the state to a previous state or redo an action
    yield put(UndoRedoActions.redoSuccess());
  } catch (error: any) {
    yield put(UndoRedoActions.redoFailure(error.message));
  }
}




  // Worker Saga: Performs the redo operation
// If the action parameter is not needed, remove it
// Worker Saga: Performs the redo operation
export function* performRedo() {
  try {
    // Implement the logic to perform the redo operation here
    // This could involve reversing the effects of the most recent undo operation
    // For example:
    // - Retrieve the necessary data for redoing an action
    // - Apply the changes to the application state to redo the action

    // Dispatch an action to indicate success
    yield put({ type: "REDO_SUCCESS" }); // Assuming you have an action type for indicating success
  } catch (error: any) {
    // Handle errors if necessary
    console.error("Error occurred while redoing:", error);
    // Dispatch an action to indicate failure
    yield put({ type: "REDO_FAILURE", payload: error.message }); // Assuming you have an action type for indicating failure and a payload for error message
  }
}




// Worker Saga: Performs the redo operation
export function* performRedoOperation(): Generator {
  try {
    // Implement the logic to perform the redo operation here
    yield put(UndoRedoActions.redoSuccess());
  } catch (error: any) {
    console.error("Error occurred while redoing:", error);
    yield put(UndoRedoActions.redoFailure(error.message));
  }
}


// Worker Saga: Handle the limit history size action
export function* handleLimitHistorySize(action: PayloadAction<number>): Generator {
  try {
    const { payload: maxSize } = action;
    // Perform the logic to limit the size of history here
    yield put(UndoRedoActions.limitHistorySizeSuccess());
  } catch (error: any) {
    console.error("Error occurred while limiting history size:", error);
    yield put(UndoRedoActions.limitHistorySizeFailure(error.message));
  }
}



// Worker Saga: Handle the save history to local action
export function* handleSaveHistoryToLocal(action: PayloadAction<HistoryItem[]>): Generator {
  try {
    const { payload: history } = action;

    // Perform the logic to save history to local storage here
    // This could involve serializing the history array and storing it in local storage

    // For example:
    // Serialize the history array to JSON
    const serializedHistory = JSON.stringify(history);

    // Store the serialized history in local storage
    localStorage.setItem("history", serializedHistory);

    // Dispatch an action to indicate success
    yield put(UndoRedoActions.saveHistoryToLocalSuccess());
  } catch (error: any) {
    // Handle errors if necessary
    console.error("Error occurred while saving history to local storage:", error);
    // Dispatch an action to indicate failure
    yield put(UndoRedoActions.saveHistoryToLocalFailure(error.message));

  }
}

  


// Update the handleBranchingHistory function
export function* handleBranchingHistory(
  action: PayloadAction<BranchingHistoryPayload>
): Generator<any, void, HistoryItem[]> {
  try {
    const { branchName, startPoint } = action.payload;

    // Fetch the current history from the state using the selector function
    const currentHistory: HistoryItem[] = yield select(selectHistory);

    // Find the starting point in the current history
    const startPointIndex: number = currentHistory.findIndex(
      (item: HistoryItem) => item.id === startPoint
    );

    if (startPointIndex !== -1) {
      // Create a new branch by copying the history from the starting point
      const newBranch: HistoryItem[] = [
        ...currentHistory.slice(startPointIndex),
      ];

      // Dispatch an action to save the new branch to the state
      yield put(
        UndoRedoActions.saveBranch({ branchName, branchHistory: newBranch })
      );

      // Dispatch an action to indicate successful branching
      yield put(UndoRedoActions.branchingHistorySuccess(branchName));
    } else {
      // If the starting point is not found in the history, indicate failure
      yield put(
        UndoRedoActions.branchingHistoryFailure(
          "Starting point not found in history"
        )
      );
    }
  } catch (error: any) {
    // Handle errors if necessary
    console.error("Error occurred while handling branching history:", error);
    // Dispatch an action to indicate failure
    yield put(UndoRedoActions.branchingHistoryFailure(error.message));
  }
}

// Handle the disable undo redo action
export function* handleDisableUndoRedo(action: PayloadAction<boolean>): Generator {
  try {
    const disableUndoRedo: boolean = action.payload;

    // Dispatch an action to update the undo redo slice state
    yield put(UndoRedoActions.updateUndoRedoStatus(disableUndoRedo));
  } catch (error: any) {
    // Handle errors if necessary
    console.error("Error occurred while handling disable undo redo:", error);
    // Dispatch an action to indicate failure
    yield put(UndoRedoActions.disableUndoRedoFailure(error.message));
  }
}









  
export function* undoRedoSagas() {
    yield takeLatest("UNDO_REDO_ACTION", handleUndoRedo);
    yield takeLatest("UNDO_ACTION", handleUndo);
    yield takeLatest("REDO_ACTION", handleRedo);
    yield takeLatest("CLEAR_HISTORY_ACTION", handleClearHistory);
    yield takeLatest("MERGE_HISTORIES_ACTION", handleMergeHistories);
    yield takeLatest("LIMIT_HISTORY_SIZE_ACTION", handleLimitHistorySize);
    yield takeLatest("SAVE_HISTORY_TO_LOCAL_ACTION", handleSaveHistoryToLocal);
    yield takeLatest("BRANCHING_HISTORY_ACTION", handleBranchingHistory);
  yield takeLatest("DISABLE_UNDO_REDO_ACTION", handleDisableUndoRedo);
  yield takeEvery('REDO_ACTION_TYPE', performRedoOperation);

}
  



export function* watchClearHistoryAction() {
  yield takeEvery('CLEAR_HISTORY_ACTION_TYPE', performClearHistoryOperation);
}


export default handleUndoRedo;

export type { HistoryItem };
