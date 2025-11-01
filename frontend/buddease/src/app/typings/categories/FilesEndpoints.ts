// FilesEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface FilesEndpoints extends EndpointCategoryConfig {
  getFileType: (file: string) => EndpointConfig;
  fetchFiles: EndpointConfig;
  fetchFileAPI: (fileId: string) => EndpointConfig;
  uploadFileAPI: EndpointConfig;
  determineFileTypeAPI: EndpointConfig;
}