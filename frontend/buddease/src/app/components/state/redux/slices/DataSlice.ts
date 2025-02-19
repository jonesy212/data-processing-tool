// DataSlice.ts
import { Data } from "@/app/components/models/data/Data";
import { DataStatus } from "@/app/components/models/data/StatusType";
import { VideoData } from "@/app/components/video/Video";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { implementThen } from "../../stores/CommonEvent";
import { WritableDraft } from "../ReducerGenerator";

interface DataSliceState {
  data: Data[];
  error: string | null; // Added error property
  dataStatus: "pending" | "inProgress" | "completed";
  dataTitle: string | null;
  dataDescription: string | null;
}

const initialState: DataSliceState = {
  data: [],
  error: null,
  dataStatus: "pending",
  dataTitle: null,
  dataDescription: null,
};

export const useDataManagerSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    updateDataTitle: (state, action: PayloadAction<string>) => {
      // Logic to update data title
      const newTitle = action.payload;
      state.dataTitle = newTitle; // Assuming there is a property named dataTitle
      // Additional logic if needed
    },
    updateDataTitleSuccess: (
      state,
      action: PayloadAction<{ id: number; title: string }>
    ) => {
      const { id, title } = action.payload;
      const dataToUpdate = state.data.find((data) => data.id === id);

      if (dataToUpdate) {
        dataToUpdate.title = title;
      }
    },

    updateDataDescription: (state, action: PayloadAction<string>) => {
      // Logic to update data description
      const newDescription = action.payload;
      state.dataDescription = newDescription; // Assuming there is a property named dataDescription
      // Additional logic if needed
    },

    updateDataStatus: (
      state,
      action: PayloadAction<"pending" | "inProgress" | "completed">
    ) => {
      // Logic to update data status
      const newStatus = action.payload;
      state.dataStatus = newStatus; // Assuming there is a property named dataStatus
      // Additional logic if needed
    },

    updateDataDetails: (
      state,
      action: PayloadAction<{ dataId: string; updatedDetails: Partial<Data> }>
    ) => {
      // Logic to update data details
      const { dataId, updatedDetails } = action.payload;
      const dataToUpdate = state.data.find((data) => data.id === dataId);

      if (dataToUpdate) {
        // Update the data details
        Object.assign(dataToUpdate, updatedDetails);
      }
      // Additional logic if needed
    },

    fetchDataRequest: (state) => {
      // Your logic for initiating data fetch
      state.error = null; // Reset error on new fetch request
    },

    fetchDataSuccess: (state, action: PayloadAction<{ data: Data[] }>) => {
      // Your logic for successful data fetch
      const { data } = action.payload;
      state.data = [...data] as WritableDraft<Data>[]; // Explicitly cast to WritableDraft<Data>[]
    },

    fetchDataFailure: (state, action: PayloadAction<{ error: string }>) => {
      // Your logic for data fetch failure
      const { error } = action.payload;
      state.error = error;
    },

    addData: (state, action: PayloadAction<{ id: string; title: string }>) => {
      // Your logic to add data
      const { id, title } = action.payload;
      const newData: Data = {
        _id: "",
        id,
        title,
        status: DataStatus.Pending,
        isActive: false,
        tags: [],
        then: implementThen,
        analysisType: "",
        analysisResults: [],
        phase: null,
        videoData: {} as VideoData
      };
      state.data.push(newData as WritableDraft<Data>);
    },

    removeData: (state, action: PayloadAction<string>) => {
      // Your logic to remove data
      const dataIdToRemove = action.payload;
      state.data = state.data.filter((data) => data.id !== dataIdToRemove);
    },
  },
});

export const {
  updateDataTitle,
  updateDataTitleSuccess,
  updateDataDescription,
  updateDataStatus,
  updateDataDetails,
  fetchDataRequest,
  fetchDataSuccess,
  fetchDataFailure,
  addData,
  removeData,
} = useDataManagerSlice.actions;

// Export selector for accessing the data from the state
export const selectData = (state: { data: DataSliceState }) => state.data.data;

// Export reducer for the data entity slice
export default useDataManagerSlice.reducer;
export type { DataSliceState };
