import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";

// Add a new slice for documentType and userIdeaexp
export interface DocumentSliceState {
    documentType: string;
    userIdea: string;
  }
  
  export const useDocumentManagerSlice = createSlice({
    name: "document",
    initialState: {
      documentType: '',
      userIdea: '',
    } as DocumentSliceState,
    reducers: {
      setDocumentType: (state: any, action: PayloadAction<string>) => {
        state.documentType = action.payload;
      },
      setUserIdea: (state: any, action: PayloadAction<string>) => {
        state.userIdea = action.payload;
      },
    },
  });
  
  // Export actions for the new slice
  export const { setDocumentType, setUserIdea } = useDocumentManagerSlice.actions;
  
  // Export selectors for accessing the new slice from the state
  export const selectDocumentType = (state: RootState) => state.documentManager.documentType
  export const selectUserIdea = (state: RootState) => state.documentManager.userIdea;
  