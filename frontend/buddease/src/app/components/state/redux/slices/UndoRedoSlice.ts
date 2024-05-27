import { UndoRedoActions } from "@/app/components/actions/UndoRedoActions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UndoRedoState {
  past: any[];
  present: any;
  future: any[];
}

const initialState: UndoRedoState = {
  past: [],
  present: null,
  future: [],
};

const undoRedoSlice = createSlice({
  name: "undoRedo",
  initialState,
  reducers: {
    [UndoRedoActions.undo.type]: (state) => {
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    },
    [UndoRedoActions.redo.type]: (state) => {
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    },
    [UndoRedoActions.addToHistory.type]: (state, action: PayloadAction<any>) => {
      return {
        past: [...state.past, state.present],
        present: action.payload,
        future: [],
      };
    },
  },
});

export const { undo, redo, addToHistory } = undoRedoSlice.actions;
export default undoRedoSlice.reducer;
