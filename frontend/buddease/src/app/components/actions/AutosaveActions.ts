// AutosaveActions.ts
import { createAction } from "@reduxjs/toolkit";

export const AutosaveActions = {
  enableAutosave: createAction("enableAutosave"),
  disableAutosave: createAction("disableAutosave"),
};