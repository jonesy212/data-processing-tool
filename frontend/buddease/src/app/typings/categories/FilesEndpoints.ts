// FilesEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface FilesEndpoints {
  getFileType: (file: string) => EndpointConfig;
  fetchFiles: EndpointConfig;
  fetchFileAPI: (fileId: string) => EndpointConfig;
  uploadFileAPI: EndpointConfig;
  determineFileTypeAPI: EndpointConfig;
}