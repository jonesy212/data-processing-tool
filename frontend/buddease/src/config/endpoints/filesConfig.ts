// filesConfig.ts
import { FilesEndpoints } from '../types/categories/FilesEndpoints';
import { BASE_URL } from './baseUrl';

export const filesConfig: FilesEndpoints = {
  getFileType: (file: string) => ({ path: `${BASE_URL}/${file}/type`, method: "GET" }),
  fetchFiles: { path: `${BASE_URL}`, method: "GET" },
  fetchFileAPI: (fileId: string) => ({ path: `${BASE_URL}/${fileId}`, method: "GET" }),
  uploadFileAPI: { path: `${BASE_URL}/upload`, method: "POST" },
  determineFileTypeAPI: { path: `${BASE_URL}/type`, method: "POST" },
};