// DataFrameActions.ts
// data/DataFrameActions.ts

import { createAction } from "@reduxjs/toolkit";
import { DataFrame } from "data-forge";

export const DataFrameActions = {
  // Standard actions
  setDataFrame: createAction<DataFrame[]>("setDataFrame"),
  addDataFrame: createAction<DataFrame>("addDataFrame"),
  updateDataFrame: createAction<DataFrame>("updateDataFrame"),
  removeDataFrame: createAction<string>("removeDataFrame"),
  
  // Fetch data frame actions
  fetchDataFrame: createAction("fetchDataFrame"),
  updateDataFrameSuccess: createAction<{ dataFrame: DataFrame[] }>("updateDataFrameSuccess"),
  fetchDataFrameSuccess: createAction<{ dataFrame: DataFrame[] }>("fetchDataFrameSuccess"),
  fetchDataFrameFailure: createAction<{ error: string }>("fetchDataFrameFailure"),
  
  // Additional actions for specific updates
  updateDataFrameTitle: createAction<{ id: string, newTitle: string }>("updateDataFrameTitle"),
  updateDataFrameDescription: createAction<{ id: string, newDescription: string }>("updateDataFrameDescription"),
  updateDataFrameStatus: createAction<{ id: string, newStatus: string }>("updateDataFrameStatus"),
  // Add more specific update actions as needed
  
  // Additional actions for specific removals
  removeDataFrameSuccess: createAction<string>("removeDataFrameSuccess"),
  removeDataFrameFailure: createAction<{ error: string }>("removeDataFrameFailure"),
};
