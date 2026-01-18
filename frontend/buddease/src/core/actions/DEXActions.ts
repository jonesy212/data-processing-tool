// DEXActions.ts
import DEXData from "@/core/models/data/DEXData";
import { createAction } from "@reduxjs/toolkit";

export const DEXActions = {
  // Action to fetch DEX data
  fetchDEXData: createAction<DEXData[]>("fetchDEXData"),
  fetchDEXDataRequest: createAction("fetchDEXDataRequest"),
  fetchDEXDataSuccess: createAction<DEXData[]>("fetchDEXDataSuccess"),
  fetchDEXDataFailure: createAction<{ error: string }>("fetchDEXDataFailure"),
};
