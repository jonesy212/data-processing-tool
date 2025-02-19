// DataFrameSlice.ts
import DataFrameAPI from "@/app/api/DataframeApi";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../ReducerGenerator";

interface DataFrameSliceState {
  dataFrames: DataFrameResponse[]; // Update to DataFrameResponse[]
  error: string | null; // Added error property
  dataFrameStatus: "pending" | "inProgress" | "completed";
  dataFrameTitle: string | null;
  dataFrameDescription: string | null;
  pushDataFrame: (state: any, action: PayloadAction<DataFrameResponse>) => {};
}

type DataFrameResponse = typeof DataFrameAPI & { id: string }; // Assuming 'id' is of type string
const initialState: DataFrameSliceState = {
  dataFrames: [],
  error: null,
  dataFrameStatus: "pending",
  dataFrameTitle: null,
  dataFrameDescription: null,
  pushDataFrame: function (
    state: any,
    action: {
      payload: {
        fetchDataFrame: () => {};
        setDataFrame: (data: any) => Promise<void>;
        updateDataFrame: (updatedData: any) => Promise<void>;
        deleteDataFrame: () => Promise<void>;
        fetchDataFromBackend: () => Promise<any>;
        appendDataToBackend: (data: any) => Promise<void>;
      };
      type: string;
    }
  ): {} {
    throw new Error("Function not implemented.");
  },
};

export const useDataFrameManagerSlice = createSlice({
  name: "dataFrame",
  initialState,
  reducers: {
    updateDataFrameTitle: (state, action: PayloadAction<string>) => {
      // Logic to update data frame title
      const newTitle = action.payload;
      state.dataFrameTitle = newTitle; // Assuming there is a property named dataFrameTitle
      // Additional logic if needed
    },
    updateDataFrameDescription: (state, action: PayloadAction<string>) => {
      // Logic to update data frame description
      const newDescription = action.payload;
      state.dataFrameDescription = newDescription; // Assuming there is a property named dataFrameDescription
      // Additional logic if needed
    },
    updateDataFrameStatus: (
      state,
      action: PayloadAction<"pending" | "inProgress" | "completed">
    ) => {
      // Logic to update data frame status
      const newStatus = action.payload;
      state.dataFrameStatus = newStatus; // Assuming there is a property named dataFrameStatus
      // Additional logic if needed
    },
    fetchDataFrameRequest: (state) => {
      // Your logic for initiating data frame fetch
      state.error = null; // Reset error on new fetch request
    },

    fetchDataFrameSuccess: (
      state,
      action: PayloadAction<{ dataFrames: (typeof DataFrameAPI)[][] }>
    ) => {
      // Your logic for successful data frame fetch
      const { dataFrames } = action.payload;

      // Map over dataFrames and call functions from DataFrameAPI
      state.dataFrames = dataFrames.map((frame) => ({
        fetchDataFrame: DataFrameAPI.fetchDataFrame,
        setDataFrame: DataFrameAPI.setDataFrame,
        updateDataFrame: DataFrameAPI.updateDataFrame,
        deleteDataFrame: DataFrameAPI.deleteDataFrame,
        fetchDataFromBackend: DataFrameAPI.fetchDataFromBackend,
        appendDataToBackend: DataFrameAPI.appendDataToBackend,
      })) as WritableDraft<DataFrameResponse>[];
    },

    fetchDataFrameFailure: (
      state,
      action: PayloadAction<{ error: string }>
    ) => {
      // Your logic for data frame fetch failure
      const { error } = action.payload;
      state.error = error;
    },
    addDataFrame: (
      state,
      action: PayloadAction<{ id: string; dataFrameTitle: string }>
    ) => {
      const { id } = action.payload;

      // Create a new DataFrame object with the required properties
      const newDataFrame: DataFrameResponse = {
        id: id,
        fetchDataFrame: DataFrameAPI.fetchDataFrame,
        setDataFrame: DataFrameAPI.setDataFrame,
        updateDataFrame: DataFrameAPI.updateDataFrame,
        deleteDataFrame: DataFrameAPI.deleteDataFrame,
        fetchDataFromBackend: DataFrameAPI.fetchDataFromBackend,
        appendDataToBackend: DataFrameAPI.appendDataToBackend,
      };

      // Push the new DataFrame to the state
      state.dataFrames.push(newDataFrame);
    },

    removeDataFrame: (state, action: PayloadAction<string>) => {
      // Your logic to remove data frame
      const dataFrameIdToRemove = action.payload;
      state.dataFrames = state.dataFrames.filter(
        (dataFrame) => dataFrame.id !== dataFrameIdToRemove
      );
    },
  },
});

export const {
  updateDataFrameTitle,
  updateDataFrameDescription,
  updateDataFrameStatus,
  fetchDataFrameRequest,
  fetchDataFrameSuccess,
  fetchDataFrameFailure,
  addDataFrame,
  removeDataFrame,
} = useDataFrameManagerSlice.actions;

// Export selector for accessing the data frames from the state
export const selectDataFrames = (state: { dataFrame: DataFrameSliceState }) =>
  state.dataFrame.dataFrames;

// Export reducer for the data frame entity slice
export default useDataFrameManagerSlice.reducer;
export type { DataFrameResponse };
