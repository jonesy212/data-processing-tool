// chatConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { ChatEndpoints } from '@/app/typings/categories/ChatEndpoints';

export const chatConfig: ChatEndpoints = {
  getThreads: { path: `${BASE_URL}/api/chat/threads`, method: "GET" },
  getMessages: { path: `${BASE_URL}/api/chat/messages`, method: "GET" },
  createThread: { path: `${BASE_URL}/api/chat/threads`, method: "POST" },
  addMessage: { path: `${BASE_URL}/api/chat/messages`, method: "POST" },
};