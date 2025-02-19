 // AppActions.ts
import { createAction } from '@reduxjs/toolkit';
import { ApiActionTypes } from "@/app/api/ApiActions";
import { DocumentActionTypes } from '@/app/tokens/DocumentActions';
import { TokenActionTypes } from '@/app/tokens/TokenActions';
import { UserPreferencesActionTypes } from '@/app/configs/UserPreferencesActions';
// Import other action types


export const AppActions = {
    createTask: createAction<string>('task/createTask'),
    updateTask: createAction<{ id: string, updates: Object }>('task/updateTask'),
}



export type AppActionsType =
  | DocumentActionTypes
  // | TokenActionTypes
  // | UserPreferencesActionTypes
  // | ApiActionTypes
  // Add other action types
