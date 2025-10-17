// ChatEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ChatEndpoints {
  getThreads: EndpointConfig;
  getMessages: EndpointConfig;
  createThread: EndpointConfig;
  addMessage: EndpointConfig;
}