// DocumentExamples.ts

// Using the App types
const currentDocument: AppDocument = createDefaultDocument({
  title: "Project Proposal",
  content: "# Project Proposal\n\nThis is the content...",
  author: "user-123",
  fileType: "markdown",
  isPublished: true
});

// Document context in React
const DocumentContext = React.createContext<DocumentContext>({
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
  tags: ["project", "proposal"]
};

// Document permissions
const userPermissions: DocumentPermissions = {
  canView: true,
  canEdit: true,
  canDelete: false,
  canShare: true,
  canDownload: true
};