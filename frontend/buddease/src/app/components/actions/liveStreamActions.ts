// liveStreamActions.ts

// liveStreamActions.ts

// Define action types
export enum LiveStreamActionTypes {
    TOGGLE_ORDER_FORM_MODAL = "TOGGLE_ORDER_FORM_MODAL",
    SUBMIT_ORDER = "SUBMIT_ORDER",
  }
  
  // Define action interfaces
  interface ToggleOrderFormModalAction {
    type: LiveStreamActionTypes.TOGGLE_ORDER_FORM_MODAL;
  }
  
  interface SubmitOrderAction {
    type: LiveStreamActionTypes.SUBMIT_ORDER;
    formData: any; // Define the type of form data
  }
  
  // Define a union type for all actions
  type LiveStreamAction = ToggleOrderFormModalAction | SubmitOrderAction;
  
  // Define action creators
  export const toggleOrderFormModal = (): ToggleOrderFormModalAction => ({
    type: LiveStreamActionTypes.TOGGLE_ORDER_FORM_MODAL,
  });
  
  export const submitOrder = (formData: any): SubmitOrderAction => ({
    type: LiveStreamActionTypes.SUBMIT_ORDER,
    formData,
  });
  
  export type { LiveStreamAction };
  