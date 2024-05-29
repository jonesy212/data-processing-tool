// UndoRedoActions.ts
import { createAction } from "@reduxjs/toolkit";
import { BranchingHistoryPayload, HistoryItem } from "../state/redux/sagas/UndoRedoSaga";

export const UndoRedoActions = {
  undo: createAction("UNDO_ACTION"),
  redo: createAction("REDO_ACTION"),
  addToHistory: createAction<any>("ADD_TO_HISTORY_ACTION"),
  saveBranch: createAction<{ branchName: string; branchHistory: any[] }>("SAVE_BRANCH"),
  updateUndoRedoStatus: createAction<boolean>("UPDATE_UNDO_REDO_STATUS"),
  disableUndoRedoFailure: createAction<string>("DISABLE_UNDO_REDO_FAILURE"),
  clearHistoryRequest: createAction("CLEAR_HISTORY_REQUEST_ACTION"),
  clearHistorySuccess: createAction("CLEAR_HISTORY_SUCCESS_ACTION"),
  clearHistoryFailure: createAction<string>("CLEAR_HISTORY_FAILURE_ACTION"),
  limitHistorySizeRequest: createAction<number>("LIMIT_HISTORY_SIZE_REQUEST_ACTION"),
  limitHistorySizeSuccess: createAction("LIMIT_HISTORY_SIZE_SUCCESS_ACTION"),
  limitHistorySizeFailure: createAction<string>("LIMIT_HISTORY_SIZE_FAILURE_ACTION"),
  saveHistoryToLocalRequest: createAction<HistoryItem[]>("SAVE_HISTORY_TO_LOCAL_REQUEST_ACTION"),
  saveHistoryToLocalSuccess: createAction("SAVE_HISTORY_TO_LOCAL_SUCCESS_ACTION"),
  saveHistoryToLocalFailure: createAction<string>("SAVE_HISTORY_TO_LOCAL_FAILURE_ACTION"),
  branchingHistoryRequest: createAction<BranchingHistoryPayload>("BRANCHING_HISTORY_REQUEST_ACTION"),
  branchingHistorySuccess: createAction<string>("BRANCHING_HISTORY_SUCCESS_ACTION"),
  branchingHistoryFailure: createAction<string>("BRANCHING_HISTORY_FAILURE_ACTION"),
  disableUndoRedo: createAction<boolean>("DISABLE_UNDO_REDO_ACTION"),
  redoRequest: createAction("REDO_REQUEST_ACTION"),
  redoSuccess: createAction("REDO_SUCCESS_ACTION"),
  redoFailure: createAction<any>("REDO_FAILURE_ACTION"),
  mergeHistoriesSuccess: createAction<HistoryItem[]>("MERGE_HISTORIES_SUCCESS"),
  mergeHistoriesFailure: createAction<string>("MERGE_HISTORIES_FAILURE"),
};

