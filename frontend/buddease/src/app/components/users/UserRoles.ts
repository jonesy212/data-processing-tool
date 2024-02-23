// UserRoles.ts
import { UserRole } from './UserRole';

const UserRoles: UserRole[] = [
  {
    role: 'Administrator',
    responsibilities: [
      'Community Management',
      'Decision-Making Authority',
      'Team Management',
      'Data Analysis',
    ],
    permissions: [
      'Approve product listings',
      'Manage team members access',
      'Access sales analytics data',
      'Configure platform settings',
    ],
  },
  {
    role: 'Moderator',
    responsibilities: [
      'Community Engagement',
      'Content Moderation',
      'Task and Project Support',
    ],
    permissions: [
      'Monitor live broadcasts',
      'Enforce moderation policies',
      'Assist in approval process',
    ],
  },
  {
    role: 'Member',
    responsibilities: [
      'Active Participation',
      'Collaboration',
      'Proposal Submission',
      'Community Decision-Making',
    ],
    permissions: [
      'Participate in discussions',
      'Submit new listings',
      'Vote on community decisions',
    ],
  },
  {
    role: 'Verified User',
    responsibilities: ['Same as regular member with verification status'],
    permissions: ['Same permissions as regular member'],
  },
  {
    role: 'Guest',
    responsibilities: ['Limited access to view public content'],
    permissions: ['View public content without registration'],
  },
  {
    role: 'TeamLeader',
    responsibilities: ['Team Management', 'Data Analysis'],
    permissions: ['Manage team members access', 'Access sales analytics data'],
  }
];

export default UserRoles;
