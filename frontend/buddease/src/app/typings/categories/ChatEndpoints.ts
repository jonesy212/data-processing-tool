// ChatEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface ChatEndpoints {
  getThreads: EndpointConfig;
  getMessages: EndpointConfig;
  createThread: EndpointConfig;
  addMessage: EndpointConfig;
}