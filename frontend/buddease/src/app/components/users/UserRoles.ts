// UserRoles.ts
import { UserRole } from './UserRole';

// Extend the UserRole interface to include JobRole
export interface JobRole extends UserRole {
  salary: number;
  isAdvertised: boolean;
}

enum UserRoleEnum {
  Administrator = 'Administrator',
  Developer = 'Developer',
  TeamLeader = 'TeamLeader',
  Coordinator = 'Coordinator',
  PaidPosition = 'PaidPosition',
  Moderator = 'Moderator',
  Guest = 'Guest',
  UXUIDesigner = 'UXUIDesigner',
  Member = 'Member',
  Verified_User = 'Verified_User',
  System = 'System',
  Editor = 'Editor',
   // New roles added due to app growth
   CryptoInvestor = 'CryptoInvestor', // Users managing their crypto portfolios
   CryptoAnalyst = 'CryptoAnalyst',   // Users providing market analysis
   BlockchainAdmin = 'BlockchainAdmin', // Admins overseeing blockchain infrastructure
   RegionalManager = 'RegionalManager', // Manages users or projects in specific regions
   LegalAdvisor = 'LegalAdvisor',       // Ensures legal compliance
   CustomerSupport = 'CustomerSupport',  // Manages customer support tasks
   DeFiInvestor = 'DeFiInvestor'
}

