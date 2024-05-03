// UserRole.ts
export interface UserRole {
    role: string;
    responsibilities: string[];
  permissions: string[];
  positions: string[];
  salary?: number // Example salary for Moderator
  includes: string[] // Example includes for Moderator
  }
  