// RealtimeActions.ts
// actions/RealtimeActions.ts
import { createAction } from "@reduxjs/toolkit";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";

export const RealtimeActions = {
  // Action to start fetching real-time data
  fetchRealtimeData: createAction("fetchRealtimeData"),

  // Action for successful real-time data fetch
  fetchRealtimeDataSuccess: createAction<{ data: RealtimeDataItem[] }>("fetchRealtimeDataSuccess"),

  // Action for failed real-time data fetch
  fetchRealtimeDataFailure: createAction<{ error: string }>("fetchRealtimeDataFailure"),

  // Action to add new real-time data
  addRealtimeData: createAction<RealtimeDataItem>("addRealtimeData"),

  // Action to remove specific real-time data by ID
  removeRealtimeData: createAction<string>("removeRealtimeData"),

  // Action to update specific real-time data by ID
  updateRealtimeData: createAction<{ id: string; newData: Partial<RealtimeDataItem> }>("updateRealtimeData"),

  // Action to clear all real-time data
  clearRealtimeData: createAction("clearRealtimeData"),

  // Add more actions as needed
};
