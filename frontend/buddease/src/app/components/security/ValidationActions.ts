// ValidationActions.ts
import { createAction } from "@reduxjs/toolkit";



export const ValidationActions = {
  validateTaskRequest: createAction<{ taskData: any }>("validateTaskRequest"),
  validateTaskSuccess: createAction<{ validatedTaskData: any }>("validateTaskSuccess"),
  validateTaskFailure: createAction<{ error: string }>("validateTaskFailure"),
  checkUserPermissions: createAction<string>("checkUserPermissions"),
  injectEvents: createAction<{ events: any[] }>("injectEvents"), // New action for injecting events
  // Add more validation actions as needed
};

// Define action types
export enum ValidationActionTypes {
    START_VALIDATION = 'START_VALIDATION',
    VALIDATION_SUCCESS = 'VALIDATION_SUCCESS',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  INJECT_EVENTS = 'INJECT_EVENTS', // New action type for injecting events

  }
  
  // Define action interfaces
  interface StartValidationAction {
    type: ValidationActionTypes.START_VALIDATION;
  }
  
  interface ValidationSuccessAction {
    type: ValidationActionTypes.VALIDATION_SUCCESS;
  }
  
  interface ValidationFailureAction {
    type: ValidationActionTypes.VALIDATION_FAILURE;
    error: string;
  }
  
  // Define a union type for all action types
  export type ValidationAction =
    | StartValidationAction
    | ValidationSuccessAction
    | ValidationFailureAction;
  
  // Define action creators
  export const startValidation = (): StartValidationAction => ({
    type: ValidationActionTypes.START_VALIDATION,
  });
  
  export const validationSuccess = (): ValidationSuccessAction => ({
    type: ValidationActionTypes.VALIDATION_SUCCESS,
  });
  
  export const validationFailure = (error: string): ValidationFailureAction => ({
    type: ValidationActionTypes.VALIDATION_FAILURE,
    error,
  });
  


  