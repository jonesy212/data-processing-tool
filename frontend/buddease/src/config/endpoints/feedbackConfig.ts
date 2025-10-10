import { FeedbackEndpoints } from '../types/categories/FeedbackEndpoints';
import { BASE_URL } from './baseUrl';

export const feedbackConfig: FeedbackEndpoints = {
  customizeFeedbackForm: { path: `${BASE_URL}/api/customize_feedback_form`, method: "POST" },
};