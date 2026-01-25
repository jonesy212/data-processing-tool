// FeedbackEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface FeedbackEndpoints extends EndpointCategoryConfig {
  customizeFeedbackForm: EndpointConfig;
}