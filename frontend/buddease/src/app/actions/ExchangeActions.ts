// ExchangeActions.ts
import { createAction } from "@reduxjs/toolkit";
import DEXData from "@/app/models/data/DEXData";
import { ExchangeData } from "@/app/models/data/ExchangeData";
import { AllTypes } from "@/app/typings/PropTypes";

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
