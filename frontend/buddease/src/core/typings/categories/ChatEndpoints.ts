// ChatEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ChatEndpoints extends EndpointCategoryConfig {
  getThreads: EndpointConfig;
  getMessages: EndpointConfig;
  createThread: EndpointConfig;
  addMessage: EndpointConfig;
}