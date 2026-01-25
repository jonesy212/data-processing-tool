// AppActions.ts
import type { DocumentActionTypes } from '@/core/tokens/DocumentActions';
import { createAction } from '@reduxjs/toolkit';
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
