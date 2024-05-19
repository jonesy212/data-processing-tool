// UserRoles.ts
import { UserRole } from './UserRole';

// Extend the UserRole interface to include JobRole
export interface JobRole extends UserRole {
  salary: number;
  isAdvertised: boolean;
}

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
    positions: [],
    salary: 100000 // Example salary for Administrator
    ,
    includes: []
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
    positions: [],
    salary: 80000,
    includes: []
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
    positions: [],
    includes: []
  },
  'Verified User': {
    role: 'Verified User',
    responsibilities: ['Same as regular member with verification status'],
    permissions: ['Same permissions as regular member'],
    positions: [],
    includes: []

  },
  Guest: {
    role: 'Guest',
    responsibilities: ['Limited access to view public content'],
    permissions: ['View public content without registration'],
    positions: [],
    includes: []
  },
  TeamLeader: {
    role: 'TeamLeader',
    responsibilities: ['Team Management', 'Data Analysis'],
    permissions: ['Manage team members access', 'Access sales analytics data'],
    positions: [],
    salary: 7000,
    includes: []
  },
  PaidPosition: {
    role: 'PaidPosition',
    responsibilities: ['Team Management', 'Data Analysis'],
    permissions: ['Manage team members access', 'Access sales analytics data'],
    positions: [],
    salary: 7000,
    includes: []
  }
};

// Restricting the keys of UserRoles to ensure type safety
type UserRoleKeys = keyof typeof UserRoles;

// Ensure that UserRoles only contains valid role keys
type CheckRoleExists<T extends string> = T extends UserRoleKeys ? T : never;



// Usage of CheckRoleExists type
type AdminRoleKey = CheckRoleExists<'Administrator'>; // This would resolve to 'Administrator'
type ModeratorRoleKey = CheckRoleExists<'Moderator'>; // This would resolve to 'Moderator'

export default UserRoles;

// Use the AdminRoleKey and ModeratorRoleKey types to define variables
const adminRole:typeof UserRoles[AdminRoleKey] = UserRoles.Administrator;
const moderatorRole:typeof UserRoles[ModeratorRoleKey] = UserRoles.Moderator;
// Accessing responsibilities of the Administrator role
const adminResponsibilities: string[] = UserRoles.Administrator.responsibilities;

