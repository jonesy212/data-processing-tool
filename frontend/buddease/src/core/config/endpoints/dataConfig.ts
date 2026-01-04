// dataConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import type { DataEndpoints } from '@/core/typings/categories/DataEndpoints';

export const dataConfig: DataEndpoints = {
  single: { path: "/api/data/single", method: "GET" },
  list: { path: "/api/data/list", method: "GET" },
  getData: { path: "/api/data", method: "GET" },
  addData: { path: "/api/data", method: "POST" },
  getSpecificData: { path: "/api/data/{dataId}", method: "GET" },
  deleteData: { path: "/api/data/{dataId}", method: "DELETE" },
  updateDataTitle: { path: "/api/data/update_title", method: "PUT" },
  streamData: { path: "/api/stream_data", method: "GET" },
  dataProcessing: { path: "/api/data/data-processing", method: "POST" },
  updateData: { path: "/api/data/update", method: "PUT" },
  highlightList: { path: "/api/highlights", method: "GET" },
  addHighlight: { path: "/api/highlights", method: "POST" },
  getSpecificHighlight: { path: "/api/highlights/{highlightId}", method: "GET" },
  updateHighlight: { path: "/api/highlights/{highlightId}", method: "PUT" },
  deleteHighlight: { path: "/api/highlights/{highlightId}", method: "DELETE" },
  uploadData: { path: "/api/data/upload", method: "POST" },
  hypothesisTest: { path: `${BASE_URL}/api/data/hypothesis-test`, method: "POST" },
};