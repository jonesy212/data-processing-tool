// FilesEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface FilesEndpoints {
  getFileType: (file: string) => EndpointConfig;
  fetchFiles: EndpointConfig;
  fetchFileAPI: (fileId: string) => EndpointConfig;
  uploadFileAPI: EndpointConfig;
  determineFileTypeAPI: EndpointConfig;
}