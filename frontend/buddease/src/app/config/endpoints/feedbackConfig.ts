// feedbackConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { FeedbackEndpoints } from '@/app/typings/categories/FeedbackEndpoints';

export const feedbackConfig: FeedbackEndpoints = {
  customizeFeedbackForm: { path: `${BASE_URL}/api/customize_feedback_form`, method: "POST" },
};