import { createAction, PayloadAction } from "@reduxjs/toolkit";

export const RandomWalkActions = {
  fetchRandomWalkRequest: createAction<number>("fetchRandomWalkRequest"),
  fetchRandomWalkSuccess: createAction<{ randomWalk: number[] }>("fetchRandomWalkSuccess"),
  fetchRandomWalkFailure: createAction<{ error: string }>("fetchRandomWalkFailure"),
  
  updateRandomWalkRequest: createAction<{ randomWalkId: number; randomWalkData: number[] }>("updateRandomWalkRequest"),
  updateRandomWalkSuccess: createAction<{ randomWalk: number[] }>("updateRandomWalkSuccess"),
  updateRandomWalkFailure: createAction<{ error: string }>("updateRandomWalkFailure"),
  
  // Batch actions for fetching, updating, and removing random walks
  batchFetchRandomWalksRequest: createAction("batchFetchRandomWalksRequest"),
  batchFetchRandomWalksSuccess: createAction<{ randomWalks: number[][] }>("batchFetchRandomWalksSuccess"),
  batchFetchRandomWalksFailure: createAction<{ error: string }>("batchFetchRandomWalksFailure"),
  
  batchUpdateRandomWalksRequest: createAction<{ ids: number[]; newRandomWalks: number[][] }>("batchUpdateRandomWalksRequest"),
  batchUpdateRandomWalksSuccess: createAction<{ randomWalks: number[][] }>("batchUpdateRandomWalksSuccess"),
  batchUpdateRandomWalksFailure: createAction<{ error: string }>("batchUpdateRandomWalksFailure"),
  
  batchRemoveRandomWalksRequest: createAction<number[]>("batchRemoveRandomWalksRequest"),
  batchRemoveRandomWalksSuccess: createAction<number[]>("batchRemoveRandomWalksSuccess"),
  batchRemoveRandomWalksFailure: createAction<{ error: string }>("batchRemoveRandomWalksFailure"),

  updateRandomWalkDetails: createAction<PayloadAction<number[]>>("updateRandomWalkDetails"),
  // Add more actions as needed
};
