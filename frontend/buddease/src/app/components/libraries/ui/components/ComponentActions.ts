import { createAction } from "@reduxjs/toolkit";
import Component from "./Component";



export const ComponentActions = {
  addComponent: createAction<typeof Component>("addComponent"),
  removeComponent: createAction<number>("removeComponent"),
  updateComponent: createAction<{ id: number; updatedComponent: Partial<typeof Component> }>("updateComponent"),

  fetchComponentRequest: createAction<{ id: number }>("fetchComponentRequest"),
  fetchComponentSuccess: createAction<{ component: typeof Component }>("fetchComponentSuccess"),
  fetchComponentFailure: createAction<{ error: string }>("fetchComponentFailure"),
  updateComponentSuccess: createAction<{ id: number; updatedComponent:typeof  Component }>("updateComponentSuccess"),
  updateComponentFailure: createAction<{ error: string }>("updateComponentFailure"),

  // Add more actions as needed
};
