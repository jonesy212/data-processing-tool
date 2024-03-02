// UserRoles.ts
import { UserRole } from './UserRole';

const UserRoles: { [key: string]: UserRole } = {
  Administrator: {
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
    positions: []
  },
  Moderator: {
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
  Member: {
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
  'Verified User': {
    role: 'Verified User',
    responsibilities: ['Same as regular member with verification status'],
    permissions: ['Same permissions as regular member'],
  },
  Guest: {
    role: 'Guest',
    responsibilities: ['Limited access to view public content'],
    permissions: ['View public content without registration'],
  },
  TeamLeader: {
    role: 'TeamLeader',
    responsibilities: ['Team Management', 'Data Analysis'],
    permissions: ['Manage team members access', 'Access sales analytics data'],
  }
};

// Restricting the keys of UserRoles to ensure type safety
type UserRoleKeys = keyof typeof UserRoles;

// Ensure that UserRoles only contains valid role keys
type CheckRoleExists<T extends string> = T extends UserRoleKeys ? T : never;

export default UserRoles;

const adminRole = UserRoles.Administrator; // No error
const moderatorRole = UserRoles.Moderator; // No error
// Accessing responsibilities of the Administrator role
const adminResponsibilities = UserRoles.Administrator.responsibilities; // No error

// Attempt to access an invalid role key
const invalidRole = UserRoles.NonExistentRole; // Error: Property 'NonExistentRole' does not exist on type '{ [key: string]: UserRole; }'
