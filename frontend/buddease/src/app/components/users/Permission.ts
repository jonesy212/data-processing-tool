
interface BasePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete?: boolean | undefined;
}

// Permission.ts
interface Permission {
  userId: string;
  permissions: UserPermissions; // Using UserPermissions as the structure
  rolePermissions?: Permissions; // Optionally include role-specific permissions
  permissionType: 'read' | 'write'
}

interface EncryptionSetting {
  enabled: boolean;
  algorithm: string;
}

interface PrivacyCompliance {
  policyVersion: string;
  complianceDate: string;
}


// Define individual category permissions
interface DataPermissions extends BasePermissions {
  // Additional data-specific permissions
  canExport?: boolean;
  assignedNotes?: boolean;
  assignedGoals?: boolean;
  assignedFiles?: boolean;
  assignedEvents?: boolean;
  assignedContacts?: boolean;
  assignedBookmarks?: boolean;
}

interface BoardPermissions extends BasePermissions {
  // Additional board-specific permissions
  canAddItems?: boolean;
  assignedBoardItems?: boolean;
  assignedBoardColumns?: boolean;
  assignedBoardLists?: boolean;
  assignedBoardCards?: boolean;
  assignedBoardViews?: boolean;
  assignedBoardComments?: boolean;
  assignedBoardActivities?: boolean;
  assignedBoardLabels?: boolean;
  assignedBoardMembers?: boolean;
  assignedBoardSettings?: boolean;
  assignedBoardPermissions?: boolean;
  assignedBoardNotifications?: boolean;
  assignedBoardIntegrations?: boolean;
  assignedBoardAutomations?: boolean;
  assignedBoardCustomFields?: boolean;
  // Add more properties as needed
}

interface TaskPermissions extends BasePermissions {
  // Additional task-specific permissions
  canAssignTasks?: boolean;
}

interface TeamPermissions extends BasePermissions {
  // Additional team-specific permissions
  canManageMembers?: boolean;
}

interface ProjectManagementPermissions extends BasePermissions {
  // Additional project management-specific permissions
  canCreateProjects?: boolean;
}

interface CommunityPermissions extends BasePermissions {
  // Additional community-specific permissions
  canPostComments?: boolean;
}

interface ProjectsPermissions extends BasePermissions {
  // Additional projects-specific permissions
  canTrackMilestones?: boolean;
}

interface DeveloperPermissions extends BasePermissions {
  // Additional developer-specific permissions
  canCommitCode?: boolean;
}

interface BlockchainPermissions extends BasePermissions {
  // Additional blockchain-specific permissions
  canDeploySmartContracts?: boolean;
  canMintNFT?: boolean;
}


interface DocumentEditingPermissions extends BasePermissions {
  // Basic document editing permissions
  canEdit: boolean;
  canComment: boolean;

  // Advanced document editing-specific permissions
  canEditComments?: boolean;
  canViewHistory?: boolean;
  canRestoreVersions?: boolean;
  canShare?: boolean;
  canDelete?: boolean;
  canMove?: boolean;

  // Collaboration permissions
  canAssignTasks?: boolean;
  canEditAssignees?: boolean;
  canMentionUsers?: boolean;
  canCreateCollaborativeSessions?: boolean; // e.g., live editing sessions
  canManageCollaborators?: boolean; // Adding/removing collaborators
  canViewCollaborators?: boolean; // View list of collaborators
  canSendInvites?: boolean; // Invite others to collaborate
  canReceiveNotifications?: boolean; // Receive notifications on updates/comments

  // Security-related permissions
  canSetPermissions?: boolean;
  canPasswordProtect?: boolean;
  canApplyWatermarks?: boolean; // Apply watermarks for confidentiality
  canSetExpiration?: boolean; // Set document expiration dates

  // Exporting and sharing permissions
  canExport?: boolean;
  canPrint?: boolean;
  canDownload?: boolean;
  canShareViaLink?: boolean; // Share document via a public link
  canRestrictDownloads?: boolean; // Restrict others from downloading

  // Communication and feedback permissions
  canResolveComments?: boolean; // Resolve comments
  canRespondToComments?: boolean; // Respond to other users' comments
  canAnnotate?: boolean; // Add annotations
  canChat?: boolean; // In-document chat

  // Other permissions
  canRename?: boolean;
  canArchive?: boolean;
  canLock?: boolean;
  canDuplicate?: boolean; // Duplicate the document
  canSetTemplates?: boolean; // Save the document as a template
}



// Combine all permissions into a single interface
interface UserPermissions {
  data?: DataPermissions;
  board?: BoardPermissions;
  task?: TaskPermissions;
  team?: TeamPermissions;
  projectManagement?: ProjectManagementPermissions
  community?: CommunityPermissions;
  projects?: ProjectsPermissions;
  developer?: DeveloperPermissions;
  blockchain?: BlockchainPermissions;
  documentEditing?: DocumentEditingPermissions;

}



const userBoardPermissions: BoardPermissions = {
  canView: true,
  canEdit: true,
  canDelete: false,
  canAddItems: true,
  assignedBoardItems: true,
  assignedBoardColumns: false,
  // Add more properties as needed
};





export type { EncryptionSetting, Permission, PrivacyCompliance, UserPermissions, BasePermissions, DocumentEditingPermissions };
