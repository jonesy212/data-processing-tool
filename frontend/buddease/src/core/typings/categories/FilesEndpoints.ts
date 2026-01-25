// FilesEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface FilesEndpoints extends EndpointCategoryConfig {
  getFileType: (file: string) => EndpointConfig;
  fetchFiles: EndpointConfig;
  fetchFileAPI: (fileId: string) => EndpointConfig;
  uploadFileAPI: EndpointConfig;
  determineFileTypeAPI: EndpointConfig;
}