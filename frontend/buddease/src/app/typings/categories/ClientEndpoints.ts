// ClientEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface ClientEndpoints {
  fetchClientDetails: (clientId: number) => EndpointConfig;
  updateClientDetails: (clientId: number) => EndpointConfig;
  connectWithTenant: (tenantId: number) => EndpointConfig;
  sendMessageToTenant: (tenantId: number) => EndpointConfig;
  listConnectedTenants: EndpointConfig;
  listMessages: EndpointConfig;
  createTask: EndpointConfig;
  listTasks: EndpointConfig;
  submitProjectProposal: EndpointConfig;
  participateInCommunityChallenges: EndpointConfig;
  listRewards: EndpointConfig;
  listFiles: EndpointConfig;
  fetchFiles: EndpointConfig;
  uploadFile: EndpointConfig;
  batchRemoveFiles: EndpointConfig;
  markFileAsComplete: EndpointConfig;
  startCollaborativeEdit: EndpointConfig;
  createFileVersion: EndpointConfig;
  fetchFileVersions: EndpointConfig;
  shareFile: EndpointConfig;
  requestAccessToFile: EndpointConfig;
  receiveFileUpdate: EndpointConfig;
  exportFile: EndpointConfig;
  archiveFile: EndpointConfig;
  determineFileType: EndpointConfig;
  importFile: EndpointConfig;
}