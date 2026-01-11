// PermissionLevel.ts
export enum PermissionLevel {
  None = 'None',
  Read = 'Read',
  Write = 'Write',
  Execute = 'Execute',
  Admin = 'Admin',
  Owner = 'Owner' // Add the missing value
}

// VisibilityLevel.ts
export enum VisibilityLevel {
  Private = 'Private',       // Only owner
  Restricted = 'Restricted', // Specific users/groups
  Public = 'Public',         // Anyone can view
  Internal = 'Internal',     // Within organization/team
}


