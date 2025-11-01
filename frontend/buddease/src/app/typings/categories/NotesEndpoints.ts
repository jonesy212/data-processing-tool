import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface NotesEndpoints extends EndpointCategoryConfig {
  // Core CRUD operations
  list: EndpointConfig;
  single: (noteId: number) => EndpointConfig;
  create: EndpointConfig;
  update: (noteId: number) => EndpointConfig;
  delete: (noteId: number) => EndpointConfig;
  
  // State management
  archive: (noteId: number) => EndpointConfig;
  restore: (noteId: number) => EndpointConfig;
  move: (noteId: number) => EndpointConfig;
  pin: (noteId: number) => EndpointConfig;
  unpin: (noteId: number) => EndpointConfig;
  duplicate: (noteId: number) => EndpointConfig;
  
  // Content operations
  merge: EndpointConfig;
  split: (noteId: number) => EndpointConfig;
  
  // Search and filter
  search: EndpointConfig;
  filter: EndpointConfig;
  
  // Bulk operations
  bulkUpdate: EndpointConfig;
  bulkDelete: EndpointConfig;
  
  // Import/Export
  export: EndpointConfig;
  import: EndpointConfig;
  
  // Tag management
  tags: (noteId: number) => EndpointConfig;
  addTag: (noteId: number) => EndpointConfig;
  removeTag: (noteId: number, tagId: number) => EndpointConfig;
  
  // Attachment management
  attachments: (noteId: number) => EndpointConfig;
  addAttachment: (noteId: number) => EndpointConfig;
  removeAttachment: (noteId: number, attachmentId: number) => EndpointConfig;
  
  // Version management
  versions: (noteId: number) => EndpointConfig;
  restoreVersion: (noteId: number, versionId: number) => EndpointConfig;
  
  // Collaboration
  share: (noteId: number) => EndpointConfig;
  unshare: (noteId: number) => EndpointConfig;
  collaborators: (noteId: number) => EndpointConfig;
  addCollaborator: (noteId: number) => EndpointConfig;
  removeCollaborator: (noteId: number, collaboratorId: number) => EndpointConfig;
  
  // Comments
  comments: (noteId: number) => EndpointConfig;
  addComment: (noteId: number) => EndpointConfig;
  updateComment: (noteId: number, commentId: number) => EndpointConfig;
  deleteComment: (noteId: number, commentId: number) => EndpointConfig;
  
  // Analytics
  analytics: (noteId: number) => EndpointConfig;
  
  // Templates
  templates: EndpointConfig;
  createFromTemplate: (templateId: number) => EndpointConfig;
}