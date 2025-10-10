// MessagesEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface MessagesEndpoints {
  textMessages: {
    send: EndpointConfig;
    get: EndpointConfig;
    update: EndpointConfig;
    delete: EndpointConfig;
  };
  audioMessages: {
    send: EndpointConfig;
    get: EndpointConfig;
    update: EndpointConfig;
    delete: EndpointConfig;
  };
  videos: {
    send: EndpointConfig;
    get: EndpointConfig;
    edit: EndpointConfig;
  };
  videoMessages: {
    send: EndpointConfig;
    get: EndpointConfig;
    update: EndpointConfig;
    delete: EndpointConfig;
  };
  notifications: {
    send: EndpointConfig;
    get: EndpointConfig;
    update: EndpointConfig;
    delete: EndpointConfig;
  };
}