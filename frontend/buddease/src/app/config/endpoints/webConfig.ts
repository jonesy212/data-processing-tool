// webConfig.ts
import { WebEndpoints } from '@/app/typings/categories/WebEndpoints';

export const webConfig: WebEndpoints = {
  send: { path: "/api/messages/web/send", method: "POST" },
  get: { path: "/api/messages/web/get", method: "GET" },
  update: { path: "/api/messages/web/update", method: "PUT" },
  delete: { path: "/api/messages/web/delete", method: "DELETE" },
};