messagesConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { MessagesEndpoints } from '@/core/typings/categories/MessagesEndpoints';

export const messagesConfig: MessagesEndpoints = {
  textMessages: {
    send: { path: `${BASE_URL}/api/messages/text/send`, method: "POST" },
    get: { path: `${BASE_URL}/api/messages/text/get`, method: "GET" },
    update: { path: `${BASE_URL}/api/messages/text/update`, method: "PUT" },
    delete: { path: `${BASE_URL}/api/messages/text/delete`, method: "DELETE" },
  },
  audioMessages: {
    send: { path: `${BASE_URL}/api/messages/audio/send`, method: "POST" },
    get: { path: `${BASE_URL}/api/messages/audio/get`, method: "GET" },
    update: { path: `${BASE_URL}/api/messages/audio/update`, method: "PUT" },
    delete: { path: `${BASE_URL}/api/messages/audio/delete`, method: "DELETE" },
  },
  videos: {
    send: { path: `${BASE_URL}/api/messages/video/send`, method: "POST" },
    get: { path: `${BASE_URL}/api/messages/video/get`, method: "GET" },
    edit: { path: `${BASE_URL}/api/videos/edit`, method: "PUT" },
  },
  videoMessages: {
    send: { path: `${BASE_URL}/api/messages/video/send`, method: "POST" },
    get: { path: `${BASE_URL}/api/messages/video/get`, method: "GET" },
    update: { path: `${BASE_URL}/api/messages/video/update`, method: "PUT" },
    delete: { path: `${BASE_URL}/api/messages/video/delete`, method: "DELETE" },
  },
  notifications: {
    send: { path: `${BASE_URL}/api/messages/notifications/send`, method: "POST" },
    get: { path: `${BASE_URL}/api/messages/notifications/get`, method: "GET" },
    update: { path: `${BASE_URL}/api/messages/notifications/update`, method: "PUT" },
    delete: { path: `${BASE_URL}/api/messages/notifications/delete`, method: "DELETE" },
  },
};