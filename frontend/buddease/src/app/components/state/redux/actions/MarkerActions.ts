// marker/MarkerActions.ts
import { Marker } from "@/app/components/models/data/Marker";
import { createAction } from "@reduxjs/toolkit";

export const MarkerActions = {
    // Marker CRUD Actions
  addMarker: createAction<{ marker: Marker }>("addMarker"),
  createMarkerSuccess: createAction<{ marker: Marker }>("createMarkerSuccess"),
  createMarkerFailure: createAction<{ error: string }>("createMarkerFailure"),
  deleteMarker: createAction<number>("deleteMarker"),
  deleteMarkerSuccess: createAction<number>("deleteMarkerSuccess"),
  deleteMarkerFailure: createAction<{ error: string }>("deleteMarkerFailure"),
  updateMarker: createAction<{ id: number, newData: any }>("updateMarker"),
  updateMarkerSuccess: createAction<{ marker: Marker }>("updateMarkerSuccess"),
  updateMarkerFailure: createAction<{ error: string }>("updateMarkerFailure"),
  


  fetchMarkersRequest: createAction("fetchMarkersRequest"),
  fetchMarkersSuccess: createAction<{ markers: Marker[] }>("fetchMarkersSuccess"),
  fetchMarkersFailure: createAction<{ error: string }>("fetchMarkersFailure"),

  updateMarkersSuccess: createAction<{ markers: Marker[] }>("updateMarkersSuccess"),
  
  // Additional Marker Actions
  // Add more actions as needed
};
