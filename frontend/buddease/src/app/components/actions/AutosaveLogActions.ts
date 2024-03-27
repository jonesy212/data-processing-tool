// AutosaveLogActions.ts
import { createAction } from "@reduxjs/toolkit";


export const AutosaveLogActions = {
  autosaveStarted: createAction("autosaveStarted"),
  autosaveCompleted: createAction("autosaveCompleted"),
  autosaveFailed: createAction("autosaveFailed"),
};