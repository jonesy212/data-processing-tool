// index.ts
// details/index.ts
// Import and re-export individual detail configurations
export type { default as ProjectDetails } from '@/core/models/projects/Project';
export { default as TaskDetails } from '@/core/models/tasks/Task';
export type { default as SnapshotDetails } from '@/core/snapshots/SnapshotStore';
export type { default as TodoDetails } from '@/core/todos/Todo';
export type { default as VideoDetails } from '@/core/typings/videoTypes/Video';
export type { default as UserDetails } from '@/core/users/User';

// export type { default as IdeaDetails } from '@/core/ideas/Idea';
// export type { default as AttachmentDetails } from '@/core/attachments/Attachment';
// export type { default as CommentDetails } from '@/core/comments/Comment';
// export type { default as PhaseDetails } from '@/core/models/phases/Phase';
// export type { default as CollaborationDetails } from '@/core/collaborations/Collaboration';
// export type { default as CollaborationOptionDetails } from '@/core/collaborations/CollaborationOption';
// export type { default as CollaborationRequestDetails } from '@/core/collaborations/CollaborationRequest';
// export type { default as CollaborationResponseDetails } from '@/core/collaborations/CollaborationResponse';
// export type { default as CollaborationInviteDetails } from '@/core/collaborations/CollaborationInvite';
// export type { default as CollaborationInviteResponseDetails } from '@/core/collaborations/CollaborationInviteResponse';
// export type { default as CollaborationInviteRequestDetails } from '@/core/collaborations/CollaborationInviteRequest';
// Export other detail configurations as needed
