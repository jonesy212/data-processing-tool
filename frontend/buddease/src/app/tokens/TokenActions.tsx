// tokens/TokenActions.ts
import { createAction } from "@reduxjs/toolkit";

export const TokenActions = {
  addToken: createAction<any>("addToken"),
  addTokens: createAction<any[]>("addTokens"),
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


// Defiypene the action types
export type TokenActionTypes =
  | ReturnType<typeof TokenActions.addToken>
  | ReturnType<typeof TokenActions.addTokens>
  | ReturnType<typeof TokenActions.editToken>
  | ReturnType<typeof TokenActions.deleteToken>
  | ReturnType<typeof TokenActions.editTokens>
  | ReturnType<typeof TokenActions.deleteTokens>
  | ReturnType<typeof TokenActions.createToken>
  | ReturnType<typeof TokenActions.fetchTokensRequest>
  | ReturnType<typeof TokenActions.fetchTokensSuccess>
  | ReturnType<typeof TokenActions.fetchTokensFailure>;