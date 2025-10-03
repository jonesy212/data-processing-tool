// token/TokenActions.ts
import { createAction } from "@reduxjs/toolkit";

export const TokenActions = {
  // Single Token Actions
  editToken: createAction<{ id: number; newData: any }>("editToken"),
  deleteToken: createAction<number>("deleteToken"),
  // Bulk Token Actions
  editTokens: createAction<{ ids: number[]; newData: any[] }>("editTokens"),
  deleteTokens: createAction<number[]>("deleteTokens"),
  createToken: createAction<any>("createToken"),
  // Fetch Tokens Actions
  fetchTokensRequest: createAction("fetchTokensRequest"),
  fetchTokensSuccess: createAction<{ tokens: any[] }>("fetchTokensSuccess"),
  fetchTokensFailure: createAction<{ error: string }>("fetchTokensFailure"),
};
