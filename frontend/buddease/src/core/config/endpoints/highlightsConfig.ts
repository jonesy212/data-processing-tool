// highlightsConfig.ts
import { HighlightsEndpoints } from '@/core/typings/categories/HighlightsEndpoints';

export const highlightsConfig: HighlightsEndpoints = {
  list: { path: "/api/highlights", method: "GET" },
  add: { path: "/api/highlights", method: "POST" },
  getSpecific: { path: "/api/highlights/{highlightId}", method: "GET" },
  update: { path: "/api/highlights/{highlightId}", method: "PUT" },
  delete: { path: "/api/highlights/{highlightId}", method: "DELETE" },
  backend: { path: "/api/highlights/backend", method: "POST"},
  frontend: { path: "/api/highlights/frontend", method: "POST"},
};