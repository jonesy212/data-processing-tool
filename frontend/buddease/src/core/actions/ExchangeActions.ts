// ExchangeActions.ts
import DEXData from "@/core/models/data/DEXData";
import { ExchangeData } from "@/core/models/data/ExchangeData";
import type { AllTypes } from "@/core/typings/PropTypes";
import { createAction } from "@reduxjs/toolkit";

export const ExchangeActions = {
  // Action to fetch exchange data
  fetchExchangeData: createAction<ExchangeData[]>("fetchExchangeData"),
  fetchExchangeDataRequest: createAction("fetchExchangeDataRequest"),

  fetchExchangeDataSuccess: createAction<ExchangeData[]>(
    "fetchExchangeDataSuccess"
    ),
  
  fetchExchangeDataFailure: createAction<{ error: string }>(
    "fetchExchangeDataFailure"
    ),
  
    fetchDEXData: createAction<{dex: DEXData[], type: AllTypes }>("fetchExchangeData"),
  
};
