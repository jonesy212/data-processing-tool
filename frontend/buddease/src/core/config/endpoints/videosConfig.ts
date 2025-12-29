  // videosConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { VideosEndpoints } from '@/core/typings/categories/VideosEndpoints';

export const videosConfig: VideosEndpoints = {
  list: { path: `${BASE_URL}/api/videos`, method: "GET" },
  uploadVideo: { path: `${BASE_URL}/api/videos/upload`, method: "POST" },
  single: (videoId: string) => ({ path: `${BASE_URL}/api/videos/${videoId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/videos`, method: "POST" },
  remove: (videoId: string) => ({ path: `${BASE_URL}/api/videos/${videoId}`, method: "DELETE" }),
  update: (videoId: string) => ({ path: `${BASE_URL}/api/videos/${videoId}`, method: "PUT" }),
  conference: {
    create: { path: `${BASE_URL}/conference/create`, method: "POST" },
    join: { path: `${BASE_URL}/conference/join`, method: "POST" },
    end: { path: `${BASE_URL}/conference/end`, method: "POST" },
  },
  messages: {
    send: { path: `${BASE_URL}/messages/send`, method: "POST" },
    retrieve: { path: `${BASE_URL}/messages/retrieve`, method: "GET" },
  },
  annotations: {
    add: { path: `${BASE_URL}/annotations/add`, method: "POST" },
    retrieve: { path: `${BASE_URL}/annotations/retrieve`, method: "GET" },
  },
  playback: {
    speed: { path: `${BASE_URL}/playback/speed`, method: "POST" },
    frame: { path: `${BASE_URL}/playback/frame`, method: "POST" },
  },
  analytics: { path: `${BASE_URL}/analytics`, method: "GET" },
  live: {
    start: { path: `${BASE_URL}/live/start`, method: "POST" },
    end: { path: `${BASE_URL}/live/end`, method: "POST" },
    status: { path: `${BASE_URL}/live/status`, method: "GET" },
  },
  edit: { path: `${BASE_URL}/edit`, method: "POST" },
  transcribe: { path: `${BASE_URL}/transcribe`, method: "POST" },
  collaboration: {
    create: { path: `${BASE_URL}/collaboration/create`, method: "POST" },
    invite: { path: `${BASE_URL}/collaboration/invite`, method: "POST" },
    join: { path: `${BASE_URL}/collaboration/join`, method: "POST" },
  },
  manage: { path: `${BASE_URL}/manage`, method: "POST" },
  updateVideoTags: { path: `${BASE_URL}/api/videos/update-tags`, method: "PUT" },
};