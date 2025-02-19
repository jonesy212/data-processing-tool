import { createAction } from "@reduxjs/toolkit";


export const RandomWalkActions = {
  // Fetch random walk actions
  createRandomWalk: createAction<{ walkAction: string }>("randomWalk/createRandomWalk"),
  fetchRandomWalk: createAction<{ walkAction: string, id: string }>("randomWalk/fetchRandomWalk"),
  fetchRandomWalkRequest: createAction<number>("randomWalk/fetchRequest"),
  fetchRandomWalkSuccess: createAction<number[]>("randomWalk/fetchSuccess"),
  fetchRandomWalkFailure: createAction<string>("randomWalk/fetchFailure"),

  // Update random walk actions
  updateRandomWalkRequest: createAction<{ id: number; data: number[] }>("randomWalk/updateRequest"),
  updateRandomWalkSuccess: createAction<number[]>("randomWalk/updateSuccess"),
  updateRandomWalkFailure: createAction<string>("randomWalk/updateFailure"),

  // Batch actions for random walks
  batchFetchRandomWalksRequest: createAction<void>("randomWalk/batchFetchRequest"),
  batchFetchRandomWalksSuccess: createAction<number[][]>("randomWalk/batchFetchSuccess"),
  batchFetchRandomWalksFailure: createAction<string>("randomWalk/batchFetchFailure"),

  batchUpdateRandomWalksRequest: createAction<{ ids: number[]; data: number[][] }>("randomWalk/batchUpdateRequest"),
  batchUpdateRandomWalksSuccess: createAction<number[][]>("randomWalk/batchUpdateSuccess"),
  batchUpdateRandomWalksFailure: createAction<string>("randomWalk/batchUpdateFailure"),

  // Batch remove actions for random walks
  batchRemoveRandomWalksRequest: createAction<number[]>("randomWalk/batchRemoveRequest"),
  batchRemoveRandomWalksSuccess: createAction<number[]>("randomWalk/batchRemoveSuccess"),
  batchRemoveRandomWalksFailure: createAction<string>("randomWalk/batchRemoveFailure"),

  // Update random walk details action
  updateRandomWalkDetails: createAction<{ id: number; details: any }>("randomWalk/updateDetails"),
};

