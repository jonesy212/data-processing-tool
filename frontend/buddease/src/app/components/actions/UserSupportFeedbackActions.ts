//UserSupportFeedbackActions.ts

import { createAction } from "@reduxjs/toolkit";

export const UserSupportFeedbackActions = {
  // Feedback Submission Actions
  submitFeedback: createAction<{ userId: string; feedback: string }>(
    "submitFeedback"
  ),

  // Feedback Handling Actions
  processFeedback: createAction<{ feedbackId: string }>("processFeedback"),
  resolveFeedback: createAction<{ feedbackId: string }>("resolveFeedback"),
  escalateFeedback: createAction<{ feedbackId: string }>("escalateFeedback"),

  // Notification Actions
  sendFeedbackNotification: createAction<{
    feedbackId: string;
    notification: string;
  }>("sendFeedbackNotification"),

  // Additional User Support Actions
  addUserToSupportQueue: createAction<{ userId: string }>(
    "addUserToSupportQueue"
  ),
  removeUserFromSupportQueue: createAction<{ userId: string }>(
    "removeUserFromSupportQueue"
  ),

  // Success and Failure Actions
  submitFeedbackSuccess: createAction<{ feedbackId: string }>(
    "submitFeedbackSuccess"
  ),
  submitFeedbackFailure: createAction<{
    feedbackId: string;
    error: string;
  }>("submitFeedbackFailure"),

  processFeedbackSuccess: createAction<{ feedbackId: string }>(
    "processFeedbackSuccess"
  ),
  processFeedbackFailure: createAction<{
    feedbackId: string;
    error: string;
  }>("processFeedbackFailure"),

  resolveFeedbackSuccess: createAction<{ feedbackId: string }>(
    "resolveFeedbackSuccess"
  ),
  resolveFeedbackFailure: createAction<{
    feedbackId: string;
    error: string;
  }>("resolveFeedbackFailure"),

  escalateFeedbackSuccess: createAction<{ feedbackId: string }>(
    "escalateFeedbackSuccess"
  ),
  escalateFeedbackFailure: createAction<{
    feedbackId: string;
    error: string;
  }>("escalateFeedbackFailure"),

  sendFeedbackNotificationSuccess: createAction<{
    feedbackId: string;
  }>("sendFeedbackNotificationSuccess"),
  sendFeedbackNotificationFailure: createAction<{
    feedbackId: string;
    error: string;
  }>("sendFeedbackNotificationFailure"),

  // Add more actions as needed
};
