// ChatEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ChatEndpoints extends EndpointCategoryConfig {
  getThreads: EndpointConfig;
  getMessages: EndpointConfig;
  createThread: EndpointConfig;
  addMessage: EndpointConfig;
}