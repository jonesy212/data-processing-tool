// datasetPathConfig.ts

import { DataEndpoints } from '@/core/typings/categories/DataEndpoints';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";

export const dataConfig: DataEndpoints = {
  single: { path: `${BASE_URL}/api/data/single`, method: "GET" },
  list: { path: `${BASE_URL}/api/data/list`, method: "GET" },
  getData: { path: `${BASE_URL}/api/data`, method: "GET" },
  addData: { path: `${BASE_URL}/api/data/add`, method: "POST" },
  getSpecificData: { path: `${BASE_URL}/api/data/:id`, method: "GET" },
  deleteData: { path: `${BASE_URL}/api/data/:id`, method: "DELETE" },
  updateDataTitle: { path: `${BASE_URL}/api/data/update-title/:id`, method: "PUT" },
  streamData: { path: `${BASE_URL}/api/data/stream`, method: "GET" },
  dataProcessing: { path: `${BASE_URL}/api/data/process`, method: "POST" },
  updateData: { path: `${BASE_URL}/api/data/update/:id`, method: "PUT" },
  highlightList: { path: `${BASE_URL}/api/data/highlights`, method: "GET" },
  addHighlight: { path: `${BASE_URL}/api/data/highlights/add`, method: "POST" },
  getSpecificHighlight: { path: `${BASE_URL}/api/data/highlights/:id`, method: "GET" },
  updateHighlight: { path: `${BASE_URL}/api/data/highlights/update/:id`, method: "PUT" },
  deleteHighlight: { path: `${BASE_URL}/api/data/highlights/:id`, method: "DELETE" },
  uploadData: { path: `${BASE_URL}/api/data/upload`, method: "POST" },
  hypothesisTest: { path: `${BASE_URL}/api/data/hypothesis-test`, method: "POST" },
};