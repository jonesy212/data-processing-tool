import { version } from '@/app/components/versions/Version';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { T, K } from "../models/data/dataStoreMethods";

/**
 * Function to validate if a given metadata object is valid.
 * @template T, K
 * @param {StructuredMetadata<T, K<T>>} meta - The metadata object to validate.
 * @param {Record<string, string>} schema - Schema to validate the metadata against, with key-value pairs specifying expected types.
 * @returns {boolean} - Returns true if the metadata is valid, otherwise false.
 */
function isValidMeta<T, K>(
  meta: StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K>,
  schema: Record<string, string> = {}
): boolean {
  // Check if meta is an object and not null
  if (typeof meta !== 'object' || meta === null) {
    console.warn("Provided metadata is not a valid object.");
    return false;
  }

  // Validate against schema properties
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in meta)) {
      console.warn(`Missing required property: ${key}`);
      return false;
    }

    const value = meta[key as keyof StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K>];

    // Check type compatibility
    if (expectedType !== 'any' && typeof value !== expectedType) {
      console.warn(
        `Type mismatch for property '${key}': expected '${expectedType}', got '${typeof value}'`
      );
      return false;
    }
  }

  // Warn for extra properties not in schema
  for (const key of Object.keys(meta)) {
    if (!(key in schema)) {
      console.warn(`Unexpected property '${key}' in metadata.`);
    }
  }

  return true;
}



export { isValidMeta };

// Example usage

// Example usage with content for empty strings
const exampleMeta: StructuredMetadata<any, any> = {
  description: "A detailed description of the document.",
  fileType: "text/document",
  alternatePaths: ["/alternate/path1", "/alternate/path2"],
  originalPath: "/path/to/original/document",
  metadataEntries: {
    "file-1": {
      originalPath: "/path/to/file1",
      alternatePaths: ["/alternate/file1"],
      author: "Jane Doe",
      timestamp: new Date(),
      fileType: "text/document",
      title: "Introduction to Metadata",
      description: "Comprehensive guide to metadata structures.",
      keywords: ["metadata", "guide", "document"],
      authors: ["Jane Doe"],
      contributors: ["John Smith"],
      publisher: "Metadata Press",
      copyright: "© 2024 Metadata Press",
      license: "CC BY-SA 4.0",
      links: ["http://metadata.com/document"],
      tags: ["metadata", "text", "document"],
    },
  },
  keywords: "metadata, documentation, example",
  childIds: [],
  relatedData: undefined,
  version: version,
  lastUpdated: new Date(),
  isActive: true,
  config: { theme: "dark" },
  permissions: ["read", "edit"],
  customFields: { department: "Documentation" },
  baseUrl: "http://example.com",
  versionData: null,
  latestVersion: {
    id: "v1.0",
    notes: "Initial draft of the document.",
    parentId: "parent-id-123",
    parentType: "folder",
    parentVersion: "v0.9",
    parentTitle: "Parent Folder Title",
    parentContent: "Parent folder content overview.",
    parentName: "Parent Folder",
    parentUrl: "http://example.com/parent",
    parentChecksum: "abcd1234",
    parentAppVersion: "1.2.3",
    parentVersionNumber: "1.2.3",
    createdBy: "User123",
    lastUpdated: new Date(),
    isLatest: true,
    isActive: true,
    isPublished: true,
    publishedAt: new Date(),
    source: "Generated internally",
    status: "Active",
    version: "1.0",
    timestamp: new Date(),
    user: "User123",
    changes: ["Added metadata fields", "Updated descriptions"],
    comments: ["Looks good", "Ready for review"],
    workspaceId: "workspace-456",
    workspaceName: "Team Workspace",
    workspaceType: "Collaborative",
    workspaceUrl: "http://example.com/workspace",
    workspaceViewers: ["Viewer1", "Viewer2"],
    workspaceAdmins: ["Admin1"],
    workspaceMembers: ["Member1", "Member2"],
    history: ["v0.9: Initial creation", "v1.0: Updated content"],
    data: { key: "value" },
    backend: { service: "Metadata API", version: "2.0" },
    frontend: { uiVersion: "1.5" },
    name: "Metadata Example Document",
    url: "http://example.com/document",
    versionNumber: "1.0.0",
    documentId: "doc-789",
    draft: false,
    userId: "user-123",
    content: "This is the main content of the document.",
    metadata: {
      author: "Jane Doe",
      timestamp: new Date(),
      revisionNotes: "Added introduction and examples.",
    },
    releaseDate: "2024-01-01",
    major: 1,
    minor: 0,
    patch: 0,
    checksum: "checksum1234",
  },
};


const schema = {
  title: 'string',
  description: 'string',
  version: 'number',
};

console.log(isValidMeta(exampleMeta, schema)); // true or false based on the validation
