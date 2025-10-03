import { createAction } from "@reduxjs/toolkit";
import HighlightEvent from "./HighlightEvent";

export const HighlightActions = {

  highlightText: createAction<{ selectedText: {id: number; text: string, startIndex: number, endIndex: number} }>("highlightText"),
  // General Highlight Actions
  createHighlight: createAction<Omit<HighlightEvent, "id">>("createHighlight"),
  updateHighlight: createAction<HighlightEvent>("updateHighlight"),
  deleteHighlight: createAction<number>("deleteHighlight"),

  // Additional Highlight Actions (if needed)
  fetchHighlightsRequest: createAction("fetchHighlightsRequest"),
  fetchHighlightsSuccess: createAction<{ highlights: HighlightEvent[] }>("fetchHighlightsSuccess"),
  fetchHighlightsFailure: createAction<{ error: string }>("fetchHighlightsFailure"),

  // Example of more specific actions
  setHighlightLoading: createAction<boolean>("setHighlightLoading"),
  clearHighlights: createAction("clearHighlights"),

  // Tagging Highlight Actions
  addTagToHighlight: createAction<{ highlightId: number; tag: string }>("addTagToHighlight"),
  removeTagFromHighlight: createAction<{ highlightId: number; tag: string }>( "removeTagFromHighlight"),
};
