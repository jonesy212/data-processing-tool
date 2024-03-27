// DEXActions.ts
import { createAction } from "@reduxjs/toolkit";
import DEXData from "../models/data/DEXData";

export const DEXActions = {
  // Action to fetch DEX data
  fetchDEXData: createAction<DEXData[]>("fetchDEXData"),
  fetchDEXDataRequest: createAction("fetchDEXDataRequest"),
  fetchDEXDataSuccess: createAction<DEXData[]>("fetchDEXDataSuccess"),
  fetchDEXDataFailure: createAction<{ error: string }>("fetchDEXDataFailure"),
};
