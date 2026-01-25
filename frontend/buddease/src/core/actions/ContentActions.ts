// ContentActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ContentActions = {
  processCopiedText: createAction<string>("processCopiedText"),
  handleSentimentAnalysis: createAction<string, string>("handleSentimentAnalysis"),
  // Add more content actions as needed
};
