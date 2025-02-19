// ChatMessageActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ChatMessageActions = {
  sendMessage: createAction<{ roomId: string; message: string }>("sendMessage"),
  sendMessageSuccess: createAction<{ roomId: string; message: string }>("sendMessageSuccess"),
  sendMessageFailure: createAction<{ error: string }>("sendMessageFailure"),
  // Add more actions as needed
};
