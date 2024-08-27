// VersioningComponent.tsx
import React from 'react';
import Version from '../versions/Version';

interface VersioningComponentProps {
  version: string;
}
const docPermissions = new DocumentPermissions(true, false);

const VersioningComponent: React.FC<VersioningComponentProps> = ({ version }) => {
  const currentVersion = new Version({
    id: 0,
    versionNumber: version,
    appVersion: '',
    description: '',
    content: '',
    checksum: '',
    data: [],
    name: '',
    url: '',
    metadata: {
      author: '',
      timestamp: '',
      revisionNotes: '',
    },
    workspaceMembers: [],
    versions: {
      data: undefined,
      backend: undefined,
      frontend: undefined
    },
    versionHistory: {
      versionData: [],
    },
    userId: '0',
    documentId: '0',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    isDeleted: false,
    isPublished: false,
    publishedAt: null,
    publishedBy: null,
    lastModifiedBy: null,
    lastModifiedAt: null,
    parentId: null,
    rootId: null,
    branchId: null,
    isLocked: false,
    lockedBy: null,
    lockedAt: null,
    isArchived: false,
    archivedBy: "archiver",
    archivedAt: null,
    tags: {},
    categories: [],
    permissions: docPermissions,
    collaborators: [],
    comments: [],
    reactions: [],
    attachments: [],
    parentType: '',
    parentVersion: '',
    parentTitle: '',
    parentContent: '',
    parentName: "",
    parentUrl: "",
    parentChecksum: "",
    parentMetadata: "",
   
    parentAppVersion: "",
    parentVersionNumber: "",
    draft: false,
    isLatest:false,
   
    source: "",
    status: "",
    buildNumber: "",
    workspaceId: "",
   
    workspaceName: "",
    workspaceType: "",
    workspaceUrl: "",
    workspaceViewers:[],
    workspaceAdmins: [],
   
    versionData: "", 
    changes: "",
    // parentDescription: '',
    // parentMetadata: {},
    // parentTags: [],
    // parentCategories: [],
    // parentPermissions: [],
    // parentCollaborators: [],
    // parentComments: [],
    // parentReactions: [],
    // parentAttachments: [],
    // parentWorkspaceMembers: [],
    // parentVersions: {},
    // parentVersionHistory: { versionData: [] },
    // type: '',
  });

  return (
    <div>
      <h2>Version Information</h2>
      <p>Current Version: {currentVersion.getVersionNumber()}</p>
    </div>
  );
};

export default VersioningComponent;