const UserRoles: { [key in UserRoleEnum]: UserRole } = {
  System: {
    roleType: UserRoleEnum.System,
    responsibilities: [
      'Automate maintenance tasks',
      'Monitor system health and performance',
      'Handle system-level events and alerts',
      'Perform data backups and restore operations',
      'Provide support for automated scripts',
    ],
    permissions: [
      'Access system logs',
      'Manage server configurations',
      'Initiate system-wide maintenance',
      'Access all automated scripts and tasks',
      'Restart services or applications',
    ],
    positions: [], // System role may not have traditional position titles
    salary: 0, // Typically, a system role doesn't have a salary as it is not a human position
    includes: [
      'Full system access',
      'Automated administrative privileges',
    ],
  },
  Administrator: {
    roleType: UserRoleEnum.Administrator,
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
  Editor: { // Define the Editor role
    roleType: UserRoleEnum.Editor,
    responsibilities: [
      'Review and edit content before publication',
      'Ensure adherence to style guides and standards',
      'Collaborate with writers and designers',
      'Manage editorial calendars and deadlines',
    ],
    permissions: [
      'Edit published content',
      'Approve new content submissions',
      'Manage user-generated content',
      'Access editorial tools and resources',
    ],
    positions: [], // Define specific positions if necessary
    salary: 75000, // Example salary for Editor
    includes: [
      'Editorial privileges',
      'Collaboration with the content team',
    ],
  },
  
  Developer: {
    roleType: UserRoleEnum.Developer,
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
    roleType: UserRoleEnum.UXUIDesigner,
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
    roleType: UserRoleEnum.Moderator,
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
    roleType: UserRoleEnum.Member,
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
  Verified_User: {
    roleType: UserRoleEnum.Verified_User,
    responsibilities: ['Same as regular member with verification status'],
    permissions: ['Same permissions as regular member'],
    positions: [],
    includes: []

  },
  Guest: {
    roleType: UserRoleEnum.Guest,
    responsibilities: ['Limited access to view public content'],
    permissions: ['View public content without registration'],
    positions: [],
    includes: []
  },
  TeamLeader: {
    roleType: UserRoleEnum.TeamLeader,
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
    roleType: UserRoleEnum.Coordinator,
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
    roleType: UserRoleEnum.PaidPosition,
    responsibilities: ['Team Management', 'Data Analysis'],
    permissions: ['Manage team members access', 'Access sales analytics data'],
    positions: [],
    salary: 7000,
    includes: []
  },

  // New roles added based on app growth
  CryptoInvestor: {
    roleType: UserRoleEnum.CryptoInvestor,
    responsibilities: [
      'Manage personal crypto portfolios',
      'Track portfolio performance',
      'Make informed crypto investment decisions',
      'Monitor market trends',
    ],
    permissions: [
      'View crypto dashboard',
      'Execute crypto transactions',
      'Analyze market data',
      'Access investment reports',
    ],
    positions: [
      { title: 'Crypto Portfolio Manager', level: 1 },
      { title: 'Investor', level: 1 }
    ],
    salary: 80000, // Example salary for CryptoInvestor role
    includes: [
      'Access to crypto trading platform',
      'Crypto-related analytics tools'
    ],
  },
  CryptoAnalyst: {
    roleType: UserRoleEnum.CryptoAnalyst,
    responsibilities: [
      'Provide market analysis and predictions',
      'Track cryptocurrency market trends',
      'Generate reports on investment opportunities',
      'Advise on risk management for crypto portfolios',
    ],
    permissions: [
      'View crypto analytics dashboard',
      'Generate market analysis reports',
      'Access cryptocurrency data',
      'Provide investment advice',
    ],
    positions: [
      { title: 'Crypto Analyst', level: 1 },
      { title: 'Market Researcher', level: 1 }
    ],
    salary: 90000, // Example salary for CryptoAnalyst role
    includes: [
      'Advanced market analysis tools',
      'Access to crypto trend data'
    ],
  },
  BlockchainAdmin: {
    roleType: UserRoleEnum.BlockchainAdmin,
    responsibilities: [
      'Oversee blockchain infrastructure',
      'Ensure security of blockchain systems',
      'Monitor blockchain transactions',
      'Optimize blockchain network performance',
    ],
    permissions: [
      'Access blockchain configuration settings',
      'Manage blockchain network permissions',
      'Monitor blockchain logs',
      'Troubleshoot blockchain network issues',
    ],
    positions: [
      { title: 'Blockchain Network Admin', level: 1 }
    ],
    salary: 120000, // Example salary for BlockchainAdmin role
    includes: [
      'Full access to blockchain systems',
      'Advanced configuration and troubleshooting tools',
    ],
  },
  RegionalManager: {
    roleType: UserRoleEnum.RegionalManager,
    responsibilities: [
      'Manage regional teams and users',
      'Oversee regional projects',
      'Ensure alignment with regional goals and strategies',
      'Manage regional customer support needs',
    ],
    permissions: [
      'Manage regional users',
      'Oversee region-specific projects and tasks',
      'Access regional performance reports',
      'Allocate resources to regional teams',
    ],
    positions: [
      { title: 'Regional Operations Manager', level: 1 },
      { title: 'Regional Supervisor', level: 1 }
    ],
    salary: 95000, // Example salary for RegionalManager role
    includes: [
      'Regional operational control',
      'Access to regional performance data'
    ],
  },
  LegalAdvisor: {
    roleType: UserRoleEnum.LegalAdvisor,
    responsibilities: [
      'Ensure compliance with legal regulations',
      'Advise on contracts and agreements',
      'Provide legal guidance on crypto-related issues',
      'Monitor for any legal issues that may arise',
    ],
    permissions: [
      'Access legal documents',
      'Review and approve contracts',
      'Provide legal compliance reports',
      'Advise on regulatory requirements',
    ],
    positions: [
      { title: 'Legal Counsel', level: 1 },
      { title: 'Compliance Officer', level: 1 }
    ],
    salary: 100000, // Example salary for LegalAdvisor role
    includes: [
      'Access to legal and compliance tools',
      'Permission to review and approve contracts'
    ],
  },
  CustomerSupport: {
    roleType: UserRoleEnum.CustomerSupport,
    responsibilities: [
      'Assist customers with inquiries',
      'Resolve customer complaints',
      'Provide technical support for platform issues',
      'Maintain positive customer relationships',
    ],
    permissions: [
      'Access customer accounts and issues',
      'Resolve tickets and support inquiries',
      'View support-related analytics',
      'Manage customer feedback',
    ],
    positions: [
      { title: 'Support Representative', level: 1 },
      { title: 'Helpdesk Coordinator', level: 1 }
    ],
    salary: 45000, // Example salary for CustomerSupport role
    includes: [
      'Access to customer support ticketing system',
      'Customer management tools'
    ],
  },

  DeFiInvestor: {
    roleType: UserRoleEnum.DeFiInvestor,
    responsibilities: [
      'Invest in decentralized finance (DeFi) projects',
      'Monitor and manage DeFi investments',
      'Research emerging DeFi opportunities',
      'Engage in yield farming and liquidity provision',
    ],
    permissions: [
      'Access DeFi investment dashboards',
      'Execute DeFi-related transactions',
      'Analyze DeFi market data',
      'Access investment opportunities',
    ],
    positions: [
      { title: 'DeFi Investment Manager', level: 1 },
      { title: 'DeFi Portfolio Manager', level: 1 }
    ],
    salary: 110000, // Example salary for DeFiInvestor role
    includes: [
      'Access to decentralized finance platforms',
      'Advanced DeFi analytics tools'
    ],
  },};

// Restricting the keys of UserRoles to ensure type safety
type UserRoleKeys = keyof typeof UserRoles;

// Ensure that UserRoles only contains valid role keys
type CheckRoleExists<T extends string> = T extends UserRoleKeys ? T : never;



// Usage of CheckRoleExists type
type AdminRoleKey = CheckRoleExists<'Administrator'>; // This would resolve to 'Administrator'
type ModeratorRoleKey = CheckRoleExists<'Moderator'>; // This would resolve to 'Moderator'

export default UserRoles;
export {UserRoleEnum}

// Use the AdminRoleKey and ModeratorRoleKey types to define variables

const adminRole = UserRoles[UserRoleEnum.Administrator];
console.log(adminRole.responsibilities); // Output: ['Community Management', 'Decision-Making Authority', ...]
console.log(adminRole.permissions); // Output: ['Approve product listings', 'Manage team members access', ...]

const developerRole = UserRoles[UserRoleEnum.Developer];
console.log(developerRole.positions); // Output: [{ title: 'Junior Developer', level: 1 }, { title: 'Mid-level Developer', level: 2 }, ...]
console.log(developerRole.salary); // Output: 80000


const adminResponsibilities = UserRoles.Administrator.responsibilities;

