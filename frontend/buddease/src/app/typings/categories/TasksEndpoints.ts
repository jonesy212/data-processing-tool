// TasksEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface TasksEndpoints {
  create: EndpointConfig;
  list: EndpointConfig;
  single: (taskId: number) => string;
  add: EndpointConfig;
  remove: (taskId: number) => string;
  process: EndpointConfig;
  completeAll: EndpointConfig;
  toggle: (taskId: number) => string;
  removeMultiple: EndpointConfig;
  toggleMultiple: EndpointConfig;
  markInProgress: (taskId: number) => string;
  update: (taskId: number) => string;
}