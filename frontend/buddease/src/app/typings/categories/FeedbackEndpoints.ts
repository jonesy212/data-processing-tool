// FeedbackEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface FeedbackEndpoints extends EndpointCategoryConfig {
  customizeFeedbackForm: EndpointConfig;
}