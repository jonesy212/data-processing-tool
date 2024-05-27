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
  

  Developer: {
    role: 'Developer',
    responsibilities: [
      'Write and maintain codebase',
      'Implement new features',
      'Debug and resolve software issues',
      'Collaborate with team members on project development',
      'Participate in code reviews',
      'Ensure application performance and responsiveness',
    ],
    permissions: [
      'Access and modify code repositories',
      'Deploy applications to staging and production environments',
      'Access to project management tools',
      'Request pull reviews',
      'View and create project documentation',
    ],
    positions: [
      { title: 'Junior Developer', level: 1 },
      { title: 'Mid-level Developer', level: 2 },
      { title: 'Senior Developer', level: 3 },
      { title: 'Lead Developer', level: 4 },
    ],
    salary: 80000, // Example salary for Developer
    includes: [
      'Health Insurance',
      'Paid Time Off',
      'Remote Work Options',
      'Professional Development Opportunities',
    ]
  },
  UXUIDesigner: {
    role: 'UX/UI Designer',
    responsibilities: [
      'Conduct user research and create user personas',
      'Design wireframes, prototypes, and high-fidelity mockups',
      'Collaborate with developers to ensure design implementation',
      'Conduct usability testing and gather user feedback',
      'Create and maintain design systems and style guides',
      'Stay up-to-date with design trends and best practices',
    ],
    permissions: [
      'Access design tools and software',
      'View and contribute to project management tools',
      'Collaborate on user research and testing',
      'Create and update design documentation',
      'Participate in design reviews',
    ],
    positions: [
      { title: 'Junior UX/UI Designer', level: 1 },
      { title: 'Mid-level UX/UI Designer', level: 2 },
      { title: 'Senior UX/UI Designer', level: 3 },
      { title: 'Lead UX/UI Designer', level: 4 },
    ],
    salary: 70000, // Example salary for UX/UI Designer
    includes: [
      'Health Insurance',
      'Paid Time Off',
      'Remote Work Options',
      'Professional Development Opportunities',
    ]
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
    role: 'Team Leader',
    responsibilities: [
      'Lead and supervise team members',
      'Coordinate team activities',
      'Ensure project goals are met',
      'Provide guidance and support to team members',
      'Communicate with stakeholders',
    ],
    permissions: [
      'Manage team tasks and assignments',
      'Review and approve team deliverables',
      'Participate in project planning and strategy meetings',
      'Represent the team in cross-functional collaborations',
    ],
    positions: [],
    salary: 90000, // Example salary for Team Leader
    includes: [
      'Health Insurance',
      'Paid Time Off',
      'Remote Work Options',
      'Professional Development Opportunities',
    ],
  },
  Coordinator: {
    role: 'Coordinator',
    responsibilities: [
      'Organize and schedule team meetings',
      'Manage team calendars and schedules',
      'Assist with project coordination tasks',
      'Facilitate communication between team members',
      'Maintain project documentation and records',
    ],
    permissions: [
      'Schedule and coordinate team events and activities',
      'Manage team communication channels',
      'Track project progress and milestones',
      'Assist in resolving project-related issues',
    ],
    positions: [],
    salary: 75000, // Example salary for Coordinator
    includes: [
      'Health Insurance',
      'Paid Time Off',
      'Remote Work Options',
      'Professional Development Opportunities',
    ],
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

