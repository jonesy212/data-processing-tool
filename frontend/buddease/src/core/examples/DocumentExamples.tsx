DocumentExamples.ts

import React from 'react';

import {
    AppDocument,
    DocumentContext as DocumentContextType,
    DocumentFilterOptions,
    DocumentPermissions,
    DocumentVersion
} from '@/core/typings/documents/DocumentTypes';

// Mock creation functions 
const createDefaultDocument = (overrides: Partial<AppDocument>): AppDocument => ({
  id: 'doc-1',
  title: '',
  content: '',
  author: '',
  fileType: 'markdown',
  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  permissions: {
    canView: true,
    canEdit: true,
    canDelete: false,
    canShare: true,
    canDownload: true
  },
  ...overrides
});

const createDocumentVersion = (
  document: AppDocument, 
  author: string, 
  changes: string[]
): DocumentVersion => ({
  id: 'v1',
  documentId: document.id,
  version: 1,
  author,
  changes,
  createdAt: new Date(),
  previousVersionId: null
});

// Using the App types
const currentDocument: AppDocument = createDefaultDocument({
  title: "Project Proposal",
  content: "# Project Proposal\n\nThis is the content...",
  author: "user-123",
  fileType: "markdown",
  isPublished: true
});

// Document context in React
const DocumentContext = React.createContext<DocumentContextType>({
  currentDocument: null,
  isLoading: false,
  hasUnsavedChanges: false,
  saveDocument: async () => {},
  updateDocument: async () => {},
  shareDocument: async () => {}
});

// Document versioning
const documentVersion: DocumentVersion = createDocumentVersion(
  currentDocument,
  "user-123",
  ["Added introduction", "Updated timeline"]
);

// Document filtering
const filterOptions: DocumentFilterOptions = {
  fileType: "markdown",
  author: "user-123",
  isPublished: true,
  tags: ["project", "proposal"],
  dateRange: null,
  searchQuery: "",
  sortBy: "updatedAt",
  sortOrder: "desc"
};

// Document permissions
const userPermissions: DocumentPermissions = {
  canView: true,
  canEdit: true,
  canDelete: false,
  canShare: true,
  canDownload: true,
  canComment: true,
  canArchive: false,
  canDuplicate: true
};

// Example component using the context
export const DocumentExamplesComponent: React.FC = () => {
  const documentContext = React.useContext(DocumentContext);

  return (
    <div>
      <h2>Document Examples</h2>
      
      <div>
        <h3>Current Document:</h3>
        <pre>{JSON.stringify(currentDocument, null, 2)}</pre>
      </div>

      <div>
        <h3>Document Version:</h3>
        <pre>{JSON.stringify(documentVersion, null, 2)}</pre>
      </div>

      <div>
        <h3>Filter Options:</h3>
        <pre>{JSON.stringify(filterOptions, null, 2)}</pre>
      </div>

      <div>
        <h3>User Permissions:</h3>
        <pre>{JSON.stringify(userPermissions, null, 2)}</pre>
      </div>

      <div>
        <h3>Document Context:</h3>
        <p>Loading: {documentContext.isLoading ? 'Yes' : 'No'}</p>
        <p>Unsaved Changes: {documentContext.hasUnsavedChanges ? 'Yes' : 'No'}</p>
        <button onClick={() => documentContext.saveDocument()}>Save Document</button>
      </div>
    </div>
  );
};

// Export the context for use in other components
export { DocumentContext };

Default export
export default DocumentExamplesComponent;