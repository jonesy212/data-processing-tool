// SelectActions

import { createAction } from "@reduxjs/toolkit";

export const SelectActions = {
  selectTask: createAction<string>("task/selectTask"),
    deselectTask: createAction<string>("task/deselectTask"),
    showOptionsForSelectedText: createAction<string | null>("showOptionsForSelectedText"),
}