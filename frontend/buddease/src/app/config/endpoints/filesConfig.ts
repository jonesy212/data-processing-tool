// filesConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { FilesEndpoints } from '@/app/typings/categories/FilesEndpoints';

export const filesConfig: FilesEndpoints = {
  getFileType: (file: string) => ({ path: `${BASE_URL}/${file}/type`, method: "GET" }),
  fetchFiles: { path: `${BASE_URL}`, method: "GET" },
  fetchFileAPI: (fileId: string) => ({ path: `${BASE_URL}/${fileId}`, method: "GET" }),
  uploadFileAPI: { path: `${BASE_URL}/upload`, method: "POST" },
  determineFileTypeAPI: { path: `${BASE_URL}/type`, method: "POST" },
};