// GlobalStateActions.ts
import { createAction } from "@reduxjs/toolkit";

export const GlobalStateActions = {
    updateGlobalState: createAction<{ key: string; value: any }>("updateGlobalState"),
  updateGlobalStateRequest: createAction<{ key: string; value: any }>(
    "updateGlobalStateRequest"
  ),
  updateGlobalStateSuccess: createAction("updateGlobalStateSuccess"),
  updateGlobalStateFailure: createAction<{ error: string }>(
    "updateGlobalStateFailure"
  ),
};
