// UserRole.ts
export interface UserRole {
    role: string;
    responsibilities: string[];
  permissions: string[];
  positions: { title: string; level: number }[]; // Define positions as an array of objects
  salary?: number // Example salary for Moderator
  includes: string[] // Example includes for Moderator
  }
  