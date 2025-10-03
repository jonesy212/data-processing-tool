import { createAction } from "@reduxjs/toolkit";

// socialMediaActions.ts
export const socialMediaActions = {
  updateFacebookEndpoints: createAction<{ endpoints: any }>("updateFacebookEndpoints"),
  updateInstagramEndpoints: createAction<{ endpoints: any }>("updateInstagramEndpoints"),
  updateTwitterEndpoints: createAction<{ endpoints: any }>("updateTwitterEndpoints"),
  updateYouTubeEndpoints: createAction<{ endpoints: any }>("updateYouTubeEndpoints"),
  updateTikTokEndpoints: createAction<{ endpoints: any }>("updateTikTokEndpoints"),
};