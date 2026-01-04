feedbackConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { FeedbackEndpoints } from '@/core/typings/categories/FeedbackEndpoints';

export const feedbackConfig: FeedbackEndpoints = {
  customizeFeedbackForm: { path: `${BASE_URL}/api/customize_feedback_form`, method: "POST" },
};